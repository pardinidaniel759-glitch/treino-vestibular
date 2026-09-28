'use strict';
const $ = (s, r = document) => r.querySelector(s);
const S = JSON.parse(localStorage.getItem('baseTatica') || '{}');
S.ed = S.ed || {}; S.rank = S.rank || {}; S.notas = S.notas || '';
const save = () => localStorage.setItem('baseTatica', JSON.stringify(S));
const shuffle = a => a.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const mmss = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const li = str => '<ul>' + str.split(';').map(t => `<li>${t.trim()}</li>`).join('') + '</ul>';

/* ---------- NAVEGAÇÃO ---------- */
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button,.view').forEach(e => e.classList.remove('on'));
  b.classList.add('on'); $('#' + b.dataset.v).classList.add('on'); scrollTo(0, 0);
});

/* ---------- DADOS ---------- */
const GUIA = {
  'Língua Portuguesa': 'Interpretação de texto (inferência, tema, ideia central);Gramática: classes de palavras, concordância verbal e nominal;Crase: antes de palavras femininas com "a" + "a";Regência verbal e nominal (assistir, obedecer, preferir);Pontuação, ortografia e acentuação;Figuras de linguagem e tipos de texto',
  'Matemática': 'Razão e proporção, divisão proporcional;Regra de três simples e composta;Porcentagem, aumentos e descontos sucessivos;Geometria plana: áreas e perímetros;Equações do 1º e 2º grau;Médias e problemas com raciocínio lógico',
  'História': 'Brasil Colônia, Império e República;Revolução Constitucionalista de 1932;Era Vargas e Ditadura Militar;Redemocratização e Constituição de 1988;Revolução Francesa e Industrial',
  'Geografia': 'Biomas e clima do Brasil;Hidrografia e relevo;Urbanização e população;Regiões brasileiras e economia;Geografia do Estado de São Paulo',
  'Atualidades': 'Segurança pública e direitos humanos;Meio ambiente e sustentabilidade;Tecnologia e economia;Política nacional e internacional dos últimos 12 meses (leia jornais de referência)',
  'Noções de Administração Pública': 'Princípios do art. 37 da CF (LIMPE);Hierarquia e disciplina;Art. 144 da CF: segurança pública;Direitos e deveres do servidor;Ética e cidadania',
  'Informática': 'Atalhos do Windows e do pacote Office;Conceitos de internet, navegadores e e-mail;Segurança: vírus, phishing e backup;Pastas, arquivos e extensões',
  'Estratégia de prova e Redação': 'Resolva primeiro as matérias em que você é mais forte;Reserve ~1 min por questão e marque as difíceis para voltar;Leia o enunciado inteiro e elimine as alternativas erradas;Redação: introdução com tese, dois parágrafos de desenvolvimento e conclusão com proposta de intervenção;Revise ortografia, concordância e pontuação nos últimos 10 minutos;Faça simulados cronometrados semanais e refaça as questões erradas'
};
const EDITAL = {
  'Língua Portuguesa': 'Interpretação e compreensão de texto;Ortografia e acentuação;Classes de palavras;Concordância verbal e nominal;Regência verbal e nominal;Crase;Pontuação;Figuras de linguagem',
  'Matemática': 'Razão e proporção;Regra de três simples e composta;Porcentagem;Geometria plana;Equações do 1º e 2º grau;Sistemas de medidas;Médias e estatística básica',
  'História': 'Brasil Colônia e Império;República Velha e Era Vargas;Revolução de 1932;Ditadura Militar e redemocratização;História geral: Revoluções Francesa e Industrial',
  'Geografia': 'Biomas e clima brasileiros;Hidrografia e relevo;População e urbanização;Regiões do Brasil;Geografia de São Paulo',
  'Atualidades': 'Segurança pública;Meio ambiente;Economia e tecnologia;Política e relações internacionais',
  'Noções de Administração Pública': 'Princípios da administração pública;Poderes administrativos;Segurança pública na CF (art. 144);Direitos e deveres do servidor',
  'Informática': 'Sistema operacional Windows;Editor de textos e planilhas;Internet e e-mail;Segurança da informação'
};
const STATUS = ['Pendente', 'Em Estudo', 'Resumo Concluído', 'Revisado'];
const MAPA = {
  'Língua Portuguesa': 'Identificar tema e finalidade de gêneros textuais;Reconhecer funções da linguagem;Interpretar figuras de linguagem, ironia e humor;Relacionar variação linguística e contexto;Concordância, regência e pontuação em textos',
  'Matemática': 'Funções afim e quadrática (gráficos e problemas);Porcentagem e juros;Estatística: média, moda, mediana e gráficos;Probabilidade e análise combinatória;Geometria plana e espacial (áreas e volumes);Razão, proporção e grandezas',
  'Ciências da Natureza': 'Fotossíntese, respiração e ecologia;Genética e evolução;Cinemática, leis de Newton e energia;Eletricidade e circuitos;Química: misturas, ligações, reações e ácidos/bases;Impactos ambientais e efeito estufa',
  'Ciências Humanas': 'Iluminismo e Revoluções Industrial e Francesa;Brasil: escravidão, Abolição e República;Cidadania, direitos humanos e democracia;Globalização, urbanização e meio ambiente;Cartografia, clima e biomas;Trabalho e desigualdade social'
};
// [disciplina, enunciado, alternativas, índice correto, comentário]
const QPM = [
  ['Língua Portuguesa', 'Complete: "Fui ___ farmácia comprar o remédio."', ['à', 'a', 'á', 'há'], 0, 'O verbo "ir" pede a preposição "a", e "farmácia" aceita o artigo "a". A soma dos dois gera a crase.'],
  ['Língua Portuguesa', 'O verbo "assistir", no sentido de "ver", é:', ['Transitivo direto', 'Transitivo indireto (pede a preposição "a")', 'Intransitivo', 'De ligação'], 1, 'Assiste-se "ao" filme. Exige a preposição "a".'],
  ['Língua Portuguesa', 'Assinale a frase correta quanto à concordância.', ['Fazem dois anos que moro aqui.', 'Faz dois anos que moro aqui.', 'Haviam muitas pessoas.', 'Devem haver soluções.'], 1, '"Fazer" indicando tempo e "haver" com sentido de existir são impessoais e ficam no singular.'],
  ['Língua Portuguesa', 'Em "O policial, cansado, atendeu a ocorrência", a palavra "cansado" exerce a função de:', ['Adjunto adverbial', 'Predicativo do sujeito', 'Objeto direto', 'Vocativo'], 1, 'Indica um estado do sujeito "policial" durante a ação.'],
  ['Matemática', '6 operários constroem um muro em 10 dias. Em quantos dias 15 operários, no mesmo ritmo, constroem o mesmo muro?', ['2 dias', '4 dias', '5 dias', '25 dias'], 1, 'Grandezas inversamente proporcionais: 6 × 10 = 15 × x, logo x = 4.'],
  ['Matemática', 'Um produto de R$ 200 sofre aumento de 20% e depois desconto de 20%. O preço final é:', ['R$ 200', 'R$ 192', 'R$ 180', 'R$ 196'], 1, '200 × 1,2 = 240; 240 × 0,8 = 192.'],
  ['Matemática', 'Dividindo 120 em partes diretamente proporcionais a 2 e 3, a maior parte vale:', ['48', '60', '72', '80'], 2, '120 ÷ 5 = 24; 24 × 3 = 72.'],
  ['Matemática', 'Um retângulo tem perímetro 20 cm e um lado de 4 cm. Sua área é:', ['16 cm²', '20 cm²', '24 cm²', '32 cm²'], 2, 'O outro lado mede 10 − 4 = 6 cm; área = 4 × 6 = 24.'],
  ['Matemática', 'Resolva: 3x − 5 = 16.', ['x = 5', 'x = 6', 'x = 7', 'x = 8'], 2, '3x = 21, logo x = 7.'],
  ['História', 'A Proclamação da República no Brasil ocorreu em:', ['1822', '1889', '1891', '1930'], 1, '15 de novembro de 1889, liderada por Deodoro da Fonseca.'],
  ['História', 'A Revolução Constitucionalista de 1932 teve como centro o estado de:', ['Minas Gerais', 'Rio Grande do Sul', 'São Paulo', 'Bahia'], 2, 'Paulistas exigiram uma nova Constituição contra o governo de Vargas.'],
  ['Geografia', 'O maior bioma brasileiro em extensão territorial é:', ['Cerrado', 'Amazônia', 'Mata Atlântica', 'Caatinga'], 1, 'A Amazônia ocupa cerca de 49% do território nacional.'],
  ['Geografia', 'Qual rio corta a capital paulista?', ['Paraíba do Sul', 'Tietê', 'Paranapanema', 'Ribeira de Iguape'], 1, 'Os rios Tietê e Pinheiros atravessam a cidade de São Paulo.'],
  ['Noções de Administração Pública', 'Qual NÃO é princípio expresso no art. 37 da Constituição Federal?', ['Legalidade', 'Eficiência', 'Pessoalidade', 'Publicidade'], 2, 'Os princípios são Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.'],
  ['Noções de Administração Pública', 'Segundo o art. 144 da CF, às polícias militares cabe:', ['Polícia judiciária', 'Polícia ostensiva e preservação da ordem pública', 'Polícia marítima', 'Policiamento das rodovias federais'], 1, 'A polícia judiciária é das polícias civis; as PMs fazem o policiamento ostensivo.'],
  ['Informática', 'No Windows, o atalho Ctrl + Z serve para:', ['Refazer', 'Desfazer', 'Recortar', 'Salvar'], 1, 'Ctrl+Z desfaz a última ação; Ctrl+Y refaz.']
];
const QPP = [
  ['Língua Portuguesa', 'Um anúncio que diz "Compre agora!" tem predomínio da função:', ['Emotiva', 'Referencial', 'Conativa', 'Poética'], 2, 'A função conativa busca influenciar o receptor, com verbos no imperativo.'],
  ['Língua Portuguesa', '"Seus olhos são dois oceanos" é um exemplo de:', ['Metonímia', 'Metáfora', 'Ironia', 'Hipérbole'], 1, 'Comparação implícita, sem conectivo comparativo.'],
  ['Língua Portuguesa', 'Qual gênero textual tem como objetivo defender uma opinião com argumentos?', ['Notícia', 'Artigo de opinião', 'Receita', 'Bula'], 1, 'O artigo de opinião é argumentativo.'],
  ['Matemática', 'Se f(x) = 2x + 3, então f(4) vale:', ['8', '10', '11', '14'], 2, '2 × 4 + 3 = 11.'],
  ['Matemática', 'A média aritmética de 6, 8, 10 e 12 é:', ['8', '9', '10', '11'], 1, '36 ÷ 4 = 9.'],
  ['Matemática', 'Ao lançar um dado comum, a probabilidade de sair número par é:', ['1/6', '1/3', '1/2', '2/3'], 2, 'Casos favoráveis: 2, 4 e 6, ou seja, 3 em 6.'],
  ['Ciências da Natureza', 'O processo em que os vegetais produzem glicose usando luz é:', ['Respiração celular', 'Fotossíntese', 'Fermentação', 'Digestão'], 1, 'Ocorre nos cloroplastos: CO₂ + H₂O + luz → glicose + O₂.'],
  ['Ciências da Natureza', 'A unidade de força no Sistema Internacional é o:', ['Joule', 'Watt', 'Newton', 'Pascal'], 2, 'Newton (N) = kg·m/s².'],
  ['Ciências da Natureza', 'Qual gás tem maior relação com o aumento do efeito estufa causado pelo ser humano?', ['Oxigênio', 'Nitrogênio', 'Dióxido de carbono', 'Hélio'], 2, 'A queima de combustíveis fósseis e o desmatamento elevam o CO₂.'],
  ['Ciências Humanas', 'Qual pensador iluminista defendeu a separação dos três poderes?', ['Locke', 'Montesquieu', 'Hobbes', 'Maquiavel'], 1, 'Em "O Espírito das Leis", Montesquieu propôs Executivo, Legislativo e Judiciário independentes.'],
  ['Ciências Humanas', 'A Revolução Industrial teve início na:', ['França', 'Inglaterra', 'Alemanha', 'Estados Unidos'], 1, 'Começou na Inglaterra, no século XVIII, com a máquina a vapor.'],
  ['Ciências Humanas', 'A Lei Áurea, que aboliu a escravidão no Brasil, é de:', ['1808', '1850', '1871', '1888'], 3, 'Assinada pela Princesa Isabel em 13 de maio de 1888.']
];
const CARDS = [
  ['Legislação', 'Art. 37 da CF: princípios da administração pública', 'L I M P E: Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência'],
  ['Legislação', 'Art. 144 da CF: a quem cabe a polícia ostensiva?', 'Às polícias militares, que também preservam a ordem pública'],
  ['Matemática', 'Fórmula de Bhaskara', 'x = (−b ± √Δ) / 2a, com Δ = b² − 4ac'],
  ['Matemática', 'Área do círculo e comprimento da circunferência', 'A = π·r²  |  C = 2·π·r'],
  ['Matemática', 'Juros simples', 'J = C · i · t  |  M = C + J'],
  ['Matemática', 'Termo geral da PA', 'aₙ = a₁ + (n − 1)·r'],
  ['Gramática', 'Quando NÃO ocorre crase?', 'Antes de palavras masculinas, verbos, pronomes de tratamento e artigos indefinidos'],
  ['Gramática', 'Diferença entre "mau" e "mal"', 'Mau é o oposto de bom (adjetivo); mal é o oposto de bem (advérbio)'],
  ['Datas', 'Independência do Brasil', '7 de setembro de 1822'],
  ['Datas', 'Lei Áurea', '13 de maio de 1888'],
  ['Datas', 'Proclamação da República', '15 de novembro de 1889'],
  ['Datas', 'Revolução Constitucionalista', '1932, em São Paulo']
];

/* ---------- GUIA ---------- */
$('#guia').innerHTML = '<h2>O que mais cai por disciplina</h2><div class="grid">' +
  Object.entries(GUIA).map(([k, v]) => `<div class="card"><h3>${k}</h3>${li(v)}</div>`).join('') + '</div>';

/* ---------- EDITAL ---------- */
function renderEdital() {
  let tot = 0, pts = 0;
  const html = Object.entries(EDITAL).map(([m, t]) => `<div class="card"><h3>${m}</h3>` + t.split(';').map((x, i) => {
    const k = m + '|' + i, s = S.ed[k] || 0; tot++; pts += s;
    return `<div class="topic"><span>${x}</span><button class="st s${s}" data-k="${k}">${STATUS[s]}</button></div>`;
  }).join('') + '</div>').join('');
  const pct = Math.round(pts / (tot * 3) * 100);
  $('#edital').innerHTML = `<h2>Edital verticalizado</h2><div class="card"><b>Progresso geral: ${pct}%</b><div class="bar"><i style="width:${pct}%"></i></div><p class="muted">Clique no status para avançar: Pendente, Em Estudo, Resumo Concluído, Revisado.</p></div>` + html;
  document.querySelectorAll('.st').forEach(b => b.onclick = () => { S.ed[b.dataset.k] = ((S.ed[b.dataset.k] || 0) + 1) % 4; save(); renderEdital(); });
}
renderEdital();

/* ---------- MAPA PAULISTA ---------- */
$('#mapa').innerHTML = '<h2>Matriz de habilidades e tópicos recorrentes</h2><div class="grid">' +
  Object.entries(MAPA).map(([k, v]) => `<div class="card"><h3>${k}</h3>${li(v)}</div>`).join('') + '</div>';

/* ---------- MOTOR DE QUESTÕES ---------- */
function quiz(root, key, bank, titulo, segPorQ) {
  const ds = [...new Set(bank.map(q => q[0]))];
  root.innerHTML = `<h2>${titulo}</h2><div class="card"><div class="row">
    <select id="${key}m"><option value="p">Modo Prática (gabarito imediato)</option><option value="s">Simulado cronometrado</option></select>
    <select id="${key}d"><option value="">Todas as disciplinas</option>${ds.map(d => `<option>${d}</option>`).join('')}</select>
    <button class="btn" id="${key}go">Iniciar</button></div></div><div id="${key}box"></div><div id="${key}rk"></div>`;
  const box = $('#' + key + 'box');
  let L, i, ans, sim, left, tm;
  const rank = () => {
    const r = S.rank[key] || [];
    $('#' + key + 'rk').innerHTML = r.length ? `<div class="card"><h3>Ranking local (simulados)</h3><table><tr><th>#</th><th>Data</th><th>Acertos</th><th>Nota</th></tr>${r.map((x, n) => `<tr><td>${n + 1}</td><td>${x.d}</td><td>${x.a}/${x.t}</td><td>${x.p}%</td></tr>`).join('')}</table></div>` : '';
  };
  rank();
  $('#' + key + 'go').onclick = () => {
    clearInterval(tm);
    const d = $('#' + key + 'd').value;
    L = shuffle(bank.filter(q => !d || q[0] === d)); i = 0; ans = [];
    sim = $('#' + key + 'm').value === 's';
    if (sim) { left = L.length * segPorQ; tm = setInterval(() => { left--; const t = $('#' + key + 't'); if (t) t.textContent = mmss(left); if (left <= 0) fim(); }, 1000); }
    mostra();
  };
  function mostra() {
    if (i >= L.length) return fim();
    const q = L[i];
    box.innerHTML = `<div class="card"><div class="row"><span class="muted">Questão ${i + 1}/${L.length} · ${q[0]}</span>${sim ? `<span class="timer" id="${key}t">${mmss(left)}</span>` : ''}</div>
      <p><b>${q[1]}</b></p>${q[2].map((o, n) => `<button class="opt" data-n="${n}">${'ABCD'[n]}) ${o}</button>`).join('')}<div id="${key}fb"></div></div>`;
    box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const n = +b.dataset.n; ans[i] = n;
      if (sim) { i++; return mostra(); }
      box.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.n === q[3]) x.classList.add('ok'); });
      if (n !== q[3]) b.classList.add('bad');
      $('#' + key + 'fb').innerHTML = `<div class="expl"><b>${n === q[3] ? 'Correto.' : 'Incorreto.'}</b> ${q[4]}</div><button class="btn" id="${key}nx">${i + 1 < L.length ? 'Próxima' : 'Ver resultado'}</button>`;
      $('#' + key + 'nx').onclick = () => { i++; mostra(); };
    });
  }
  function fim() {
    clearInterval(tm);
    const por = {}; let ac = 0;
    L.forEach((q, n) => { por[q[0]] = por[q[0]] || [0, 0]; por[q[0]][1]++; if (ans[n] === q[3]) { ac++; por[q[0]][0]++; } });
    const p = Math.round(ac / L.length * 100);
    if (sim) { (S.rank[key] = S.rank[key] || []).push({ d: new Date().toLocaleDateString('pt-BR'), a: ac, t: L.length, p }); S.rank[key].sort((a, b) => b.p - a.p); S.rank[key] = S.rank[key].slice(0, 5); save(); rank(); }
    box.innerHTML = `<div class="card"><h3>Resultado: ${ac}/${L.length} (${p}%)</h3><table><tr><th>Disciplina</th><th>Desempenho</th><th>Análise</th></tr>${Object.entries(por).map(([d, [a, t]]) => { const x = Math.round(a / t * 100); return `<tr><td>${d}</td><td>${a}/${t} (${x}%)</td><td class="${x >= 70 ? 'good' : 'weak'}">${x >= 70 ? 'Ponto forte' : 'Ponto a melhorar'}</td></tr>`; }).join('')}</table></div>`;
  }
}
quiz($('#pm'), 'pm', QPM, 'Banco de questões e simulado PMESP', 90);
quiz($('#pp'), 'pp', QPP, 'Simulado Prova Paulista', 120);

/* ---------- FLASHCARDS ---------- */
(function () {
  const root = $('#flash'); let fila, acertos, virado;
  const reinicia = () => { fila = shuffle(CARDS.slice()); acertos = 0; virado = false; desenha(); };
  function desenha() {
    if (!fila.length) { root.innerHTML = `<h2>Flashcards</h2><div class="card center"><h3>Rodada concluída: ${acertos} cartões dominados.</h3><button class="btn" id="fr">Reiniciar</button></div>`; $('#fr').onclick = reinicia; return; }
    const c = fila[0];
    root.innerHTML = `<h2>Flashcards</h2><p class="muted">${c[0]} · restam ${fila.length} · acertos ${acertos}. Clique no cartão para virar.</p>
      <div class="fc ${virado ? 'back' : ''}" id="fc" tabindex="0">${virado ? c[2] : c[1]}</div>
      <div class="row"><button class="btn" id="fa">Acertei</button><button class="btn ghost" id="fe">Errei</button></div>`;
    $('#fc').onclick = () => { virado = !virado; desenha(); };
    $('#fa').onclick = () => { fila.shift(); acertos++; virado = false; desenha(); };
    $('#fe').onclick = () => { fila.push(fila.shift()); virado = false; desenha(); };
  }
  reinicia();
})();

/* ---------- NOTAS ---------- */
$('#nota').value = S.notas;
$('#nota').oninput = e => { S.notas = e.target.value; save(); $('#salvo').textContent = 'Salvo às ' + new Date().toLocaleTimeString('pt-BR'); };

/* ---------- POMODORO ---------- */
(function () {
  let est = true, rest = 1500, id = null;
  const mins = () => (est ? +$('#tE').value : +$('#tD').value) * 60;
  const show = () => { $('#tempo').textContent = mmss(rest); $('#modo').textContent = est ? 'Estudo' : 'Descanso'; document.title = (id ? mmss(rest) + ' · ' : '') + 'Base Tática'; };
  function beep() {
    try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(); o.frequency.value = 880; o.connect(c.destination); o.start(); setTimeout(() => o.stop(), 700); } catch (e) { }
  }
  function tick() {
    if (--rest > 0) return show();
    beep(); $('#tempo').classList.add('flash'); setTimeout(() => $('#tempo').classList.remove('flash'), 2500);
    est = !est; rest = mins(); show();
  }
  $('#pIni').onclick = () => {
    if (id) { clearInterval(id); id = null; $('#pIni').textContent = 'Retomar'; }
    else { id = setInterval(tick, 1000); $('#pIni').textContent = 'Pausar'; }
    show();
  };
  $('#pRes').onclick = () => { clearInterval(id); id = null; est = true; rest = mins(); $('#pIni').textContent = 'Iniciar'; show(); };
  ['#tE', '#tD'].forEach(s => $(s).onchange = () => { if (!id) { rest = mins(); show(); } });
})();
