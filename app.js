<div>${[['Errei', 0], ['Difícil', 1], ['Bom', 2], ['Fácil', 3]].map(([t, n]) => `<button type="button" data-nota="${n}">${t}<br><small>${previa(card, n)}</small></button>`).join(' ')}</div>`
            : `<button type="button" id="btn-revelar-fc">👁️ Revelar Resposta</button>`}
        </div>`;
      return;
    }

    area.innerHTML = `
      <div class="astra-card">
        <h3>📓 Caderno de Erros & Flashcards (Anki)</h3>
        <p>Total de erros catalogados: <b>${cad.length}</b></p>
        <p>Cards para revisar hoje: <b class="astra-neon">${devidos.length}</b></p>
        ${devidos.length ? `<button type="button" id="btn-iniciar-fc">🃏 Revisar Flashcards (${devidos.length})</button>` : '<p>Parabéns! Nenhuma revisão pendente para agora.</p>'}
      </div>
      <div class="astra-card">
        <h3>📊 Erros por Matéria</h3>
        ${Object.keys(porMat).length
          ? Object.entries(porMat).map(([m, c]) => `<p>• <b>${esc(m)}</b>:${c} questões</p>`).join('')
          : '<p>Seu caderno está limpo. Ao errar questões nos simulados, elas virão para cá automaticamente.</p>'}
      </div>`;
  }

  /* =====================================================================
     6. EVENTOS E INICIALIZAÇÃO
     ===================================================================== */
  function bindEventos() {
    document.addEventListener('click', e => {
      const b = e.target.closest('button, [data-aba], [data-tempo], [data-op], [data-goto], [data-nav], [data-taf-perfil], [data-fc], [data-nota]');
      if (!b) return;

      if (b.dataset.aba) { showTab(b.dataset.aba); return; }

      if (b.dataset.tempo) {
        iniciar(Number(b.dataset.tempo));
        return;
      }

      if (b.id === 'btn-sair-foco') {
        if (confirm('Deseja realmente cancelar o simulado? O progresso atual será perdido.')) cancelarSimulado();
        return;
      }

      if (b.dataset.op !== undefined && sim) {
        sim.resp[sim.i] = Number(b.dataset.op);
        desenhar();
        return;
      }

      if (b.dataset.nav !== undefined && sim) {
        sim.i = Math.max(0, Math.min(sim.qs.length - 1, sim.i + Number(b.dataset.nav)));
        desenhar();
        return;
      }

      if (b.dataset.goto !== undefined && sim) {
        sim.i = Number(b.dataset.goto);
        desenhar();
        return;
      }

      if (b.id === 'btn-finalizar') {
        if (confirm('Deseja finalizar e gerar o relatório?')) finalizar(false);
        return;
      }

      if (b.dataset.tafPerfil) {
        tafEstado.perfil = b.dataset.tafPerfil;
        renderTAF();
        return;
      }

      if (b.dataset.fc === 'redencao') {
        const cad = carregarCad();
        if (!cad.length) { alert('Você ainda não possui erros cadastrados para gerar um simulado de redenção.'); return; }
        const lista = embaralhar(cad).slice(0, 10).map(c => BANCO.find(q => q.id === c.id) || c);
        iniciar(15, lista, 'redencao');
        return;
      }

      if (b.id === 'btn-iniciar-fc') {
        const cad = carregarCad();
        const devidos = cad.filter(c => c.due <= Date.now()).map(c => c.id);
        if (devidos.length) { fc = { fila: devidos, pos: 0, mostrou: false }; renderCaderno(); }
        return;
      }

      if (b.id === 'btn-revelar-fc' && fc) {
        fc.mostrou = true;
        renderCaderno();
        return;
      }

      if (b.dataset.nota !== undefined && fc) {
        const cad = carregarCad();
        const card = cad.find(c => c.id === fc.fila[fc.pos]);
        if (card) { agendar(card, Number(b.dataset.nota)); salvarCad(cad); }
        fc.pos++;
        fc.mostrou = false;
        if (fc.pos >= fc.fila.length) fc = null;
        renderCaderno();
        return;
      }

      if (b.id === 'status-candidato') {
        abrirModal(modalCadastro());
        return;
      }

      if (b.id === 'red-limpar') {
        if (confirm('Deseja apagar todo o texto da redação?')) {
          store.set(KEY.red, '');
          const ta = $('#red-texto'); if (ta) ta.value = '';
          atualizarRedacao();
        }
      }
    });

    document.addEventListener('input', e => {
      if (e.target.dataset.taf) {
        const id = e.target.dataset.taf;
        tafEstado.valores[tafEstado.perfil][id] = e.target.value;
        calcularTAF();
      }
    });

    document.addEventListener('submit', e => {
      if (e.target.id === 'form-cadastro') {
        e.preventDefault();
        salvarCadastro();
      }
    });
  }

  function init() {
    injetarCSS();
    montarLayout();
    modalCadastro();
    atualizarStatus();
    telaInicial();
    renderTAF();
    renderRedacao();
    renderCaderno();
    bindEventos();
    showTab('simulado');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();