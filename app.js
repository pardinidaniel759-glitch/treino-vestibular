/* =============================================================================
   PLATAFORMA PMESP & PROVA PAULISTA — app.js (vanilla JS, sem dependências)

   IDs / atributos que o HTML pode fornecer (tudo é opcional e null-safe):

   CADASTRO ........ #modal-cadastro, #form-cadastro, #cad-nome, #cad-email,
                     #cad-concurso, #btn-salvar-cadastro, [data-abrir-cadastro],
                     [data-candidato-status], [data-candidato-nome]
   NAVEGAÇÃO ....... botões [data-nav="id-da-secao"] + seções <section id="...">
   MODO FOCO ....... botões [data-foco-min="25|45|50"] ou .btn-foco-tempo
                     (o overlay #foco-overlay é criado pelo próprio JS)
   TAF ............. #taf-perfil (select) ou radios name="taf-perfil",
                     #taf-flexao, #taf-abdominal, #taf-corrida50, #taf-corrida12,
                     saídas: #taf-pts-flexao, #taf-pts-abdominal, #taf-pts-corrida50,
                     #taf-pts-corrida12, #taf-total, #taf-situacao
   REDAÇÃO ......... #redacao-texto, #redacao-linhas (régua 1–30),
                     #redacao-contador, #redacao-alerta
   SIMULADO ........ #btn-iniciar-simulado, #sim-tema (select, opcional),
                     #sim-qtd (opcional), #simulado-area, #simulado-relatorio,
                     #btn-redencao
   CADERNO ......... #caderno-erros-lista, [data-caderno-total]
   FLASHCARDS ...... #flashcards-area
============================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     UTILITÁRIOS
  --------------------------------------------------------------------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (t) =>
    String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LETRAS = ['A', 'B', 'C', 'D', 'E'];

  const Store = {
    get(k, def) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage cheio/bloqueado */ }
    }
  };
  const K = {
    candidato: 'pmesp_candidato',
    erros: 'pmesp_caderno_erros',
    srs: 'pmesp_srs',
    focoTotal: 'pmesp_foco_total_min',
    historico: 'pmesp_historico_simulados'
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const fmtTempo = (seg) => {
    seg = Math.max(0, Math.round(seg));
    return String(Math.floor(seg / 60)).padStart(2, '0') + ':' + String(seg % 60).padStart(2, '0');
  };
  function esconder(el) {
    if (!el) return;
    el.classList.remove('ativo', 'aberto', 'show', 'open', 'visivel');
    el.classList.add('oculto', 'hidden');
    el.setAttribute('aria-hidden', 'true');
    el.hidden = true;
    el.style.display = 'none';
  }
  function mostrar(el) {
    if (!el) return;
    el.classList.remove('oculto', 'hidden');
    el.classList.add('ativo', 'aberto', 'show');
    el.setAttribute('aria-hidden', 'false');
    el.hidden = false;
    el.style.display = '';
    if (getComputedStyle(el).display === 'none') el.style.display = 'flex';
  }

  /* Toast interno — substitui alert() */
  function toast(msg, tipo) {
    let t = $('#pmesp-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pmesp-toast';
      document.body.appendChild(t);
    }
    t.className = 'pmesp-toast ' + (tipo || 'info') + ' visivel';
    t.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('visivel'), 3200);
  }

  /* CSS mínimo para elementos criados via JS (não conflita com o style.css) */
  function injetarEstilos() {
    if ($('#pmesp-estilos-js')) return;
    const st = document.createElement('style');
    st.id = 'pmesp-estilos-js';
    st.textContent = `
      #foco-overlay{display:none}
      body.modo-foco-ativo > *:not(#foco-overlay):not(script):not(style){display:none!important}
      body.modo-foco-ativo{overflow:hidden}
      body.modo-foco-ativo #foco-overlay{display:flex!important;position:fixed;inset:0;z-index:99999;
        background:#000;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem}
      #foco-overlay .foco-tempo{font-family:'Courier New',monospace;font-weight:800;color:#FFFF00;
        font-size:clamp(4rem,20vw,11rem);letter-spacing:.05em;line-height:1;
        text-shadow:0 0 12px #FFFF00,0 0 32px rgba(255,255,0,.6)}
      #foco-overlay .foco-rotulo{color:#FFFF00;opacity:.7;letter-spacing:.3em;text-transform:uppercase;font-size:.9rem}
      #foco-overlay .foco-encerrar{background:transparent;color:#FFFF00;border:2px solid #FFFF00;padding:.9rem 2.2rem;
        font-weight:700;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;border-radius:6px}
      #foco-overlay .foco-encerrar:hover{background:#FFFF00;color:#000}
      .pmesp-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);z-index:100000;
        background:#111;color:#fff;border:1px solid #FFFF00;padding:.8rem 1.2rem;border-radius:8px;opacity:0;
        pointer-events:none;transition:.25s;max-width:90vw;font-size:.95rem}
      .pmesp-toast.visivel{opacity:1;transform:translateX(-50%) translateY(0)}
      .pmesp-toast.erro{border-color:#ff4d4d}.pmesp-toast.ok{border-color:#3ddc84}
      .tag{display:inline-block;padding:.15rem .55rem;border-radius:4px;font-size:.72rem;font-weight:700;
        letter-spacing:.06em;margin-right:.4rem;background:#222;color:#FFFF00;border:1px solid #444}
      .tag-banca{background:#FFFF00;color:#000;border-color:#FFFF00}
      .alt-btn{display:block;width:100%;text-align:left;margin:.45rem 0;padding:.75rem 1rem;border-radius:8px;
        border:1px solid #444;background:transparent;color:inherit;cursor:pointer;font:inherit}
      .alt-btn:hover{border-color:#FFFF00}
      .alt-btn.selecionada{border-color:#FFFF00;background:rgba(255,255,0,.12)}
      .sim-timer{font-family:'Courier New',monospace;font-weight:700;color:#FFFF00}
      .sim-timer.urgente{color:#ff4d4d}
      .rel-item{border:1px solid #444;border-left:4px solid #ff4d4d;border-radius:8px;padding:1rem;margin:.8rem 0}
      .rel-ok{color:#3ddc84}.rel-bad{color:#ff4d4d}
      .aviso{padding:.6rem .9rem;border-radius:6px;margin-top:.5rem;font-weight:600}
      .aviso.ok{background:rgba(61,220,132,.15);color:#3ddc84}
      .aviso.atencao{background:rgba(255,193,7,.15);color:#ffc107}
      .aviso.perigo{background:rgba(255,77,77,.15);color:#ff4d4d}
      .anki-botoes{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem}
      .anki-botoes button{flex:1;min-width:90px;padding:.7rem;border-radius:8px;border:1px solid #444;
        background:transparent;color:inherit;cursor:pointer;font-weight:700}
      .anki-botoes button:hover{border-color:#FFFF00}
    `;
    document.head.appendChild(st);
  }

  /* ---------------------------------------------------------------------------
     NAVEGAÇÃO ENTRE SEÇÕES (opcional — só age se existir [data-nav])
  --------------------------------------------------------------------------- */
  function initNavegacao() {
    const botoes = $$('[data-nav]');
    if (!botoes.length) return;
    const ids = botoes.map((b) => b.dataset.nav);
    function ir(id) {
      ids.forEach((sid) => {
        const s = document.getElementById(sid);
        if (!s) return;
        const ativo = sid === id;
        s.classList.toggle('ativa', ativo);
        s.hidden = !ativo;
      });
      botoes.forEach((b) => b.classList.toggle('ativo', b.dataset.nav === id));
      if (id === 'flashcards' || id === 'secao-flashcards') Flash.render();
      if (id === 'caderno' || id === 'secao-caderno') Caderno.render();
    }
    botoes.forEach((b) => b.addEventListener('click', () => ir(b.dataset.nav)));
  }

  /* ---------------------------------------------------------------------------
     2. CADASTRO & PERSISTÊNCIA LOCAL
  --------------------------------------------------------------------------- */
  const Cadastro = {
    modal: () => $('#modal-cadastro'),
    campo(ids, names) {
      for (const id of ids) { const e = document.getElementById(id); if (e) return e; }
      for (const n of names) { const e = $('[name="' + n + '"]'); if (e) return e; }
      return null;
    },
    init() {
      const form = $('#form-cadastro');
      const btn = $('#btn-salvar-cadastro');
      if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.salvar(); });
      if (btn && !(btn.form && btn.type === 'submit')) {
        btn.addEventListener('click', (e) => { e.preventDefault(); this.salvar(); });
      }
      $$('[data-abrir-cadastro]').forEach((b) => b.addEventListener('click', () => mostrar(this.modal())));
      $$('[data-fechar-cadastro]').forEach((b) => b.addEventListener('click', () => esconder(this.modal())));

      const salvo = Store.get(K.candidato, null);
      if (salvo && salvo.nome) { this.atualizarUI(salvo); esconder(this.modal()); }
      else if (this.modal()) { mostrar(this.modal()); }
    },
    salvar() {
      const nomeEl = this.campo(['cad-nome', 'nome'], ['nome', 'name']);
      const emailEl = this.campo(['cad-email', 'email'], ['email']);
      const concEl = this.campo(['cad-concurso', 'concurso'], ['concurso']);
      const nome = nomeEl ? nomeEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const concurso = concEl ? concEl.value.trim() : '';
      if (!nome) { toast('Informe seu nome para continuar.', 'erro'); if (nomeEl) nomeEl.focus(); return; }
      if (email && !/^\S+@\S+\.\S+$/.test(email)) { toast('E-mail inválido.', 'erro'); if (emailEl) emailEl.focus(); return; }

      const dados = { nome, email, concurso, desde: new Date().toISOString() };
      Store.set(K.candidato, dados);
      this.atualizarUI(dados);
      esconder(this.modal());
      toast('Cadastro salvo. Bem-vindo, ' + nome.split(' ')[0] + '!', 'ok');

      /* Envio opcional ao Web3Forms — em segundo plano; qualquer falha é ignorada */
      try {
        const form = $('#form-cadastro');
        const key = form && form.querySelector('[name="access_key"]');
        if (form && key && key.value && !/SUA_|YOUR_|COLOQUE/i.test(key.value)) {
          fetch(form.getAttribute('action') || 'https://api.web3forms.com/submit', {
            method: 'POST',
            body: new FormData(form)
          }).catch(() => {});
        }
      } catch (e) { /* ignorado de propósito */ }
    },
    atualizarUI(d) {
      $$('[data-candidato-status]').forEach((el) => { el.textContent = 'CANDIDATO OPERACIONAL'; });
      $$('[data-candidato-nome]').forEach((el) => { el.textContent = d.nome; });
      const alt = $('#status-candidato');
      if (alt) alt.textContent = 'CANDIDATO OPERACIONAL';
    }
  };

  /* ---------------------------------------------------------------------------
     1. MODO FOCO IMERSIVO
  --------------------------------------------------------------------------- */
  const Foco = {
    overlay: null, display: null, rotulo: null,
    fim: 0, total: 0, timer: null, ativo: false,

    init() {
      const ov = document.createElement('div');
      ov.id = 'foco-overlay';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-label', 'Modo foco');
      ov.innerHTML =
        '<div class="foco-rotulo">MODO FOCO • SESSÃO EM ANDAMENTO</div>' +
        '<div class="foco-tempo" id="foco-display">00:00</div>' +
        '<button type="button" class="foco-encerrar" id="foco-encerrar">Encerrar sessão</button>';
      document.body.appendChild(ov);
      this.overlay = ov;
      this.display = $('#foco-display', ov);
      $('#foco-encerrar', ov).addEventListener('click', () => this.encerrar(false));

      /* Delegação: a seleção do tempo ocorre SOMENTE por clique nos botões de tempo */
      document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-foco-min], .btn-foco-tempo');
        if (!b || this.ativo) return;
        let min = parseInt(b.dataset.focoMin, 10);
        if (!min) { const m = (b.textContent || '').match(/(\d+)\s*min/i); min = m ? parseInt(m[1], 10) : 0; }
        if (min > 0) this.iniciar(min);
      });
      this.atualizarTotal();
    },
    iniciar(min) {
      this.total = min * 60;
      this.fim = Date.now() + this.total * 1000;
      this.ativo = true;
      document.body.classList.add('modo-foco-ativo');
      this.tick();
      this.timer = setInterval(() => this.tick(), 250);
    },
    tick() {
      const restante = Math.ceil((this.fim - Date.now()) / 1000);
      if (this.display) this.display.textContent = fmtTempo(restante);
      document.title = '⏱ ' + fmtTempo(restante) + ' • Modo Foco';
      if (restante <= 0) this.encerrar(true);
    },
    encerrar(concluida) {
      if (!this.ativo) return;
      clearInterval(this.timer);
      this.ativo = false;
      const usado = Math.min(this.total, Math.max(0, this.total - Math.max(0, (this.fim - Date.now()) / 1000)));
      const minutos = Math.floor(usado / 60);
      Store.set(K.focoTotal, (Store.get(K.focoTotal, 0) || 0) + minutos);
      document.body.classList.remove('modo-foco-ativo');
      document.title = 'PMESP & Prova Paulista';
      this.atualizarTotal();
      toast(concluida ? 'Sessão concluída! +' + minutos + ' min de foco.' : 'Sessão encerrada. ' + minutos + ' min registrados.', 'ok');
    },
    atualizarTotal() {
      $$('[data-foco-total]').forEach((el) => { el.textContent = Store.get(K.focoTotal, 0) + ' min'; });
    }
  };

  /* ---------------------------------------------------------------------------
     3. CALCULADORA TAF — PMESP
     ATENÇÃO: as faixas abaixo são parametrizáveis. Confira SEMPRE com a tabela
     oficial do edital vigente e ajuste os valores em TAF_TABELAS se necessário.
     tipo 'maior' = quanto maior melhor; 'menor' = quanto menor melhor (tempo).
     'limite' = mínimo (ou máximo, se 'menor') para pontuar; fora dele = 0 pts.
     'faixas' = pares [marca, pontos]; entre as marcas a pontuação é interpolada.
  --------------------------------------------------------------------------- */
  const TAF_TABELAS = {
    M: {
      flexao:    { tipo: 'maior', limite: 10,   faixas: [[10, 20], [20, 45], [30, 70], [40, 100]] },
      abdominal: { tipo: 'maior', limite: 20,   faixas: [[20, 20], [30, 45], [40, 70], [50, 100]] },
      corrida50: { tipo: 'menor', limite: 10.5, faixas: [[10.5, 20], [9.5, 45], [8.5, 70], [7.5, 100]] },
      corrida12: { tipo: 'maior', limite: 2000, faixas: [[2000, 20], [2300, 45], [2600, 70], [3000, 100]] }
    },
    F: {
      flexao:    { tipo: 'maior', limite: 5,    faixas: [[5, 20], [10, 45], [15, 70], [25, 100]] },
      abdominal: { tipo: 'maior', limite: 15,   faixas: [[15, 20], [25, 45], [35, 70], [45, 100]] },
      corrida50: { tipo: 'menor', limite: 12,   faixas: [[12, 20], [11, 45], [10, 70], [9, 100]] },
      corrida12: { tipo: 'maior', limite: 1600, faixas: [[1600, 20], [1900, 45], [2200, 70], [2600, 100]] }
    }
  };
  const TAF_PROVAS = [
    { chave: 'flexao', input: 'taf-flexao', saida: 'taf-pts-flexao', nome: 'Flexão' },
    { chave: 'abdominal', input: 'taf-abdominal', saida: 'taf-pts-abdominal', nome: 'Abdominal Remador' },
    { chave: 'corrida50', input: 'taf-corrida50', saida: 'taf-pts-corrida50', nome: 'Corrida 50m' },
    { chave: 'corrida12', input: 'taf-corrida12', saida: 'taf-pts-corrida12', nome: 'Corrida 12min' }
  ];
  const TAF_MINIMO_APROVACAO = 200;

  const TAF = {
    perfil() {
      const sel = $('#taf-perfil');
      let v = sel ? sel.value : '';
      if (!v) { const r = $('input[name="taf-perfil"]:checked'); v = r ? r.value : 'M'; }
      return /^f/i.test(v) ? 'F' : 'M';
    },
    pontuar(regra, bruto) {
      if (bruto === null || isNaN(bruto)) return null;
      const menor = regra.tipo === 'menor';
      const x = menor ? -bruto : bruto;
      const lim = menor ? -regra.limite : regra.limite;
      const fx = regra.faixas.map(([m, p]) => [menor ? -m : m, p]).sort((a, b) => a[0] - b[0]);
      if (x < lim) return 0;
      if (x <= fx[0][0]) return fx[0][1];
      if (x >= fx[fx.length - 1][0]) return fx[fx.length - 1][1];
      for (let i = 0; i < fx.length - 1; i++) {
        const [x1, p1] = fx[i], [x2, p2] = fx[i + 1];
        if (x >= x1 && x <= x2) return Math.round(p1 + ((x - x1) / (x2 - x1)) * (p2 - p1));
      }
      return 0;
    },
    calcular() {
      if (!$('#taf-total') && !$('#taf-situacao')) return;
      const tabela = TAF_TABELAS[this.perfil()];
      let total = 0, preenchidas = 0;
      const zerou = [];
      TAF_PROVAS.forEach((p) => {
        const el = document.getElementById(p.input);
        const raw = el ? String(el.value).replace(',', '.').trim() : '';
        const bruto = raw === '' ? null : parseFloat(raw);
        const pts = this.pontuar(tabela[p.chave], bruto);
        const out = document.getElementById(p.saida);
        if (out) out.textContent = pts === null ? '—' : pts + ' pts';
        if (pts !== null) { preenchidas++; total += pts; if (pts === 0) zerou.push(p.nome); }
      });
      const totalEl = $('#taf-total');
      if (totalEl) totalEl.textContent = total + ' pts';
      const sit = $('#taf-situacao');
      if (!sit) return;
      if (preenchidas < TAF_PROVAS.length) {
        sit.className = 'aviso atencao';
        sit.textContent = zerou.length
          ? 'ALERTA TÁTICO: zerou em ' + zerou.join(', ') + '. Preencha todas as provas para o resultado final.'
          : 'Preencha as 4 provas para ver a situação final (' + preenchidas + '/4).';
      } else if (zerou.length) {
        sit.className = 'aviso perigo';
        sit.textContent = 'REPROVADO / ALERTA TÁTICO: zerou em ' + zerou.join(', ') + '.';
      } else if (total >= TAF_MINIMO_APROVACAO) {
        sit.className = 'aviso ok';
        sit.textContent = 'APROVADO — ' + total + ' pts (mínimo ' + TAF_MINIMO_APROVACAO + ').';
      } else {
        sit.className = 'aviso perigo';
        sit.textContent = 'REPROVADO / ALERTA TÁTICO — faltam ' + (TAF_MINIMO_APROVACAO - total) + ' pts para o mínimo de ' + TAF_MINIMO_APROVACAO + '.';
      }
    },
    init() {
      document.addEventListener('input', (e) => { if (e.target.id && e.target.id.indexOf('taf-') === 0) this.calcular(); });
      document.addEventListener('change', (e) => {
        if (e.target.id === 'taf-perfil' || e.target.name === 'taf-perfil') this.calcular();
      });
      this.calcular();
    }
  };

  /* ---------------------------------------------------------------------------
     4. TREINADOR DE REDAÇÃO — PADRÃO VUNESP
  --------------------------------------------------------------------------- */
  const Redacao = {
    MAX: 30, META_MIN: 20,
    init() {
      const ta = $('#redacao-texto');
      if (!ta) return;
      const regua = $('#redacao-linhas');
      if (regua) {
        regua.innerHTML = Array.from({ length: this.MAX }, (_, i) => '<div>' + (i + 1) + '</div>').join('');
        regua.style.whiteSpace = 'pre';
        regua.style.overflow = 'hidden';
      }
      ta.addEventListener('input', () => this.atualizar());
      ta.addEventListener('scroll', () => { if (regua) regua.scrollTop = ta.scrollTop; });
      window.addEventListener('resize', () => this.atualizar());
      this.atualizar();
    },
    contarLinhas(ta) {
      const texto = ta.value;
      if (!texto.trim()) return 0;
      const porQuebra = texto.replace(/\s+$/, '').split('\n').length;
      const lh = parseFloat(getComputedStyle(ta).lineHeight);
      if (!lh || isNaN(lh)) return porQuebra;
      const cs = getComputedStyle(ta);
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const visuais = Math.max(1, Math.round((ta.scrollHeight - pad) / lh));
      return Math.max(porQuebra, visuais);
    },
    atualizar() {
      const ta = $('#redacao-texto');
      const n = this.contarLinhas(ta);
      const cont = $('#redacao-contador');
      const alerta = $('#redacao-alerta');
      if (cont) cont.textContent = n + ' / ' + this.MAX + ' linhas (meta: ' + this.META_MIN + '–' + this.MAX + ')';
      $$('#redacao-linhas > div').forEach((d, i) => {
        d.style.color = i < n ? '#FFFF00' : '';
        d.style.fontWeight = i < n ? '700' : '';
      });
      if (!alerta) return;
      let cls, msg;
      if (n === 0) { cls = 'aviso atencao'; msg = 'Comece a escrever. Meta: ' + this.META_MIN + ' a ' + this.MAX + ' linhas.'; }
      else if (n < 8) { cls = 'aviso perigo'; msg = 'RISCO DE ZERA POR TEXTO INSUFICIENTE — menos de 8 linhas.'; }
      else if (n < 15) { cls = 'aviso perigo'; msg = 'ALERTA DE POUCAS LINHAS — menos de 15 linhas. Desenvolva mais os argumentos.'; }
      else if (n < this.META_MIN) { cls = 'aviso atencao'; msg = 'Quase lá: faltam ' + (this.META_MIN - n) + ' linha(s) para a meta mínima.'; }
      else if (n <= this.MAX) { cls = 'aviso ok'; msg = 'Extensão dentro da meta (' + this.META_MIN + '–' + this.MAX + ' linhas).'; }
      else { cls = 'aviso atencao'; msg = 'Acima de ' + this.MAX + ' linhas — o excedente pode não ser considerado. Revise e enxugue.'; }
      alerta.className = cls;
      alerta.textContent = msg;
    }
  };

  /* ---------------------------------------------------------------------------
     5. BANCO DE QUESTÕES
     Confira sempre a redação atual da lei/artigo citado antes de estudar.
  --------------------------------------------------------------------------- */
  const BANCO = [
    {
      id: 'q01', banca: 'VUNESP', tema: 'Língua Portuguesa', nivel: 'Fácil',
      enunciado: 'Assinale a alternativa em que a concordância verbal está correta.',
      alternativas: ['Fazem dois anos que ele ingressou na corporação.', 'Faz dois anos que ele ingressou na corporação.', 'Fazem-se dois anos que ele ingressou na corporação.', 'Vai fazerem dois anos que ele ingressou na corporação.'],
      correta: 1,
      bizu: 'O verbo FAZER indicando tempo decorrido é impessoal: fica sempre na 3ª pessoa do singular.',
      lei: 'Gramática Normativa — verbos impessoais (fazer, haver, ser indicando tempo).'
    },
    {
      id: 'q02', banca: 'VUNESP', tema: 'Língua Portuguesa', nivel: 'Médio',
      enunciado: 'Quanto à regência verbal, assinale a frase correta.',
      alternativas: ['Assistimos o jogo ontem, no estádio.', 'Assistimos ao jogo ontem, no estádio.', 'Assistimos do jogo ontem, no estádio.', 'Assistimos com o jogo ontem, no estádio.'],
      correta: 1,
      bizu: 'ASSISTIR no sentido de "ver/presenciar" é transitivo indireto e pede a preposição "a".',
      lei: 'Gramática Normativa — regência verbal.'
    },
    {
      id: 'q03', banca: 'VUNESP', tema: 'Língua Portuguesa', nivel: 'Fácil',
      enunciado: 'Complete: "O candidato foi ______ orientado e, por isso, teve um ______ desempenho."',
      alternativas: ['mau / mal', 'mal / mau', 'mal / mal', 'mau / mau'],
      correta: 1,
      bizu: 'MAL é o oposto de BEM (advérbio); MAU é o oposto de BOM (adjetivo). "Mal orientado" / "mau desempenho".',
      lei: 'Gramática Normativa — emprego de mal/mau.'
    },
    {
      id: 'q04', banca: 'VUNESP', tema: 'Matemática', nivel: 'Fácil',
      enunciado: 'Quanto é 20% de 350?',
      alternativas: ['60', '65', '70', '75'],
      correta: 2,
      bizu: '10% de 350 = 35; então 20% = 35 × 2 = 70. Ache 10% e multiplique.',
      lei: 'Porcentagem — conceito básico.'
    },
    {
      id: 'q05', banca: 'VUNESP', tema: 'Matemática', nivel: 'Médio',
      enunciado: '4 policiais realizam uma tarefa em 6 dias. Mantido o ritmo, em quantos dias 8 policiais realizam a mesma tarefa?',
      alternativas: ['2 dias', '3 dias', '4 dias', '12 dias'],
      correta: 1,
      bizu: 'Grandezas INVERSAMENTE proporcionais: dobrou o efetivo, cai pela metade o tempo (6 ÷ 2 = 3).',
      lei: 'Regra de três inversa.'
    },
    {
      id: 'q06', banca: 'VUNESP', tema: 'Matemática', nivel: 'Fácil',
      enunciado: 'A média aritmética simples entre 6, 8 e 10 é:',
      alternativas: ['7', '8', '9', '24'],
      correta: 1,
      bizu: 'Some tudo (24) e divida pela quantidade de termos (3) = 8. Cuidado com a alternativa que é só a soma.',
      lei: 'Estatística básica — média aritmética.'
    },
    {
      id: 'q07', banca: 'VUNESP', tema: 'Direitos Humanos', nivel: 'Médio',
      enunciado: 'A Declaração Universal dos Direitos Humanos foi proclamada em:',
      alternativas: ['1945, pela Liga das Nações.', '1948, pela Assembleia Geral da ONU.', '1966, pela Organização dos Estados Americanos.', '1988, pelo Congresso Nacional brasileiro.'],
      correta: 1,
      bizu: 'DUDH = 10/12/1948, Assembleia Geral da ONU. Não confunda com a CF/88 nem com a OEA.',
      lei: 'DUDH (1948) — Art. 1º: todos nascem livres e iguais em dignidade e direitos.'
    },
    {
      id: 'q08', banca: 'VUNESP', tema: 'Direito Constitucional', nivel: 'Médio',
      enunciado: 'De acordo com a Constituição Federal, às polícias militares cabem:',
      alternativas: ['A polícia judiciária e a apuração de infrações penais.', 'A polícia ostensiva e a preservação da ordem pública.', 'A polícia marítima, aeroportuária e de fronteiras.', 'O patrulhamento ostensivo das rodovias federais.'],
      correta: 1,
      bizu: 'PM = ostensiva + preservação da ordem pública. Polícia judiciária é da Polícia Civil.',
      lei: 'CF/88, art. 144, § 5º.'
    },
    {
      id: 'q09', banca: 'VUNESP', tema: 'Direito Constitucional', nivel: 'Médio',
      enunciado: 'Segundo a CF/88, são crimes inafiançáveis e insuscetíveis de graça ou anistia, entre outros:',
      alternativas: ['Furto e roubo.', 'Tortura, tráfico ilícito de entorpecentes, terrorismo e crimes hediondos.', 'Apenas o homicídio simples.', 'Estelionato e receptação.'],
      correta: 1,
      bizu: 'Decore o quarteto: tortura, tráfico, terrorismo e hediondos.',
      lei: 'CF/88, art. 5º, XLIII.'
    },
    {
      id: 'q10', banca: 'VUNESP', tema: 'Direito Constitucional', nivel: 'Difícil',
      enunciado: 'Ninguém será preso senão em flagrante delito ou por ordem escrita e fundamentada de autoridade judiciária competente, ressalvados:',
      alternativas: ['Os casos de prisão por ordem do delegado de polícia.', 'Os casos de transgressão militar ou crime propriamente militar, definidos em lei.', 'Apenas os casos de crime hediondo.', 'Os casos de ordem verbal do superior hierárquico civil.'],
      correta: 1,
      bizu: 'A exceção da regra de "ordem escrita de juiz" é a transgressão militar e o crime propriamente militar.',
      lei: 'CF/88, art. 5º, LXI.'
    },
    {
      id: 'q11', banca: 'VUNESP', tema: 'Direito Penal', nivel: 'Médio',
      enunciado: 'Não há crime quando o agente pratica o fato em:',
      alternativas: ['Erro de execução, apenas.', 'Estado de necessidade, legítima defesa, estrito cumprimento de dever legal ou exercício regular de direito.', 'Embriaguez voluntária.', 'Emoção ou paixão.'],
      correta: 1,
      bizu: 'São as 4 excludentes de ilicitude. Embriaguez voluntária e paixão NÃO excluem o crime.',
      lei: 'Código Penal, art. 23.'
    },
    {
      id: 'q12', banca: 'VUNESP', tema: 'Processo Penal', nivel: 'Médio',
      enunciado: 'Quanto à prisão em flagrante, é correto afirmar que:',
      alternativas: ['Somente a autoridade policial pode prender em flagrante.', 'Qualquer do povo poderá, e as autoridades policiais e seus agentes deverão, prender quem quer que seja encontrado em flagrante delito.', 'Nenhum agente é obrigado a prender em flagrante.', 'Apenas o Poder Judiciário pode determinar o flagrante.'],
      correta: 1,
      bizu: 'Flagrante facultativo para o povo; flagrante obrigatório para autoridades e seus agentes.',
      lei: 'CPP, art. 301.'
    },
    {
      id: 'q13', banca: 'VUNESP', tema: 'ECA', nivel: 'Fácil',
      enunciado: 'Para os efeitos do ECA, considera-se criança a pessoa com:',
      alternativas: ['Até 10 anos completos.', 'Até 12 anos incompletos.', 'Até 14 anos incompletos.', 'Até 16 anos completos.'],
      correta: 1,
      bizu: 'Criança: até 12 anos INCOMPLETOS. Adolescente: de 12 a 18 anos.',
      lei: 'Lei nº 8.069/1990 (ECA), art. 2º.'
    }
  ];
  const porId = (id) => BANCO.find((q) => q.id === id);

  /* ---------------------------------------------------------------------------
     6a. CADERNO DE ERROS
  --------------------------------------------------------------------------- */
  const Caderno = {
    todos() { return Store.get(K.erros, {}); },          // { idQuestao: {vezes, ultimo} }
    ids() { return Object.keys(this.todos()).filter((id) => porId(id)); },
    add(id) {
      const c = this.todos();
      c[id] = { vezes: ((c[id] && c[id].vezes) || 0) + 1, ultimo: Date.now() };
      Store.set(K.erros, c);
    },
    remover(id) {
      const c = this.todos();
      delete c[id];
      Store.set(K.erros, c);
    },
    render() {
      const total = this.ids().length;
      $$('[data-caderno-total]').forEach((el) => { el.textContent = total; });
      const box = $('#caderno-erros-lista');
      if (!box) return;
      if (!total) { box.innerHTML = '<p>Caderno vazio. Seus erros serão salvos aqui automaticamente.</p>'; return; }
      const c = this.todos();
      box.innerHTML = this.ids().map((id) => {
        const q = porId(id);
        return '<div class="rel-item"><span class="tag tag-banca">' + esc(q.banca) + '</span><span class="tag">' + esc(q.tema) + '</span>' +
          '<span class="tag">Erros: ' + c[id].vezes + '</span>' +
          '<p>' + esc(q.enunciado) + '</p>' +
          '<p class="rel-ok">Gabarito: ' + LETRAS[q.correta] + ') ' + esc(q.alternativas[q.correta]) + '</p>' +
          '<p><strong>Bizú Vunesp:</strong> ' + esc(q.bizu) + '</p>' +
          '<p><strong>Base legal:</strong> ' + esc(q.lei) + '</p>' +
          '<button type="button" data-remover-erro="' + id + '">Dominei — remover</button></div>';
      }).join('');
    },
    init() {
      document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-remover-erro]');
        if (b) { this.remover(b.dataset.removerErro); this.render(); Flash.render(); }
      });
      this.render();
    }
  };

  /* ---------------------------------------------------------------------------
     5b. SIMULADO + DIAGNÓSTICO TÁTICO
  --------------------------------------------------------------------------- */
  const TEMPO_QUESTAO = 180; // 3 min por questão

  const Simulado = {
    fila: [], idx: 0, respostas: [], restante: TEMPO_QUESTAO, timer: null, modo: 'normal', selecionada: null,

    init() {
      const btn = $('#btn-iniciar-simulado');
      if (btn) btn.addEventListener('click', () => this.iniciar('normal'));
      const red = $('#btn-redencao');
      if (red) red.addEventListener('click', () => this.iniciar('redencao'));
      const sel = $('#sim-tema');
      if (sel && sel.options.length <= 1) {
        const temas = Array.from(new Set(BANCO.map((q) => q.tema)));
        sel.innerHTML = '<option value="todos">Todos os temas</option>' + temas.map((t) => '<option>' + esc(t) + '</option>').join('');
      }
    },

    iniciar(modo) {
      const area = $('#simulado-area');
      if (!area) return;
      let pool;
      if (modo === 'redencao') {
        pool = Caderno.ids().map(porId);
        if (!pool.length) { toast('Seu Caderno de Erros está vazio. Faça um simulado primeiro.', 'erro'); return; }
      } else {
        const tema = $('#sim-tema') ? $('#sim-tema').value : 'todos';
        pool = BANCO.filter((q) => !tema || tema === 'todos' || q.tema === tema);
        if (!pool.length) { toast('Sem questões para este tema.', 'erro'); return; }
      }
      const qtdEl = $('#sim-qtd');
      const qtd = qtdEl ? Math.max(1, parseInt(qtdEl.value, 10) || pool.length) : pool.length;
      this.fila = shuffle(pool).slice(0, qtd);
      this.idx = 0;
      this.respostas = [];
      this.modo = modo;
      const rel = $('#simulado-relatorio');
      if (rel) rel.innerHTML = '';
      this.renderQuestao();
    },

    renderQuestao() {
      const area = $('#simulado-area');
      const q = this.fila[this.idx];
      this.selecionada = null;
      this.restante = TEMPO_QUESTAO;
      clearInterval(this.timer);
      area.innerHTML =
        '<div class="sim-topo"><span class="tag tag-banca">' + esc(q.banca) + '</span><span class="tag">' + esc(q.tema) + '</span>' +
        '<span class="tag">Nível: ' + esc(q.nivel) + '</span>' +
        (this.modo === 'redencao' ? '<span class="tag">REDENÇÃO</span>' : '') +
        '<span style="float:right">Questão ' + (this.idx + 1) + '/' + this.fila.length + ' • <span class="sim-timer" id="sim-timer">' + fmtTempo(this.restante) + '</span></span></div>' +
        '<p class="sim-enunciado" style="margin:1rem 0;font-weight:600">' + esc(q.enunciado) + '</p>' +
        '<div id="sim-alternativas">' +
        q.alternativas.map((a, i) => '<button type="button" class="alt-btn" data-alt="' + i + '"><strong>' + LETRAS[i] + ')</strong> ' + esc(a) + '</button>').join('') +
        '</div>' +
        '<button type="button" id="sim-avancar" disabled style="margin-top:1rem">' +
        (this.idx === this.fila.length - 1 ? 'Finalizar simulado' : 'Confirmar e avançar') + '</button>';

      $$('.alt-btn', area).forEach((b) => b.addEventListener('click', () => {
        this.selecionada = parseInt(b.dataset.alt, 10);
        $$('.alt-btn', area).forEach((x) => x.classList.toggle('selecionada', x === b));
        $('#sim-avancar').disabled = false;
      }));
      $('#sim-avancar').addEventListener('click', () => this.registrar(this.selecionada));

      this.timer = setInterval(() => {
        this.restante--;
        const t = $('#sim-timer');
        if (t) { t.textContent = fmtTempo(this.restante); t.classList.toggle('urgente', this.restante <= 30); }
        if (this.restante <= 0) { toast('Tempo esgotado nesta questão.', 'erro'); this.registrar(this.selecionada); }
      }, 1000);
    },

    registrar(escolha) {
      clearInterval(this.timer);
      const q = this.fila[this.idx];
      const acertou = escolha === q.correta;
      this.respostas.push({ id: q.id, escolha, acertou, gasto: TEMPO_QUESTAO - this.restante });
      if (!acertou) Caderno.add(q.id);                                   // salvamento automático
      else if (this.modo === 'redencao') Caderno.remover(q.id);          // redimiu o erro
      this.idx++;
      if (this.idx >= this.fila.length) this.finalizar();
      else this.renderQuestao();
    },

    aulaPersonalizada(pct, temasFracos) {
      const foco = temasFracos.length ? ' Prioridade: ' + temasFracos.join(', ') + '.' : '';
      if (pct < 50) return { titulo: 'AULA DE BASE', cls: 'perigo', texto: 'Desempenho abaixo de 50%. Volte aos fundamentos: leia a teoria, faça resumos curtos e refaça as questões erradas no Caderno de Erros antes de avançar.' + foco };
      if (pct < 80) return { titulo: 'AJUSTE FINO & PEGADINHAS', cls: 'atencao', texto: 'Desempenho entre 50% e 79%. Você tem a base; agora treine as pegadinhas clássicas da VUNESP, leia os Bizús e faça o Mini-Simulado de Redenção.' + foco };
      return { titulo: 'MANUTENÇÃO DE ELITE', cls: 'ok', texto: 'Desempenho de 80% ou mais. Mantenha o ritmo com simulados cronometrados, revisão espaçada nos flashcards e treino de redação.' + foco };
    },

    finalizar() {
      const area = $('#simulado-area');
      const alvo = $('#simulado-relatorio') || area;
      if (area && alvo !== area) area.innerHTML = '';
      const total = this.respostas.length;
      const acertos = this.respostas.filter((r) => r.acertou).length;
      const pct = Math.round((acertos / total) * 100);

      /* Pontos cegos por tema */
      const porTema = {};
      this.respostas.forEach((r) => {
        const t = porId(r.id).tema;
        porTema[t] = porTema[t] || { ok: 0, n: 0 };
        porTema[t].n++;
        if (r.acertou) porTema[t].ok++;
      });
      const temasFracos = Object.keys(porTema).filter((t) => porTema[t].ok / porTema[t].n < 0.6);
      const aula = this.aulaPersonalizada(pct, temasFracos);

      const erros = this.respostas.filter((r) => !r.acertou);
      const hist = Store.get(K.historico, []);
      hist.push({ data: Date.now(), acertos, total, pct, modo: this.modo });
      Store.set(K.historico, hist.slice(-50));

      alvo.innerHTML =
        '<h3>Relatório de Erros e Pontos Cegos</h3>' +
        '<p><strong>Resultado:</strong> ' + acertos + '/' + total + ' (' + pct + '%)</p>' +
        '<div class="aviso ' + aula.cls + '"><strong>' + aula.titulo + '</strong> — ' + esc(aula.texto) + '</div>' +
        '<h4 style="margin-top:1rem">Desempenho por tema</h4><ul>' +
        Object.keys(porTema).map((t) => '<li>' + esc(t) + ': ' + porTema[t].ok + '/' + porTema[t].n + '</li>').join('') + '</ul>' +
        (erros.length
          ? '<h4>Questões para revisar</h4>' + erros.map((r) => {
              const q = porId(r.id);
              const sua = r.escolha == null ? '<em>Em branco / sem resposta</em>' : LETRAS[r.escolha] + ') ' + esc(q.alternativas[r.escolha]);
              return '<div class="rel-item"><span class="tag tag-banca">' + esc(q.banca) + '</span><span class="tag">' + esc(q.tema) + '</span>' +
                '<p>' + esc(q.enunciado) + '</p>' +
                '<p class="rel-bad"><strong>Sua resposta:</strong> ' + sua + '</p>' +
                '<p class="rel-ok"><strong>Gabarito:</strong> ' + LETRAS[q.correta] + ') ' + esc(q.alternativas[q.correta]) + '</p>' +
                '<p><strong>Bizú Vunesp:</strong> ' + esc(q.bizu) + '</p>' +
                '<p><strong>Artigo da Lei:</strong> ' + esc(q.lei) + '</p></div>';
            }).join('')
          : '<p class="rel-ok">Nenhum erro neste simulado. Excelente!</p>') +
        '<p style="margin-top:1rem">Os erros foram salvos no Caderno de Erros. Use o Mini-Simulado de Redenção para refazê-los.</p>';

      Caderno.render();
      Flash.render();
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ---------------------------------------------------------------------------
     6b. FLASHCARDS ANKI — REPETIÇÃO ESPAÇADA (variação simplificada do SM-2)
  --------------------------------------------------------------------------- */
  const DIA = 86400000;
  const Flash = {
    atual: null, virado: false,

    estado(id) {
      const s = Store.get(K.srs, {});
      return s[id] || { ef: 2.5, reps: 0, dias: 0, due: 0 };
    },
    salvar(id, st) {
      const s = Store.get(K.srs, {});
      s[id] = st;
      Store.set(K.srs, s);
    },
    fila() {
      const agora = Date.now();
      const errosIds = Caderno.ids();
      return BANCO.map((q) => ({ q, st: this.estado(q.id), erro: errosIds.indexOf(q.id) >= 0 }))
        .filter((c) => c.st.due <= agora)
        .sort((a, b) => (b.erro - a.erro) || (a.st.due - b.st.due));
    },
    avaliar(nota) {
      if (!this.atual) return;
      const id = this.atual.q.id;
      const st = Object.assign({}, this.estado(id));
      const agora = Date.now();
      if (nota === 'errei') {
        st.reps = 0; st.dias = 0; st.ef = Math.max(1.3, st.ef - 0.2);
        st.due = agora + 60 * 1000;                         // volta em 1 minuto
        Caderno.add(id);
      } else if (nota === 'dificil') {
        st.dias = st.reps === 0 ? 0.5 : Math.max(1, st.dias * 1.2);
        st.ef = Math.max(1.3, st.ef - 0.15); st.reps++;
        st.due = agora + st.dias * DIA;
      } else if (nota === 'bom') {
        st.dias = st.reps === 0 ? 1 : st.reps === 1 ? 3 : st.dias * st.ef;
        st.reps++;
        st.due = agora + st.dias * DIA;
      } else { // fácil
        st.dias = st.reps === 0 ? 3 : st.dias * st.ef * 1.3;
        st.ef = st.ef + 0.15; st.reps++;
        st.due = agora + st.dias * DIA;
      }
      this.salvar(id, st);
      Caderno.render();
      this.render();
    },
    proximoTexto(st) {
      if (st.dias === 0) return 'em 1 min';
      if (st.dias < 1) return 'em ' + Math.round(st.dias * 24) + ' h';
      return 'em ' + Math.round(st.dias) + ' dia(s)';
    },
    render() {
      const box = $('#flashcards-area');
      if (!box) return;
      const fila = this.fila();
      if (!fila.length) {
        const s = Store.get(K.srs, {});
        const proximos = Object.keys(s).map((k) => s[k].due).filter((d) => d > Date.now()).sort((a, b) => a - b);
        const quando = proximos.length ? Math.max(1, Math.ceil((proximos[0] - Date.now()) / 60000)) : 0;
        box.innerHTML = '<p class="rel-ok"><strong>Revisões em dia!</strong></p>' +
          (quando ? '<p>Próximo cartão em ~' + (quando >= 60 ? Math.round(quando / 60) + ' h' : quando + ' min') + '.</p>' : '');
        this.atual = null;
        return;
      }
      this.atual = fila[0];
      this.virado = false;
      const c = this.atual;
      box.innerHTML =
        '<p><span class="tag tag-banca">' + esc(c.q.banca) + '</span><span class="tag">' + esc(c.q.tema) + '</span>' +
        (c.erro ? '<span class="tag">CADERNO DE ERROS</span>' : '') +
        '<span style="float:right">Pendentes: ' + fila.length + '</span></p>' +
        '<div class="flash-card" style="border:1px solid #444;border-radius:10px;padding:1.2rem;margin:.8rem 0">' +
        '<p style="font-weight:600">' + esc(c.q.enunciado) + '</p>' +
        '<div id="flash-verso" hidden style="margin-top:1rem;border-top:1px dashed #444;padding-top:1rem">' +
        '<p class="rel-ok"><strong>Resposta:</strong> ' + esc(c.q.alternativas[c.q.correta]) + '</p>' +
        '<p><strong>Bizú:</strong> ' + esc(c.q.bizu) + '</p>' +
        '<p><strong>Lei:</strong> ' + esc(c.q.lei) + '</p></div></div>' +
        '<button type="button" id="flash-virar">Mostrar resposta</button>' +
        '<div class="anki-botoes" id="flash-botoes" hidden>' +
        '<button type="button" data-nota="errei">Errei<br><small>1 min</small></button>' +
        '<button type="button" data-nota="dificil">Difícil<br><small>' + this.proximoTexto({ dias: c.st.reps === 0 ? 0.5 : Math.max(1, c.st.dias * 1.2) }) + '</small></button>' +
        '<button type="button" data-nota="bom">Bom<br><small>' + this.proximoTexto({ dias: c.st.reps === 0 ? 1 : c.st.reps === 1 ? 3 : c.st.dias * c.st.ef }) + '</small></button>' +
        '<button type="button" data-nota="facil">Fácil<br><small>' + this.proximoTexto({ dias: c.st.reps === 0 ? 3 : c.st.dias * c.st.ef * 1.3 }) + '</small></button></div>';

      $('#flash-virar').addEventListener('click', () => {
        $('#flash-verso').hidden = false;
        $('#flash-botoes').hidden = false;
        $('#flash-virar').hidden = true;
        this.virado = true;
      });
      $$('#flash-botoes button').forEach((b) => b.addEventListener('click', () => this.avaliar(b.dataset.nota === 'facil' ? 'facil' : b.dataset.nota)));
    },
    init() { this.render(); }
  };

  /* ---------------------------------------------------------------------------
     INICIALIZAÇÃO
  --------------------------------------------------------------------------- */
  function iniciar() {
    injetarEstilos();
    initNavegacao();
    Cadastro.init();
    Foco.init();
    TAF.init();
    Redacao.init();
    Caderno.init();
    Simulado.init();
    Flash.init();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  /* Depuração opcional no console */
  window.PMESP = { BANCO, TAF_TABELAS, Caderno, Flash, Simulado, Foco };
})();
