import { adicionar, 
         listar, 
         atualizar, 
         deletar, 
         listarReceitas, 
         totalEfetivado, 
         totalPendente,
         listarReceitasFiltro } from './indexedDB.js';
import { carregarContas, carregarCategorias, formatarDataExtenso } from './script.js';
$(document).ready(function() {
    // Variáveis globais
    let receitas = [];
    let categorias = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
    let mesAtual = localStorage.getItem('selectedMonth'); // || new Date().getMonth();
    let anoAtual = localStorage.getItem('selectedYear'); // || new Date().getFullYear();
    let isSubmitting = false; // <- Adiciona essa variável global no início do seu $(document).ready(function() { })
    const dataAtual = new Date().toISOString().split('T')[0];
    let repetirReceita = 1;

    // Aplica a máscara de valor no campo de receitaValor
    $('#receitaValor').mask('###.###.###.###.###,00', {reverse: true});   

    // Inicialização
    init();

    async function init() {  
        carregarReceitasIndexedDB();              
        setupEventListeners();
        atualizarTotalReceitas();
        popularFiltros();
        limparFiltrosAvancados();
    }

    $('#receitaEfetivada').change(function() {
        if ($(this).is(':checked')) {
            $('#dataEfetivacaoContainer').show();
            $('#dataEfetivacao').val($('#receitaData').val());
        } else {
            $('#dataEfetivacaoContainer').hide();
            $('#dataEfetivacao').val('');
        }
    });


    $('.transactions-list').on('click', '.transaction-item', function() {
        const transactionId = $(this).data('id');
        editarReceita(transactionId);
    });


    $('#confirmMonthYear').on('click', function () {
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
    $('#formFiltroAvancado').submit(async function(e) {
        e.preventDefault();

        const mes = localStorage.getItem('selectedMonth');
        const ano = localStorage.getItem('selectedYear');

        await aplicarFiltrosAvancados(mes, ano);


    });

    // Botão para limpar filtros
    $('#limparFiltros').on('click', function () {
        limparFiltrosAvancados();
    });


    async function carregarReceitasIndexedDB() {
        const listaReceitas = await listarReceitas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'));
        
        const dadosSalvos = JSON.stringify(listaReceitas);

        //ordernar dadosSalvos da maior data para a menor
        

        if (dadosSalvos) {
            receitas = JSON.parse(dadosSalvos);
            receitas.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));
        } else {
            // Dados de exemplo
            receitas = [];
        }
        
        exibirReceitas(receitas);
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
        // console.log('Exibindo receitas...');
        // console.log(listaTransacoes);
        const $container = $('.transactions-list');
        $container.empty();
    
        if (listaTransacoes.length === 0) {
            $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
            return;
        }

        
        let printData = "";
        // console.log(listaTransacoes);

        listaTransacoes.forEach(receita => {
            const dataFormatada = formatarDataExtenso(receita.data_vencimento);
            const valorFormatado = formatMoney(receita.valor);
            const status = receita.data_efetivacao != null ? 
                '<span style="display: inline-block; width: 15px; height: 15px; background-color: green; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>' : 
                '<span style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>';
            
            //verificar se dataFormatada é diferente de printData
            // console.log(dataFormatada+" != "+printData);
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
    
    }

    // Configura os event listeners
    function setupEventListeners() {
        // Formulário de nova receita
        $('#formNovaReceita').submit(async function(e) {
            //desativar o botão de salvar
            e.preventDefault();

            if (isSubmitting) return; // Se já estiver enviando, não faz nada

            isSubmitting = true; // trava envio
            $('#btnSalvarReceita').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');

            console.log('Salvando 2');
            await salvarReceita(); // Aguarda o salvamento terminar

            await carregarReceitasIndexedDB();

            isSubmitting = false; // libera envio novamente
            $('#btnSalvarReceita').prop('disabled', false).text('Salvar Receita');
        });

        //ao abrir o modal de nova receita, limpar os campos
        $('#novaReceitaModal').on('show.bs.modal', function() {            
            const dataId = $('#novaReceitaModal').data('id');
            if(dataId === 0) {
                $('#receitaData').val(dataAtual);
            }            
        });

        //ao fechar o modal de nova receita, limpar os campos
        $('#novaReceitaModal').on('hidden.bs.modal', function() {
            $('#receitaDescricao').val(''); // Limpa o campo de descrição
            $('#receitaValor').val(''); // Limpa o campo de valor
            //definir data atual
            $('#receitaData').val(dataAtual);
            $('#dataEfetivacao').val('');
            $('#receitaConta').val(''); // Limpa o campo de conta
            $('#receitaCategoria').val(''); // Limpa o campo de categoria
            $('#receitaEfetivada').prop('checked', false); // Desmarca a opção de efetivada
            $('#receitaObservacao').val(''); // Limpa o campo de observação
            //alterar o model-title de um modal expecifico
            $('#novaReceitaModal .modal-title').text('Nova Receita');
            $('#dataEfetivacaoContainer').hide();
            $('#repeticaoContainer').removeClass('d-none');
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


        $('#btnExcluirReceita').off('click').on('click', function () {
            const id = $("#novaReceitaModal").data('id');
            confirmarExclusao(id);
        });


        // Alternar opções de repetição
        $('#receitaRepetir').change(function() {
            $('#repeticaoOptions').toggle(this.checked);
        });

        // Alterar repetirDespesa ao alterar input de repetição
        $('#repetirReceita').on('change', function() {
            repetirReceita = $('#repetirReceita').val();
        })
    }

    // Salva uma nova receita
    async function salvarReceita() {
        // Obter valores do formulário
        const descricao = $('#receitaDescricao').val().trim();
        const valor = parseFloat($('#receitaValor').val().replace('.', '').replace(',', '.'));
        const data = $('#receitaData').val();
        const categoria_id = $('#receitaCategoria').val();
        const efetivada = $('#receitaEfetivada').is(':checked');
        const observacao = $('#receitaObservacao').val().trim();
        const conta_id = $('#receitaConta').val(); // Adicione um select para contas no formulário
        const repetir = $('#receitaRepetir').is(':checked');
        const tipo = 'R';
    
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
            tipo,
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
            
            console.log(dadosReceita);
            adicionar('transacoes', dadosReceita);
            
            $('#novaReceitaModal').modal('hide');
            resetarFormulario();
            atualizarTotalReceitas();
            exibirReceitas(receitas);
    
            // Feedback de sucesso
            mostrarAlerta('Receita salva com sucesso!', 'success');
    
            // Lógica para receitas recorrentes
            if (repetir) {
                // Implementar lógica de repetição conforme necessário
                for (let i = 1; i <= parseInt(repetirReceita-1); i++) {
                    const novaDataVencimento = new Date(dataVencimento);
                    novaDataVencimento.setMonth(novaDataVencimento.getMonth() + i);
                    const novaDataVencimentoFormatada = novaDataVencimento.toISOString().split('T')[0];
                 alert(novaDataVencimentoFormatada);
                    const novaReceita = {
                        ...dadosReceita,
                        data_vencimento: novaDataVencimentoFormatada
                    };
                    console.log(novaReceita);
                    adicionar('transacoes', novaReceita);
                }
                

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

        var valorFormatado = receita.valor.toFixed(2).replace('.', ',');

        $('#novaReceitaModal').data('id', id);
        $('#receitaDescricao').val(receita.descricao);
        $('#receitaValor').val(valorFormatado);
        $('#receitaData').val(receita.data_vencimento);
        $('#receitaConta').val(receita.conta_id);
        $('#receitaCategoria').val(receita.categoria_id);
        $('#receitaEfetivada').prop('checked', receita.efetivada);
        $('#receitaObservacao').val(receita.observacao || '');
        $('#dataEfetivacao').val(receita.data_efetivacao);
        $('#repeticaoSwitch').hide();
        $('#repeticaoContainer').addClass('d-none');
        
        if (receita.efetivada) {
            $('#dataEfetivacaoContainer').show();
        } else {
            $('#dataEfetivacaoContainer').hide();
        }

        // Alterar o formulário para modo edição
        $('#formNovaReceita').off('submit').submit(async function(e) {
            e.preventDefault();

            if (isSubmitting) return; // Se já estiver enviando, não faz nada

            isSubmitting = true; // trava envio
            $('#btnSalvarReceita').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');

            console.log('Salvando 2');
            await atualizarReceita(id); // Aguarda o salvamento terminar

            isSubmitting = false; // libera envio novamente
            $('#btnSalvarReceita').prop('disabled', false).text('Salvar Receita');
            
        });

        //alterar o modal-title de um modal expecifico
        $('#novaReceitaModal .modal-title').text('Editar Receita');


        $('#novaReceitaModal').modal('show');
    }

    

    // Atualizar receita existente
    async function atualizarReceita(id) {
        const receitaAtualizada = {
            descricao: $('#receitaDescricao').val(),
            valor: parseFloat($('#receitaValor').val().replace('.', '').replace(',', '.')),
            data_vencimento: $('#receitaData').val(),
            data_efetivacao: $('#receitaEfetivada').is(':checked') ? $('#dataEfetivacao').val() : null,
            categoria_id: parseInt($('#receitaCategoria').val()), // Converte para inteiro $('#receitaCategoria').val(),
            conta_id: parseInt($('#receitaConta').val()), // Converte para inteiro $('#receitaConta').val(),
            efetivada: $('#receitaEfetivada').is(':checked'),
            observacao: $('#receitaObservacao').val()
        };

        console.log(receitaAtualizada);
    
        try {

            await atualizar('transacoes', id, receitaAtualizada);

            // const response = await fetch(`https://apinoazul.markethubplace.com/api/receitas/${id}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Bearer ' + localStorage.getItem('authToken') // Assumindo autenticação JWT
            //     },
            //     body: JSON.stringify(receitaAtualizada)
            // });
    
            // if (!response.ok) {
            //     throw new Error('Erro ao atualizar a receita.');
            // }
    
            // const receitaResposta = await response.json();
    
            // Atualiza localmente
            const index = receitas.findIndex(r => r.id === id);
            if (index !== -1) {
                receitas[index] = receitaAtualizada;
            }

            await carregarReceitasIndexedDB();
    
            salvarReceitas();
            exibirReceitas(receitas);
            $('#novaReceitaModal').modal('hide');
            resetarFormulario();
            atualizarTotalReceitas();
    
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar a receita. Tente novamente.');
        }
    }
    

    // Confirmar exclusão de receita
    async function confirmarExclusao(id) {
        if (confirm('Tem certeza que deseja excluir esta receita?')) {
            await excluirReceita(id);
            $('#novaReceitaModal').modal('hide');
        } else {
            $('#novaReceitaModal').modal('hide');
        }
    }

    // Excluir receita
    async function excluirReceita(id) {
        try {
            const receitaExcluida = {
                descricao: $('#receitaDescricao').val(),
                valor: parseFloat($('#receitaValor').val().replace('.', '').replace(',', '.')),
                data_vencimento: $('#receitaData').val(),
                data_efetivacao: $('#dataEfetivacao').val(),
                categoria_id: $('#receitaCategoria').val(),
                conta_id: $('#receitaConta').val(),
                efetivada: $('#receitaEfetivada').is(':checked'),
                observacao: $('#receitaObservacao').val()
            };

            // const response = await fetch(`https://apinoazul.markethubplace.com/api/receitas/${id}`, {
            //     method: 'DELETE',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': 'Bearer ' + localStorage.getItem('authToken') // Assumindo autenticação JWT
            //     },
            //     body: receitaExcluida
            // });
    
            // if (!response.ok) {
            //     throw new Error('Erro ao excluir a receita.');
            // }

            deletar('transacoes', id);
            await carregarReceitasIndexedDB();
            salvarReceitas();
            exibirReceitas(receitas);
            $('#novaReceitaModal').modal('hide');
            resetarFormulario();
            atualizarTotalReceitas();
    
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar a receita. Tente novamente.');
        }
        // receitas = receitas.filter(r => r.id !== id);
        // salvarReceitas();
        // exibirReceitas(receitas);
        // atualizarTotalReceitas();
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
        // const total = await getTotalReceitas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'), anoAtual);
        const totalE = await totalEfetivado(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'),'R');
        $('#receitasEfetivada').text( formatMoney(totalE) ); // Atualiza o elemento com o valor do total de receitas (total);
        // const total = await getTotalReceitas(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'), anoAtual);

        const totalP = await totalPendente(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'),'R');
        $('#receitasPendente').text( formatMoney(totalP) ); // Atualiza o elemento com o valor do total de receitas (total);
    }

    // Salvar receitas no localStorage
    function salvarReceitas() {
        localStorage.setItem('noAzulReceitas', JSON.stringify(receitas));
    }

    // Resetar formulário
    function resetarFormulario() {
        $('#formNovaReceita')[0].reset();
        $('#repeticaoOptions').hide();
        $('#formNovaReceita').off('submit').submit(async function(e) {
            e.preventDefault();
            console.log('Salvando 1');
            await salvarReceita();
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

    async function limparFiltrosAvancados() {
        return new Promise(async (resolve, reject) => {
            $('#formFiltroAvancado')[0].reset();

            const mes = localStorage.getItem('selectedMonth');
            const ano = localStorage.getItem('selectedYear');

            await aplicarFiltrosAvancados(mes, ano);

            $('#filtroAvancadoIconFill').addClass('d-none');
            $('#filtroAvancadoIcon').removeClass('d-none');

            $('#filtroAvancadoModal').modal('hide');
            resolve();
        })
    }

    async function aplicarFiltrosAvancados(mes, ano) {
        return new Promise(async (resolve, reject) => {
            
            const dataInicio = document.getElementById('filtroDataInicio').value;
            const dataFim = document.getElementById('filtroDataFim').value;
            const categorias = Array.from(document.getElementById('filtroCategoria').selectedOptions).map(opt => parseInt(opt.value));
            const valorMin = document.getElementById('filtroValorMin').value;
            const valorMax = document.getElementById('filtroValorMax').value;
            const statusEfetivado = document.getElementById('filtroStatusEfetivado').checked;
            const statusPendente = document.getElementById('filtroStatusPendente').checked;
            const descricao = document.getElementById('filtroDescricao').value.trim();
    
            // Monta o objeto de filtros
            const filtros = {
                dataInicio: dataInicio || null,
                dataFim: dataFim || null,
                categorias: categorias.length ? categorias : null,
                valorMin: valorMin ? parseFloat(valorMin) : null,
                valorMax: valorMax ? parseFloat(valorMax) : null,
                status: [],
                descricao: descricao || null,
                mes: parseInt(mes),
                ano: parseInt(ano)
            };
    
            if (statusEfetivado) filtros.status.push('efetivado');
            if (statusPendente) filtros.status.push('pendente');
    
            console.log('Filtros aplicados:', filtros);
    
            const { transacoes, totalEfetivado, totalPendente } = await listarReceitasFiltro(filtros);
    
             $('#receitasEfetivada').text( formatMoney(totalEfetivado) ); // Atualiza o elemento com o valor do total de receitas efetivadas
             $('#receitasPendente').text( formatMoney(totalPendente) ); // Atualiza o elemento com o valor do total de receitas pendentes
    
             exibirReceitas(transacoes);

             
            $('#filtroAvancadoIcon').addClass('d-none');
            $('#filtroAvancadoIconFill').removeClass('d-none');

             resolve();
        })
    }


    carregarContas('R');

    carregarCategorias('R');


});

