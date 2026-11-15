// TechBox: servidor do site. Entrega a página e conversa com o MySQL.
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
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

// Guarda os últimos comandos SQL para mostrar no painel do site.
const ultimosSql = [];
function textoSql(sql, valores = []) {
  let i = 0;
  return sql.replace(/\s+/g, ' ').trim().replace(/\?/g, () => {
    const v = valores[i++];
    if (v === null || v === undefined) return 'NULL';
    return typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
  });
}
function registrar(sql, valores) {
  const texto = textoSql(sql, valores) + ';';
  ultimosSql.unshift({ hora: new Date().toLocaleTimeString('pt-BR'), sql: texto });
  ultimosSql.length = Math.min(ultimosSql.length, 6);
  return texto;
}
// Executa e registra um comando que grava dados. A gravação usa parâmetros (?), que evitam SQL injection.
async function gravar(sql, valores) {
  const [r] = await pool.execute(sql, valores);
  return { r, sql: registrar(sql, valores) };
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
      if (texto.length > 4000) { reject(new Error('grande')); req.destroy(); }
    });
    req.on('end', () => { try { resolve(JSON.parse(texto || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

// Pontos da competição. Monte seu PC: melhor montagem de cada jogo (estrelas * 100, +50 médio, +100 difícil).
// Técnico: melhor partida (acertos * 50).
const PTS_MONTAR = `SELECT t.jogador_id, SUM(t.melhor) AS pts FROM (
    SELECT m.jogador_id, m.jogo_id,
      MAX(m.estrelas * 100 + CASE j.nivel WHEN 'm' THEN 50 WHEN 'd' THEN 100 ELSE 0 END) AS melhor
    FROM montagens m JOIN jogos j ON j.id = m.jogo_id
    WHERE m.rodou = 1 GROUP BY m.jogador_id, m.jogo_id) t
  GROUP BY t.jogador_id`;
const PTS_TECNICO = 'SELECT jogador_id, MAX(acertos) * 50 AS pts FROM diagnosticos GROUP BY jogador_id';

async function api(req, res, rota, url) {
  if (rota === 'GET /api/status') {
    try {
      await pool.query('SELECT 1');
      return json(res, 200, { banco: true, host: config.DB_HOST, nome: config.DB_NAME });
    } catch (e) {
      console.error(`Banco indisponível: ${e.code || e.message}`);
      return json(res, 200, { banco: false, host: config.DB_HOST, nome: config.DB_NAME });
    }
  }

  if (rota === 'GET /api/jogos') {
    const [linhas] = await pool.query('SELECT * FROM jogos ORDER BY id');
    return json(res, 200, linhas);
  }

  if (rota === 'GET /api/pecas') {
    const [linhas] = await pool.query('SELECT * FROM pecas ORDER BY id');
    return json(res, 200, linhas);
  }

  // Tela de cadastro
  if (rota === 'POST /api/jogadores') {
    let b;
    try { b = await lerCorpo(req); } catch (_) { return json(res, 400, { erro: 'Dados inválidos.' }); }
    const nome = String(b.nome || '').trim().replace(/\s+/g, ' ');
    const email = String(b.email || '').trim().toLowerCase() || null;
    if (nome.length < 2 || nome.length > 60) return json(res, 400, { erro: 'Digite o nome com 2 a 60 letras.' });
    if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return json(res, 400, { erro: 'Digite um e-mail válido, como nome@exemplo.com, ou deixe em branco.' });
    try {
      const { r, sql } = await gravar('INSERT INTO jogadores (nome, email) VALUES (?, ?)', [nome, email]);
      return json(res, 201, { id: r.insertId, nome, novo: true, sql });
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') throw e;
      const [linhas] = await pool.execute('SELECT id, nome FROM jogadores WHERE email = ?', [email]);
      return json(res, 200, { id: linhas[0].id, nome: linhas[0].nome, novo: false });
    }
  }

  // PC montado e testado
  if (rota === 'POST /api/montagens') {
    let b;
    try { b = await lerCorpo(req); } catch (_) { return json(res, 400, { erro: 'Dados inválidos.' }); }
    const jogadorId = Number(b.jogador_id);
    const estrelas = Number(b.estrelas);
    const rodou = b.rodou ? 1 : 0;
    const slugs = ['cpu', 'ram', 'gpu', 'ssd', 'psu'].map((c) => String((b.pecas || {})[c] || ''));
    if (!Number.isInteger(jogadorId) || jogadorId < 1 || !Number.isInteger(estrelas) || estrelas < 0 || estrelas > 3) return json(res, 400, { erro: 'Dados da montagem inválidos.' });
    const [[jogo]] = await pool.execute('SELECT id FROM jogos WHERE slug = ?', [String(b.jogo || '')]);
    const [pecas] = await pool.query('SELECT id, slug, categoria, preco FROM pecas WHERE slug IN (?)', [slugs]);
    const porCat = Object.fromEntries(pecas.map((p) => [p.categoria, p]));
    if (!jogo || ['cpu', 'ram', 'gpu', 'ssd', 'psu'].some((c, i) => !porCat[c] || porCat[c].slug !== slugs[i])) return json(res, 400, { erro: 'Jogo ou peça não encontrados no banco.' });
    // O gasto é calculado com os preços do banco, não com o que o navegador mandou.
    const gasto = pecas.reduce((s, p) => s + Number(p.preco), 0);
    try {
      const { r, sql } = await gravar(
        'INSERT INTO montagens (jogador_id, jogo_id, cpu_id, ram_id, gpu_id, ssd_id, psu_id, gasto, rodou, estrelas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [jogadorId, jogo.id, porCat.cpu.id, porCat.ram.id, porCat.gpu.id, porCat.ssd.id, porCat.psu.id, gasto, rodou, rodou ? estrelas : 0]);
      return json(res, 201, { id: r.insertId, sql });
    } catch (e) {
      if (e.code === 'ER_NO_REFERENCED_ROW_2') return json(res, 400, { erro: 'Esse jogador não existe no banco. Faça o cadastro de novo.' });
      throw e;
    }
  }

  // Resultado do Técnico por um dia
  if (rota === 'POST /api/diagnosticos') {
    let b;
    try { b = await lerCorpo(req); } catch (_) { return json(res, 400, { erro: 'Dados inválidos.' }); }
    const v = [Number(b.jogador_id), Number(b.acertos), Number(b.total)];
    if (!v.every(Number.isInteger) || v[0] < 1 || v[2] < 1 || v[2] > 20 || v[1] < 0 || v[1] > v[2]) return json(res, 400, { erro: 'Resultado inválido.' });
    try {
      const { r, sql } = await gravar('INSERT INTO diagnosticos (jogador_id, acertos, total) VALUES (?, ?, ?)', v);
      return json(res, 201, { id: r.insertId, sql });
    } catch (e) {
      if (e.code === 'ER_NO_REFERENCED_ROW_2') return json(res, 400, { erro: 'Esse jogador não existe no banco. Faça o cadastro de novo.' });
      throw e;
    }
  }

  // Competição: ranking, totais e últimas jogadas
  if (rota === 'GET /api/painel') {
    const [[n]] = await pool.query(`SELECT
      (SELECT COUNT(*) FROM (SELECT jogador_id FROM montagens UNION SELECT jogador_id FROM diagnosticos) x) AS jogadores,
      (SELECT COUNT(*) FROM montagens WHERE rodou = 1) AS rodaram,
      (SELECT COALESCE(SUM(total), 0) FROM diagnosticos) AS clientes`);
    const [ranking] = await pool.query(`SELECT g.id, g.nome,
        COALESCE(pm.pts, 0) AS montar, COALESCE(pt.pts, 0) AS tecnico, COALESCE(pm.pts, 0) + COALESCE(pt.pts, 0) AS total
      FROM jogadores g
      LEFT JOIN (${PTS_MONTAR}) pm ON pm.jogador_id = g.id
      LEFT JOIN (${PTS_TECNICO}) pt ON pt.jogador_id = g.id
      WHERE COALESCE(pm.pts, 0) + COALESCE(pt.pts, 0) > 0
      ORDER BY total DESC, g.id ASC
      LIMIT 20`);
    const [montou] = await pool.query(`SELECT m.id, g.nome, j.nome AS jogo, m.estrelas,
        m.estrelas * 100 + CASE j.nivel WHEN 'm' THEN 50 WHEN 'd' THEN 100 ELSE 0 END AS pontos, m.criado_em AS quando
      FROM montagens m JOIN jogadores g ON g.id = m.jogador_id JOIN jogos j ON j.id = m.jogo_id
      WHERE m.rodou = 1 ORDER BY m.id DESC LIMIT 8`);
    const [tecnico] = await pool.query(`SELECT d.id, g.nome, d.acertos, d.total, d.acertos * 50 AS pontos, d.criado_em AS quando
      FROM diagnosticos d JOIN jogadores g ON g.id = d.jogador_id
      ORDER BY d.id DESC LIMIT 8`);
    const feito = [
      ...montou.map((m) => ({ nome: m.nome, tipo: 'montar', jogo: m.jogo, estrelas: m.estrelas, pontos: Number(m.pontos), quando: m.quando })),
      ...tecnico.map((d) => ({ nome: d.nome, tipo: 'tecnico', acertos: d.acertos, total: d.total, pontos: Number(d.pontos), quando: d.quando })),
    ].sort((a, b) => new Date(b.quando) - new Date(a.quando)).slice(0, 8);
    return json(res, 200, {
      totais: { jogadores: Number(n.jogadores), rodaram: Number(n.rodaram), clientes: Number(n.clientes) },
      ranking: ranking.map((r) => ({ id: r.id, nome: r.nome, montar: Number(r.montar), tecnico: Number(r.tecnico), total: Number(r.total) })),
      feito,
    });
  }

  // Pontos de um jogador (botão do topo)
  if (rota === 'GET /api/pontos') {
    const id = Number(url.searchParams.get('jogador_id'));
    if (!Number.isInteger(id) || id < 1) return json(res, 400, { erro: 'Jogador inválido.' });
    const [[p]] = await pool.execute(`SELECT
      COALESCE((SELECT pm.pts FROM (${PTS_MONTAR}) pm WHERE pm.jogador_id = ?), 0) AS montar,
      COALESCE((SELECT pt.pts FROM (${PTS_TECNICO}) pt WHERE pt.jogador_id = ?), 0) AS tecnico`, [id, id]);
    const montar = Number(p.montar), tecnico = Number(p.tecnico);
    return json(res, 200, { montar, tecnico, total: montar + tecnico });
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
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(arquivo).pipe(res);
});

servidor.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`A porta ${PORTA} já está em uso. O site já está rodando, ou feche o outro programa.`);
  else console.error(e.message);
  process.exit(1);
});

servidor.listen(PORTA, '0.0.0.0', () => {
  console.log(`TechBox no ar: http://localhost:${PORTA}`);
  console.log(`Banco MySQL: ${config.DB_HOST}:${config.DB_PORT || 3306}, banco ${config.DB_NAME}`);
  console.log('Para parar, aperte Ctrl + C.');
});
