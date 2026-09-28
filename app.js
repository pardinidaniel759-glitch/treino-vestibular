'use strict';
const $ = (s, r = document) => r.querySelector(s);
const S = JSON.parse(localStorage.getItem('baseTatica') || '{}');
S.ed = S.ed || {}; S.rank = S.rank || {}; S.notas = S.notas || '';
const save = () => localStorage.setItem('baseTatica', JSON.stringify(S));
const shuffle = a => a.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const mmss = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const bd = i => i < 2 ? '<em class="bg a">Alta Frequência</em>' : i < 4 ? '<em class="bg e">Essencial</em>' : '<em class="bg r">Revisão</em>';
const li = (str, b) => '<ul>' + str.split(';').map((t, i) => `<li>${t.trim()}${b ? bd(i) : ''}</li>`).join('') + '</ul>';

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
  Object.entries(GUIA).map(([k, v]) => `<div class="card"><h3>${k}</h3>${li(v, 1)}</div>`).join('') + '</div>';

/* ---------- EDITAL ---------- */
function renderEdital() {
  let tot = 0, pts = 0;
  const html = Object.entries(EDITAL).map(([m, t]) => `<div class="card"><h3>${m}</h3>` + t.split(';').map((x, i) => {
    const k = m + '|' + i, s = S.ed[k] || 0; tot++; pts += s;
    return `<div class="topic"><span>${x}${bd(i)}</span><button class="st s${s}" data-k="${k}">${STATUS[s]}</button></div>`;
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
    box.innerHTML = `<div class="card"><h3>Resultado: ${ac}/${L.length} (${p}%)</h3><div class="bar"><i style="width:${p}%"></i></div><table><tr><th>Disciplina</th><th>Desempenho</th><th>Análise</th></tr>${Object.entries(por).map(([d, [a, t]]) => { const x = Math.round(a / t * 100); return `<tr><td>${d}</td><td>${a}/${t} (${x}%)<div class="bar"><i style="width:${x}%"></i></div></td><td class="${x >= 70 ? 'good' : 'weak'}">${x >= 70 ? 'Ponto forte' : 'Ponto a melhorar'}</td></tr>`; }).join('')}</table></div>`;
  }
}
quiz($('#pm'), 'pm', QPM, 'Banco de questões e simulado PMESP', 90);
quiz($('#pp'), 'pp', QPP, 'Simulado Prova Paulista', 120);

/* ---------- FLASHCARDS 3D ---------- */
(function () {
  const root = $('#flash'); let fila, ac;
  const start = () => { fila = shuffle(CARDS.slice()); ac = 0; draw(); };
  function draw() {
    if (!fila.length) { root.innerHTML = `<h2>Flashcards</h2><div class="card center"><h3>Rodada concluída: ${ac} cartões dominados.</h3><button class="btn" id="fr">Reiniciar</button></div>`; $('#fr').onclick = start; return; }
    const c = fila[0];
    root.innerHTML = `<h2>Flashcards</h2><p class="muted">${c[0]} · restam ${fila.length} · acertos ${ac}. Clique no cartão para virar.</p>
      <div class="scene"><div class="fcard" id="fc"><div class="face">${c[1]}</div><div class="face bk">${c[2]}</div></div></div>
      <div class="row"><button class="btn" id="fa">Acertei</button><button class="btn ghost" id="fe">Errei</button></div>`;
    $('#fc').onclick = () => $('#fc').classList.toggle('flip');
    $('#fa').onclick = () => { fila.shift(); ac++; draw(); };
    $('#fe').onclick = () => { fila.push(fila.shift()); draw(); };
  }
  start();
})();

/* ---------- TAF PMESP (ISF por exercício) ---------- */
(function () {
  const ISF = { M: { b: 3, a: 36, c: 8.25, k: 780 }, F: { b: 7, a: 32, c: 9.5, k: 900 } };
  $('#taf').innerHTML = `<h2>Calculadora do TAF (Soldado PM)</h2>
  <div class="card static"><p class="muted">O TAF da PMESP usa Índice de Suficiência Física (ISF): é preciso atingir o mínimo em cada exercício, sem soma de pontos. Valores baseados em fontes de preparatórios (Edital DP-2/321/25 e DP-3/321/26). Confira sempre o edital vigente.</p>
  <div class="fields"><label>Sexo<select id="tS"><option value="M">Masculino</option><option value="F">Feminino</option></select></label>
  <label id="lb">Barra fixa (repetições)<input type="number" id="tb" min="0"></label>
  <label>Abdominal remador em 60 s (repetições)<input type="number" id="ta" min="0"></label>
  <label>Corrida de 50 m (segundos, ex.: 8.4)<input type="number" id="tc" step="0.01" min="0"></label>
  <label>Corrida de 2.400 m (minutos)<input type="number" id="tm" min="0"></label>
  <label>Corrida de 2.400 m (segundos)<input type="number" id="ts" min="0" max="59"></label></div>
  <div class="row"><button class="btn" id="tGo">Calcular</button></div></div><div id="tRes"></div>`;
  $('#tS').onchange = () => $('#lb').firstChild.textContent = $('#tS').value === 'M' ? 'Barra fixa (repetições)' : 'Isometria na barra (segundos)';
  $('#tGo').onclick = () => {
    const I = ISF[$('#tS').value], b = +$('#tb').value, a = +$('#ta').value, c = +$('#tc').value, k = (+$('#tm').value) * 60 + (+$('#ts').value);
    const L = [
      [$('#tS').value === 'M' ? 'Barra fixa' : 'Isometria na barra', b, `mín. ${I.b}${$('#tS').value === 'M' ? ' rep.' : ' s'}`, b >= I.b, Math.min(100, b / I.b * 100)],
      ['Abdominal remador', a, `mín. ${I.a} rep.`, a >= I.a, Math.min(100, a / I.a * 100)],
      ['Corrida 50 m', c, `máx. ${I.c.toFixed(2)} s`, c > 0 && c <= I.c, c > 0 ? Math.min(100, I.c / c * 100) : 0],
      ['Corrida 2.400 m', mmss(k), `máx. ${mmss(I.k)}`, k > 0 && k <= I.k, k > 0 ? Math.min(100, I.k / k * 100) : 0]
    ];
    const ok = L.every(x => x[3]);
    $('#tRes').innerHTML = `<div class="card static"><h3 class="${ok ? 'good' : 'weak'}">${ok ? 'APROVADO: todos os índices atingidos' : 'REPROVADO: há índice não atingido'}</h3><table><tr><th>Exercício</th><th>Seu resultado</th><th>Índice</th><th>Status</th></tr>${L.map(x => `<tr><td>${x[0]}</td><td>${x[1]}<div class="bar"><i style="width:${x[4]}%"></i></div></td><td>${x[2]}</td><td class="${x[3] ? 'good' : 'weak'}">${x[3] ? 'Atingido' : 'Não atingido'}</td></tr>`).join('')}</table><p class="muted">A barra mostra seu desempenho em relação ao índice mínimo. Cada exercício tem 1 reteste com intervalo de 5 minutos.</p></div>`;
  };
})();

/* ---------- TREINADOR DE REDAÇÃO ---------- */
(function () {
  const T = ['Desafios da segurança pública no Brasil contemporâneo', 'O impacto das redes sociais na disseminação de fake news', 'O uso de câmeras corporais na atividade policial', 'Violência contra a mulher e políticas de proteção', 'Saúde mental dos profissionais de segurança pública', 'Desigualdade social e criminalidade', 'Inteligência artificial e o mercado de trabalho', 'Educação digital e cidadania na era da informação', 'Respeito às leis de trânsito e a segurança coletiva', 'Sustentabilidade e crise hídrica nas grandes cidades'];
  let left = 3600, id = null, tema = T[0];
  $('#redacao').innerHTML = `<h2>Treinador de redação (padrão Vunesp)</h2><div class="grid">
  <div class="card static center"><div class="muted">Tempo restante</div><div class="big" id="rT">60:00</div><div class="row"><button class="btn" id="rI">Iniciar</button><button class="btn ghost" id="rR">Reiniciar</button></div></div>
  <div class="card static"><h3>Tema sorteado</h3><p id="rTema"><b>${tema}</b></p><button class="btn" id="rS">Sortear tema</button><p class="muted">Temas prováveis, criados para treino. Não são temas oficiais confirmados.</p></div></div>
  <div class="card static"><h3>Estrutura em 4 parágrafos</h3><ul><li><b>1º Introdução:</b> contextualize o tema e apresente sua tese.</li><li><b>2º Desenvolvimento 1:</b> primeiro argumento, com exemplo, dado ou fato histórico.</li><li><b>3º Desenvolvimento 2:</b> segundo argumento, diferente do primeiro, com repertório.</li><li><b>4º Conclusão:</b> retome a tese e proponha solução (quem faz, o que faz, como e para quê).</li></ul></div>
  <div class="card static"><h3>Antes de entregar</h3>${li('Reserve 10 minutos para o rascunho de estrutura;Use conectivos entre parágrafos;Revise concordância, crase e pontuação;Respeite o limite de linhas e escreva com letra legível')}</div>`;
  $('#rS').onclick = () => { tema = T[Math.floor(Math.random() * T.length)]; $('#rTema').innerHTML = `<b>${tema}</b>`; };
  $('#rI').onclick = () => {
    if (id) { clearInterval(id); id = null; $('#rI').textContent = 'Retomar'; return; }
    $('#rI').textContent = 'Pausar';
    id = setInterval(() => { left--; $('#rT').textContent = mmss(Math.max(left, 0)); if (left <= 0) { clearInterval(id); id = null; $('#rT').classList.add('flash'); $('#rI').textContent = 'Iniciar'; } }, 1000);
  };
  $('#rR').onclick = () => { clearInterval(id); id = null; left = 3600; $('#rT').textContent = '60:00'; $('#rT').classList.remove('flash'); $('#rI').textContent = 'Iniciar'; };
})();

/* ---------- META DIÁRIA DE QUESTÕES ---------- */
(function () {
  S.q = S.q || { meta: 30, dias: {} };
  const hoje = () => new Date().toLocaleDateString('sv-SE');
  function draw() {
    const n = S.q.dias[hoje()] || 0, p = Math.min(100, Math.round(n / S.q.meta * 100));
    const ult = Object.entries(S.q.dias).sort().reverse().slice(0, 7);
    $('#metas').innerHTML = `<h2>Rastreador de questões diárias</h2><div class="card static"><h3>Hoje: ${n} de ${S.q.meta} questões (${p}%)</h3><div class="bar"><i style="width:${p}%"></i></div>
    <p class="${n >= S.q.meta ? 'good' : 'muted'}">${n >= S.q.meta ? 'Meta batida. Bom trabalho.' : 'Faltam ' + (S.q.meta - n) + ' questões.'}</p>
    <div class="row"><button class="btn" data-a="1">+1</button><button class="btn" data-a="5">+5</button><button class="btn ghost" data-a="-1">−1</button>
    <label>Meta <input type="number" id="qm" min="1" value="${S.q.meta}"></label></div></div>
    <div class="card static"><h3>Últimos dias</h3><table>${ult.map(([d, v]) => `<tr><td>${d}</td><td>${v}/${S.q.meta}<div class="bar"><i style="width:${Math.min(100, v / S.q.meta * 100)}%"></i></div></td></tr>`).join('') || '<tr><td class="muted">Nenhum registro ainda.</td></tr>'}</table></div>`;
    document.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { S.q.dias[hoje()] = Math.max(0, n + +b.dataset.a); save(); draw(); });
    $('#qm').onchange = e => { S.q.meta = Math.max(1, +e.target.value); save(); draw(); };
  }
  draw();
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
