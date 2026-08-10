  // ---------- Configuração (fácil de alterar) ----------
  const HORARIO_COMERCIAL_INICIO = '07:45';
  const HORARIO_COMERCIAL_FIM = '17:30';
  const CHAVE_STORAGE = 'prakolar_funcionarios';

  // ---------- Estado ----------
  let funcionarios = carregarDoStorage();
  let idEmEdicao = null;
  let idParaExcluir = null;

  function carregarDoStorage() {
    try {
      const dados = localStorage.getItem(CHAVE_STORAGE);
      return dados ? JSON.parse(dados) : [];
    } catch {
      return [];
    }
  }

  function salvarNoStorage() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(funcionarios));
  }

  function gerarId() {
    return 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- Renderização ----------
  function renderizar() {
    const contador = document.getElementById('contador');
    contador.textContent = funcionarios.length + ' funcionário(s) cadastrado(s)';

    const tabela = document.getElementById('tabela');
    const cards = document.getElementById('cards');
    const empty = document.getElementById('empty');
    const corpo = document.getElementById('tabelaCorpo');

    if (funcionarios.length === 0) {
      tabela.style.display = 'none';
      cards.style.display = 'none';
      empty.style.display = 'block';
      corpo.innerHTML = '';
      cards.innerHTML = '';
      return;
    }

    empty.style.display = 'none';
    tabela.style.display = '';
    cards.style.display = '';
    corpo.innerHTML = '';
    cards.innerHTML = '';

    funcionarios.forEach((f) => {
      corpo.appendChild(criarLinhaTabela(f));
      cards.appendChild(criarCard(f));
    });
  }

  function rotuloModalidade(m) { return m === 'HOME_OFFICE' ? 'Home Office' : 'Presencial'; }
  function rotuloTipoHorario(t) { return t === 'COMERCIAL' ? 'Comercial' : 'Flexível'; }

  function classeBadge(avaliacao) {
    if (avaliacao <= 4) return 'badge-vermelho';
    if (avaliacao <= 6) return 'badge-amarelo';
    if (avaliacao <= 8) return 'badge-azul';
    return 'badge-verde';
  }

  function criarBadge(avaliacao) {
    const span = document.createElement('span');
    span.className = 'badge ' + classeBadge(avaliacao);
    span.textContent = Number(avaliacao).toFixed(1) + '/10';
    return span;
  }

  function criarLinhaTabela(f) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHtml(f.nome)}</td>
      <td style="color:var(--text-muted);">${escapeHtml(f.funcao)}</td>
      <td style="color:var(--text-muted);">${f.horarioInicio} – ${f.horarioFim}
        <span style="font-size:11px; color:var(--text-muted); opacity:.7;">(${rotuloTipoHorario(f.tipoHorario)})</span>
      </td>
      <td style="color:var(--text-muted);">${f.escala}</td>
      <td style="color:var(--text-muted);">${rotuloModalidade(f.modalidade)}</td>
      <td class="td-avaliacao"></td>
      <td>
        <div class="acoes">
          <button class="btn-editar" onclick="abrirEdicao('${f.id}')">Editar</button>
          <button class="btn-excluir" onclick="abrirExcluir('${f.id}')">Excluir</button>
        </div>
      </td>
    `;
    tr.querySelector('.td-avaliacao').appendChild(criarBadge(f.avaliacao));
    return tr;
  }

  function criarCard(f) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-top">
        <div>
          <div class="card-nome">${escapeHtml(f.nome)}</div>
          <div class="card-funcao">${escapeHtml(f.funcao)}</div>
        </div>
        <div class="card-badge"></div>
      </div>
      <div class="card-info">
        <span>Horário</span><span>${f.horarioInicio} – ${f.horarioFim}</span>
        <span>Escala</span><span>${f.escala}</span>
        <span>Modalidade</span><span>${rotuloModalidade(f.modalidade)}</span>
      </div>
      <div class="card-acoes">
        <button class="btn-editar" onclick="abrirEdicao('${f.id}')">Editar</button>
        <button class="btn-excluir" onclick="abrirExcluir('${f.id}')">Excluir</button>
      </div>
    `;
    div.querySelector('.card-badge').appendChild(criarBadge(f.avaliacao));
    return div;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Toast ----------
  let toastTimeout = null;
  function mostrarToast(tipo, mensagem) {
    const toast = document.getElementById('toast');
    toast.className = tipo;
    toast.style.display = 'flex';
    toast.innerHTML = `<span>${tipo === 'sucesso' ? '✓' : '⚠'}</span><span>${escapeHtml(mensagem)}</span>`;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 3500);
  }

  // ---------- Form: abrir/fechar ----------
  function abrirCadastro() {
    idEmEdicao = null;
    document.getElementById('tituloForm').textContent = 'Cadastrar Funcionário';
    document.getElementById('btnSalvar').textContent = 'Cadastrar Funcionário';
    document.getElementById('campoNome').value = '';
    document.getElementById('campoFuncao').value = '';
    document.getElementById('campoEscala').value = '6x1';
    document.getElementById('campoModalidade').value = 'PRESENCIAL';
    document.getElementById('campoAvaliacao').value = 5;
    atualizarValorAvaliacao();
    selecionarTipoHorario('COMERCIAL');
    esconderErros();
    document.getElementById('overlayForm').classList.add('aberto');
  }

  function abrirEdicao(id) {
    const f = funcionarios.find((x) => x.id === id);
    if (!f) return;
    idEmEdicao = id;
    document.getElementById('tituloForm').textContent = 'Editar Funcionário';
    document.getElementById('btnSalvar').textContent = 'Salvar Alterações';
    document.getElementById('campoNome').value = f.nome;
    document.getElementById('campoFuncao').value = f.funcao;
    document.getElementById('campoEscala').value = f.escala;
    document.getElementById('campoModalidade').value = f.modalidade;
    document.getElementById('campoAvaliacao').value = f.avaliacao;
    atualizarValorAvaliacao();
    selecionarTipoHorario(f.tipoHorario, f.horarioInicio, f.horarioFim);
    esconderErros();
    document.getElementById('overlayForm').classList.add('aberto');
  }

  function fecharForm() {
    document.getElementById('overlayForm').classList.remove('aberto');
  }

  function selecionarTipoHorario(tipo, entrada, saida) {
    document.querySelector(`input[name="tipoHorario"][value="${tipo}"]`).checked = true;
    mudarTipoHorario(tipo, entrada, saida);
  }

  function mudarTipoHorario(tipo, entradaPersonalizada, saidaPersonalizada) {
    document.getElementById('opComercial').classList.toggle('selecionado', tipo === 'COMERCIAL');
    document.getElementById('opFlexivel').classList.toggle('selecionado', tipo === 'FLEXIVEL');

    const entrada = document.getElementById('campoEntrada');
    const saida = document.getElementById('campoSaida');

    if (tipo === 'COMERCIAL') {
      entrada.value = HORARIO_COMERCIAL_INICIO;
      saida.value = HORARIO_COMERCIAL_FIM;
      entrada.disabled = true;
      saida.disabled = true;
    } else {
      entrada.disabled = false;
      saida.disabled = false;
      entrada.value = entradaPersonalizada || entrada.value || '09:00';
      saida.value = saidaPersonalizada || saida.value || '18:00';
    }
  }

  function atualizarValorAvaliacao() {
    const valor = Number(document.getElementById('campoAvaliacao').value);
    document.getElementById('valorAvaliacao').textContent = valor.toFixed(1);
  }

  function esconderErros() {
    document.getElementById('errosForm').style.display = 'none';
    document.getElementById('listaErros').innerHTML = '';
  }

  function mostrarErros(erros) {
    const box = document.getElementById('errosForm');
    const lista = document.getElementById('listaErros');
    lista.innerHTML = erros.map((e) => `<li>${escapeHtml(e)}</li>`).join('');
    box.style.display = 'block';
  }

  // ---------- Validação + salvar ----------
  function salvarFuncionario(event) {
    event.preventDefault();

    const nome = document.getElementById('campoNome').value.trim();
    const funcao = document.getElementById('campoFuncao').value.trim();
    const tipoHorario = document.querySelector('input[name="tipoHorario"]:checked').value;
    const horarioInicio = document.getElementById('campoEntrada').value;
    const horarioFim = document.getElementById('campoSaida').value;
    const escala = document.getElementById('campoEscala').value;
    const modalidade = document.getElementById('campoModalidade').value;
    const avaliacao = Number(document.getElementById('campoAvaliacao').value);

    const erros = [];
    if (!nome) erros.push('Informe o nome do funcionário.');
    if (!funcao) erros.push('Informe a função do funcionário.');
    if (!horarioInicio) erros.push('Informe o horário de entrada.');
    if (!horarioFim) erros.push('Informe o horário de saída.');
    if (horarioInicio && horarioFim && horarioFim <= horarioInicio) {
      erros.push('O horário de saída deve ser maior que o de entrada.');
    }
    if (isNaN(avaliacao) || avaliacao < 0 || avaliacao > 10) {
      erros.push('A avaliação deve estar entre 0 e 10.');
    }

    if (erros.length > 0) {
      mostrarErros(erros);
      return false;
    }

    const dados = { nome, funcao, tipoHorario, horarioInicio, horarioFim, escala, modalidade, avaliacao };

    if (idEmEdicao) {
      const index = funcionarios.findIndex((f) => f.id === idEmEdicao);
      if (index === -1) {
        mostrarToast('erro', 'Não foi possível atualizar o funcionário. Tente novamente.');
        return false;
      }
      funcionarios[index] = { ...funcionarios[index], ...dados, updatedAt: new Date().toISOString() };
      salvarNoStorage();
      renderizar();
      fecharForm();
      mostrarToast('sucesso', 'Funcionário atualizado com sucesso!');
    } else {
      const novo = {
        id: gerarId(),
        ...dados,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      funcionarios.unshift(novo);
      salvarNoStorage();
      renderizar();
      fecharForm();
      mostrarToast('sucesso', 'Funcionário cadastrado com sucesso!');
    }

    return false;
  }

  // ---------- Exclusão ----------
  function abrirExcluir(id) {
    const f = funcionarios.find((x) => x.id === id);
    if (!f) return;
    idParaExcluir = id;
    document.getElementById('mensagemExcluir').textContent =
      `Tem certeza que deseja excluir "${f.nome}"? Essa ação não pode ser desfeita.`;
    document.getElementById('overlayExcluir').classList.add('aberto');
  }

  function fecharExcluir() {
    idParaExcluir = null;
    document.getElementById('overlayExcluir').classList.remove('aberto');
  }

  function confirmarExclusao() {
    if (!idParaExcluir) return;
    const index = funcionarios.findIndex((f) => f.id === idParaExcluir);
    if (index === -1) {
      mostrarToast('erro', 'Não foi possível excluir o funcionário. Tente novamente.');
      fecharExcluir();
      return;
    }
    funcionarios.splice(index, 1);
    salvarNoStorage();
    renderizar();
    fecharExcluir();
    mostrarToast('sucesso', 'Funcionário excluído com sucesso!');
  }

  // ---------- Início ----------
  renderizar();
