$(document).ready(function() {
    // Atualiza o mês/ano exibido
    updateMonthYear();

    // Configura o seletor de mês/ano
    setupMonthYearSelector();

    // Navegação para detalhes
    $('#totalReceitas').click(function() {
        window.location.href = 'receitas.html';
    });

    $('#totalDespesas').click(function() {
        window.location.href = 'despesas.html';
    });

    // Gerenciar orçamento
    $('#gerenciarOrcamento').click(function() {
        window.location.href = 'orcamentos.html';
    });

    // ver todas as categorias
    $('#moreCategories').click(function() {
        window.location.href = 'categorias.html';
    });

    // Configuração do botão "Ver Todas as Categorias"
    $('#verTodasCategorias').click(function() {
        toggleTodasCategorias();
    });

    // Configuração do botão de toggle
    $('#btnToggleCategorias').click(function() {
        toggleTodasCategorias();
    });    
        
    $('#confirmMonthYear').click(function() {
        Inicializacao();
    });

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
    function loadUltimasTransacoes(todasTransacoes) {

        const transacoes = [];
        
        todasTransacoes.forEach(transacao => {
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
                                <small class="text-muted">${transacao.categoria} • ${transacao.data}</small>
                            </div>                            
                        </div>
                        <span class="${valorClass}">${formatMoney(transacao.valor)} ${efetivadaBadge}</span>
                        
                    </div>
                </a>
            `;
        });

        $('#ultimasTransacoes').html(html);
    }

    function Inicializacao() {
        var mes = localStorage.getItem('selectedMonth');
        var ano = localStorage.getItem('selectedYear');

        endpointTotalDespesas(mes, ano);
        endpointTotalReceitas(mes, ano);
        endpointTodasTransacoes(mes, ano);

    }

    // Inicialização
    Inicializacao();
    
    // Configuração dos gráficos
    if (typeof initCharts === 'function') {
        initCharts();
    }

});

