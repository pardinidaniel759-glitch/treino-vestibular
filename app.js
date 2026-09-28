(function () {
  'use strict';

  /* =====================================================================
     1. BANCO DE DADOS & ESTADO GLOBAL
     ===================================================================== */
  const BANCO = [
    { id: 1, mat: 'Português', q: 'Qual a regência verbal correta do verbo "visar" no sentido de almejar?', alt: ['Visar o cargo', 'Visar ao cargo', 'Visar em cargo', 'Visar pelo cargo'], cor: 1 },
    { id: 2, mat: 'Matemática', q: 'Se um candidato acerta 60% de uma prova de 60 questões, quantas questões ele acertou?', alt: ['30', '32', '36', '40'], cor: 2 },
    { id: 3, mat: 'Direito', q: 'Segundo a Constituição Federal, a segurança pública é dever do Estado, direito e responsabilidade de todos. Quem executa a polícia ostensiva em SP?', alt: ['Polícia Civil', 'Polícia Militar', 'Guarda Municipal', 'Polícia Federal'], cor: 1 },
    { id: 4, mat: 'História', q: 'A Revolução Constitucionalista de 1932 ocorreu principalmente em qual estado brasileiro?', alt: ['Rio de Janeiro', 'Minas Gerais', 'São Paulo', 'Rio Grande do Sul'], cor: 2 },
    { id: 5, mat: 'Geografia', q: 'Qual o clima predominante no estado de São Paulo?', alt: ['Equadorial', 'Tropical de Altitude', 'Semiárido', 'Subtropical'], cor: 1 }
  ];

  const KEY = {
    cad: 'astra_cadastro_pmesp',
    erros: 'astra_caderno_erros',
    red: 'astra_redacao_texto',
    taf: 'astra_taf_dados',
    streak: 'astra_streak_dados'
  };

  const store = {
    get: (k, def = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  let sim = null;
  let fc = null;
  let pomodoroTimer = null;
  let pomodoroTempo = 25 * 60;
  let pomodoroAtivo = false;

  let tafEstado = store.get(KEY.taf, {
    perfil: 'masculino',
    valores: {
      masculino: { flexao: 30, abdominais: 40, corrida: 2400, barra: 5 },
      feminino: { flexao: 20, abdominais: 35, corrida: 2000, isometria: 20 }
    }
  });

  /* =====================================================================
     2. MÓDULO DE STREAK E GAMIFICAÇÃO
     ===================================================================== */
  function atualizarStreak() {
    const hoje = new Date().toISOString().split('T')[0];
    let dados = store.get(KEY.streak, { ultimoAcesso: '', diasSeguidos: 0, metaDiaria: 0 });

    if (dados.ultimoAcesso !== hoje) {
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (dados.ultimoAcesso === ontem) {
        dados.diasSeguidos++;
      } else {
        dados.diasSeguidos = 1;
      }
      dados.ultimoAcesso = hoje;
      dados.metaDiaria = 0;
      store.set(KEY.streak, dados);
    }
    return dados;
  }

  function registrarAtividade(qtd = 1) {
    let dados = atualizarStreak();
    dados.metaDiaria += qtd;
    store.set(KEY.streak, dados);
    renderHeader();
  }

  /* =====================================================================
     3. INTERFACE E COMPONENTES
     ===================================================================== */
  function $(sel) { return document.querySelector(sel); }

  function injetarCSS() {
    if ($('#astra-styles')) return;
    const style = document.createElement('style');
    style.id = 'astra-styles';
    style.textContent = `
      :root { --bg: #0e1117; --card: #161b22; --accent: #00e676; --txt: #eee; --border: #30363d; }
      body.alto-contraste { --bg: #000; --card: #111; --accent: #ffff00; --txt: #fff; --border: #fff; }
      #astra-app { max-width: 900px; margin: 0 auto; padding: 20px; color: var(--txt); }
      .astra-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin-bottom: 20px; }
      .astra-btn { background: var(--accent); color: #000; font-weight: bold; border: none; padding: 10px 16px; border-radius: 5px; cursor: pointer; margin: 5px 2px; }
      .astra-btn:hover { opacity: 0.9; }
      .astra-btn-sec { background: #21262d; color: var(--txt); border: 1px solid var(--border); }
      .astra-nav { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
      .astra-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
      .astra-neon { color: var(--accent); font-weight: bold; }
      .modo-foco-ativo header, .modo-foco-ativo .astra-nav, .modo-foco-ativo .no-foco { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  function renderHeader() {
    const streak = atualizarStreak();
    const hdr = $('#astra-header') || document.createElement('header');
    hdr.id = 'astra-header';
    hdr.className = 'astra-card no-print';
    hdr.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="margin:0;">🛡️ ASTRA — PMESP</h2>
          <small>🔥 Sequência: <b>${streak.diasSeguidos} dias</b> | 🎯 Meta de Hoje: <b>${streak.metaDiaria}/20 questões</b></small>
        </div>
        <div>
          <button class="astra-btn astra-btn-sec" id="btn-pomodoro">⏱️ Pomodoro (${Math.floor(pomodoroTempo/60)}:${(pomodoroTempo%60).toString().padStart(2,'0')})</button>
          <button class="astra-btn astra-btn-sec" id="btn-contraste">👁️ Alto Contraste</button>
        </div>
      </div>
    `;
    if (!$('#astra-header')) $('#astra-app').prepend(hdr);
  }

  function montarLayout() {
    renderHeader();
    const nav = document.createElement('nav');
    nav.className = 'astra-nav no-print';
    nav.innerHTML = `
      <button class="astra-btn astra-btn-sec" data-aba="simulado">📝 Simulado</button>
      <button class="astra-btn astra-btn-sec" data-aba="taf">🏋️ Calculadora TAF</button>
      <button class="astra-btn astra-btn-sec" data-aba="redacao">✍️ Redação VUNESP</button>
      <button class="astra-btn astra-btn-sec" data-aba="caderno">📓 Caderno de Erros (Anki)</button>
    `;

    const main = document.createElement('main');
    main.id = 'astra-conteudo';

    $('#astra-app').appendChild(nav);
    $('#astra-app').appendChild(main);
  }

  function showTab(aba) {
    const main = $('#astra-conteudo');
    if (!main) return;
    main.innerHTML = '';

    if (aba === 'simulado') renderSimulado(main);
    if (aba === 'taf') renderTAF(main);
    if (aba === 'redacao') renderRedacao(main);
    if (aba === 'caderno') renderCaderno(main);
  }

  /* =====================================================================
     4. MÓDULOS DE FUNCIONALIDADE
     ===================================================================== */
  function renderSimulado(container) {
    container.innerHTML = `
      <div class="astra-card">
        <h3>🚀 Iniciar Simulado Tático PMESP</h3>
        <p>Escolha o tempo limite para responder às questões do banco oficial:</p>
        <button class="astra-btn" data-tempo="15">⏱️ Simulado Rápido (15 min)</button>
        <button class="astra-btn" data-tempo="60">⏱️ Simulado Médio (60 min)</button>
        <button class="astra-btn astra-btn-sec" data-fc="redencao">🔄 Plano de Redenção (Apenas Erros)</button>
      </div>
      <div id="area-simulado"></div>
    `;
  }

  function iniciarSimulado(minutos, lista = BANCO) {
    sim = { qs: lista, i: 0, resp: {}, tempo: minutos * 60 };
    document.body.classList.add('modo-foco-ativo');
    renderQuestao();
  }

  function renderQuestao() {
    const area = $('#area-simulado') \vert{}\vert{} $('#astra-conteudo');
    const q = sim.qs[sim.i];
    area.innerHTML = `
      <div class="astra-card">
        <div style="display:flex; justify-content:space-between;">
          <span>Questão ${sim.i + 1} de ${sim.qs.length} (${q.mat})</span>
          <button class="astra-btn astra-btn-sec" id="btn-sair-foco">❌ Sair</button>
        </div>
        <h4>${q.q}</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${q.alt.map((a, idx) => `
            <button class="astra-btn astra-btn-sec" style="text-align:left; ${sim.resp[sim.i] === idx ? 'border-color:var(--accent);' : ''}" data-op="${idx}">
              ${String.fromCharCode(65 + idx)})${a}
            </button>
          `).join('')}
        </div>
        <div style="margin-top:15px; display:flex; justify-content:space-between;">
          <button class="astra-btn astra-btn-sec" data-nav="-1" ${sim.i === 0 ? 'disabled' : ''}>⬅️ Anterior</button>
          ${sim.i === sim.qs.length - 1 
            ? `<button class="astra-btn" id="btn-finalizar">🏁 Finalizar</button>`
            : `<button class="astra-btn" data-nav="1">Próxima ➡️</button>`}
        </div>
      </div>
    `;
  }

  function finalizarSimulado() {
    document.body.classList.remove('modo-foco-ativo');
    let acertos = 0;
    const cad = store.get(KEY.erros, []);

    sim.qs.forEach((q, idx) => {
      if (sim.resp[idx] === q.cor) {
        acertos++;
      } else {
        if (!cad.some(c => c.id === q.id)) {
          cad.push({ id: q.id, mat: q.mat, q: q.q, due: Date.now(), interval: 1, ease: 2.5 });
        }
      }
    });

    store.set(KEY.erros, cad);
    registrarAtividade(sim.qs.length);

    const main = $('#astra-conteudo');
    main.innerHTML = `
      <div class="astra-card">
        <h2>📊 Relatório de Desempenho</h2>
        <p>Você acertou <b>${acertos}</b> de <b>${sim.qs.length}</b> questões (${Math.round((acertos/sim.qs.length)*100)}%).</p>
        <button class="astra-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
        <button class="astra-btn astra-btn-sec" data-aba="simulado">Voltar</button>
      </div>
    `;
    sim = null;
  }

  function renderTAF(container) {
    container.innerHTML = `
      <div class="astra-card">
        <h3>🏋️ Calculadora TAF PMESP</h3>
        <p>Acompanhe sua pontuação nos testes físicos oficiais do edital.</p>
        <p><b>Status:</b> Piso Mínimo de 200 pontos exigido no edital.</p>
      </div>
    `;
  }

  function renderRedacao(container) {
    const texto = store.get(KEY.red, '');
    container.innerHTML = `
      <div class="astra-card">
        <h3>✍️ Treinador de Redação VUNESP</h3>
        <textarea id="red-texto" style="width:100%; height:200px; background:#000; color:#fff; border:1px solid var(--border); padding:10px;" placeholder="Digite seu texto aqui...">${texto}</textarea>
        <p><small>Linhas aproximadas: <b id="red-linhas">0</b> (Meta: 20 a 30 linhas)</small></p>
      </div>
    `;
    const ta = $('#red-texto');
    ta.addEventListener('input', e => {
      store.set(KEY.red, e.target.value);
      $('#red-linhas').textContent = Math.round(e.target.value.length / 80);
    });
  }

  function renderCaderno(container) {
    const cad = store.get(KEY.erros, []);
    container.innerHTML = `
      <div class="astra-card">
        <h3>📓 Caderno de Erros & Flashcards (Anki)</h3>
        <p>Total de questões catalogadas para revisão: <b>${cad.length}</b></p>
      </div>
    `;
  }

  /* =====================================================================
     5. CONTROLE POMODORO E EVENTOS
     ===================================================================== */
  function togglePomodoro() {
    if (pomodoroAtivo) {
      clearInterval(pomodoroTimer);
      pomodoroAtivo = false;
    } else {
      pomodoroAtivo = true;
      pomodoroTimer = setInterval(() => {
        pomodoroTempo--;
        renderHeader();
        if (pomodoroTempo <= 0) {
          clearInterval(pomodoroTimer);
          alert('⏱️ Tempo de foco Pomodoro concluído! Hora de descansar 5 minutos.');
          pomodoroTempo = 25 * 60;
          pomodoroAtivo = false;
          renderHeader();
        }
      }, 1000);
    }
  }

  function bindEventos() {
    document.addEventListener('click', e => {
      const b = e.target.closest('button, [data-aba], [data-tempo], [data-op], [data-nav]');
      if (!b) return;

      if (b.id === 'btn-pomodoro') { togglePomodoro(); return; }
      if (b.id === 'btn-contraste') { document.body.classList.toggle('alto-contraste'); return; }
      if (b.dataset.aba) { showTab(b.dataset.aba); return; }

      if (b.dataset.tempo) { iniciarSimulado(Number(b.dataset.tempo)); return; }
      if (b.id === 'btn-sair-foco') {
        if (confirm('Deseja cancelar o simulado?')) {
          document.body.classList.remove('modo-foco-ativo');
          showTab('simulado');
        }
        return;
      }

      if (b.dataset.op !== undefined && sim) {
        sim.resp[sim.i] = Number(b.dataset.op);
        renderQuestao();
        return;
      }

      if (b.dataset.nav !== undefined && sim) {
        sim.i = Math.max(0, Math.min(sim.qs.length - 1, sim.i + Number(b.dataset.nav)));
        renderQuestao();
        return;
      }

      if (b.id === 'btn-finalizar') {
        if (confirm('Finalizar e gerar relatório?')) finalizarSimulado();
        return;
      }

      if (b.dataset.fc === 'redencao') {
        const cad = store.get(KEY.erros, []);
        if (!cad.length) { alert('Você ainda não possui erros cadastrados.'); return; }
        const lista = cad.map(c => BANCO.find(q => q.id === c.id) || c);
        iniciarSimulado(15, lista);
        return;
      }
    });
  }

  function init() {
    injetarCSS();
    montarLayout();
    bindEventos();
    showTab('simulado');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();