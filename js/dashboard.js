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

    // Carrega as últimas transações
    function loadUltimasTransacoes() {
        // Simulação de dados - na implementação real viria de uma API ou localStorage
        const transacoes = [
            { tipo: 'receita', descricao: 'Salário', valor: 2500, data: '05/03/2023', categoria: 'Salário', efetivada: true },
            { tipo: 'despesa', descricao: 'Supermercado', valor: 450, data: '10/03/2023', categoria: 'Alimentação', efetivada: true },
            { tipo: 'despesa', descricao: 'Combustível', valor: 180, data: '12/03/2023', categoria: 'Transporte', efetivada: true },
            { tipo: 'receita', descricao: 'Freelance', valor: 800, data: '15/03/2023', categoria: 'Freelance', efetivada: false },
            { tipo: 'despesa', descricao: 'Restaurante', valor: 120, data: '18/03/2023', categoria: 'Alimentação', efetivada: true }
        ];

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

    // Inicialização
    loadUltimasTransacoes();
    
    // Configuração dos gráficos
    if (typeof initCharts === 'function') {
        initCharts();
    }
});