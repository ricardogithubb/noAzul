$(document).ready(function() {
    // Variáveis globais
    let Despesas = [];
    let categorias = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
    let mesAtual = new Date().getMonth();
    let anoAtual = new Date().getFullYear();

    // Inicialização
    init();

    async function init() {        
        carregarDespesas();
        setupEventListeners();
        atualizarTotalDespesas();
        popularFiltros();
    }

    // Botão que abre o modal de filtro
    $('#filtroAvancadoBtn').click(function() {
        // Preenche os valores atuais dos filtros (se existirem)
        // preencherFiltrosAtuais();
        
        // Exibe o modal
        $('#filtroAvancadoModal').modal('show');
    });

    // Configura o submit do formulário de filtro
    $('#formFiltroAvancado').submit(function(e) {
        e.preventDefault();
        aplicarFiltrosAvancados();
    });

    // Botão para limpar filtros
    $('#limparFiltrosBtn').click(function() {
        limparFiltrosAvancados();
    });

    // Carrega as Despesas do localStorage (simulação)
    function carregarDespesas() {
        const dadosSalvos = localStorage.getItem('noAzulDespesas');
        if (dadosSalvos) {
            Despesas = JSON.parse(dadosSalvos);
        } else {
            // Dados de exemplo
            Despesas = [
                {
                    id: 1,
                    descricao: 'Salário ACME',
                    valor: 2500,
                    data: '2023-03-05',
                    categoria: 'Salário',
                    efetivada: true,
                    conta: 'Santander'
                },
                {
                    id: 2,
                    descricao: 'Freelance Site',
                    valor: 800,
                    data: '2023-03-15',
                    categoria: 'Freelance',
                    efetivada: false,
                    conta: 'Nubank'
                }
            ];
            salvarDespesas();
        }
        
        exibirDespesas(Despesas);
    }

    // Exibe as Despesas na tabela
    function exibirDespesas(listaDespesas) {
        const $tbody = $('#DespesasTable tbody');
        $tbody.empty();

        if (listaDespesas.length === 0) {
            $tbody.append('<tr><td colspan="6" class="text-center">Nenhuma receita encontrada</td></tr>');
            return;
        }

        listaDespesas.forEach(receita => {
            const dataFormatada = formatarData(receita.data);
            const valorFormatado = formatMoney(receita.valor);
            const status = receita.efetivada ? 
                '<span class="badge bg-success">Efetivada</span>' : 
                '<span class="badge bg-secondary">Pendente</span>';

            $tbody.append(`
                <tr data-id="${receita.id}">
                    <td>${dataFormatada}</td>
                    <td>${receita.descricao}</td>
                    <td><span class="badge bg-primary">${receita.categoria}</span></td>
                    <td class="text-success">${valorFormatado}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-editar me-1">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    }

    // Configura os event listeners
    function setupEventListeners() {
        // Formulário de nova receita
        $('#formNovaReceita').submit(function(e) {
            e.preventDefault();
            salvarReceita();
        });

        // Botão de filtro avançado
        $('#filtroAvancadoBtn').click(function() {
            $('#filtroAvancadoModal').modal('show');
        });

        // Formulário de filtro avançado
        $('#formFiltroAvancado').submit(function(e) {
            e.preventDefault();
            aplicarFiltros();
        });

        // Limpar filtros
        $('#limparFiltros').click(function() {
            limparFiltros();
        });

        // Delegation para botões de editar/excluir (já que são dinâmicos)
        $('#DespesasTable').on('click', '.btn-editar', function() {
            const id = $(this).closest('tr').data('id');
            editarReceita(id);
        });

        $('#DespesasTable').on('click', '.btn-excluir', function() {
            const id = $(this).closest('tr').data('id');
            confirmarExclusao(id);
        });

        // Alternar opções de repetição
        $('#receitaRepetir').change(function() {
            $('#repeticaoOptions').toggle(this.checked);
        });
    }

    // Salva uma nova receita
    function salvarReceita() {
        const descricao = $('#receitaDescricao').val();
        const valor = parseFloat($('#receitaValor').val());
        const data = $('#receitaData').val();
        const categoria = $('#receitaCategoria').val();
        const efetivada = $('#receitaEfetivada').is(':checked');
        const observacao = $('#receitaObservacao').val();
        const repetir = $('#receitaRepetir').is(':checked');

        if (!descricao || !valor || !data || !categoria) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        const novaReceita = {
            id: Date.now(), // ID único
            descricao,
            valor,
            data,
            categoria,
            efetivada,
            observacao,
            conta: 'Santander' // Exemplo, pode ser um select no formulário
        };

        Despesas.push(novaReceita);
        salvarDespesas();
        exibirDespesas(Despesas);
        $('#novaReceitaModal').modal('hide');
        resetarFormulario();
        atualizarTotalDespesas();

        // Lógica para Despesas recorrentes (simplificada)
        if (repetir) {
            alert('Funcionalidade de repetição será implementada');
        }
    }

    // Editar receita existente
    function editarReceita(id) {
        const receita = Despesas.find(r => r.id === id);
        if (!receita) return;

        $('#receitaDescricao').val(receita.descricao);
        $('#receitaValor').val(receita.valor);
        $('#receitaData').val(receita.data);
        $('#receitaCategoria').val(receita.categoria);
        $('#receitaEfetivada').prop('checked', receita.efetivada);
        $('#receitaObservacao').val(receita.observacao || '');

        // Alterar o formulário para modo edição
        $('#formNovaReceita').off('submit').submit(function(e) {
            e.preventDefault();
            atualizarReceita(id);
        });

        $('#novaReceitaModal').modal('show');
    }

    // Atualizar receita existente
    function atualizarReceita(id) {
        const index = Despesas.findIndex(r => r.id === id);
        if (index === -1) return;

        Despesas[index] = {
            ...Despesas[index],
            descricao: $('#receitaDescricao').val(),
            valor: parseFloat($('#receitaValor').val()),
            data: $('#receitaData').val(),
            categoria: $('#receitaCategoria').val(),
            efetivada: $('#receitaEfetivada').is(':checked'),
            observacao: $('#receitaObservacao').val()
        };

        salvarDespesas();
        exibirDespesas(Despesas);
        $('#novaReceitaModal').modal('hide');
        resetarFormulario();
        atualizarTotalDespesas();
    }

    // Confirmar exclusão de receita
    function confirmarExclusao(id) {
        if (confirm('Tem certeza que deseja excluir esta receita?')) {
            excluirReceita(id);
        }
    }

    // Excluir receita
    function excluirReceita(id) {
        Despesas = Despesas.filter(r => r.id !== id);
        salvarDespesas();
        exibirDespesas(Despesas);
        atualizarTotalDespesas();
    }

    // Aplicar filtros avançados
    function aplicarFiltros() {
        const dataInicio = $('#filtroDataInicio').val();
        const dataFim = $('#filtroDataFim').val();
        const categoria = $('#filtroCategoria').val();
        const valorMin = $('#filtroValorMin').val();
        const valorMax = $('#filtroValorMax').val();
        const status = $('#filtroStatus').val();
        const descricao = $('#filtroDescricao').val();

        let DespesasFiltradas = [...Despesas];

        if (dataInicio) {
            DespesasFiltradas = DespesasFiltradas.filter(r => r.data >= dataInicio);
        }

        if (dataFim) {
            DespesasFiltradas = DespesasFiltradas.filter(r => r.data <= dataFim);
        }

        if (categoria) {
            DespesasFiltradas = DespesasFiltradas.filter(r => r.categoria === categoria);
        }

        if (valorMin) {
            DespesasFiltradas = DespesasFiltradas.filter(r => r.valor >= parseFloat(valorMin));
        }

        if (valorMax) {
            DespesasFiltradas = DespesasFiltradas.filter(r => r.valor <= parseFloat(valorMax));
        }

        if (status) {
            const efetivada = status === 'efetivado';
            DespesasFiltradas = DespesasFiltradas.filter(r => r.efetivada === efetivada);
        }

        if (descricao) {
            const termo = descricao.toLowerCase();
            DespesasFiltradas = DespesasFiltradas.filter(r => 
                r.descricao.toLowerCase().includes(termo)
            );
        }

        exibirDespesas(DespesasFiltradas);
        $('#filtroAvancadoModal').modal('hide');
    }

    // Limpar filtros
    function limparFiltros() {
        $('#formFiltroAvancado')[0].reset();
        exibirDespesas(Despesas);
        $('#filtroAvancadoModal').modal('hide');
    }

    // Popular selects de filtro
    function popularFiltros() {
        const $categoriaSelect = $('#filtroCategoria');
        $categoriaSelect.empty();
        $categoriaSelect.append('<option value="">Todas Categorias</option>');
        
        categorias.forEach(categoria => {
            $categoriaSelect.append(`<option value="${categoria}">${categoria}</option>`);
        });
    }

    // Atualizar o total de Despesas exibido
    async function atualizarTotalDespesas() {
        const total = await getTotalDespesas(mesAtual, anoAtual);
        $('#totalDespesas').text(total);
    }

    // Salvar Despesas no localStorage
    function salvarDespesas() {
        localStorage.setItem('noAzulDespesas', JSON.stringify(Despesas));
    }

    // Resetar formulário
    function resetarFormulario() {
        $('#formNovaReceita')[0].reset();
        $('#repeticaoOptions').hide();
        $('#formNovaReceita').off('submit').submit(function(e) {
            e.preventDefault();
            salvarReceita();
        });
    }

    // Funções auxiliares
    function formatMoney(value) {
        return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
    }

    function formatarData(dataString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    }
});