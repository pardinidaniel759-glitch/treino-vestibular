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
  paulista(el) {
    el.innerHTML = `<h2>Prova Paulista</h2><div class="grid">${DATA.paulista.map(p => card(...p)).join('')}</div>`;
  },
  podclass(el) {
    el.innerHTML = `<h2>PodClass &amp; Áudio</h2><div class="card"><h3>Player tático</h3>
    <input type="file" id="aFile" accept="audio/*" aria-label="Escolher arquivo de áudio">
    <audio id="audio" controls style="width:100%;margin-top:.8rem"></audio>
    <div class="row"><button class="btn" id="play">▶ Play</button><button class="btn ghost" id="pause">⏸ Pause</button>
    <label style="margin:0">Velocidade <select id="rate" style="width:auto">${[1, 1.25, 1.5, 2].map(r => `<option value="${r}">${r}x</option>`).join('')}</select></label></div></div>
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

/* ========== Banco de questões (autorais, no estilo Vunesp) ========== */
// Formato: [matéria, enunciado, [alternativas], índice do gabarito, comentário]
const PESOS_PM = [['Língua Portuguesa', .25], ['Matemática', .25], ['Conhecimentos Gerais', .25], ['Administração Pública', .15], ['Informática', .10]];
const PESOS_PA = [['Linguagens', .25], ['Matemática', .25], ['Ciências da Natureza', .25], ['Ciências Humanas', .25]];
const BANCO = {
  pmesp: [
    ['Língua Portuguesa', 'Assinale a alternativa em que a concordância está de acordo com a norma-padrão.', ['Houveram muitos candidatos na prova.', 'Fazem dez anos que ingressei na corporação.', 'Devem existir soluções para o problema.', 'Vendem-se casa na região.', 'Aluga-se apartamentos no bairro.'], 2, '"Haver" (existir) e "fazer" (tempo) são impessoais e ficam no singular. Em "Devem existir soluções", o auxiliar "devem" concorda com o sujeito "soluções".'],
    ['Língua Portuguesa', 'Assinale a alternativa em que o sinal indicativo de crase está empregado corretamente.', ['Entregou o documento à ele.', 'Foi à pé até o quartel.', 'Refiro-me à colegas de turma.', 'Chegamos às duas horas da tarde.', 'Estudará à partir de amanhã.'], 3, 'Crase é obrigatória antes de horas determinadas. Não há crase antes de pronome pessoal, palavra masculina, palavra no plural sem artigo ou verbo.'],
    ['Língua Portuguesa', 'Assinale a alternativa em que a vírgula está empregada de acordo com a norma-padrão.', ['O soldado, cumpriu a ordem.', 'Os policiais chegaram, ao local, rapidamente.', 'Ao chegar ao local, o policial isolou a área.', 'O policial isolou, a área ao chegar.', 'Chegando o policial, isolou, a área.'], 2, 'A oração reduzida deslocada para o início da frase é separada por vírgula. Não se separa sujeito de verbo nem verbo de complemento.'],
    ['Língua Portuguesa', 'Assinale a alternativa que está de acordo com a norma-padrão de regência.', ['Assistimos o jogo ontem.', 'O policial obedeceu as normas.', 'Prefiro correr do que caminhar.', 'Aspiro a uma vaga na corporação.', 'Esqueci que a prova era hoje, mas lembrei-me que era.'], 3, '"Aspirar" no sentido de almejar pede a preposição "a". O correto seria "assistimos ao jogo", "obedeceu às normas" e "prefiro correr a caminhar".'],
    ['Língua Portuguesa', 'Em "O comandante foi peremptório ao negar o pedido", a palavra "peremptório" significa:', ['hesitante', 'categórico, que não admite réplica', 'irônico', 'generoso', 'impaciente'], 1, '"Peremptório" indica algo decisivo e definitivo, que não admite contestação.'],
    ['Matemática', 'Um salário de R$ 3.500,00 sofre desconto de 12%. Qual é o valor líquido?', ['R$ 2.940,00', 'R$ 3.080,00', 'R$ 3.120,00', 'R$ 3.200,00', 'R$ 3.380,00'], 1, '12% de 3.500 = 420. Logo, 3.500 − 420 = 3.080.'],
    ['Matemática', 'Seis policiais patrulham uma região em 12 dias. Mantido o ritmo, quantos dias levarão 9 policiais?', ['6', '8', '9', '10', '18'], 1, 'As grandezas são inversamente proporcionais: 6 × 12 = 9 × x, então x = 8.'],
    ['Matemática', 'A média de 5 números é 18. Retirando um deles, a média dos 4 restantes passa a ser 16. Qual número foi retirado?', ['20', '22', '24', '26', '28'], 3, 'A soma inicial é 90 e a final é 64. O número retirado é 90 − 64 = 26.'],
    ['Matemática', 'Uma viatura percorre 150 km em 2 h 30 min. Qual a velocidade média?', ['55 km/h', '60 km/h', '65 km/h', '70 km/h', '75 km/h'], 1, '2 h 30 min = 2,5 h. Velocidade = 150 ÷ 2,5 = 60 km/h.'],
    ['Matemática', 'Uma urna tem 3 bolas vermelhas e 7 azuis. Qual a probabilidade de sortear uma bola vermelha?', ['10%', '20%', '30%', '37%', '70%'], 2, 'Casos favoráveis ÷ casos possíveis = 3/10 = 30%.'],
    ['Conhecimentos Gerais', 'A Proclamação da República no Brasil ocorreu em:', ['1822', '1888', '1889', '1930', '1964'], 2, 'A República foi proclamada em 15 de novembro de 1889, pelo marechal Deodoro da Fonseca.'],
    ['Conhecimentos Gerais', 'A Revolução Constitucionalista, movimento armado em São Paulo, ocorreu em:', ['1922', '1932', '1942', '1954', '1964'], 1, 'O movimento de 1932 exigia a convocação de uma Assembleia Constituinte.'],
    ['Conhecimentos Gerais', 'O bioma brasileiro de maior extensão territorial é:', ['Cerrado', 'Mata Atlântica', 'Caatinga', 'Amazônia', 'Pampa'], 3, 'A Amazônia ocupa cerca de 49% do território nacional.'],
    ['Conhecimentos Gerais', 'A Constituição da República Federativa do Brasil vigente foi promulgada em:', ['1934', '1946', '1967', '1988', '1995'], 3, 'A Constituição Cidadã foi promulgada em 5 de outubro de 1988.'],
    ['Conhecimentos Gerais', 'Qual rio atravessa a cidade de São Paulo?', ['Paraíba do Sul', 'Tietê', 'Paranapanema', 'Ribeira de Iguape', 'Grande'], 1, 'O Tietê cruza a capital paulista, junto com o Pinheiros.'],
    ['Administração Pública', 'Qual NÃO é princípio expresso no caput do art. 37 da Constituição Federal?', ['Legalidade', 'Moralidade', 'Eficiência', 'Razoabilidade', 'Publicidade'], 3, 'Os princípios expressos são legalidade, impessoalidade, moralidade, publicidade e eficiência (LIMPE). A razoabilidade é implícita.'],
    ['Administração Pública', 'O poder que permite à Administração punir servidores por infrações funcionais é o poder:', ['hierárquico', 'disciplinar', 'regulamentar', 'de polícia', 'vinculado'], 1, 'O poder disciplinar apura infrações e aplica sanções a quem tem vínculo com a Administração.'],
    ['Administração Pública', 'O princípio que veda favoritismos e perseguições na atuação administrativa é o da:', ['publicidade', 'legalidade', 'impessoalidade', 'eficiência', 'autotutela'], 2, 'A impessoalidade exige tratamento igual, sem beneficiar ou prejudicar pessoas.'],
    ['Informática', 'No Windows, qual atalho copia o item selecionado?', ['Ctrl + V', 'Ctrl + X', 'Ctrl + C', 'Ctrl + Z', 'Ctrl + P'], 2, 'Ctrl+C copia, Ctrl+V cola, Ctrl+X recorta e Ctrl+Z desfaz.'],
    ['Informática', '"Phishing" é:', ['um tipo de backup', 'fraude que usa mensagens falsas para roubar dados', 'um antivírus', 'um protocolo de e-mail', 'uma extensão de arquivo'], 1, 'O golpista se passa por instituição confiável para obter senhas e dados.'],
    ['Informática', 'Qual é a extensão padrão de planilhas do Microsoft Excel atual?', ['.docx', '.pptx', '.xlsx', '.pdf', '.txt'], 2, '.xlsx é o formato de planilha; .docx é do Word e .pptx do PowerPoint.']
  ],
  paulista: [
    ['Linguagens', 'Em "Seu sorriso é um raio de sol", ocorre a figura de linguagem:', ['metonímia', 'metáfora', 'ironia', 'antítese', 'hipérbole'], 1, 'Há comparação implícita, sem conectivo, entre o sorriso e o raio de sol.'],
    ['Linguagens', 'O editorial de um jornal caracteriza-se por:', ['relatar um fato sem opinião', 'expressar a posição do veículo sobre um tema', 'anunciar produtos', 'narrar uma história fictícia', 'listar classificados'], 1, 'O editorial é um texto opinativo que representa o posicionamento do veículo.'],
    ['Matemática', 'Se f(x) = 2x + 3, então f(4) é:', ['8', '9', '10', '11', '12'], 3, 'f(4) = 2·4 + 3 = 11.'],
    ['Matemática', 'A área de um círculo de raio 3 cm é:', ['6π cm²', '9π cm²', '12π cm²', '3π cm²', '18π cm²'], 1, 'A = π·r² = π·3² = 9π.'],
    ['Ciências da Natureza', 'A fotossíntese ocorre principalmente em qual organela?', ['Mitocôndria', 'Ribossomo', 'Cloroplasto', 'Lisossomo', 'Núcleo'], 2, 'Os cloroplastos contêm clorofila, que capta a luz.'],
    ['Ciências da Natureza', 'Um corpo de 5 kg tem aceleração de 4 m/s². A força resultante é:', ['1,25 N', '9 N', '20 N', '25 N', '40 N'], 2, 'Segunda lei de Newton: F = m·a = 5 × 4 = 20 N.'],
    ['Ciências Humanas', 'A Revolução Industrial teve início em qual país?', ['França', 'Inglaterra', 'Alemanha', 'Estados Unidos', 'Itália'], 1, 'Começou na Inglaterra, na segunda metade do século XVIII.'],
    ['Ciências Humanas', 'A linha do Equador corresponde à latitude de:', ['0°', '23°27′ N', '23°27′ S', '66°33′ N', '90° N'], 0, 'O Equador é a latitude 0°, que divide a Terra em hemisférios Norte e Sul.']
  ]
};

/* ========== Simulados ========== */
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickBy = (pool, total, pesos) => shuffle(pesos.flatMap(([m, w]) => shuffle(pool.filter(q => q[0] === m)).slice(0, Math.round(total * w))));
const fmtT = s => { s = Math.max(0, s); return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(n => String(n).padStart(2, '0')).join(':'); };
const MODOS = {
  treino: { t: 'Modo Treino Rápido', d: '10 questões aleatórias, sem cronômetro.', secs: 0, build: () => shuffle([...BANCO.pmesp, ...BANCO.paulista]).slice(0, 10), meta: 10, n: () => BANCO.pmesp.length + BANCO.paulista.length },
  completo: { t: 'Simulado Completo PMESP', d: '60 questões proporcionais por matéria, com 4h30 de prova.', secs: 16200, build: () => pickBy(BANCO.pmesp, 60, PESOS_PM), meta: 60, n: () => BANCO.pmesp.length },
  paulista: { t: 'Simulado Prova Paulista', d: '40 questões do Ensino Médio, com 3h de prova.', secs: 10800, build: () => pickBy(BANCO.paulista, 40, PESOS_PA), meta: 40, n: () => BANCO.paulista.length }
};

modules.simulado = function (el) {
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; };

  function menu() {
    stop();
    const h = store.get('hist', []);
    const media = h.length ? (h.reduce((s, x) => s + x.pct, 0) / h.length).toFixed(1) : null;
    el.innerHTML = `<h2>Simulados</h2><div class="card"><label>Modo de prova<select id="modo">${Object.entries(MODOS).map(([k, m]) => `<option value="${k}">${m.t}</option>`).join('')}</select></label>
    <p class="muted" id="desc"></p><button class="btn" id="go">Iniciar</button></div>
    <h3 style="margin-top:1.5rem">Histórico</h3>
    ${h.length ? `<p class="muted">Média geral de acertos: ${media}% em ${h.length} simulado(s)</p>` + h.slice(-5).reverse().map(x => `<p class="check">${x.d} · ${x.modo}: ${x.hits}/${x.total} (${x.pct}%) · nota ${x.nota}</p>`).join('') + '<div class="row"><button class="btn ghost" id="clr">Limpar histórico</button></div>' : '<p class="muted">Nenhum simulado feito ainda.</p>'}`;
    const upd = () => { const m = MODOS[$('#modo', el).value]; $('#desc', el).textContent = `${m.d} Banco atual: ${m.n()} questões disponíveis (meta ${m.meta}).`; };
    $('#modo', el).onchange = upd; upd();
    $('#go', el).onclick = () => start($('#modo', el).value);
    const c = $('#clr', el); if (c) c.onclick = () => { store.del('hist'); menu(); };
  }

  function start(id) {
    const M = MODOS[id], qs = M.build(), ans = [];
    let i = 0, left = M.secs, msg = '';
    const finish = timeout => {
      stop();
      const total = qs.length, hits = qs.filter((q, k) => ans[k] === q[3]).length;
      const pct = Math.round(hits / total * 1000) / 10, nota = (hits / total * 10).toFixed(1);
      const h = store.get('hist', []);
      h.push({ d: new Date().toLocaleString('pt-BR'), modo: M.t, hits, total, pct, nota });
      store.set('hist', h.slice(-20));
      const mats = [...new Set(qs.map(q => q[0]))].map(m => { const l = qs.map((q, k) => [q, k]).filter(([q]) => q[0] === m); return `<p class="check">${m}: ${l.filter(([q, k]) => ans[k] === q[3]).length}/${l.length}</p>`; }).join('');
      el.innerHTML = `<h2>Resultado</h2><div class="card">${timeout ? '<p style="color:var(--orange);font-weight:600">⏰ Tempo esgotado!</p>' : ''}<p class="result" style="color:var(--neon)">Nota ${nota} · ${pct}% de acertos</p><p class="muted">${hits} acertos em ${total} questões (${qs.filter((q, k) => ans[k] == null).length} em branco)</p>${mats}<div class="row"><button class="btn" id="back">Voltar aos simulados</button></div></div>`;
      $('#back', el).onclick = menu;
    };
    const view = () => {
      if (i >= qs.length) return finish(false);
      const [mat, q, o, a, c] = qs[i], done = ans[i] != null;
      el.innerHTML = `<div class="card"><div class="row"><span class="badge b-ess">${mat}</span><span class="muted">Questão ${i + 1} de ${qs.length}</span><strong id="tm" style="margin-left:auto">${M.secs ? '⏱ ' + fmtT(left) : ''}</strong></div>
      <div class="bar"><i style="width:${i / qs.length * 100}%"></i></div><p id="alerta" role="alert" style="color:var(--orange);font-weight:600">${msg}</p>
      <h3>${q}</h3>${o.map((t, n) => `<button class="opt" data-n="${n}" ${done ? 'disabled' : ''}>${String.fromCharCode(65 + n)}) ${t}</button>`).join('')}
      <div id="fb"></div><div class="row"><button class="btn ghost" id="fin">Encerrar simulado</button><button class="btn" id="nx" hidden>${i + 1 < qs.length ? 'Próxima' : 'Ver resultado'}</button></div></div>`;
      const reveal = () => {
        $$('.opt', el).forEach(b => { b.disabled = true; const n = +b.dataset.n; if (n === a) b.classList.add('ok'); else if (n === ans[i]) b.classList.add('bad'); });
        $('#fb', el).innerHTML = `<div class="card hot"><strong>${ans[i] === a ? '✅ Correto!' : `❌ Gabarito: ${String.fromCharCode(65 + a)}`}</strong><p>${c}</p></div>`;
        $('#nx', el).hidden = false;
      };
      $$('.opt', el).forEach(b => b.onclick = () => { ans[i] = +b.dataset.n; reveal(); });
      if (done) reveal();
      $('#nx', el).onclick = () => { i++; view(); };
      $('#fin', el).onclick = () => confirm('Encerrar e ver o resultado?') && finish(false);
    };
    if (M.secs) timer = setInterval(() => {
      left--;
      const t = $('#tm', el); if (t) t.textContent = '⏱ ' + fmtT(left);
      if ([1800, 600, 300].includes(left)) { msg = `⚠️ Restam ${left / 60} minutos de prova!`; const a = $('#alerta', el); if (a) a.textContent = msg; }
      if (left <= 0) finish(true);
    }, 1000);
    view();
  }
  menu();
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

/* ========== Leitura em voz alta da tela ========== */
$('#readScreen').onclick = () => {
  const synth = window.speechSynthesis;
  if (!synth) return alert('Seu navegador não suporta leitura em voz alta.');
  if (synth.speaking) return synth.cancel();
  const p = $('.panel.active');
  const src = p.id === 'podclass' ? $('#speakTxt').value : p.innerText;
  const u = new SpeechSynthesisUtterance(src);
  u.lang = 'pt-BR'; u.rate = +($('#rate')?.value || 1);
  synth.speak(u);
};

/* ========== Inicialização ========== */
Object.entries(modules).forEach(([id, fn]) => fn($('#' + id)));
openTab(store.get('tab', 'guia'));
applySession();
