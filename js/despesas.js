import { adicionar, listar, atualizar, deletar, listarDespesas, totalEfetivado, totalPendente } from './indexedDB.js';
import { carregarContas, carregarCategorias } from './script.js';
$(document).ready(function() {
    // Variáveis globais
    let despesas = [];
    let categorias = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
    let mesAtual = localStorage.getItem('selectedMonth'); // || new Date().getMonth();
    let anoAtual = localStorage.getItem('selectedYear'); // || new Date().getFullYear();
    let isSubmitting = false; // <- Adiciona essa variável global no início do seu $(document).ready(function() { })
    const dataAtual = new Date().toISOString().split('T')[0];
    let repetirDespesa = 1;

    // Aplica a máscara de valor no campo de despesaValor
    $('#despesaValor').mask('###.###.###.###.###,00', {reverse: true});   
      
    // Inicialização
    init();

    async function init() {  
        carregarDespesasIndexedDB();              
        setupEventListeners();
        atualizarTotalDespesas();
        popularFiltros();
    }

    $('#despesaEfetivada').change(function() {
        if ($(this).is(':checked')) {
            $('#dataEfetivacaoContainer').show();
            $('#dataEfetivacao').val($('#despesaData').val());
        } else {
            $('#dataEfetivacaoContainer').hide();
            $('#dataEfetivacao').val('');
        }
    });


    $('.transactions-list').on('click', '.transaction-item', function() {
        const transactionId = $(this).data('id');
        editarDespesa(transactionId);
    });


    $('#confirmMonthYear').off('click').on('click', function () {
        init();
    });

    // Botão que abre o modal de filtro
    $('#filtroAvancadoBtn').off('click').on('click', function () {
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
    $('#limparFiltrosBtn').off('click').on('click', function () {
        limparFiltrosAvancados();
    });


    async function carregarDespesasIndexedDB() {
        const listaDespesas = await listarDespesas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'));
        
        const dadosSalvos = JSON.stringify(listaDespesas);

        //ordernar dadosSalvos da maior data para a menor
        

        if (dadosSalvos) {
            despesas = JSON.parse(dadosSalvos);
            despesas.sort((a, b) => new Date(b.data_vencimento) - new Date(a.data_vencimento));
        } else {
            // Dados de exemplo
            despesas = [];
        }
        
        exibirDespesas(despesas);
    }
    

    // Carrega as despesas do localStorage (simulação)
    async function carregarDespesas() {
        await carregarDespesasApi(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'));
        const dadosSalvos = localStorage.getItem('noAzulDespesas');

        //ordernar dadosSalvos da maior data para a menor
        

        if (dadosSalvos) {
            despesas = JSON.parse(dadosSalvos);
            despesas.sort((a, b) => new Date(b.data_vencimento) - new Date(a.data_vencimento));
        } else {
            // Dados de exemplo
            despesas = [];
        }
        
        exibirDespesas(despesas);

    }

    // Exibe as despesas na tabela
    function exibirDespesas(listaTransacoes) {
        return new Promise((resolve, reject) => {

            console.log('Exibindo despesas...');
            console.log(listaTransacoes);
            const $container = $('.transactions-list');
            $container.empty();
        
            if (listaTransacoes.length === 0) {
                $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
                return;
            }

            
            let printData = "";
            console.log(listaTransacoes);

            listaTransacoes.forEach(despesa => {
                const dataFormatada = formatarDataExtenso(despesa.data_vencimento);
                const valorFormatado = formatMoney(despesa.valor);
                const status = despesa.data_efetivacao != null ? 
                    '<span style="display: inline-block; width: 15px; height: 15px; background-color: green; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>' : 
                    '<span style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>';
                
                //verificar se dataFormatada é diferente de printData
                console.log(dataFormatada+" != "+printData);
                if (dataFormatada != printData) {
                    if(printData != "") {
                        printData = dataFormatada;
                        $container.append(`</div>
                                <div class="transaction-group">
                                    <div class="transaction-date bg-light p-0">${dataFormatada}</div>                   
                                `);
                    } else {    
                        printData = dataFormatada;
                        $container.append(`<div class="transaction-group">
                                            <div class="transaction-date bg-light p-0 fw-bold">${dataFormatada}</div>                    
                                `);
                    }
                }
        
                $container.append(`
                    <div class="transaction-item" data-id="${despesa.id}">
                        <div class="transaction-main">
                            <div class="transaction-title">${despesa.descricao}</div>
                            <div class="transaction-details small text-muted">${despesa.categoria} | ${despesa.conta}</div> <!-- Texto menor e baixa densidade -->
                        </div>
                        <div class="transaction-amount text-danger" style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span>${valorFormatado}</span>
                            ${status}
                        </div>
                    </div>
                `);
            });

            resolve();
            
        });
    
    }

    // Configura os event listeners
    function setupEventListeners() {
        // Formulário de nova despesa
        $('#formNovaDespesa').submit(async function(e) {
            //desativar o botão de salvar
            e.preventDefault();

            if (isSubmitting) return; // Se já estiver enviando, não faz nada

            isSubmitting = true; // trava envio
            $('#btnSalvarDespesa').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');

            console.log('Salvando 2');
            await salvarDespesa(); // Aguarda o salvamento terminar

            await carregarDespesasIndexedDB();

            isSubmitting = false; // libera envio novamente
            $('#btnSalvarDespesa').prop('disabled', false).text('Salvar Despesa');
        });

        //ao abrir o modal de nova despesa, limpar os campos
        $('#novaDespesaModal').on('show.bs.modal', function() {
            $('#despesaData').val(dataAtual);
        });

        //ao fechar o modal de nova despesa, limpar os campos
        $('#novaDespesaModal').on('hidden.bs.modal', function() {
            $('#despesaDescricao').val(''); // Limpa o campo de descrição
            $('#despesaValor').val(''); // Limpa o campo de valor
            //definir data atual
            $('#despesaData').val(dataAtual);
            $('#dataEfetivacao').val('');
            $('#despesaConta').val(''); // Limpa o campo de conta
            $('#despesaCategoria').val(''); // Limpa o campo de categoria
            $('#despesaEfetivada').prop('checked', false); // Desmarca a opção de efetivada
            $('#despesaObservacao').val(''); // Limpa o campo de observação
            //alterar o model-title de um modal expecifico
            $('#novaDespesaModal .modal-title').text('Nova Despesa');
            $('#dataEfetivacaoContainer').hide();
            $('#repeticaoSwitch').show();
        });


        // Botão de filtro avançado
        $('#filtroAvancadoBtn').off('click').on('click', function () {
            $('#filtroAvancadoModal').modal('show');
        });

        // Formulário de filtro avançado
        $('#formFiltroAvancado').submit(function(e) {
            e.preventDefault();
            aplicarFiltros();
        });

        // Limpar filtros
        $('#limparFiltros').off('click').on('click', function () {
            limparFiltros();
        });


        $('#btnExcluirDespesa').off('click').on('click', function () {
            const id = $("#novaDespesaModal").data('id');
            confirmarExclusao(id);
        });


        // Alternar opções de repetição
        $('#despesaRepetir').change(function() {
            $('#repeticaoOptions').toggle(this.checked);
        });

        // Alterar repetirDespesa ao alterar input de repetição
        $('#repetirDespesa').on('change', function() {
            repetirDespesa = $('#repetirDespesa').val();
        })
    }

    // Salva uma nova despesa
    async function salvarDespesa() {
        // Obter valores do formulário
        const descricao = $('#despesaDescricao').val().trim();
        const valor = parseFloat($('#despesaValor').val().replace('.', '').replace(',', '.'));
        const data = $('#despesaData').val();
        const categoria_id = $('#despesaCategoria').val();
        const efetivada = $('#despesaEfetivada').is(':checked');
        const dataEfetivacao = $('#despesaEfetivada').is(':checked') ? $('#dataEfetivacao').val() : null;
        const observacao = $('#despesaObservacao').val().trim();
        const conta_id = $('#despesaConta').val(); // Adicione um select para contas no formulário
        const repetir = $('#despesaRepetir').is(':checked');
        const tipo = 'D';
    
        // Validação dos campos obrigatórios
        if (!descricao || isNaN(valor) || !data || !categoria_id || !conta_id) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }
    
        console.log(data);
        // Formatando a data para o padrão da API (YYYY/MM/DD)
        const dataVencimento = data;
    
        // Objeto com os dados para a API
        const dadosDespesa = {
            tipo,
            descricao,
            conta_id: parseInt(conta_id),
            categoria_id: parseInt(categoria_id),
            valor,
            data_vencimento: dataVencimento,
            data_efetivacao: dataEfetivacao,
            observacao,
            efetivada
        };


        try {
            // Mostrar indicador de carregamento
            $('#btnSalvarDespesa').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');
            
            console.log(dadosDespesa);
            await adicionar('transacoes', dadosDespesa);
            
            $('#novaDespesaModal').modal('hide');
            resetarFormulario();
            await atualizarTotalDespesas();
            await exibirDespesas(despesas);
    
            // Feedback de sucesso
            mostrarAlerta('Despesa salva com sucesso!', 'success');
    
            // Lógica para despesas recorrentes
            if (repetir) {
                // Implementar lógica de repetição conforme necessário
                for (let i = 1; i <= parseInt(repetirDespesa-1); i++) {
                    const novaDataVencimento = new Date(dataVencimento);
                    novaDataVencimento.setMonth(novaDataVencimento.getMonth() + i);
                    const novaDataVencimentoFormatada = novaDataVencimento.toISOString().split('T')[0];

                    const novaDespesa = {
                        ...dadosDespesa,
                        data_vencimento: novaDataVencimentoFormatada
                    };

                    adicionar('transacoes', novaDespesa);
                }
                

            }
    
        } catch (error) {
            console.error('Erro ao salvar despesa:', error);
            mostrarAlerta(error.message || 'Erro ao salvar despesa. Tente novamente.', 'danger');
        } finally {
            // Restaurar botão
            $('#btnSalvarDespesa').prop('disabled', false).text('Salvar Despesa');
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

    // Editar despesa existente
    function editarDespesa(id) {
        const despesa = despesas.find(r => r.id === id);

        if (!despesa) return;

        var valorFormatado = despesa.valor.toFixed(2).replace('.', ',');

        $('#novaDespesaModal').data('id', id);
        $('#despesaDescricao').val(despesa.descricao);
        $('#despesaValor').val(valorFormatado);
        $('#despesaData').val(despesa.data_vencimento);
        $('#despesaConta').val(despesa.conta_id);
        $('#despesaCategoria').val(despesa.categoria_id);
        $('#despesaEfetivada').prop('checked', despesa.efetivada);
        $('#despesaObservacao').val(despesa.observacao || '');
        $('#dataEfetivacao').val(despesa.data_efetivacao);
        $('#repeticaoSwitch').hide();
        
        if (despesa.efetivada) {
            $('#dataEfetivacaoContainer').show();
        } else {
            $('#dataEfetivacaoContainer').hide();
        }

        // Alterar o formulário para modo edição
        $('#formNovaDespesa').off('submit').submit(async function(e) {
            e.preventDefault();

            if (isSubmitting) return; // Se já estiver enviando, não faz nada

            isSubmitting = true; // trava envio
            $('#btnSalvarDespesa').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');

            console.log('Salvando 2');
            await atualizarDespesa(id); // Aguarda o salvamento terminar

            isSubmitting = false; // libera envio novamente
            $('#btnSalvarDespesa').prop('disabled', false).text('Salvar Despesa');
            
        });

        //alterar o modal-title de um modal expecifico
        $('#novaDespesaModal .modal-title').text('Editar Despesa');


        $('#novaDespesaModal').modal('show');
    }

    

    // Atualizar despesa existente
    async function atualizarDespesa(id) {
        const despesaAtualizada = {
            descricao: $('#despesaDescricao').val(),
            valor: parseFloat($('#despesaValor').val().replace('.', '').replace(',', '.')),
            data_vencimento: $('#despesaData').val(),
            data_efetivacao: $('#despesaEfetivada').is(':checked') ? $('#dataEfetivacao').val() : null,
            categoria_id: parseInt($('#despesaCategoria').val()), // Converte para inteiro $('#despesaCategoria').val(),
            conta_id: parseInt($('#despesaConta').val()), // Converte para inteiro $('#despesaConta').val(),
            efetivada: $('#despesaEfetivada').is(':checked'),
            observacao: $('#despesaObservacao').val()
        };

        console.log(despesaAtualizada);
    
        try {

            await atualizar('transacoes', id, despesaAtualizada);


            // Atualiza localmente
            const index = despesas.findIndex(r => r.id === id);
            if (index !== -1) {
                despesas[index] = despesaAtualizada;
            }

            await carregarDespesasIndexedDB();
    
            salvarDespesas();
            exibirDespesas(despesas);
            $('#novaDespesaModal').modal('hide');
            resetarFormulario();
            atualizarTotalDespesas();
    
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar a despesa. Tente novamente.');
        }
    }
    

    // Confirmar exclusão de despesa
    async function confirmarExclusao(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            await excluirDespesa(id);
            $('#novaDespesaModal').modal('hide');
        } else {
            $('#novaDespesaModal').modal('hide');
        }
    }

    // Excluir despesa
    async function excluirDespesa(id) {
        try {
            const despesaExcluida = {
                descricao: $('#despesaDescricao').val(),
                valor: parseFloat($('#despesaValor').val().replace('.', '').replace(',', '.')),
                data_vencimento: $('#despesaData').val(),
                data_efetivacao: $('#dataEfetivacao').val(),
                categoria_id: $('#despesaCategoria').val(),
                conta_id: $('#despesaConta').val(),
                efetivada: $('#despesaEfetivada').is(':checked'),
                observacao: $('#despesaObservacao').val()
            };

            deletar('transacoes', id);
            await carregarDespesasIndexedDB();
            salvarDespesas();
            exibirDespesas(despesas);
            $('#novaDespesaModal').modal('hide');
            resetarFormulario();
            atualizarTotalDespesas();
    
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar a despesa. Tente novamente.');
        }
        // despesas = despesas.filter(r => r.id !== id);
        // salvarDespesas();
        // exibirDespesas(despesas);
        // atualizarTotalDespesas();
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

        let despesasFiltradas = [...despesas];

        if (dataInicio) {
            despesasFiltradas = despesasFiltradas.filter(r => r.data >= dataInicio);
        }

        if (dataFim) {
            despesasFiltradas = despesasFiltradas.filter(r => r.data <= dataFim);
        }

        if (categoria) {
            despesasFiltradas = despesasFiltradas.filter(r => r.categoria === categoria);
        }

        if (valorMin) {
            despesasFiltradas = despesasFiltradas.filter(r => r.valor >= parseFloat(valorMin));
        }

        if (valorMax) {
            despesasFiltradas = despesasFiltradas.filter(r => r.valor <= parseFloat(valorMax));
        }

        if (status) {
            const efetivada = status === 'efetivado';
            despesasFiltradas = despesasFiltradas.filter(r => r.efetivada === efetivada);
        }

        if (descricao) {
            const termo = descricao.toLowerCase();
            despesasFiltradas = despesasFiltradas.filter(r => 
                r.descricao.toLowerCase().includes(termo)
            );
        }

        exibirDespesas(despesasFiltradas);
        $('#filtroAvancadoModal').modal('hide');
    }

    // Limpar filtros
    function limparFiltros() {
        $('#formFiltroAvancado')[0].reset();
        exibirDespesas(despesas);
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

    // Atualizar o total de despesas exibido
    async function atualizarTotalDespesas() {
        // const total = await getTotalDespesas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'), anoAtual);
        const totalE = await totalEfetivado(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'),'D');
        $('#despesasEfetivada').text( formatMoney(totalE) ); // Atualiza o elemento com o valor do total de despesas (total);
        // const total = await getTotalDespesas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'), anoAtual);

        const totalP = await totalPendente(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'),'D');
        $('#despesasPendente').text( formatMoney(totalP) ); // Atualiza o elemento com o valor do total de despesas (total);
    }

    // Salvar despesas no localStorage
    function salvarDespesas() {
        localStorage.setItem('noAzulDespesas', JSON.stringify(despesas));
    }

    // Resetar formulário
    function resetarFormulario() {
        $('#formNovaDespesa')[0].reset();
        $('#repeticaoOptions').hide();
        $('#formNovaDespesa').off('submit').submit(async function(e) {
            e.preventDefault();
            console.log('Salvando 1');
            await salvarDespesa();
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

    carregarContas('D');

    carregarCategorias('D');


});

