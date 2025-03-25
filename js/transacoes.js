$(document).ready(function() {
    // Carrega categorias para os selects
    loadCategorias();
    
    // Carrega transações
    loadTransacoes();
    
    // Configura eventos
    setupTransacoesEventos();
});

function loadCategorias() {
    // Simulação - na prática viria de uma API
    const categorias = [
        { id: 1, nome: 'Salário', tipo: 'receita' },
        { id: 2, nome: 'Freelance', tipo: 'receita' },
        { id: 3, nome: 'Investimentos', tipo: 'receita' },
        { id: 4, nome: 'Alimentação', tipo: 'despesa' },
        { id: 5, nome: 'Moradia', tipo: 'despesa' },
        { id: 6, nome: 'Transporte', tipo: 'despesa' },
        { id: 7, nome: 'Lazer', tipo: 'despesa' },
        { id: 8, nome: 'Saúde', tipo: 'despesa' }
    ];
    
    // Preenche select no modal
    const categoriaSelect = $('#transacaoCategoria');
    categorias.forEach(categoria => {
        categoriaSelect.append(`<option value="${categoria.id}">${categoria.nome}</option>`);
    });
    
    // Preenche select de filtro
    const filtroCategoria = $('#filtroCategoria');
    categorias.forEach(categoria => {
        filtroCategoria.append(`<option value="${categoria.id}">${categoria.nome}</option>`);
    });
}

function loadTransacoes(filtros = {}) {
    // Simulação - na prática viria de uma API com filtros
    const transacoes = [
        { id: 1, data: '2023-03-15', descricao: 'Salário', categoria: 'Salário', tipo: 'receita', valor: 3500.00 },
        { id: 2, data: '2023-03-10', descricao: 'Aluguel', categoria: 'Moradia', tipo: 'despesa', valor: 1200.00 },
        { id: 3, data: '2023-03-05', descricao: 'Supermercado', categoria: 'Alimentação', tipo: 'despesa', valor: 450.00 },
        { id: 4, data: '2023-03-03', descricao: 'Freelance', categoria: 'Freelance', tipo: 'receita', valor: 800.00 },
        { id: 5, data: '2023-03-01', descricao: 'Internet', categoria: 'Moradia', tipo: 'despesa', valor: 120.00 },
        { id: 6, data: '2023-02-28', descricao: 'Academia', categoria: 'Saúde', tipo: 'despesa', valor: 150.00 },
        { id: 7, data: '2023-02-25', descricao: 'Restaurante', categoria: 'Alimentação', tipo: 'despesa', valor: 85.00 },
        { id: 8, data: '2023-02-20', descricao: 'Gasolina', categoria: 'Transporte', tipo: 'despesa', valor: 200.00 },
        { id: 9, data: '2023-02-15', descricao: 'Salário', categoria: 'Salário', tipo: 'receita', valor: 3500.00 },
        { id: 10, data: '2023-02-10', descricao: 'Aluguel', categoria: 'Moradia', tipo: 'despesa', valor: 1200.00 }
    ];
    
    // Aplica filtros (simulação)
    let transacoesFiltradas = [...transacoes];
    
    if (filtros.tipo) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === filtros.tipo);
    }
    
    if (filtros.categoria) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()));
    }
    
    if (filtros.dataInicio) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.data >= filtros.dataInicio);
    }
    
    if (filtros.dataFim) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.data <= filtros.dataFim);
    }
    
    if (filtros.valorMin) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor >= parseFloat(filtros.valorMin));
    }
    
    if (filtros.valorMax) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor <= parseFloat(filtros.valorMax));
    }
    
    // Preenche tabela
    const tbody = $('#tabelaTransacoes tbody');
    tbody.empty();
    
    transacoesFiltradas.forEach(transacao => {
        const tipoClass = transacao.tipo === 'receita' ? 'text-success' : 'text-danger';
        const tipoTexto = transacao.tipo === 'receita' ? 'Receita' : 'Despesa';
        
        tbody.append(`
            <tr>
                <td>${formatarData(transacao.data)}</td>
                <td>${transacao.descricao}</td>
                <td>${transacao.categoria}</td>
                <td>${tipoTexto}</td>
                <td class="${tipoClass}">R$ ${transacao.valor.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 editar-transacao" data-id="${transacao.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger excluir-transacao" data-id="${transacao.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function setupTransacoesEventos() {
    // Mostra/oculta seção de repetição
    $('#transacaoRepetir').change(function() {
        $('#repeticaoContainer').toggle(this.checked);
    });
    
    // Formulário de filtros
    $('#filtrosForm').submit(function(e) {
        e.preventDefault();
        
        const filtros = {
            tipo: $('#filtroTipo').val(),
            categoria: $('#filtroCategoria').val(),
            dataInicio: $('#filtroDataInicio').val(),
            dataFim: $('#filtroDataFim').val(),
            valorMin: $('#filtroValorMin').val(),
            valorMax: $('#filtroValorMax').val()
        };
        
        loadTransacoes(filtros);
    });
    
    // Limpar filtros
    $('#limparFiltros').click(function() {
        $('#filtrosForm')[0].reset();
        loadTransacoes();
    });
    
    // Formulário de transação
    $('#formTransacao').submit(function(e) {
        e.preventDefault();
        
        const transacao = {
            tipo: $('#transacaoTipo').val(),
            categoria: $('#transacaoCategoria').find('option:selected').text(),
            descricao: $('#transacaoDescricao').val(),
            valor: parseFloat($('#transacaoValor').val()),
            data: $('#transacaoData').val()
        };
        
        // Lógica de repetição
        const repetir = $('#transacaoRepetir').is(':checked');
        const repeticaoTipo = $('#transacaoRepeticaoTipo').val();
        const repeticaoQuantidade = parseInt($('#transacaoRepeticaoQuantidade').val());
        
        if (repetir) {
            // Cria transações repetidas
            const transacoesRepetidas = criarTransacoesRepetidas(transacao, repeticaoTipo, repeticaoQuantidade);
            console.log('Transações repetidas criadas:', transacoesRepetidas);
            // Aqui você enviaria para a API
        } else {
            console.log('Transação única criada:', transacao);
            // Aqui você enviaria para a API
        }
        
        // Fecha o modal e recarrega as transações
        $('#novaTransacaoModal').modal('hide');
        loadTransacoes();
    });
    
    // Editar transação
    $(document).on('click', '.editar-transacao', function() {
        const transacaoId = $(this).data('id');
        console.log('Editar transação:', transacaoId);
        // Implementar lógica de edição
    });
    
    // Excluir transação
    $(document).on('click', '.excluir-transacao', function() {
        const transacaoId = $(this).data('id');
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            console.log('Excluir transação:', transacaoId);
            // Implementar lógica de exclusão
            loadTransacoes();
        }
    });
}

function criarTransacoesRepetidas(transacaoBase, tipo, quantidade) {
    const transacoes = [];
    const dataBase = new Date(transacaoBase.data);
    
    for (let i = 0; i < quantidade; i++) {
        const novaData = new Date(dataBase);
        
        if (tipo === 'mensal') {
            novaData.setMonth(dataBase.getMonth() + i);
        } else { // anual
            novaData.setFullYear(dataBase.getFullYear() + i);
        }
        
        const transacao = {
            ...transacaoBase,
            data: formatarDataParaAPI(novaData)
        };
        
        transacoes.push(transacao);
    }
    
    return transacoes;
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarDataParaAPI(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}