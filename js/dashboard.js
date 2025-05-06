//importar funcoes do arquivo IndexedDB.js
import { adicionar, listar, atualizar, deletar, totalTransacao, ultimasTransacoes,listarOrcamentos,listarContas } from './indexedDB.js';
import { updateMonthYear, formatMoney, setupMonthYearSelector } from './script.js';

$(document).ready(function() {
    // Atualiza o mês/ano exibido
    updateMonthYear(localStorage.getItem('selectedMonth'), localStorage.getItem('selectedYear'));

    // Configura o seletor de mês/ano
    setupMonthYearSelector();

    // Navegação para detalhes
    $('#totalReceitas').off('click').on('click', function () {
        window.location.href = 'receitas.html';
    });

    $('#totalDespesas').off('click').on('click', function () {
        window.location.href = 'despesas.html';
    });

    // Gerenciar orçamento
    $('#gerenciarOrcamento').off('click').on('click', function () {
        window.location.href = 'orcamentos.html';
    });

    // ver todas as categorias
    $('#moreCategories').off('click').on('click', function () {
        window.location.href = 'categorias.html';
    });

    // Configuração do botão "Ver Todas as Categorias"
    $('#verTodasCategorias').off('click').on('click', function () {
        toggleTodasCategorias();
    });

    // Configuração do botão de toggle
    $('#btnToggleCategorias').off('click').on('click', function () {
        toggleTodasCategorias();
    });    
        

    //quando o modal monthYearModal fechar 
    $('#monthYearModal').on('hidden.bs.modal', function () {
        Inicializacao();
    })

    // executar endpoint para carregar total despesa com token
     function endpointTotalDespesas(mes, ano) {
        const token = localStorage.getItem('authToken');
        const url = 'https://apinoazul.markethubplace.com/api/total-despesas/'+mes+'/'+ano; // Substitua pela URL correta

        console.log("Token:", token);   
        $.ajax({
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            method: 'GET',
            success: function(response) {
                const totalDespesas = response.total;
                //formatar total despesas para exibir no dashboard
                $('#totalDespesas').text(formatMoney(totalDespesas));
            },
            error: function(xhr, status, error) {
                console.log('Erro ao obter o total de despesas: ' + error);
            }
        })
    }

    // executar endpoint para carregar total receita com token
    function endpointTotalReceitas(mes, ano) {
        const token = localStorage.getItem('authToken');
        const url = 'https://apinoazul.markethubplace.com/api/total-receitas/'+mes+'/'+ano; // Substitua pela URL correta

        console.log("Token:", token);   
        $.ajax({
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            method: 'GET',
            success: function(response) {
                const totalReceitas = response.total;
                //formatar total receitas para exibir no dashboard
                $('#totalReceitas').text(formatMoney(totalReceitas));
            },
            error: function(xhr, status, error) {
                console.log('Erro ao obter o total de receitas: ' + error);
            }
        })
    }

    //total receitas usando function totalReceitas
    async function totalReceitasIndexedDB(mes, ano) {
        const totalReceita = await totalTransacao(mes, ano, 'R');
        $('#totalReceitas').text(formatMoney(totalReceita));
    }
    async function totalDespesasIndexedDB(mes, ano) {
        const totalReceita = await totalTransacao(mes, ano, 'D');
        $('#totalDespesas').text(formatMoney(totalReceita));
    }

    //endpoint para criar um array de totas as tranações conforme na função loadUltimasTransacoes
    function endpointTodasTransacoes(mes, ano) {
        const token = localStorage.getItem('authToken');
        const url = 'https://apinoazul.markethubplace.com/api/transacoes-recentes/'+mes+'/'+ano+'/5'; // Substitua pela URL correta

        console.log("Token:", token);   
        $.ajax({
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            method: 'GET',
            success: function(response) {
                
                loadUltimasTransacoes(response);
            },
            error: function(xhr, status, error) {
                console.log('Ultimas transações: ' + error);
            }
        })
    }

    // Função para alternar a visibilidade de todas as categorias
    function toggleTodasCategorias() {
        const $container = $('#todasCategoriasContainer');
        const $btnVerTodas = $('#verTodasCategorias');
        const $btnToggle = $('#btnToggleCategorias');
        
        if ($container.is(':visible')) {
            $container.slideUp();
            $btnVerTodas.html('<i class="bi bi-eye"></i> Ver Todas');
            $btnToggle.html('<i class="bi bi-chevron-down"></i> Ver mais categorias');
        } else {
            $container.slideDown();
            $btnVerTodas.html('<i class="bi bi-eye-slash"></i> Ocultar');
            $btnToggle.html('<i class="bi bi-chevron-up"></i> Ver menos categorias');
        }
    }


    // Carrega as últimas transações
    async function loadUltimasTransacoes(mes,ano) {

        const todasTransacoes = await ultimasTransacoes(mes,ano);
        console.log(todasTransacoes);

        const transacoes = [];
        
        todasTransacoes.forEach(transacao => {
            console.log(transacao.tipo);
            transacoes.push({
                tipo: transacao.tipo === 'R' ? 'receita' : 'despesa',
                descricao: transacao.descricao,
                valor: parseFloat(transacao.valor),
                data: transacao.data_vencimento,
                categoria: transacao.categoria,
                efetivada: transacao.data_efetivacao !== null
            });
        });


        let html = '';
        transacoes.forEach(transacao => {
            const icon = transacao.tipo === 'receita' ? 
                '<i class="bi bi-arrow-down-circle text-success me-2"></i>' : 
                '<i class="bi bi-arrow-up-circle text-danger me-2"></i>';
            //formatar transacao.data 2025-04-15 para 15/04
            const dataStr = transacao.data;
            const dataParts = dataStr.split('-');
            const data = `${dataParts[2]}/${dataParts[1]}`;
            const valorClass = transacao.tipo === 'receita' ? 'text-success' : 'text-danger';
            const efetivadaClass = transacao.efetivada ? '' : 'text-muted';
            const efetivadaBadge = transacao.efetivada ? 
                '<span class="badge bg-success ms-2">E</span>' : 
                '<span class="badge bg-secondary ms-2">P</span>';
            
            html += `
                <a href="#" class="list-group-item list-group-item-action ${efetivadaClass}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            ${icon}
                            <div>
                                <h6 class="mb-0">${transacao.descricao}</h6>
                                <small class="text-muted">${transacao.categoria} • ${data}</small>
                            </div>                            
                        </div>
                        <span class="${valorClass}">${formatMoney(transacao.valor)} ${efetivadaBadge}</span>
                        
                    </div>
                </a>
            `;
        });

        $('#ultimasTransacoes').html(html);
    }

    async function Inicializacao() {
        var mes = localStorage.getItem('selectedMonth');
        var ano = localStorage.getItem('selectedYear');

        // endpointTotalDespesas(mes, ano);
        // endpointTotalReceitas(mes, ano);    
        await carregarContas(); 
        await totalReceitasIndexedDB(mes, ano);
        await totalDespesasIndexedDB(mes, ano);
        await loadUltimasTransacoes(mes,ano);
        await carregarResumoOrcamentos();    
        // endpointTodasTransacoes(mes, ano);

    }

    async function carregarContas() {

        const $contas = $('#saldoContas');
        $contas.empty();
        
        const lista = await listarContas('A');

        console.log(lista);
        
        lista.forEach(conta => {
            $contas.append(`
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${conta.nome}</span>
                        <strong class="text-success">${formatMoney(conta.saldo_atual)}</strong>
                    </div>`);
        })

    }


    async function carregarResumoOrcamentos() {
        const $listarOrcamento = $('.listar-orcamento');
        let $moreOrcamentos = '';
        let $moreBotao = '';
        $listarOrcamento.empty();


        let contador = 1;

        const mes = localStorage.getItem('selectedMonth');
        const ano = localStorage.getItem('selectedYear');
    
        const lista = await listarOrcamentos(mes, ano);

        //ordenar por maior percentual para o menor
        lista.sort((a, b) => b.percentual - a.percentual);

        lista.forEach(categoria => {
            console.log($listarOrcamento.children().length);
            // os 3 primeiros orçamentos
            if (contador <= 3) {

                $listarOrcamento.append(`
                    <div class="mb-4">
                        <h6 class="small font-weight-bold">${categoria.categoria} <span class="float-end">${categoria.percentual}%</span></h6>
                        <div class="progress mb-3">
                            <div class="progress-bar ${getBarColor(categoria.percentual)}" role="progressbar" style="width: ${categoria.percentual}%"></div>
                        </div>
                        <small class="text-muted">${formatMoney(categoria.valor)} de ${formatMoney(categoria.total_gasto)}</small>
                    </div>
                `);
            } else {
                $moreOrcamentos += `
                    <div class="mb-4">
                        <h6 class="small font-weight-bold">${categoria.categoria} <span class="float-end">${categoria.percentual}%</span></h6>
                        <div class="progress mb-3">
                            <div class="progress-bar ${getBarColor(categoria.percentual)}" role="progressbar" style="width: ${categoria.percentual}%"></div>
                        </div>
                        <small class="text-muted">${formatMoney(categoria.valor)} de ${formatMoney(categoria.total_gasto)}</small>
                    </div>
                `;
            };

            contador++;
        });

        $moreBotao += `
            <div class="text-center">
                <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#moreOrcamentos" aria-expanded="false" aria-controls="moreCategories">
                    <i class="bi bi-chevron-down"></i>
                </button>
            </div>
        `;

        $listarOrcamento.append(`<div class="collapse" id="moreOrcamentos">${$moreOrcamentos}</div>${$moreBotao}`);

        console.log('Lista de categorias:', lista);
    
        
    }
    
    // Utilitário opcional para definir a cor com base no percentual
    function getBarColor(percentual) {
        percentual = parseInt(percentual);
        if (percentual < 25) return 'bg-info';
        if (percentual < 50) return 'bg-success';
        if (percentual < 75) return 'bg-warning';
        if (percentual < 100) return 'bg-danger';
        return 'bg-danger';
    }
    

    // Inicialização
    Inicializacao();
    
    // Configuração dos gráficos
    if (typeof initCharts === 'function') {
        initCharts();
    }

});

