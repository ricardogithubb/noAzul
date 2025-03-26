function initCharts() {
    // Gráfico anual
    // Gráfico anual em linhas
const annualCtx = document.getElementById('annualChart').getContext('2d');
const annualChart = new Chart(annualCtx, {
    type: 'line', // Alterado para tipo 'line'
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [
            {
                label: 'Receitas',
                backgroundColor: 'rgba(78, 115, 223, 0.2)', // Fundo mais claro para preenchimento
                borderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 2, // Linha mais grossa
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: '#fff',
                pointRadius: 4, // Tamanho dos pontos
                pointHoverRadius: 6,
                fill: true, // Preenchimento abaixo da linha
                tension: 0.3, // Suavização das curvas
                data: [5000, 4500, 5250, 10000, 7896, 12098, 4599, 0, 0, 0, 0, 0]
            },
            {
                label: 'Despesas',
                backgroundColor: 'rgba(231, 74, 59, 0.2)',
                borderColor: 'rgba(231, 74, 59, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(231, 74, 59, 1)',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3,
                data: [3200, 3500, 3780, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        ]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return 'R$ ' + value.toLocaleString('pt-BR');
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true, // Estilo mais compacto para a legenda
                    padding: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + formatMoney(context.raw);
                    }
                },
                mode: 'index',
                intersect: false
            }
        },
        interaction: {
            intersect: false,
            mode: 'nearest'
        }
    }
});

// Função auxiliar para formatar valores monetários
function formatMoney(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

    // Gráfico de orçamento (no dashboard)
    const orcamentoCtx = document.getElementById('orcamentoChart').getContext('2d');
    const orcamentoChart = new Chart(orcamentoCtx, {
        type: 'line',
        data: {
            labels: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Outros'],
            datasets: [{
                data: [750, 1200, 600, 300, 630],
                backgroundColor: [
                    'rgba(28, 200, 138, 0.8)',
                    'rgba(78, 115, 223, 0.8)',
                    'rgba(54, 185, 204, 0.8)',
                    'rgba(246, 194, 62, 0.8)',
                    'rgba(231, 74, 59, 0.8)'
                ],
                borderColor: [
                    'rgba(28, 200, 138, 1)',
                    'rgba(78, 115, 223, 1)',
                    'rgba(54, 185, 204, 1)',
                    'rgba(246, 194, 62, 1)',
                    'rgba(231, 74, 59, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatMoney(context.raw);
                        }
                    }
                }
            }
        }
    });

    // Gráfico de orçamento (na página de orçamentos)
    if (document.getElementById('orcamentoBarChart')) {
        const orcamentoBarCtx = document.getElementById('orcamentoBarChart').getContext('2d');
        const orcamentoBarChart = new Chart(orcamentoBarCtx, {
            type: 'bar',
            data: {
                labels: ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'],
                datasets: [{
                    label: 'Orçado',
                    backgroundColor: 'rgba(78, 115, 223, 0.8)',
                    data: [1000, 1500, 600, 500, 300, 400, 700]
                }, {
                    label: 'Gasto',
                    backgroundColor: 'rgba(231, 74, 59, 0.8)',
                    data: [750, 1200, 550, 450, 280, 350, 600]
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatMoney(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Inicializa os gráficos quando o DOM estiver pronto
$(document).ready(function() {
    if ($('#annualChart, #orcamentoChart, #orcamentoBarChart').length) {
        initCharts();
    }
});