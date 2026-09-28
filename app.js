'use strict';
/* ========== Utilidades ========== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d = null) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const BADGES = { alta: ['b-alta', 'Alta Frequência'], ess: ['b-ess', 'Essencial'], rev: ['b-rev', 'Revisão'] };
const badge = t => `<span class="badge ${BADGES[t][0]}">${BADGES[t][1]}</span>`;
const card = (t, body, b, hot) => `<article class="card ${hot ? 'hot' : ''}">${b ? badge(b) : ''}<h3>${t}</h3><p>${body}</p></article>`;

/* ========== Dados ========== */
const DATA = {
  guia: [
    ['Conheça o edital', 'Leia o edital completo: etapas, prazos e requisitos. Tudo parte dele.', 'ess'],
    ['Prova objetiva', 'Peso maior em Português, Matemática e noções de Direito. Resolva questões Vunesp todos os dias.', 'alta'],
    ['Redação', 'Estrutura dissertativa, coesão e respeito ao número de linhas. Treine semanalmente.', 'alta'],
    ['Preparo físico', 'Comece o TAF cedo e registre a evolução de cada teste.', 'ess'],
    ['Revisão espaçada', 'Reveja o conteúdo em 1, 7 e 30 dias com flashcards.', 'rev']
  ],
  edital: {
    'Língua Portuguesa': ['Interpretação de texto', 'Concordância verbal e nominal', 'Regência e crase', 'Pontuação', 'Semântica'],
    'Matemática': ['Porcentagem', 'Regra de três', 'Razão e proporção', 'Geometria básica', 'Raciocínio lógico'],
    'Noções de Direito': ['Direitos e garantias fundamentais', 'Segurança pública (art. 144 CF)', 'Direitos Humanos'],
    'Atualidades': ['Segurança pública', 'Política e economia', 'Meio ambiente']
  },
  incendio: [
    ['Classe A', 'Sólidos comuns que deixam brasa: madeira, papel, tecido. Extintores: água, espuma ou pó ABC.'],
    ['Classe B', 'Líquidos e gases inflamáveis: gasolina, óleo, álcool. Extintores: espuma, CO₂ ou pó BC/ABC.'],
    ['Classe C', 'Equipamentos elétricos energizados. Extintores: CO₂ ou pó BC/ABC. Nunca use água.'],
    ['Classe D', 'Metais combustíveis: magnésio, sódio, titânio. Extintor: pó químico especial.']
  ],
  aph: [
    ['X – Hemorragia exsanguinante', 'Controle primeiro o sangramento grave: pressão direta e, se preciso, torniquete.'],
    ['A – Vias aéreas', 'Abra as vias aéreas com proteção da coluna cervical em vítimas de trauma.'],
    ['B – Respiração', 'Avalie se respira e a qualidade da ventilação.'],
    ['C – Circulação', 'Verifique pulso, cor e temperatura da pele.'],
    ['D – Estado neurológico', 'Avalie consciência e pupilas.'],
    ['E – Exposição', 'Exponha a vítima para achar lesões e evite hipotermia.'],
    ['RCP adulto', 'Compressões de 5 a 6 cm, ritmo de 100 a 120 por minuto, relação 30:2.'],
    ['Hemorragias', 'Pressão direta e curativo compressivo. Torniquete em membros quando a pressão não basta.']
  ],
  quizAph: [
    ['Qual classe de incêndio envolve líquidos inflamáveis?', ['A', 'B', 'C', 'D'], 1],
    ['Qual extintor é indicado para equipamentos elétricos energizados?', ['Água', 'Espuma', 'CO₂', 'Nenhum'], 2],
    ['No XABCDE, o "X" representa:', ['Vias aéreas', 'Hemorragia exsanguinante', 'Exposição', 'Circulação'], 1],
    ['Relação compressão/ventilação na RCP de adulto:', ['15:2', '30:2', '5:1', '10:2'], 1],
    ['Incêndios em metais combustíveis são de classe:', ['A', 'B', 'C', 'D'], 3]
  ],
  quizPm: [
    ['Assinale a frase correta quanto à norma-padrão:', ['Fazem dois anos que o vi.', 'Faz dois anos que o vi.', 'Fazem dois ano que o vi.', 'Faziam dois anos que o vi hoje.'], 1],
    ['Quanto é 25% de 240?', ['50', '55', '60', '65'], 2],
    ['Assinale o uso correto da crase:', ['Refiro-me à aquela decisão.', 'Refiro-me àquela decisão.', 'Vou à pé.', 'Fiz à pergunta.'], 1],
    ['A Declaração Universal dos Direitos Humanos foi proclamada em:', ['1948', '1964', '1988', '1919'], 0],
    ['O art. 144 da Constituição Federal trata:', ['Da educação', 'Da segurança pública', 'Da tributação', 'Do meio ambiente'], 1]
  ],
  paulista: [
    ['Língua Portuguesa', 'Foque em leitura de gêneros textuais, inferência e variação linguística.', 'alta'],
    ['Matemática', 'Resolução de problemas, porcentagem, leitura de tabelas e gráficos.', 'alta'],
    ['Método de estudo', 'Simule em blocos de 45 min e faça o mapa dos erros por habilidade.', 'ess'],
    ['Revisão', 'Refaça as questões erradas depois de 3 dias.', 'rev']
  ],
  temas: ['Violência urbana e o papel da educação', 'Uso responsável das redes sociais', 'Segurança pública e participação da sociedade', 'Desafios da mobilidade urbana'],
  flash: [
    ['Extintor para Classe C?', 'CO₂ ou pó químico (BC/ABC).'],
    ['Sigla XABCDE?', 'Hemorragia, Vias aéreas, Respiração, Circulação, Neurológico, Exposição.'],
    ['Relação da RCP em adultos?', '30 compressões para 2 ventilações.'],
    ['Art. 144 da CF?', 'Segurança pública.'],
    ['Quanto é 10% de 350?', '35.']
  ],
  resumo: 'Resumo de Combate a Incêndios. Classe A: sólidos comuns. Classe B: líquidos inflamáveis. Classe C: equipamentos elétricos energizados. Classe D: metais combustíveis. Em APH, siga o protocolo X A B C D E, começando pelo controle de hemorragias graves. Na RCP de adultos, use trinta compressões para duas ventilações.'
};

/* ========== Componente de Quiz ========== */
function renderQuiz(el, qs) {
  let i = 0, score = 0;
  const show = () => {
    if (i >= qs.length) {
      el.innerHTML = `<div class="card"><h3>Resultado</h3><p class="result">${score}/${qs.length} acertos</p><button class="btn" id="qr">Refazer</button></div>`;
      $('#qr', el).onclick = () => { i = 0; score = 0; show(); };
      return;
    }
    const [q, opts, ok] = qs[i];
    el.innerHTML = `<div class="card"><p class="muted">Questão ${i + 1} de ${qs.length}</p><h3>${q}</h3>${opts.map((o, n) => `<button class="opt" data-n="${n}">${String.fromCharCode(65 + n)}) ${o}</button>`).join('')}</div>`;
    $$('.opt', el).forEach(b => b.onclick = () => {
      const n = +b.dataset.n;
      $$('.opt', el).forEach(x => x.disabled = true);
      $$('.opt', el)[ok].classList.add('ok');
      if (n === ok) score++; else b.classList.add('bad');
      const nx = document.createElement('button');
      nx.className = 'btn'; nx.textContent = i + 1 < qs.length ? 'Próxima' : 'Ver resultado';
      nx.onclick = () => { i++; show(); };
      el.firstElementChild.append(nx);
    });
  };
  show();
}

/* ========== Módulos ========== */
const modules = {
  guia(el) {
    el.innerHTML = `<h2>Guia PMESP</h2><p class="muted">Seu plano de missão do zero à aprovação.</p><div class="grid">${DATA.guia.map(g => card(...g)).join('')}</div>`;
  },
  edital(el) {
    const done = store.get('edital', {});
    const all = Object.values(DATA.edital).flat().length;
    const draw = () => {
      const n = Object.values(done).filter(Boolean).length;
      el.innerHTML = `<h2>Edital Verticalizado</h2><p class="muted">${n} de ${all} tópicos concluídos</p><div class="bar"><i style="width:${n / all * 100}%"></i></div>
      <div class="grid">${Object.entries(DATA.edital).map(([d, ts]) => `<article class="card"><h3>${d}</h3>${ts.map(t => `<label class="check"><input type="checkbox" data-k="${t}" ${done[t] ? 'checked' : ''}>${t}</label>`).join('')}</article>`).join('')}</div>`;
      $$('input', el).forEach(c => c.onchange = () => { done[c.dataset.k] = c.checked; store.set('edital', done); draw(); });
    };
    draw();
  },
  aph(el) {
    el.innerHTML = `<h2>Combate a Incêndios &amp; APH</h2><h3>Classes de incêndio</h3><p class="muted">Toque no card para ver o extintor adequado.</p>
    <div class="grid">${DATA.incendio.map(([t, d], n) => `<article class="card hot fire" tabindex="0" role="button" data-n="${n}"><span class="badge b-alta">Alta Frequência</span><h3>${t}</h3><p class="muted">Toque para ver detalhes</p></article>`).join('')}</div>
    <h3>Resumo de APH</h3><div class="grid">${DATA.aph.map(a => card(a[0], a[1], 'ess')).join('')}</div>
    <h3>Mini-simulado Vunesp</h3><div id="quizAph"></div>`;
    $$('.fire', el).forEach(c => {
      const toggle = () => { const [t, d] = DATA.incendio[c.dataset.n]; c.querySelector('p').textContent = c.dataset.open ? 'Toque para ver detalhes' : d; c.dataset.open = c.dataset.open ? '' : '1'; };
      c.onclick = toggle; c.onkeydown = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle());
    });
    renderQuiz($('#quizAph', el), DATA.quizAph);
  },
  taf(el) {
    const tests = [['corrida', 'Corrida 12 min (m)', 2400], ['flexao', 'Flexões (reps)', 25], ['abdominal', 'Abdominais (reps)', 30], ['barra', 'Barra (reps)', 3]];
    el.innerHTML = `<h2>Calculadora TAF</h2><p class="muted">Os mínimos abaixo são valores de exemplo. Ajuste-os conforme o edital do seu concurso.</p>
    <div class="card"><div class="grid">${tests.map(([k, l, m]) => `<div><label>${l}<input type="number" min="0" id="v-${k}"></label><label>Mínimo exigido<input type="number" min="0" id="m-${k}" value="${m}"></label></div>`).join('')}</div>
    <button class="btn" id="tafGo">Calcular</button><div id="tafOut"></div></div>`;
    $('#tafGo', el).onclick = () => {
      const rows = tests.map(([k, l]) => { const v = +$('#v-' + k, el).value, m = +$('#m-' + k, el).value; return [l, v, m, v >= m]; });
      const okAll = rows.every(r => r[3]);
      $('#tafOut', el).innerHTML = `<div class="result" style="color:${okAll ? 'var(--ok)' : 'var(--orange)'}">${okAll ? 'APTO nos testes informados' : 'ATENÇÃO: há testes abaixo do mínimo'}</div>` +
        rows.map(([l, v, m, ok]) => `<p class="check">${ok ? '✅' : '⚠️'} ${l}: ${v} (mínimo ${m})${ok ? '' : ` — faltam ${m - v}`}</p>`).join('');
    };
  },
  redacao(el) {
    el.innerHTML = `<h2>Treinador de Redação Vunesp</h2><p class="muted">Meta: texto dissertativo-argumentativo, com introdução, desenvolvimento e conclusão.</p>
    <div class="card"><div class="row"><button class="btn warn" id="tema">Sortear tema</button><strong id="temaTxt">Clique para sortear um tema</strong></div>
    <textarea id="txt" placeholder="Escreva sua redação aqui..."></textarea>
    <p id="cnt" class="muted">0 palavras · 0 parágrafos · ~0 linhas</p>
    <div class="row">${['Tese clara na introdução', 'Dois argumentos no desenvolvimento', 'Conclusão com proposta', 'Revisei ortografia e pontuação'].map(c => `<label class="check"><input type="checkbox">${c}</label>`).join('')}</div></div>`;
    const t = $('#txt', el);
    t.value = store.get('redacao', '');
    const upd = () => {
      const w = (t.value.trim().match(/\S+/g) || []).length, p = t.value.split(/\n+/).filter(x => x.trim()).length;
      $('#cnt', el).textContent = `${w} palavras · ${p} parágrafos · ~${Math.ceil(w / 11)} linhas`;
      store.set('redacao', t.value);
    };
    t.oninput = upd; upd();
    $('#tema', el).onclick = () => $('#temaTxt', el).textContent = DATA.temas[Math.floor(Math.random() * DATA.temas.length)];
  },
  simulado(el) {
    el.innerHTML = `<h2>Simulado PMESP</h2><div id="quizPm"></div>`;
    renderQuiz($('#quizPm', el), DATA.quizPm);
  },
  paulista(el) {
    el.innerHTML = `<h2>Prova Paulista</h2><div class="grid">${DATA.paulista.map(p => card(...p)).join('')}</div>`;
  },
  podclass(el) {
    el.innerHTML = `<h2>PodClass &amp; Áudio</h2><div class="card"><h3>Player tático</h3>
    <input type="file" id="aFile" accept="audio/*" aria-label="Escolher arquivo de áudio">
    <audio id="audio" controls style="width:100%;margin-top:.8rem"></audio>
    <div class="row"><button class="btn" id="play">▶ Play</button><button class="btn ghost" id="pause">⏸ Pause</button>
    <label style="margin:0">Velocidade <select id="rate" style="width:auto">${[1, 1.25, 1.5, 1.75, 2].map(r => `<option value="${r}">${r}x</option>`).join('')}</select></label></div></div>
    <div class="card" style="margin-top:1rem"><h3>Ouvir resumo</h3><textarea id="speakTxt" style="min-height:120px">${DATA.resumo}</textarea>
    <div class="row"><button class="btn warn" id="speak">🔊 Ouvir Resumo</button><button class="btn ghost" id="stop">Parar</button><span class="muted" id="ttsMsg"></span></div></div>`;
    const a = $('#audio', el);
    $('#aFile', el).onchange = e => { const f = e.target.files[0]; if (f) { a.src = URL.createObjectURL(f); } };
    $('#play', el).onclick = () => a.play().catch(() => $('#ttsMsg', el).textContent = 'Escolha um arquivo de áudio antes.');
    $('#pause', el).onclick = () => a.pause();
    $('#rate', el).onchange = e => { a.playbackRate = +e.target.value; };
    const synth = window.speechSynthesis;
    $('#speak', el).onclick = () => {
      if (!synth) return $('#ttsMsg', el).textContent = 'Seu navegador não suporta leitura em voz alta.';
      synth.cancel();
      const u = new SpeechSynthesisUtterance($('#speakTxt', el).value);
      u.lang = 'pt-BR'; u.rate = +$('#rate', el).value; synth.speak(u);
    };
    $('#stop', el).onclick = () => synth && synth.cancel();
  },
  flash(el) {
    let i = 0, open = false;
    const draw = () => {
      const [q, r] = DATA.flash[i];
      el.innerHTML = `<h2>Flashcards</h2><p class="muted">Card ${i + 1} de ${DATA.flash.length}. Clique no card para virar.</p>
      <div class="card flip" id="fc" tabindex="0" role="button">${open ? r : q}</div>
      <div class="row"><button class="btn ghost" id="prev">Anterior</button><button class="btn" id="next">Próximo</button></div>`;
      const flip = () => { open = !open; draw(); $('#fc', el).focus(); };
      $('#fc', el).onclick = flip; $('#fc', el).onkeydown = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), flip());
      $('#prev', el).onclick = () => { i = (i - 1 + DATA.flash.length) % DATA.flash.length; open = false; draw(); };
      $('#next', el).onclick = () => { i = (i + 1) % DATA.flash.length; open = false; draw(); };
    };
    draw();
  },
  pomo(el) {
    let sec = 25 * 60, mode = 'Foco', timer = null;
    el.innerHTML = `<h2>Pomodoro &amp; Bloco de Notas</h2><div class="grid"><div class="card"><p class="muted" id="pmode">Foco</p><div class="clock" id="clock">25:00</div>
    <div class="row" style="justify-content:center"><button class="btn" id="pgo">Iniciar</button><button class="btn ghost" id="prs">Zerar</button></div></div>
    <div class="card"><h3>Bloco de notas</h3><textarea id="notes" placeholder="Anote dúvidas e pontos de revisão..."></textarea></div></div>`;
    const clock = $('#clock', el);
    const show = () => clock.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    const stop = () => { clearInterval(timer); timer = null; $('#pgo', el).textContent = 'Iniciar'; };
    $('#pgo', el).onclick = () => {
      if (timer) return stop();
      $('#pgo', el).textContent = 'Pausar';
      timer = setInterval(() => {
        if (--sec <= 0) { mode = mode === 'Foco' ? 'Pausa' : 'Foco'; sec = (mode === 'Foco' ? 25 : 5) * 60; $('#pmode', el).textContent = mode; }
        show();
      }, 1000);
    };
    $('#prs', el).onclick = () => { stop(); mode = 'Foco'; sec = 25 * 60; $('#pmode', el).textContent = mode; show(); };
    const n = $('#notes', el); n.value = store.get('notas', ''); n.oninput = () => store.set('notas', n.value);
  }
};

/* ========== Navegação ========== */
function openTab(id) {
  $$('.tab').forEach(t => { const on = t.dataset.tab === id; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === id));
  store.set('tab', id);
}
$('#tabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) openTab(t.dataset.tab); });

/* ========== Sessão / Web3Forms ========== */
const modal = $('#loginModal');
function applySession() {
  const s = store.get('aluno');
  modal.hidden = !!s;
  $('#userBox').hidden = !s;
  if (s) $('#userName').textContent = `${s.nome} · ${s.foco}`;
}
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, msg = $('#formMsg');
  const aluno = { nome: f.nome.value.trim(), email: f.email.value.trim(), foco: f.foco.value };
  msg.textContent = 'Enviando cadastro...';
  try {
    const r = await fetch(f.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
    if (!r.ok) throw new Error();
  } catch { /* segue offline: a sessão local continua válida */ }
  store.set('aluno', aluno);
  msg.textContent = '';
  applySession();
});
$('#logoutBtn').onclick = () => { store.del('aluno'); applySession(); };

/* ========== Inicialização ========== */
Object.entries(modules).forEach(([id, fn]) => fn($('#' + id)));
openTab(store.get('tab', 'guia'));
applySession();
