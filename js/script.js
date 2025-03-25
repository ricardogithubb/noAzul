$(document).ready(function() {
    // Atualiza o gráfico anual
    renderAnnualChart();

    // Define o mês/ano atual
    const currentDate = new Date();
    updateMonthYearDisplay(currentDate.getMonth(), currentDate.getFullYear());
    
    // Evento para seleção de mês
    $('.month-btn').click(function() {
        const month = $(this).data('month');
        const year = $('#yearSelect').val();
        updateMonthYearDisplay(month, year);
        $('#monthYearModal').modal('hide');
    });
    
    // Evento para mudança de ano
    $('#yearSelect').change(function() {
        const year = $(this).val();
        const currentMonth = $('.month-btn.active').data('month') || 0;
        updateMonthYearDisplay(currentMonth, year);
    });

    // Adicione no início do arquivo
    let receitas = [
        { id: 1, data: '2023-03-15', descricao: 'Salário', categoria: 'Rendimento', valor: 3500.00, recorrente: true },
        { id: 2, data: '2023-03-01', descricao: 'Freelance', categoria: 'Rendimento', valor: 1750.00, recorrente: false }
    ];

    let despesas = [
        { id: 1, data: '2023-03-10', descricao: 'Aluguel', categoria: 'Moradia', valor: 1200.00, recorrente: true },
        { id: 2, data: '2023-03-05', descricao: 'Supermercado', categoria: 'Alimentação', valor: 450.00, recorrente: true }
    ];
    
    // Configura os eventos dos cards de receitas e despesas
    $('#receitasCard').click(function() {
        window.location.href = 'receitas-detalhes.html';
    });
    
    $('#despesasCard').click(function() {
        window.location.href = 'despesas-detalhes.html';
    });

    // Lógica para salvar nova receita
    $('#salvarReceita').click(function() {
        const novaReceita = {
            data: $('#dataReceita').val(),
            descricao: $('#descricaoReceita').val(),
            categoria: $('#categoriaReceita').val(),
            valor: $('#valorReceita').val(),
            recorrente: $('#receitaRecorrente').is(':checked')
        };
        
        // Aqui você adicionaria a lógica para salvar no array/banco de dados
        console.log('Nova receita:', novaReceita);
        alert('Receita cadastrada com sucesso!');
        $('#novaReceitaModal').modal('hide');
        
        // Recarregar a listagem
        carregarReceitas();
    });
    
    // // Configura a seleção de mês/ano
    // $('.month-btn').click(function() {
    //     const month = $(this).data('month');
    //     const year = $('#yearSelect').val();
    //     const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
    //                       "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
    //     $('#currentMonthYear').text(monthNames[month] + ' ' + year);
    //     $('#monthYearModal').modal('hide');
        
    //     // Aqui você pode adicionar a lógica para atualizar os dados com o novo mês/ano
    //     updateDashboardData(month, year);
    // });
    
    // Configura o botão de logout
    $('#logoutBtn').click(function() {
        logout();
    });
});

// Função para carregar receitas
function carregarReceitas() {
    // Implemente a lógica para carregar do armazenamento local
}



function renderAnnualChart() {
    const ctx = document.getElementById('annualChart').getContext('2d');
    const annualChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Receitas',
                    backgroundColor: '#0d6efd',
                    data: [4500, 4800, 5250, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                },
                {
                    label: 'Despesas',
                    backgroundColor: '#dc3545',
                    data: [3200, 3500, 3780, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                },
                y: {
                    stacked: false,
                    beginAtZero: true
                }
            }
        }
    });
}

function updateDashboardData(month, year) {
    // Esta função seria responsável por atualizar todos os dados do dashboard
    // com base no mês e ano selecionados
    console.log(`Atualizando dados para ${month}/${year}`);
    // Aqui você faria requisições AJAX para buscar os novos dados
}

function logout() {
    // Limpa os dados de autenticação e redireciona para a tela de login
    localStorage.removeItem('userToken');
    window.location.href = 'index.html';
}

function updateMonthYearDisplay(month, year) {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    // Atualiza o display na navbar
    $('#currentMonthYear').text(`${monthNames[month]} ${year}`);
    
    // Atualiza o modal para manter sincronizado
    $('#yearSelect').val(year);
    $('.month-btn').removeClass('active');
    $(`.month-btn[data-month="${month}"]`).addClass('active');
    
    // Atualiza os dados da aplicação
    updateDashboardData(month, year);
}