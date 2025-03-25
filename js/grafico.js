function initOrcamentoChart(orcamentoData) {
    const ctx = document.getElementById('orcamentoChart').getContext('2d');
    
    const categorias = orcamentoData.map(item => item.categoria);
    const orcamentos = orcamentoData.map(item => item.orcamento);
    const gastos = orcamentoData.map(item => item.gasto);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categorias,
            datasets: [
                {
                    label: 'Orçamento',
                    data: orcamentos,
                    backgroundColor: 'rgba(13, 110, 253, 0.5)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gasto',
                    data: gastos,
                    backgroundColor: 'rgba(220, 53, 69, 0.5)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initAnoChart(anualData) {
    const ctx = document.getElementById('anoChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: anualData.meses,
            datasets: [
                {
                    label: 'Receitas',
                    data: anualData.receitas,
                    borderColor: 'rgba(13, 110, 253, 1)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: anualData.despesas,
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}