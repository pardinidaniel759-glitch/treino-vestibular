/* app.js - Plataforma PMESP e Prova Paulista
   Carregado pelo index.html com <script src="app.js" defer></script> */
(() => {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const S = {
  g(k, d) { try { const v = JSON.parse(localStorage.getItem("pm_" + k)); return v ?? d; } catch { return d; } },
  s(k, v) { try { localStorage.setItem("pm_" + k, JSON.stringify(v)); } catch {} }
};
const h = (t, p = {}, ...k) => {
  const e = document.createElement(t);
  for (const [a, v] of Object.entries(p)) {
    if (a === "class") e.className = v;
    else if (a === "text") e.textContent = v;
    else if (a.startsWith("on")) e[a] = v;
    else e.setAttribute(a, v);
  }
  e.append(...k); return e;
};
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const mmss = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const hoje = () => new Date().toISOString().slice(0, 10);
function beep() {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination); g.gain.value = .2; o.frequency.value = 880; o.start(); o.stop(c.currentTime + .4);
  } catch {}
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch {}
}

/* ===== Estilos extras ===== */
document.head.append(h("style", { text: `
body.foco header,body.foco main>section:not(#astra),body.foco .oc{display:none!important}
body.foco #astra>*:not(#astra-app),body.foco #astra-app>.oc{display:none!important}
#fx{display:none;position:fixed;right:12px;top:calc(12px + env(safe-area-inset-top,0px));z-index:30}
body.foco #fx{display:block}
.sm{font-size:.85rem}.cm{border-left:3px solid var(--y);padding-left:.75rem;margin-top:.5rem}
.pl button.it{display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--ln);color:var(--tx);padding:.6rem .3rem;font:inherit;cursor:pointer}
.pl button.it[aria-current=true]{color:var(--y)}
body.tatico{--sf:#050505;--ln:#1a1a1a;--mu:#8c8c8c;--tx:#e6e6e6}
body:not(.tatico){--sf:#141414;--ln:#333;--mu:#b0b0b0}
.bd i{transition:width 2.2s cubic-bezier(.2,.6,.2,1)}
#tt{background:none;border:1px solid var(--ln);color:var(--y);border-radius:6px;min-height:30px;min-width:30px;cursor:pointer;font-size:.9rem}
#toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--y);color:#000;font-weight:600;padding:.6rem 1rem;border-radius:6px;z-index:40;opacity:0;pointer-events:none;transition:opacity .25s;text-align:center}
#toast.on{opacity:1}
@media(prefers-reduced-motion:reduce){.bd i,#toast{transition:none}}
` }));

/* ===== Abas ===== */
const T = [["guia","Guia PMESP"],["edital","Edital Verticalizado"],["astra","Estudo Intensivo (Astra)"],["aph","Incêndio/APH"],["taf","Calculadora TAF"],["redacao","Treinador de Redação Vunesp"],["simulado","Simulado PMESP & Prova Paulista"],["podclass","PodClass"],["flash","Flashcards"],["pomo","Pomodoro & Notas"]];
const tabs = $("#tabs");
T.forEach(([id, l]) => tabs.append(h("button", { role: "tab", "data-t": id, text: l, onclick: () => show(id) })));
function show(id) {
  if (!T.some(t => t[0] === id)) id = "guia";
  $$("main>section").forEach(s => {
    const on = s.id === id, era = s.hidden; s.hidden = !on;
    if (on && era && !matchMedia("(prefers-reduced-motion: reduce)").matches && s.animate)
      s.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "ease-out" });
  });
  $$("#tabs button").forEach(b => {
    const on = b.dataset.t === id; b.setAttribute("aria-selected", on);
    if (on) b.scrollIntoView({ inline: "center", block: "nearest" });
  });
  history.replaceState(null, "", "#" + id); scrollTo(0, 0);
}
addEventListener("hashchange", () => show(location.hash.slice(1)));

/* ===== Modo escuro tático ===== */
{
  const tt = h("button", { id: "tt", "aria-label": "Alternar modo tático", title: "Modo tático", text: "◐" });
  let on = S.g("tatico", true);
  const ap = () => { document.body.classList.toggle("tatico", on); tt.setAttribute("aria-pressed", on); };
  tt.onclick = () => { on = !on; S.s("tatico", on); ap(); };
  $(".bar").insertBefore(tt, $("#abrir")); ap();
}

/* ===== Banco de questões ===== */
const BANK = [
 { m:"Português", q:"Qual frase está correta?", o:["Houveram muitos candidatos.","Houve muitos candidatos.","Haviam muitos candidatos."], a:1,
   p:["Identifique o verbo: 'haver' no sentido de 'existir'.","Nesse sentido, ele é impessoal e fica na 3ª pessoa do singular.","Logo, 'Houve muitos candidatos' está correta."] },
 { m:"Português", q:"Complete: 'Refiro-me ___ situação descrita no relatório.'", o:["a","à","há"], a:1,
   p:["'Referir-se' pede a preposição 'a'.","'Situação' é palavra feminina que aceita o artigo 'a'.","Preposição 'a' + artigo 'a' = crase: 'à'."] },
 { m:"Matemática", q:"Quanto é 20% de 150?", o:["20","25","30"], a:2,
   p:["20% = 20/100 = 0,2.","0,2 x 150 = 30."] },
 { m:"Matemática", q:"Quatro viaturas consomem 80 litros de combustível. Nas mesmas condições, seis viaturas consumirão:", o:["100 L","120 L","160 L"], a:1,
   p:["As grandezas são diretamente proporcionais.","4/6 = 80/x.","x = 80 x 6 / 4 = 120 litros."] },
 { m:"Matemática", q:"Um número aumentado em 25% resulta em 150. Qual é o número?", o:["112,5","120","125"], a:1,
   p:["Aumento de 25% equivale a multiplicar por 1,25.","1,25 x N = 150.","N = 150 / 1,25 = 120."] },
 { m:"Direitos Humanos", q:"A Declaração Universal dos Direitos Humanos foi adotada pela ONU em:", o:["1919","1948","1988"], a:1,
   p:["A Declaração foi proclamada em 10 de dezembro de 1948.","1988 é o ano da Constituição brasileira e 1919 o da Sociedade das Nações, não da ONU."] },
 { m:"APH", q:"No XABCDE do atendimento pré-hospitalar, o 'X' representa:", o:["Vias aéreas","Hemorragia exsanguinante","Circulação"], a:1,
   p:["O 'X' vem antes do 'A' porque hemorragia grave mata mais rápido.","Ele indica controlar a hemorragia exsanguinante.","Só depois seguem A (vias aéreas), B, C, D e E."] },
 { m:"Incêndio", q:"Incêndio em líquidos inflamáveis, como gasolina, é de classe:", o:["A","B","C"], a:1,
   p:["Classe A: sólidos comuns.","Classe B: líquidos e gases inflamáveis.","Classe C: equipamentos elétricos energizados."] },
 { m:"Incêndio", q:"Qual agente NÃO é indicado em incêndio classe C (equipamentos elétricos energizados)?", o:["Pó químico","Gás carbônico (CO2)","Água"], a:2,
   p:["Classe C envolve equipamentos energizados.","A água conduz eletricidade e gera risco de choque.","Pó químico e CO2 não conduzem corrente e são os indicados."] }
];
const MATS = [...new Set(BANK.map(q => q.m))];

/* ===== Caderno de erros ===== */
let erros = S.g("erros", []);
function addErro(i, esc) {
  erros = erros.filter(e => e.i !== i); erros.unshift({ i, esc, d: hoje() }); S.s("erros", erros); renderCad();
}
let cadBox = null;
function renderCad() {
  if (!cadBox) return;
  cadBox.replaceChildren();
  if (!erros.length) { cadBox.append(h("p", { class: "mu", text: "Nenhum erro registrado. Faça o diagnóstico ou um simulado." })); return; }
  erros.forEach(e => {
    const q = BANK[e.i]; if (!q) return;
    cadBox.append(h("div", { class: "cm" },
      h("p", { class: "sm mu", text: q.m + " • " + e.d }),
      h("p", { text: q.q }),
      h("p", { class: "no sm", text: "Sua resposta: " + (e.esc >= 0 ? q.o[e.esc] : "em branco") }),
      h("p", { class: "ok sm", text: "Correta: " + q.o[q.a] }),
      h("ol", { class: "sm" }, ...q.p.map(x => h("li", { text: x }))),
      h("div", { class: "row" },
        h("button", { class: "btn o", text: "Ler em voz alta", onclick: () => falar(q.q + ". Resposta correta: " + q.o[q.a] + ". " + q.p.join(" ")) }),
        h("button", { class: "btn o", text: "Já dominei", onclick: () => { erros = erros.filter(x => x.i !== e.i); S.s("erros", erros); renderCad(); } }))));
  });
}

/* ===== Motor de questões com gabarito comentado ===== */
function runQuiz(box, idxs, done) {
  box.replaceChildren();
  const form = h("div");
  idxs.forEach((qi, n) => {
    const q = BANK[qi];
    form.append(h("fieldset", { class: "card q", style: "border:1px solid var(--ln)", "data-q": qi },
      h("legend", { style: "padding:0 .4rem", text: "Questão " + (n + 1) + " • " + q.m }),
      h("p", { text: q.q }),
      ...q.o.map((o, j) => h("label", { class: "ck" }, h("input", { type: "radio", name: "r" + qi, value: j }), document.createTextNode(o))),
      h("div", { class: "cm", hidden: "" })));
  });
  const res = h("p", { class: "ok", role: "status" });
  const btn = h("button", { class: "btn", text: "Corrigir", onclick: () => {
    const out = [];
    idxs.forEach(qi => {
      const q = BANK[qi], s = form.querySelector(`input[name=r${qi}]:checked`), esc = s ? +s.value : -1, ok = esc === q.a;
      out.push({ qi, ok, m: q.m });
      const c = form.querySelector(`[data-q="${qi}"] .cm`); c.hidden = false; c.replaceChildren(
        h("p", { class: ok ? "ok" : "no", text: ok ? "Correto." : (esc < 0 ? "Em branco. " : "Errado. ") + "Gabarito: " + q.o[q.a] }),
        h("ol", { class: "sm" }, ...q.p.map(x => h("li", { text: x }))));
      if (!ok) addErro(qi, esc);
      else if (erros.some(e => e.i === qi)) { /* acertou de novo: mantém no caderno até ser marcado como dominado */ }
    });
    $$("input", form).forEach(i => i.disabled = true); btn.disabled = true;
    const ac = out.filter(o => o.ok).length;
    res.textContent = "Acertos: " + ac + " de " + out.length + " (" + Math.round(ac / out.length * 100) + "%)";
    done && done(out);
  } });
  box.append(form, h("div", { class: "row" }, btn, res));
}

/* ===== Simulado ===== */
{
  const sec = $("#simulado"), box = h("div"), sel = h("select", { "aria-label": "Matéria" }, h("option", { value: "", text: "Todas as matérias" }), ...MATS.map(m => h("option", { value: m, text: m }))),
    qtd = h("select", { "aria-label": "Quantidade" }, ...[5, 10, 20].map(n => h("option", { value: n, text: n + " questões" })));
  sec.replaceChildren(h("h2", { text: "Simulado" }), h("p", { class: "mu", text: "Escolha a matéria e receba o gabarito comentado passo a passo." }),
    h("div", { class: "row", style: "margin:1rem 0" }, sel, qtd, h("button", { class: "btn", text: "Gerar simulado", onclick: () => {
      const pool = BANK.map((q, i) => i).filter(i => !sel.value || BANK[i].m === sel.value);
      runQuiz(box, shuffle(pool).slice(0, +qtd.value), null);
    } })), box);
  sel.style.width = qtd.style.width = "auto";
}

/* ===== Edital verticalizado ===== */
{
  const ED = { "Língua Portuguesa":["Interpretação de texto","Ortografia e acentuação","Pontuação","Concordância","Regência e crase"], "Matemática":["Operações e problemas","Razão e proporção","Porcentagem","Geometria básica"], "Conhecimentos Gerais":["Atualidades","História do Brasil","Geografia do Brasil"], "Direitos Humanos":["Declaração Universal","Direitos fundamentais","Uso da força"], "Noções de Direito":["Constitucional","Penal","Administrativo"] };
  const ck = S.g("edital", {}), ed = $("#ed"); ed.replaceChildren();
  Object.entries(ED).forEach(([m, l]) => {
    const tt = h("h3"), c = h("div", { class: "card" }, tt);
    const upd = () => { const n = l.filter(t => ck[m + "|" + t]).length; tt.textContent = m + " (" + n + "/" + l.length + ")"; };
    l.forEach(t => {
      const k = m + "|" + t, i = h("input", { type: "checkbox" }); i.checked = !!ck[k];
      i.onchange = () => { ck[k] = i.checked; S.s("edital", ck); upd(); prog(); };
      c.append(h("label", { class: "ck" }, i, document.createTextNode(t)));
    });
    upd(); ed.append(c);
  });
  function prog() {
    const a = $$("#ed input"), n = a.filter(i => i.checked).length, p = a.length ? Math.round(n / a.length * 100) : 0;
    const bar = $("#pg");
    if (!prog.ok) { prog.ok = 1; bar.style.width = "0%"; setTimeout(() => bar.style.width = p + "%", 400); } else bar.style.width = p + "%";
    $("#pgt").textContent = n + " de " + a.length + " tópicos concluídos (" + p + "%)";
  }
  prog();
}

/* ===== Estudo Intensivo (Astra) ===== */
{
  const app = h("div", { id: "astra-app", class: "grid" });
  $("#astra").append(app);
  // Cronômetro
  let dur = 25 * 60, left = dur, iv = null, est = S.g("estudo", {});
  const tm = h("div", { class: "timer", text: mmss(left) }), tot = h("p", { class: "mu sm" }),
    dsel = h("select", { "aria-label": "Duração" }, ...[25, 45, 60, 90].map(m => h("option", { value: m, text: m + " min" }))),
    go = h("button", { class: "btn", text: "Iniciar" });
  const upTot = () => tot.textContent = "Estudado hoje: " + Math.floor((est[hoje()] || 0) / 60) + " min";
  function stop() { clearInterval(iv); iv = null; go.textContent = "Iniciar"; S.s("estudo", est); }
  go.onclick = () => {
    if (iv) return stop(); go.textContent = "Pausar";
    iv = setInterval(() => {
      left--; est[hoje()] = (est[hoje()] || 0) + 1; tm.textContent = mmss(left); upTot();
      if (left % 15 === 0) S.s("estudo", est);
      if (left <= 0) { stop(); beep(); left = dur; tm.textContent = mmss(left); }
    }, 1000);
  };
  dsel.style.width = "auto";
  dsel.onchange = () => { stop(); dur = left = +dsel.value * 60; tm.textContent = mmss(left); };
  const foco = h("button", { class: "btn o", text: "Modo foco", onclick: () => setFoco(true) });
  app.append(h("div", { class: "card" }, h("h3", { text: "Cronômetro" }), tm, h("div", { class: "row" }, dsel, go,
    h("button", { class: "btn o", text: "Zerar", onclick: () => { stop(); left = dur; tm.textContent = mmss(left); } }), foco), tot));
  upTot();
  // Modo foco
  const fx = h("button", { id: "fx", class: "btn", text: "Sair do foco", onclick: () => setFoco(false) });
  document.body.append(fx);
  let wl = null;
  async function setFoco(on) {
    document.body.classList.toggle("foco", on);
    if (on) { show("astra"); try { wl = await navigator.wakeLock?.request("screen"); } catch {} }
    else { try { await wl?.release(); } catch {} wl = null; }
  }
  addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("foco")) setFoco(false); });
  // Diagnóstico
  const dbox = h("div"), dres = h("div", { class: "sm", style: "margin-top:.6rem" });
  const last = S.g("diag", null);
  function mostraDiag(o) {
    dres.replaceChildren(h("p", { class: "mu", text: "Último diagnóstico: " + o.d }),
      ...Object.entries(o.r).map(([m, [a, t]]) => h("p", { class: a / t < .6 ? "no" : "ok", text: m + ": " + a + "/" + t + (a / t < .6 ? " (priorize)" : "") })));
  }
  if (last) mostraDiag(last);
  app.append(h("div", { class: "card oc" }, h("h3", { text: "Teste diagnóstico" }),
    h("p", { class: "mu sm", text: "Duas questões por matéria para achar seus pontos fracos. Os erros vão para o caderno." }),
    h("button", { class: "btn", text: "Iniciar diagnóstico", onclick: () => {
      const ids = MATS.flatMap(m => shuffle(BANK.map((q, i) => i).filter(i => BANK[i].m === m)).slice(0, 2));
      runQuiz(dbox, shuffle(ids), out => {
        const r = {}; out.forEach(o => { r[o.m] = r[o.m] || [0, 0]; r[o.m][1]++; if (o.ok) r[o.m][0]++; });
        const o = { d: hoje(), r }; S.s("diag", o); mostraDiag(o);
      });
    } }), dbox, dres));
  // Caderno
  cadBox = h("div");
  app.append(h("div", { class: "card oc", style: "grid-column:1/-1" }, h("h3", { text: "Caderno de erros" }), cadBox));
  renderCad();
}

/* ===== Player tático de áudio ===== */
let falar = () => {};
{
  const sec = $("#podclass"), au = h("audio", { controls: "", preload: "metadata", style: "width:100%" });
  let pl = S.g("playlist", []), cur = -1, A = null, B = null, loop = false;
  const list = h("div", { class: "pl" }), st = h("p", { class: "mu sm", role: "status" });
  const tit = h("input", { type: "text", placeholder: "Título", "aria-label": "Título" }), url = h("input", { type: "url", placeholder: "https://.../aula.mp3", "aria-label": "Link do áudio" });
  function rl() {
    list.replaceChildren(...pl.map((p, i) => h("div", { class: "row" },
      h("button", { class: "it", style: "flex:1", "aria-current": i === cur, text: p.t, onclick: () => tocar(i) }),
      h("button", { class: "btn o", text: "Remover", onclick: () => { pl.splice(i, 1); S.s("playlist", pl); if (cur === i) { au.pause(); cur = -1; } rl(); } }))));
    if (!pl.length) list.append(h("p", { class: "mu", text: "Playlist vazia. Adicione um link de áudio." }));
  }
  function tocar(i) { cur = i; A = B = null; loop = false; au.src = pl[i].u; au.play().catch(() => {}); st.textContent = ""; rl(); }
  au.addEventListener("timeupdate", () => { if (loop && A != null && B != null && au.currentTime >= B) au.currentTime = A; });
  au.addEventListener("ended", () => { if (cur + 1 < pl.length) tocar(cur + 1); });
  const spd = h("select", { "aria-label": "Velocidade" }, ...[.75, 1, 1.25, 1.5, 2].map(v => h("option", { value: v, text: v + "x", ...(v === 1 ? { selected: "" } : {}) })));
  spd.style.width = "auto"; spd.onchange = () => au.playbackRate = +spd.value;
  const lb = h("button", { class: "btn o", text: "Loop A-B", onclick: () => {
    if (A == null || B == null || B <= A) { st.textContent = "Marque A e depois B (B maior que A)."; return; }
    loop = !loop; lb.textContent = loop ? "Loop A-B ativo" : "Loop A-B"; if (loop) au.currentTime = A;
  } });
  const mk = (t, f) => h("button", { class: "btn o", text: t, onclick: f });
  // Leitor de voz (Web Speech API)
  const ok = "speechSynthesis" in window, syn = window.speechSynthesis;
  const vs = h("select", { "aria-label": "Voz" }), rt = h("select", { "aria-label": "Ritmo da leitura" }, ...[.8, 1, 1.2, 1.5].map(v => h("option", { value: v, text: v + "x", ...(v === 1 ? { selected: "" } : {}) })));
  vs.style.width = rt.style.width = "auto";
  const txt = h("textarea", { "data-save": "leitor", placeholder: "Cole aqui o texto para ouvir", "aria-label": "Texto para leitura", style: "min-height:130px" });
  function vozes() {
    const v = syn.getVoices().filter(x => x.lang.toLowerCase().startsWith("pt")); vs.replaceChildren(...(v.length ? v : syn.getVoices()).map(x => h("option", { value: x.name, text: x.name + " (" + x.lang + ")" })));
  }
  if (ok) { vozes(); syn.onvoiceschanged = vozes; }
  falar = t => {
    if (!ok) return alert("Seu navegador não suporta leitura em voz alta.");
    t = (t || "").trim(); if (!t) return; syn.cancel();
    const ps = t.match(/[^.!?\n]+[.!?]?/g).reduce((a, s) => { if (a.length && (a[a.length - 1] + s).length < 180) a[a.length - 1] += s; else a.push(s); return a; }, []);
    const v = syn.getVoices().find(x => x.name === vs.value);
    ps.forEach(p => { const u = new SpeechSynthesisUtterance(p); u.lang = v ? v.lang : "pt-BR"; if (v) u.voice = v; u.rate = +rt.value; syn.speak(u); });
  };
  let pausado = false;
  const pb = mk("Pausar", () => { if (!ok) return; pausado = !pausado; pausado ? syn.pause() : syn.resume(); pb.textContent = pausado ? "Continuar" : "Pausar"; });
  sec.replaceChildren(h("h2", { text: "PodClass" }),
    h("div", { class: "card", style: "margin-top:1rem" }, h("h3", { text: "Player tático" }), au,
      h("div", { class: "row", style: "margin:.7rem 0" },
        mk("-10 s", () => au.currentTime = Math.max(0, au.currentTime - 10)), mk("+10 s", () => au.currentTime += 10), spd,
        mk("Marcar A", () => { A = au.currentTime; st.textContent = "A em " + mmss(Math.floor(A)); }),
        mk("Marcar B", () => { B = au.currentTime; st.textContent = "B em " + mmss(Math.floor(B)); }), lb), st, list,
      h("div", { class: "row", style: "margin-top:.7rem" }, tit, url, h("button", { class: "btn", text: "Adicionar", onclick: () => {
        if (!url.value.trim()) return; pl.push({ t: tit.value.trim() || url.value.trim(), u: url.value.trim() }); S.s("playlist", pl); tit.value = url.value = ""; rl();
      } }))),
    h("div", { class: "card", style: "margin-top:1rem" }, h("h3", { text: "Leitor de voz" }), txt,
      h("div", { class: "row", style: "margin-top:.6rem" }, vs, rt, mk("Ler texto", () => falar(txt.value)),
        mk("Ler seleção", () => falar(String(getSelection()))), mk("Ler notas", () => falar(S.g("notas", ""))), pb,
        mk("Parar", () => { if (ok) syn.cancel(); pausado = false; pb.textContent = "Pausar"; })),
      ...(ok ? [] : [h("p", { class: "no sm", text: "Leitura por voz indisponível neste navegador." })])));
  rl();
  addEventListener("pagehide", () => { if (ok) syn.cancel(); });
}

/* ===== Campos salvos, redação, TAF, notas ===== */
$$("[data-save]").forEach(e => {
  const k = e.dataset.save; if (k === "notas" || k === "redacao" || k.startsWith("taf") || k.startsWith("ast") || k === "leitor") e.value = S.g("f_" + k, "");
  e.addEventListener("input", () => { S.s("f_" + k, e.value); if (e.id === "red") cnt(); if (k === "notas") S.s("notas", e.value); });
});
{ const n = S.g("f_notas", ""); if (n) S.s("notas", n); }
function cnt() { const t = $("#red").value.trim(); $("#cnt").textContent = (t ? t.split(/\s+/).length : 0) + " palavras"; }
cnt();

/* ===== Flashcards ===== */
{
  const F = [["Tetraedro do fogo: quais elementos?","Combustível, comburente, calor e reação em cadeia."],["Classe de incêndio em líquidos inflamáveis","Classe B."],["O que significa o X do XABCDE?","Hemorragia exsanguinante."],["Crase antes de palavra masculina","Em regra não ocorre, salvo locução com palavra feminina subentendida."]];
  let i = 0, v = false; const fr = () => { $("#fc").textContent = F[i][v ? 1 : 0]; $("#fn").textContent = (i + 1) + "/" + F.length; };
  const flip = () => { v = !v; fr(); };
  $("#fc").onclick = flip; $("#fc").onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } };
  $("#next").onclick = () => { i = (i + 1) % F.length; v = false; fr(); }; $("#prev").onclick = () => { i = (i - 1 + F.length) % F.length; v = false; fr(); }; fr();
}

/* ===== Pomodoro ===== */
{
  let m = 25, left = 1500, iv = null; const draw = () => $("#tm").textContent = mmss(left);
  const stop = () => { clearInterval(iv); iv = null; $("#go").textContent = "Iniciar"; };
  $("#go").onclick = () => {
    if (iv) return stop(); $("#go").textContent = "Pausar";
    iv = setInterval(() => { left--; draw(); if (left <= 0) { stop(); beep(); left = m * 60; draw(); } }, 1000);
  };
  $("#rs").onclick = () => { stop(); left = m * 60; draw(); };
  $$("[data-m]").forEach(b => b.onclick = () => { m = +b.dataset.m; stop(); left = m * 60; draw(); });
}

/* ===== Cadastro: localStorage primeiro, envio silencioso ===== */
{
  const dlg = $("#dlg"), frm = $("#frm"), ab = $("#abrir"), hs = $("#hs"), STATUS = "CANDIDATO OPERACIONAL";
  const toast = h("div", { id: "toast", role: "status" }); document.body.append(toast);
  const say = t => { toast.textContent = t; toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 2400); };
  const pinta = () => {
    const c = S.g("cadastro", null); if (!c) return;
    if (hs.textContent !== STATUS) hs.textContent = STATUS;
    hs.classList.add("on"); ab.textContent = "Meu cadastro";
    if (c.nome) $("#hn").textContent = String(c.nome).trim().split(/\s+/)[0];
  };
  // o script inline do index também escreve no status; este observador mantém o texto correto
  new MutationObserver(pinta).observe(hs, { childList: true, characterData: true, subtree: true });
  pinta();
  const fill = () => { const c = S.g("cadastro", null); if (c) ["nome", "email", "whatsapp", "concurso"].forEach(k => { if (frm.elements[k] && c[k]) frm.elements[k].value = c[k]; }); };
  ab.onclick = () => { fill(); const m = $("#msg"); if (m) m.textContent = ""; dlg.showModal(); };
  $("#fechar").onclick = () => dlg.close();
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  frm.addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(frm), v = k => String(fd.get(k) || "").trim();
    S.s("cadastro", { nome: v("nome"), email: v("email"), whatsapp: v("whatsapp"), concurso: v("concurso"), status: STATUS, ts: Date.now() });
    dlg.close(); pinta(); say(STATUS);
    // envio em segundo plano: qualquer erro é ignorado
    const key = v("access_key");
    if (key && !key.startsWith("SUA_")) {
      try { fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: fd }).catch(() => {}); } catch {}
    }
  });
}

show(location.hash.slice(1) || "guia");
})();
