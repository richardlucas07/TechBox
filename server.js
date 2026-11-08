const http = require('http');
const fs = require('fs');
const path = require('path');
const { pool, config } = require('./db');

const PORTA = Number(process.env.PORT || config.PORT || 3000);
const PUBLICO = path.join(__dirname, 'public');
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

async function lerRanking() {
  const [linhas] = await pool.query(
    `SELECT j.nome, p.pontos, c.nome AS pc
       FROM partidas p
       JOIN jogadores j ON j.id = p.jogador_id
       JOIN computadores c ON c.id = p.computador_id
      ORDER BY p.pontos DESC, p.id ASC
      LIMIT 10`);
  return linhas;
}

// Monta o texto do comando so para exibir no painel do site.
// A gravacao real usa pool.execute com parametros (?), que evita SQL injection.
function textoSql(sql, valores) {
  let i = 0;
  return sql.replace(/\?/g, () => {
    const v = valores[i++];
    return typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
  });
}

function json(res, status, corpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(corpo));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let texto = '';
    req.setEncoding('utf8');
    req.on('data', (parte) => {
      texto += parte;
      if (texto.length > 2000) { reject(new Error('grande')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(texto || '{}')); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function api(req, res, rota, url) {
  if (rota === 'GET /api/status') {
    try {
      const [[c]] = await pool.query(
        'SELECT (SELECT COUNT(*) FROM jogadores) AS jogadores, (SELECT COUNT(*) FROM partidas) AS partidas');
      return json(res, 200, { banco: true, host: config.DB_HOST, nome: config.DB_NAME, jogadores: c.jogadores, partidas: c.partidas });
    } catch (e) {
      console.error(`Banco indisponivel: ${e.code || e.message}`);
      return json(res, 200, { banco: false, host: config.DB_HOST, nome: config.DB_NAME });
    }
  }

  if (rota === 'GET /api/curiosidades') {
    const [linhas] = await pool.query('SELECT texto FROM curiosidades');
    return json(res, 200, linhas.map((l) => l.texto));
  }

  if (rota === 'GET /api/computadores') {
    const [linhas] = await pool.query('SELECT id, nome FROM computadores ORDER BY id');
    return json(res, 200, linhas);
  }

  // Sorteia no banco o computador que veio na caixa.
  if (rota === 'GET /api/caixa') {
    const ultima = Number(url.searchParams.get('ultima')) || 0;
    const sql = 'SELECT * FROM computadores WHERE id <> ? ORDER BY RAND() LIMIT 1';
    const [linhas] = await pool.execute(sql, [ultima]);
    if (!linhas.length) return json(res, 404, { erro: 'Nenhum computador cadastrado. Execute o banco.sql.' });
    const c = linhas[0];
    return json(res, 200, {
      id: c.id, nome: c.nome, artigo: c.artigo, uso: c.uso,
      specs: { mobo: c.placa_mae, cpu: c.processador, ram: c.memoria, gpu: c.video, ssd: c.armazenamento, psu: c.fonte },
      sql: textoSql(sql, [ultima]),
    });
  }

  if (rota === 'GET /api/ranking') return json(res, 200, await lerRanking());

  if (rota === 'GET /api/jogadores') {
    const [linhas] = await pool.query('SELECT id, nome FROM jogadores ORDER BY id DESC LIMIT 5');
    return json(res, 200, linhas);
  }

  // Tela de cadastro
  if (rota === 'POST /api/jogadores') {
    let b;
    try { b = await lerCorpo(req); } catch (_) { return json(res, 400, { erro: 'Dados inválidos.' }); }
    const nome = String(b.nome || '').trim().replace(/\s+/g, ' ');
    const email = String(b.email || '').trim().toLowerCase();
    if (nome.length < 2 || nome.length > 60) return json(res, 400, { erro: 'Digite o nome com 2 a 60 letras.' });
    if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { erro: 'Digite um e-mail válido, como nome@exemplo.com.' });

    const sql = 'INSERT INTO jogadores (nome, email) VALUES (?, ?)';
    try {
      const [r] = await pool.execute(sql, [nome, email]);
      return json(res, 201, { id: r.insertId, nome, novo: true, sql: textoSql(sql, [nome, email]) });
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') throw e;
      const busca = 'SELECT id, nome FROM jogadores WHERE email = ?';
      const [linhas] = await pool.execute(busca, [email]);
      return json(res, 200, { id: linhas[0].id, nome: linhas[0].nome, novo: false, sql: textoSql(busca, [email]) });
    }
  }

  // Grava o resultado do jogo
  if (rota === 'POST /api/partidas') {
    let b;
    try { b = await lerCorpo(req); } catch (_) { return json(res, 400, { erro: 'Dados inválidos.' }); }
    const valores = [Number(b.jogador_id), Number(b.computador_id), Number(b.pontos), Number(b.tempo_seg)];
    if (!valores.every(Number.isInteger) || valores[0] < 1 || valores[1] < 1 || valores[2] < 0 || valores[2] > 2000 || valores[3] < 0 || valores[3] > 3600) {
      return json(res, 400, { erro: 'Dados da partida inválidos.' });
    }
    const sql = 'INSERT INTO partidas (jogador_id, computador_id, pontos, tempo_seg) VALUES (?, ?, ?, ?)';
    try {
      const [r] = await pool.execute(sql, valores);
      return json(res, 201, { id: r.insertId, ranking: await lerRanking(), sql: textoSql(sql, valores) });
    } catch (e) {
      if (e.code === 'ER_NO_REFERENCED_ROW_2') return json(res, 400, { erro: 'Esse jogador não existe no banco. Faça o cadastro de novo.' });
      throw e;
    }
  }

  return json(res, 404, { erro: 'Endereço não encontrado.' });
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    try {
      return await api(req, res, `${req.method} ${url.pathname}`, url);
    } catch (e) {
      console.error(`Erro no banco: ${e.code || ''} ${e.message}`);
      return json(res, 503, { erro: 'Sem conexão com o banco de dados. Rode node testar-banco.js para ver o motivo.' });
    }
  }

  let caminho;
  try { caminho = decodeURIComponent(url.pathname); } catch (_) { caminho = '/'; }
  if (caminho === '/') caminho = '/index.html';
  const arquivo = path.join(PUBLICO, path.normalize(caminho));

  if (req.method !== 'GET' || !arquivo.startsWith(PUBLICO + path.sep) || !fs.existsSync(arquivo) || !fs.statSync(arquivo).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Página não encontrada.');
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(arquivo).pipe(res);
});

servidor.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`A porta ${PORTA} já está em uso. Feche o outro servidor e rode de novo.`);
  else console.error(e.message);
  process.exit(1);
});

servidor.listen(PORTA, '127.0.0.1', () => {
  console.log(`TechBox no ar: http://localhost:${PORTA}`);
  console.log(`Banco MySQL: ${config.DB_HOST}:${config.DB_PORT || 3306}`);
  console.log('Para parar, aperte Ctrl + C.');
});
