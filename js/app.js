$(document).ready(function() {
    // Atualiza o dropdown de mês/ano
    updateMonthYearDropdown();
    
    // Carrega os dados do dashboard
    loadDashboardData();
    
    // Configura eventos
    setupEventListeners();
});

function updateMonthYearDropdown() {
    const currentDate = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Atualiza o texto do botão
    $('#monthYearDropdown').text(`${months[currentMonth]} ${currentYear}`);
    $('.current-year').text(currentYear);
    
    // Destaca o mês atual
    $('.month-item').removeClass('current-month');
    $(`.month-item:eq(${currentMonth})`).addClass('current-month');
}

function loadDashboardData() {
    // Simulação de dados - na implementação real, isso viria de uma API
    const dashboardData = {
        totalReceitas: 5250.00,
        totalDespesas: 3890.00,
        ultimasTransacoes: [
            { data: '15/03/2023', descricao: 'Salário', categoria: 'Rendimento', valor: 3500.00, tipo: 'receita' },
            { data: '10/03/2023', descricao: 'Aluguel', categoria: 'Moradia', valor: 1200.00, tipo: 'despesa' },
            { data: '05/03/2023', descricao: 'Supermercado', categoria: 'Alimentação', valor: 450.00, tipo: 'despesa' },
            { data: '03/03/2023', descricao: 'Freelance', categoria: 'Rendimento', valor: 800.00, tipo: 'receita' },
            { data: '01/03/2023', descricao: 'Internet', categoria: 'Telefonia', valor: 120.00, tipo: 'despesa' }
        ],
        orcamento: [
            { categoria: 'Alimentação', orcamento: 800.00, gasto: 450.00 },
            { categoria: 'Moradia', orcamento: 1500.00, gasto: 1200.00 },
            { categoria: 'Transporte', orcamento: 500.00, gasto: 320.00 },
            { categoria: 'Lazer', orcamento: 300.00, gasto: 150.00 },
            { categoria: 'Saúde', orcamento: 400.00, gasto: 210.00 }
        ],
        anual: {
            meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            receitas: [3200, 3500, 5250, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            despesas: [2800, 3100, 3890, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    };
    
    // Atualiza totais
    $('#total-receitas').text(`R$ ${dashboardData.totalReceitas.toFixed(2).replace('.', ',')}`);
    $('#total-despesas').text(`R$ ${dashboardData.totalDespesas.toFixed(2).replace('.', ',')}`);
    
    // Preenche últimas transações
    const transacoesHtml = dashboardData.ultimasTransacoes.map(transacao => {
        const valorClass = transacao.tipo === 'receita' ? 'text-success' : 'text-danger';
        return `
            <tr>
                <td>${transacao.data}</td>
                <td>${transacao.descricao}</td>
                <td>${transacao.categoria}</td>
                <td class="${valorClass}">R$ ${transacao.valor.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    $('#ultimas-transacoes').html(transacoesHtml);
    
    // Preenche orçamento
    const orcamentoHtml = dashboardData.orcamento.map(item => {
        const saldo = item.orcamento - item.gasto;
        const saldoClass = saldo >= 0 ? 'text-success' : 'text-danger';
        return `
            <tr>
                <td>${item.categoria}</td>
                <td>R$ ${item.orcamento.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${item.gasto.toFixed(2).replace('.', ',')}</td>
                <td class="${saldoClass}">R$ ${saldo.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    $('#orcamento-table').html(orcamentoHtml);
    
    // Inicializa gráficos
    initOrcamentoChart(dashboardData.orcamento);
    initAnoChart(dashboardData.anual);
}

function setupEventListeners() {
    // Navegação entre anos
    $('.prev-year').click(function() {
        const currentYear = parseInt($('.current-year').text());
        $('.current-year').text(currentYear - 1);
    });
    
    $('.next-year').click(function() {
        const currentYear = parseInt($('.current-year').text());
        $('.current-year').text(currentYear + 1);
    });
    
    // Seleção de mês
    $('.month-item').click(function() {
        const monthIndex = $('.month-item').index(this);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const year = $('.current-year').text();
        
        $('.month-item').removeClass('current-month');
        $(this).addClass('current-month');
        $('#monthYearDropdown').text(`${months[monthIndex]} ${year}`);
        
        // Aqui você carregaria os dados do mês selecionado
        // loadMonthData(monthIndex + 1, year);
    });
    
    // Logout
    $('.logout-btn').click(function() {
        // Implementar lógica de logout
        window.location.href = 'index.html';
    });
}