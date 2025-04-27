$(document).ready(function() {
    // Variáveis globais
    let receitas = [];
    let categorias = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
    let mesAtual = localStorage.getItem('selectedMonth'); // || new Date().getMonth();
    let anoAtual = localStorage.getItem('selectedYear'); // || new Date().getFullYear();

    // Aplica a máscara de valor no campo de receitaValor
    $('#receitaValor').mask('###.###.###.###.###,00', {reverse: true});

    

    // Inicialização
    init();

    async function init() {                
        carregarReceitas();
        setupEventListeners();
        atualizarTotalReceitas();
        popularFiltros();
    }

$('.transactions-list').on('click', '.transaction-item', function() {
    const transactionId = $(this).data('id');
    editarReceita(transactionId);
});


    $('#confirmMonthYear').click(function() {
        init();
    });

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

    // function para carregar dados de api 
    async function carregarReceitasApi(mes, ano) {
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem('authToken');
            const url = `https://apinoazul.markethubplace.com/api/receitas/periodo/${mes}/${ano}`;

            $.ajax({
                url: url,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                method: 'GET',
                success: function(response) {
                    //converter objeto para json
                    resolve(localStorage.setItem('noAzulReceitas', JSON.stringify(response)));
                },
                error: function(xhr, status, error) {
                    console.log('Erro ao obter o total de despesas:', error);
                    reject(error);
                }
            });
        });
    }

    // Carrega as receitas do localStorage (simulação)
    async function carregarReceitas() {
        await carregarReceitasApi(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'));
        const dadosSalvos = localStorage.getItem('noAzulReceitas');

        //ordernar dadosSalvos da maior data para a menor
        

        if (dadosSalvos) {
            receitas = JSON.parse(dadosSalvos);
            receitas.sort((a, b) => new Date(b.data_vencimento) - new Date(a.data_vencimento));
        } else {
            // Dados de exemplo
            receitas = [];
        }
        
        exibirReceitas(receitas);
    }

    // Exibe as receitas na tabela
    function exibirReceitas(listaTransacoes) {
        const $container = $('.transactions-list');
        $container.empty();
    
        if (listaTransacoes.length === 0) {
            $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
            return;
        }

        
        let printData = "";
        console.log(listaTransacoes);

        listaTransacoes.forEach(receita => {
            const dataFormatada = formatarDataExtenso(receita.data_vencimento);
            const valorFormatado = formatMoney(receita.valor);
            const status = receita.data_efetivacao != null ? 
                '<span style="display: inline-block; width: 15px; height: 15px; background-color: green; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>' : 
                '<span style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>';
            
            //verificar se dataFormatada é diferente de printData
            console.log(dataFormatada+" != "+printData);
            if (dataFormatada != printData) {
                if(printData != "") {
                    printData = dataFormatada;
                    $container.append(`</div>
                            <div class="transaction-group">
                                <div class="transaction-date bg-light">${dataFormatada}</div>                   
                            `);
                } else {    
                    printData = dataFormatada;
                    $container.append(`<div class="transaction-group">
                                         <div class="transaction-date bg-light p-0 fw-bold">${dataFormatada}</div>                    
                            `);
                }
            }
    
            $container.append(`
                <div class="transaction-item" data-id="${receita.id}">
                    <div class="transaction-main">
                        <div class="transaction-title">${receita.descricao}</div>
                        <div class="transaction-details small text-muted">${receita.categoria} | ${receita.conta}</div> <!-- Texto menor e baixa densidade -->
                    </div>
                    <div class="transaction-amount text-danger" style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span>${valorFormatado}</span>
                        ${status}
                    </div>
                </div>
            `);
        });
    
        // listaTransacoes.forEach(grupo => {
        //     const $grupo = $(`
        //         <div class="transaction-group">
        //             <div class="transaction-date bg-light">${grupo.data}</div>
        //         </div>
        //     `);
    
        //     grupo.transacoes.forEach(transacao => {
        //         const valorClass = transacao.valor < 0 ? 'text-danger' : 'text-success';
        //         const valorFormatado = formatMoney(Math.abs(transacao.valor));
    
        //         const $transacao = $(`
        //             <div class="transaction-item">
        //                 <div class="transaction-main">
        //                     <div class="transaction-title">${transacao.descricao}</div>
        //                     <div class="transaction-details small text-muted">${transacao.detalhes}</div>
        //                 </div>
        //                 <div class="transaction-amount ${valorClass}">R$ ${valorFormatado}</div>
        //             </div>
        //         `);
    
        //         $grupo.append($transacao);
        //     });
    
        //     $container.append($grupo);
        // });
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
        $('#receitasTable').on('click', '.btn-editar', function() {
            const id = $(this).closest('tr').data('id');
            editarReceita(id);
        });

        $('#receitasTable').on('click', '.btn-excluir', function() {
            const id = $(this).closest('tr').data('id');
            confirmarExclusao(id);
        });

        // Alternar opções de repetição
        $('#receitaRepetir').change(function() {
            $('#repeticaoOptions').toggle(this.checked);
        });
    }

    // Salva uma nova receita
    async function salvarReceita() {
        console.log("salvarReceita");
        // Obter valores do formulário
        const descricao = $('#receitaDescricao').val().trim();
        const valor = parseFloat($('#receitaValor').val());
        const data = $('#receitaData').val();
        const categoria_id = $('#receitaCategoria').val();
        const efetivada = $('#receitaEfetivada').is(':checked');
        const observacao = $('#receitaObservacao').val().trim();
        const conta_id = $('#receitaConta').val(); // Adicione um select para contas no formulário
        const repetir = $('#receitaRepetir').is(':checked');
    
        // Validação dos campos obrigatórios
        if (!descricao || isNaN(valor) || !data || !categoria_id || !conta_id) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }
    
        console.log(data);
        // Formatando a data para o padrão da API (YYYY/MM/DD)
        const dataVencimento = data;
    
        // Objeto com os dados para a API
        const dadosReceita = {
            descricao,
            conta_id: parseInt(conta_id),
            categoria_id: parseInt(categoria_id),
            valor,
            data_vencimento: dataVencimento,
            observacao,
            efetivada
        };


        try {
            // Mostrar indicador de carregamento
            $('#btnSalvarReceita').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');
    
            // Chamada à API
            const response = await fetch('https://apinoazul.markethubplace.com/api/receitas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken') // Assumindo autenticação JWT
                },
                body: JSON.stringify(dadosReceita)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar receita');
            }
    
            const receitaSalva = await response.json();
    
            // Adiciona a receita na lista local (opcional)
            // receitas.push({
            //     id: receitaSalva.id,
            //     ...dadosReceita
            // });
    
            // Atualiza a interface
            exibirReceitas(receitas);
            $('#novaReceitaModal').modal('hide');
            resetarFormulario();
            atualizarTotalReceitas();
    
            // Feedback de sucesso
            mostrarAlerta('Receita salva com sucesso!', 'success');
    
            // Lógica para receitas recorrentes
            if (repetir) {
                // Implementar lógica de repetição conforme necessário
            }
    
        } catch (error) {
            console.error('Erro ao salvar receita:', error);
            mostrarAlerta(error.message || 'Erro ao salvar receita. Tente novamente.', 'danger');
        } finally {
            // Restaurar botão
            $('#btnSalvarReceita').prop('disabled', false).text('Salvar Receita');
        }
    }
    
    // Função auxiliar para formatar data para YYYY/MM/DD
    function formatarDataParaAPI(data) {
        const [dia, mes, ano] = data.split('/');
        return `${ano}/${mes}/${dia}`;
    }
    
    // Função para mostrar feedback visual
    function mostrarAlerta(mensagem, tipo) {
        const alerta = `
            <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
                ${mensagem}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        $('#alertaContainer').html(alerta);
    }

    // Editar receita existente
    function editarReceita(id) {
        const receita = receitas.find(r => r.id === id);
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
        const index = receitas.findIndex(r => r.id === id);
        if (index === -1) return;

        receitas[index] = {
            ...receitas[index],
            descricao: $('#receitaDescricao').val(),
            valor: parseFloat($('#receitaValor').val()),
            data: $('#receitaData').val(),
            categoria: $('#receitaCategoria').val(),
            efetivada: $('#receitaEfetivada').is(':checked'),
            observacao: $('#receitaObservacao').val()
        };

        salvarReceitas();
        exibirReceitas(receitas);
        $('#novaReceitaModal').modal('hide');
        resetarFormulario();
        atualizarTotalReceitas();
    }

    // Confirmar exclusão de receita
    function confirmarExclusao(id) {
        if (confirm('Tem certeza que deseja excluir esta receita?')) {
            excluirReceita(id);
        }
    }

    // Excluir receita
    function excluirReceita(id) {
        receitas = receitas.filter(r => r.id !== id);
        salvarReceitas();
        exibirReceitas(receitas);
        atualizarTotalReceitas();
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

        let receitasFiltradas = [...receitas];

        if (dataInicio) {
            receitasFiltradas = receitasFiltradas.filter(r => r.data >= dataInicio);
        }

        if (dataFim) {
            receitasFiltradas = receitasFiltradas.filter(r => r.data <= dataFim);
        }

        if (categoria) {
            receitasFiltradas = receitasFiltradas.filter(r => r.categoria === categoria);
        }

        if (valorMin) {
            receitasFiltradas = receitasFiltradas.filter(r => r.valor >= parseFloat(valorMin));
        }

        if (valorMax) {
            receitasFiltradas = receitasFiltradas.filter(r => r.valor <= parseFloat(valorMax));
        }

        if (status) {
            const efetivada = status === 'efetivado';
            receitasFiltradas = receitasFiltradas.filter(r => r.efetivada === efetivada);
        }

        if (descricao) {
            const termo = descricao.toLowerCase();
            receitasFiltradas = receitasFiltradas.filter(r => 
                r.descricao.toLowerCase().includes(termo)
            );
        }

        exibirReceitas(receitasFiltradas);
        $('#filtroAvancadoModal').modal('hide');
    }

    // Limpar filtros
    function limparFiltros() {
        $('#formFiltroAvancado')[0].reset();
        exibirReceitas(receitas);
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

    // Atualizar o total de receitas exibido
    async function atualizarTotalReceitas() {
        const total = await getTotalReceitas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'), anoAtual);
        $('#totalReceitas').text(total);
    }

    // Salvar receitas no localStorage
    function salvarReceitas() {
        localStorage.setItem('noAzulReceitas', JSON.stringify(receitas));
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
        const number = Number(value) || 0;  // garante que value seja um número
        return 'R$ ' + number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function formatarData(dataString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dataString).toLocaleDateString('pt-BR', options);
    }

    function formatarDataExtenso(dataString) {
        const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
        const partes = dataString.split('-');
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // mês no JS é de 0 a 11
        const dia = parseInt(partes[2], 10);
    
        const data = new Date(ano, mes, dia);
        const diaSemana = diasSemana[data.getDay()];
    
        return `${diaSemana}, ${dia}`;
    }

    carregarContas();

    carregarCategorias();


});

