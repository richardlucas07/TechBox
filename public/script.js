(() => {
  'use strict';

  const PECAS = [
    { id: 'mobo', pista: 'Liga todas as peças entre si', ref: 'MB1', nome: 'Placa-mãe',
      fato: 'O formato ATX, usado até hoje em muitas placas-mãe, foi criado pela Intel em 1995.',
      svg: `<rect x="14" y="4" width="92" height="72" fill="#1f6f8b" stroke="#35d0f5" stroke-width="2"/><rect x="24" y="12" width="26" height="26" fill="#0e1a24" stroke="#eef1f6"/><rect x="60" y="12" width="5" height="34" fill="#eef1f6"/><rect x="69" y="12" width="5" height="34" fill="#eef1f6"/><rect x="24" y="48" width="30" height="5" fill="#35d0f5"/><rect x="24" y="60" width="44" height="5" fill="#35d0f5"/><circle cx="90" cy="60" r="8" fill="#d9dee6"/>` },
    { id: 'cpu', pista: 'Executa as instruções dos programas', ref: 'U1', nome: 'Processador',
      fato: 'O Intel 4004, de 1971, tinha cerca de 2.300 transistores. Os processadores atuais têm bilhões.',
      svg: `<rect x="32" y="12" width="56" height="56" fill="#2a8fb0" stroke="#35d0f5" stroke-width="2"/><rect x="44" y="24" width="32" height="32" fill="#d9dee6"/><g stroke="#35d0f5" stroke-width="2"><path d="M40 12V5M50 12V5M60 12V5M70 12V5M80 12V5M40 68v7M50 68v7M60 68v7M70 68v7M80 68v7M32 22h-7M32 34h-7M32 46h-7M32 58h-7M88 22h7M88 34h7M88 46h7M88 58h7"/></g>` },
    { id: 'ram', pista: 'Guarda o que está em uso e apaga ao desligar', ref: 'DIMM1', nome: 'Memória RAM',
      fato: 'DDR significa Double Data Rate: a memória transfere dados duas vezes em cada ciclo do clock.',
      svg: `<rect x="4" y="22" width="112" height="34" fill="#1f6f8b" stroke="#35d0f5" stroke-width="2"/><g fill="#0e1a24"><rect x="12" y="29" width="14" height="18"/><rect x="30" y="29" width="14" height="18"/><rect x="48" y="29" width="14" height="18"/><rect x="66" y="29" width="14" height="18"/><rect x="84" y="29" width="14" height="18"/></g><path d="M8 56h104" stroke="#35d0f5" stroke-width="5" stroke-dasharray="3 2"/>` },
    { id: 'gpu', pista: 'Gera as imagens enviadas ao monitor', ref: 'PCIE1', nome: 'Placa de vídeo',
      fato: 'O termo GPU foi popularizado pela NVIDIA em 1999, no lançamento da GeForce 256.',
      svg: `<rect x="6" y="14" width="108" height="46" fill="#2a303c" stroke="#35d0f5" stroke-width="2"/><g fill="#0e1a24" stroke="#d9dee6" stroke-width="2"><circle cx="36" cy="37" r="17"/><circle cx="84" cy="37" r="17"/></g><g stroke="#d9dee6" stroke-width="2"><path d="M36 22v30M21 37h30M84 22v30M69 37h30"/></g><path d="M20 60v8h60v-8" fill="#35d0f5"/>` },
    { id: 'ssd', pista: 'Guarda os arquivos mesmo desligado', ref: 'M2_1', nome: 'Armazenamento SSD',
      fato: 'O SSD não tem partes móveis. O primeiro HD comercial, o IBM 305 RAMAC de 1956, guardava cerca de 3,75 MB e pesava perto de uma tonelada.',
      svg: `<rect x="6" y="28" width="108" height="24" fill="#1f6f8b" stroke="#35d0f5" stroke-width="2"/><g fill="#0e1a24"><rect x="18" y="33" width="22" height="14"/><rect x="46" y="33" width="22" height="14"/><rect x="74" y="33" width="14" height="14"/></g><path d="M6 32v16" stroke="#35d0f5" stroke-width="5"/><circle cx="106" cy="40" r="4" fill="#11151e"/>` },
    { id: 'psu', pista: 'Converte a energia da tomada para o PC', ref: 'ATX1', nome: 'Fonte de alimentação',
      fato: 'Uma fonte 80 Plus Bronze precisa ter pelo menos 85% de eficiência com metade da carga, na rede de 115 V.',
      svg: `<rect x="22" y="6" width="76" height="68" fill="#2a303c" stroke="#35d0f5" stroke-width="2"/><circle cx="60" cy="40" r="26" fill="#0e1a24" stroke="#d9dee6" stroke-width="2"/><g stroke="#d9dee6" stroke-width="2"><path d="M60 14v52M34 40h52M42 22l36 36M78 22L42 58"/></g>` },
  ];

  const QUIZ = [
    { p: 'Qual peça perde o conteúdo quando o PC desliga?', r: ['Memória RAM', 'SSD', 'HD'] },
    { p: 'O que significa CPU?', r: ['Central Processing Unit', 'Computer Power Unit', 'Core Program Utility'] },
    { p: 'Quantos bits tem 1 byte?', r: ['8', '4', '16'] },
    { p: 'Qual é a vantagem física do SSD sobre o HD?', r: ['Não tem partes móveis', 'Não usa energia', 'Não precisa de cabos'] },
    { p: 'O que a fonte faz com a energia da tomada?', r: ['Converte corrente alternada em contínua', 'Armazena para usar depois', 'Aumenta a tensão para 220 V'] },
    { p: 'O que significa DDR na memória?', r: ['Double Data Rate', 'Direct Disk Read', 'Dual Drive RAM'] },
    { p: 'Qual destes formatos de placa-mãe é o menor?', r: ['Mini-ITX', 'Micro-ATX', 'ATX'] },
    { p: 'Para que serve a bateria CR2032 da placa-mãe?', r: ['Manter o relógio e as configurações', 'Ligar o PC sem tomada', 'Alimentar o processador'] },
  ];

  const $ = (id) => document.getElementById(id);
  const criar = (tag, classe, texto) => {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texto !== undefined) el.textContent = texto;
    return el;
  };
  const embaralhar = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const svgDe = (p) => `<svg viewBox="0 0 120 80" aria-hidden="true">${p.svg}</svg>`;

  const cubo = $('cubo'), abrir = $('abrir'), resultado = $('resultado'), fato = $('fato'), painel = $('painel');
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const espera = (ms) => new Promise((r) => setTimeout(r, reduzido ? Math.min(ms, 80) : ms));

  const som = (() => {
    let ctx = null, ligado = true;
    try { ligado = localStorage.getItem('mb-som') !== 'off'; } catch (_) {}
    const iniciar = () => {
      if (!ligado) return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    const tom = (freq, ini, dur, tipo = 'triangle', vol = .18) => {
      const c = iniciar(); if (!c) return;
      const t = c.currentTime + ini;
      const o = c.createOscillator(), g = c.createGain();
      o.type = tipo; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur + .02);
    };
    const ruido = (dur, de, para, vol = .25, ini = 0) => {
      const c = iniciar(); if (!c) return;
      const t = c.currentTime + ini;
      const n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = 'bandpass'; f.Q.value = 1.1;
      f.frequency.setValueAtTime(de, t); f.frequency.exponentialRampToValueAtTime(para, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(c.destination);
      s.start(t);
    };
    const ESCALA = [392, 440, 494, 587, 659, 784];
    return {
      get ligado() { return ligado; },
      alternar() {
        ligado = !ligado;
        try { localStorage.setItem('mb-som', ligado ? 'on' : 'off'); } catch (_) {}
        return ligado;
      },
      preparar: iniciar,
      chacoalhar() { for (let i = 0; i < 6; i++) { ruido(.1, 240, 120, .4, i * .15); tom(70 + i * 6, i * .15, .1, 'sine', .2); } },
      rasgar() { ruido(.42, 900, 5200, .34); },
      abas() { ruido(.16, 300, 140, .5); tom(96, 0, .22, 'sine', .3); tom(150, .18, .16, 'sine', .22); },
      bipe(i) { tom(ESCALA[i % 6], 0, .2); tom(ESCALA[i % 6] * 2, .03, .12, 'square', .05); },
      erro() { tom(140, 0, .25, 'sawtooth', .16); tom(110, .1, .28, 'sawtooth', .16); },
      ligar() { tom(988, 0, .25, 'square', .1); ruido(.9, 120, 700, .12, .1); },
      certo() { tom(659, 0, .14); tom(988, .1, .24); },
      fim() { [523, 659, 784, 1047].forEach((f, i) => tom(f, i * .12, i === 3 ? .7 : .22, 'triangle', .2)); },
    };
  })();

  // Som
  const pintarSom = () => {
    $('som').textContent = som.ligado ? 'Som ligado' : 'Som desligado';
    $('som').setAttribute('aria-pressed', String(som.ligado));
  };
  pintarSom();
  $('som').addEventListener('click', () => { som.alternar(); pintarSom(); som.bipe(3); });

  // Curiosidades
  let fatos = embaralhar(PECAS.map((p) => p.fato));
  let indiceFato = 0;
  const proximoFato = () => { fato.textContent = fatos[indiceFato++ % fatos.length]; };
  proximoFato();
  $('outra').addEventListener('click', () => { som.bipe(2); proximoFato(); });

  // Coleção de computadores encontrados
  let achados = [];
  try { achados = JSON.parse(localStorage.getItem('techbox-achados') || '[]'); } catch (_) {}
  const guardarAchado = (nome) => {
    if (!achados.includes(nome)) achados.push(nome);
    try { localStorage.setItem('techbox-achados', JSON.stringify(achados)); } catch (_) {}
  };

  // Estado do jogo
  let fase = 'inicio', pontos = 0, palpite = null, montagem = null, ultima = 0, computadores = [], jogador = null;
  let selecionada = null, restantes = 0, inicioTempo = 0, relogio = null, segundos = 0;

  function somar(n) {
    pontos = Math.max(0, pontos + n);
    $('pontos').textContent = pontos;
  }

  function pintarChips() {
    $('chips').replaceChildren(...computadores.map((m) => {
      const b = criar('button', 'chip' + (achados.includes(m.nome) ? ' achado' : ''), m.nome);
      b.type = 'button';
      b.disabled = fase !== 'inicio';
      b.setAttribute('aria-pressed', String(palpite === m.nome));
      b.addEventListener('click', () => {
        palpite = palpite === m.nome ? null : m.nome;
        som.bipe(1);
        pintarChips();
      });
      return b;
    }));
  }

  // Soquetes
  const soquetes = {};
  for (const p of PECAS) {
    const b = criar('button', 'soquete');
    b.type = 'button';
    b.dataset.id = p.id;
    b.addEventListener('click', () => {
      if (fase === 'montar' && selecionada && !b.classList.contains('on')) return tentar(selecionada, b);
      if (b.classList.contains('on')) { fato.textContent = p.fato; som.bipe(0); }
    });
    $('soquetes').append(b);
    soquetes[p.id] = b;
  }

  function limparSoquetes() {
    for (const p of PECAS) {
      const s = soquetes[p.id];
      s.className = 'soquete';
      s.replaceChildren(criar('span', 'ref', p.ref), criar('span', 'desenho', '?'), criar('span', 'nome', 'Peça oculta'), criar('span', 'spec', p.pista));
    }
  }

  // Colocar a peça no soquete
  function tentar(peca, soquete) {
    const p = PECAS.find((x) => x.id === peca.dataset.id);
    if (soquete.dataset.id !== p.id) {
      somar(-20);
      som.erro();
      resultado.textContent = `${p.nome} não vai nesse soquete. Leia a pista e tente outro. −20 pontos.`;
      soquete.classList.remove('errou');
      void soquete.offsetWidth;
      soquete.classList.add('errou');
      return;
    }
    somar(100);
    som.bipe(6 - restantes);
    soquete.querySelector('.desenho').innerHTML = svgDe(p);
    soquete.querySelector('.nome').textContent = p.nome;
    soquete.querySelector('.spec').textContent = montagem.specs[p.id];
    soquete.classList.remove('alvo', 'errou');
    soquete.classList.add('on');
    fato.textContent = p.fato;
    resultado.textContent = `${p.nome} encaixada. +100 pontos.`;
    peca.remove();
    selecionada = null;
    restantes--;
    if (!restantes) montagemConcluida();
  }

  function escolher(peca) {
    const mesma = selecionada === peca;
    document.querySelectorAll('.peca').forEach((x) => x.classList.remove('escolhida'));
    selecionada = mesma ? null : peca;
    if (selecionada) {
      peca.classList.add('escolhida');
      som.bipe(1);
      resultado.textContent = 'Agora clique no soquete certo.';
    }
  }

  function ativarArrasto(peca, p) {
    let ini = null, fantasma = null, arrastou = false;
    const sobre = (x, y) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.closest('.soquete:not(.on)') : null;
    };
    const mover = (e) => {
      if (!arrastou && Math.hypot(e.clientX - ini.x, e.clientY - ini.y) < 8) return;
      if (!arrastou) {
        arrastou = true;
        fantasma = criar('div', 'arrasto');
        fantasma.innerHTML = svgDe(p);
        document.body.append(fantasma);
        peca.classList.add('oculta');
      }
      fantasma.style.left = e.clientX - 55 + 'px';
      fantasma.style.top = e.clientY - 37 + 'px';
      document.querySelectorAll('.soquete.sobre').forEach((s) => s.classList.remove('sobre'));
      const alvo = sobre(e.clientX, e.clientY);
      if (alvo) alvo.classList.add('sobre');
    };
    const soltar = (e) => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      if (!arrastou) return;
      fantasma.remove();
      peca.classList.remove('oculta');
      document.querySelectorAll('.soquete.sobre').forEach((s) => s.classList.remove('sobre'));
      const alvo = e.type === 'pointerup' ? sobre(e.clientX, e.clientY) : null;
      if (alvo) tentar(peca, alvo);
      peca.dataset.arrastou = '1';
      setTimeout(() => { delete peca.dataset.arrastou; }, 0);
    };
    peca.addEventListener('pointerdown', (e) => {
      if (fase !== 'montar') return;
      ini = { x: e.clientX, y: e.clientY };
      arrastou = false;
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', soltar);
      window.addEventListener('pointercancel', soltar);
    });
    peca.addEventListener('click', () => {
      if (fase === 'montar' && !peca.dataset.arrastou) escolher(peca);
    });
  }

  async function voar(p, destino) {
    const origem = cubo.getBoundingClientRect();
    const alvo = destino.getBoundingClientRect();
    const el = criar('div', 'voando');
    el.innerHTML = svgDe(p);
    const x0 = origem.left + origem.width / 2 - 60, y0 = origem.top + origem.height * .2 - 40;
    el.style.left = x0 + 'px';
    el.style.top = y0 + 'px';
    document.body.append(el);
    const dx = alvo.left + alvo.width / 2 - 60 - x0, dy = alvo.top + alvo.height / 2 - 40 - y0;
    await el.animate([
      { transform: 'translate(0, 40px) scale(.3)', opacity: 0 },
      { transform: 'translate(0, -50px) scale(1.25)', opacity: 1, offset: .4 },
      { transform: `translate(${dx}px, ${dy}px) scale(.5)`, opacity: 1 },
    ], { duration: 520, easing: 'cubic-bezier(.4, 0, .3, 1)' }).finished.catch(() => {});
    el.remove();
  }

  function iniciarRelogio() {
    inicioTempo = Date.now();
    segundos = 0;
    relogio = setInterval(() => {
      segundos = Math.floor((Date.now() - inicioTempo) / 1000);
      $('tempo').textContent = segundos + 's';
    }, 250);
  }

  // Fases
  async function abrirCaixa() {
    if (fase === 'fim') return reiniciar();
    if (fase !== 'inicio') return;
    fase = 'abrindo';
    som.preparar();
    abrir.disabled = true;
    abrir.textContent = 'Abrindo…';
    pintarChips();
    resultado.textContent = 'Sorteando no banco de dados…';
    try {
      montagem = await pedir(`/api/caixa?ultima=${ultima}`);
    } catch (e) {
      resultado.textContent = e.message;
      fase = 'inicio';
      abrir.disabled = false;
      abrir.textContent = 'Abrir minha caixa';
      pintarChips();
      return;
    }
    ultima = montagem.id;
    mostrarSql(montagem.sql);
    resultado.textContent = 'A caixa está abrindo…';

    cubo.classList.add('treme');
    som.chacoalhar();
    await espera(900);
    cubo.classList.remove('treme');
    cubo.classList.add('rasgada');
    som.rasgar();
    await espera(420);
    cubo.classList.add('aberta');
    som.abas();
    await espera(750);

    const bandeja = criar('div', 'bandeja');
    const pecas = embaralhar(PECAS).map((p) => {
      const b = criar('button', 'peca oculta');
      b.type = 'button';
      b.dataset.id = p.id;
      b.innerHTML = svgDe(p);
      b.append(p.nome.replace('Armazenamento ', ''));
      ativarArrasto(b, p);
      bandeja.append(b);
      return { b, p };
    });
    painel.replaceChildren(criar('p', 'dica', 'Arraste cada peça até o soquete certo, ou clique na peça e depois no soquete.'), bandeja);

    if (matchMedia('(max-width: 820px)').matches) {
      document.querySelector('.bancada').scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' });
      await espera(450);
    }
    for (const { b, p } of pecas) {
      if (!reduzido) await voar(p, b);
      b.classList.remove('oculta');
      som.bipe(3);
    }

    restantes = PECAS.length;
    Object.values(soquetes).forEach((s) => s.classList.add('alvo'));
    fase = 'montar';
    abrir.textContent = 'Monte o computador';
    resultado.textContent = 'Encaixe as 6 peças. Acerto vale +100 e erro tira 20.';
    iniciarRelogio();
  }

  function montagemConcluida() {
    clearInterval(relogio);
    const bonus = Math.max(0, 90 - segundos) * 2;
    somar(bonus);
    let texto = `Veio ${montagem.artigo} ${montagem.nome}, ${montagem.uso}. Bônus de tempo: +${bonus}.`;
    if (palpite) {
      if (palpite === montagem.nome) { somar(50); texto += ' Palpite certo: +50.'; }
      else texto += ' Palpite errado.';
    }
    resultado.textContent = texto;
    guardarAchado(montagem.nome);
    pintarChips();
    fase = 'ligar';
    som.certo();

    const bloco = criar('div', 'ligar');
    const botao = criar('button', 'power', 'Ligar');
    botao.type = 'button';
    botao.addEventListener('click', async () => {
      botao.disabled = true;
      som.ligar();
      for (const p of PECAS) {
        soquetes[p.id].classList.add('ligado');
        await espera(110);
      }
      resultado.textContent = 'O computador ligou. Responda 3 perguntas: cada acerto vale +50.';
      await espera(350);
      iniciarQuiz();
    });
    bloco.append(botao, criar('p', 'dica', 'Peças no lugar. Aperte para ligar o computador.'));
    painel.replaceChildren(bloco);
    botao.focus();
  }

  function iniciarQuiz() {
    fase = 'quiz';
    const perguntas = embaralhar(QUIZ).slice(0, 3);
    let i = 0, acertos = 0;

    const mostrar = () => {
      const q = perguntas[i];
      const titulo = criar('p', 'pergunta', q.p);
      titulo.prepend(criar('small', '', `Pergunta ${i + 1} de 3`));
      const lista = criar('div', 'respostas');
      const certa = q.r[0];
      for (const texto of embaralhar(q.r)) {
        const b = criar('button', 'resposta', texto);
        b.type = 'button';
        b.addEventListener('click', () => {
          lista.querySelectorAll('button').forEach((x) => {
            x.disabled = true;
            if (x.textContent === certa) x.classList.add('certa');
          });
          if (texto === certa) { acertos++; somar(50); som.certo(); }
          else { b.classList.add('errada'); som.erro(); }
          const seguir = criar('button', 'seguir', i < 2 ? 'Próxima pergunta' : 'Ver resultado');
          seguir.type = 'button';
          seguir.addEventListener('click', () => { i++; i < 3 ? mostrar() : terminar(acertos); });
          painel.append(seguir);
          seguir.focus();
        });
        lista.append(b);
      }
      painel.replaceChildren(titulo, lista);
    };
    mostrar();
  }

  function terminar(acertos) {
    fase = 'fim';
    som.fim();
    resultado.textContent = `Você montou ${montagem.artigo} ${montagem.nome} em ${segundos}s.`;
    abrir.disabled = false;
    abrir.textContent = 'Abrir outra caixa';

    const bloco = criar('div', 'fim');
    bloco.append(criar('h3', '', `${pontos} pontos`), criar('p', '', `Você acertou ${acertos} de 3 perguntas.`));
    const aviso = criar('p', 'aviso-form', 'Gravando a partida no MySQL…');
    aviso.setAttribute('role', 'status');
    bloco.append(aviso);
    painel.replaceChildren(bloco);

    const gravar = async () => {
      aviso.textContent = 'Gravando a partida no MySQL…';
      bloco.querySelector('.seguir')?.remove();
      try {
        const r = await pedir('/api/partidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jogador_id: jogador.id, computador_id: montagem.id, pontos, tempo_seg: segundos }),
        });
        aviso.textContent = `Partida nº ${r.id} gravada no MySQL.`;
        mostrarSql(r.sql);
        pintarRanking(r.ranking);
        atualizarBanco();
      } catch (e) {
        aviso.textContent = e.message;
        const repetir = criar('button', 'seguir', 'Tentar gravar de novo');
        repetir.type = 'button';
        repetir.addEventListener('click', gravar);
        bloco.append(repetir);
      }
    };
    gravar();
  }

  async function reiniciar() {
    fase = 'reiniciando';
    abrir.disabled = true;
    cubo.classList.remove('aberta', 'rasgada');
    limparSoquetes();
    painel.replaceChildren();
    pontos = 0;
    palpite = null;
    selecionada = null;
    $('pontos').textContent = '0';
    $('tempo').textContent = '0s';
    resultado.textContent = 'Abra a caixa para receber as peças.';
    await espera(750);
    fase = 'inicio';
    abrir.disabled = false;
    abrir.textContent = 'Abrir minha caixa';
    pintarChips();
  }

  // Ranking
  function pintarRanking(lista) {
    if (!lista.length) {
      $('ranking').replaceChildren(criar('p', '', 'Ninguém jogou ainda. Monte um computador e seja o primeiro.'));
      return;
    }
    const ol = criar('ol');
    for (const item of lista) {
      const li = criar('li');
      const quem = criar('span', 'quem', item.nome + ' ');
      quem.append(criar('small', '', item.pc));
      li.append(quem, criar('b', '', item.pontos));
      ol.append(li);
    }
    $('ranking').replaceChildren(ol);
  }

  async function carregarRanking() {
    try {
      pintarRanking(await pedir('/api/ranking'));
    } catch (e) {
      $('ranking').replaceChildren(criar('p', '', e.message));
    }
  }

  // Comunicacao com o servidor Node
  async function pedir(caminho, opcoes) {
    let r;
    try {
      r = await fetch(caminho, opcoes);
    } catch (_) {
      throw new Error('O servidor não respondeu. Inicie o site com "node server.js".');
    }
    const corpo = await r.json().catch(() => {
      throw new Error('O servidor não respondeu. Inicie o site com "node server.js".');
    });
    if (!r.ok) throw new Error(corpo.erro || 'Não foi possível concluir a operação.');
    return corpo;
  }

  // Painel do banco de dados
  function mostrarSql(texto) {
    if (texto) $('ultimo-sql').textContent = texto + ';';
  }

  async function atualizarBanco() {
    try {
      const s = await pedir('/api/status');
      $('banco-status').className = s.banco ? 'conectado' : 'desconectado';
      $('banco-status').textContent = s.banco
        ? `Conectado ao MySQL em ${s.host}, banco ${s.nome}. ${s.jogadores} jogador(es) e ${s.partidas} partida(s) gravados.`
        : `Sem conexão com o MySQL em ${s.host}. Rode node testar-banco.js para ver o motivo.`;
      if (!s.banco) return;
      const lista = await pedir('/api/jogadores');
      $('banco-jogadores').replaceChildren(...lista.map((l) => criar('li', '', `ID ${l.id}: ${l.nome}`)));
      if (!lista.length) $('banco-jogadores').replaceChildren(criar('li', '', 'Nenhum cadastro ainda.'));
    } catch (e) {
      $('banco-status').className = 'desconectado';
      $('banco-status').textContent = e.message;
    }
  }

  // Tela de cadastro
  function guardarJogador() {
    try {
      if (jogador) localStorage.setItem('techbox-jogador', JSON.stringify(jogador));
      else localStorage.removeItem('techbox-jogador');
    } catch (_) {}
  }

  function pintarJogador() {
    const alvo = $('jogador');
    if (!jogador) return alvo.replaceChildren();
    const trocar = criar('button', 'trocar', 'Trocar');
    trocar.type = 'button';
    trocar.addEventListener('click', async () => {
      if (fase !== 'inicio' && fase !== 'fim') return;
      if (fase === 'fim') await reiniciar();
      jogador = null;
      guardarJogador();
      mostrarCadastro();
    });
    alvo.replaceChildren(`${jogador.nome} (ID ${jogador.id}) `, trocar);
  }

  function mostrarCadastro() {
    fase = 'cadastro';
    pintarJogador();
    pintarChips();
    abrir.disabled = true;
    abrir.textContent = 'Faça o cadastro';
    resultado.textContent = 'Cadastre-se para receber sua caixa.';

    const form = criar('form', 'cadastro');
    form.noValidate = true;
    form.append(criar('h3', '', 'Cadastro do jogador'));
    const campo = (id, rotulo, tipo, max) => {
      const label = criar('label', '', rotulo);
      const input = criar('input');
      input.id = id; input.type = tipo; input.maxLength = max; input.required = true;
      label.append(input);
      form.append(label);
      return input;
    };
    const nome = campo('cad-nome', 'Nome', 'text', 60);
    const email = campo('cad-email', 'E-mail', 'email', 120);
    const erro = criar('p', 'erro-form');
    erro.setAttribute('role', 'alert');
    const botao = criar('button', 'seguir', 'Cadastrar e jogar');
    botao.type = 'submit';
    form.append(erro, botao);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      erro.textContent = '';
      botao.disabled = true;
      try {
        const r = await pedir('/api/jogadores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nome.value, email: email.value }),
        });
        jogador = { id: r.id, nome: r.nome };
        guardarJogador();
        mostrarSql(r.sql);
        atualizarBanco();
        painel.replaceChildren();
        prontoParaJogar(r.novo ? `Cadastro gravado no MySQL com o ID ${r.id}. Abra sua caixa.` : `Bem-vindo de volta, ${r.nome}. Abra sua caixa.`);
      } catch (falha) {
        erro.textContent = falha.message;
        botao.disabled = false;
      }
    });
    painel.replaceChildren(form);
  }

  function prontoParaJogar(texto) {
    fase = 'inicio';
    pintarJogador();
    pintarChips();
    abrir.disabled = false;
    abrir.textContent = 'Abrir minha caixa';
    resultado.textContent = texto;
  }

  async function iniciar() {
    limparSoquetes();
    try { jogador = JSON.parse(localStorage.getItem('techbox-jogador') || 'null'); } catch (_) {}
    if (jogador) prontoParaJogar('Abra a caixa para receber as peças.');
    else mostrarCadastro();
    atualizarBanco();
    carregarRanking();
    try {
      computadores = await pedir('/api/computadores');
      pintarChips();
      const lista = await pedir('/api/curiosidades');
      if (lista.length) { fatos = embaralhar(lista); indiceFato = 0; proximoFato(); }
    } catch (_) {
      // O painel do banco ja mostra o motivo.
    }
  }

  // Clicar na caixa fechada chacoalha
  $('cena').addEventListener('click', () => {
    if (fase !== 'inicio') return;
    som.preparar();
    som.chacoalhar();
    cubo.classList.remove('chacoalha');
    void cubo.offsetWidth;
    cubo.classList.add('chacoalha');
  });

  abrir.addEventListener('click', abrirCaixa);
  iniciar();
})();
