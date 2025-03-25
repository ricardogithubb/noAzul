// Variáveis de controle de data
let currentDate = new Date(); // Data atual
let currentMonth = currentDate.getMonth(); // Mês atual (0-11)
let currentYear = currentDate.getFullYear(); // Ano atual

// 1. Primeiro crie um array com os nomes dos meses corretamente formatados
const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 
    'Maio', 'Junho', 'Julho', 'Agosto', 
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Dados de exemplo
let transactions = [
    { id: 1, type: 'income', category: 'Salário', amount: 3500, date: '2023-06-01', description: 'Salário mensal' },
    { id: 2, type: 'expense', category: 'Alimentação', amount: 150, date: '2023-06-02', description: 'Supermercado' },
    { id: 3, type: 'expense', category: 'Transporte', amount: 200, date: '2023-06-03', description: 'Combustível' },
    { id: 4, type: 'expense', category: 'Lazer', amount: 80, date: '2023-06-05', description: 'Cinema' },
    { id: 5, type: 'income', category: 'Freelance', amount: 800, date: '2023-06-10', description: 'Projeto web' }
];

let budgets = [
    { category: 'Alimentação', limit: 600, spent: 150 },
    { category: 'Transporte', limit: 400, spent: 200 },
    { category: 'Lazer', limit: 300, spent: 80 },
    { category: 'Moradia', limit: 1200, spent: 0 }
];

// Adicione esta função no início do app.js, após as declarações de variáveis
function navigateMonth(offset) {
    return function() {
        currentMonth += offset;
        
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        
        updateMonthDisplay();
        loadPage(getCurrentPage());
    };
}

// Função para carregar páginas
function loadPage(page) {
    const content = document.getElementById('content');
    
    // Animação de saída
    content.classList.add('page-exit-active');
    
    setTimeout(() => {
        content.innerHTML = '';
        content.classList.remove('page-exit-active');
        
        // Animação de entrada
        content.classList.add('page-enter');
        
        setTimeout(() => {
            switch(page) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
                case 'budget':
                    loadBudget();
                    break;
                case 'reports':
                    loadReports();
                    break;
                default:
                    loadDashboard();
            }
            
            content.classList.remove('page-enter');
            content.classList.add('page-enter-active');
            
            setTimeout(() => {
                content.classList.remove('page-enter-active');
            }, 300);
        }, 10);
    }, 300);
}

// Página: Dashboard
function loadDashboard() {
    const content = document.getElementById('content');
    
    // Calcular totais
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // HTML do Dashboard
    content.innerHTML = `
        <div class="row">
            <!-- Resumo Financeiro -->
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">Resumo</div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-3">
                            <span>Receitas:</span>
                            <span class="income">R$ ${totalIncome.toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span>Despesas:</span>
                            <span class="expense">R$ ${totalExpense.toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span>Saldo:</span>
                            <span class="balance">R$ ${balance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Últimas Transações -->
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Últimas Transações</span>
                        <button class="btn btn-sm btn-primary btn-action" onclick="loadPage('transactions')">
                            Ver Todas
                        </button>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            ${transactions.slice(0, 5).map(t => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'} me-2">
                                            ${t.type === 'income' ? 'R' : 'D'}
                                        </span>
                                        ${t.description}
                                    </div>
                                    <div>
                                        <span class="${t.type === 'income' ? 'income' : 'expense'}">
                                            R$ ${t.amount.toFixed(2)}
                                        </span>
                                        <small class="text-muted ms-2">${t.date}</small>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <!-- Orçamento -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>Orçamento</span>
                        <button class="btn btn-sm btn-primary btn-action" onclick="loadPage('budget')">
                            Gerenciar
                        </button>
                    </div>
                    <div class="card-body">
                        ${budgets.slice(0, 3).map(b => `
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span>${b.category}</span>
                                    <span>R$ ${b.spent.toFixed(2)} / R$ ${b.limit.toFixed(2)}</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" 
                                         style="width: ${(b.spent / b.limit * 100)}%; 
                                         ${b.spent > b.limit ? 'background-color: #dc3545' : ''}" 
                                         aria-valuenow="${(b.spent / b.limit * 100)}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Gráfico Rápido -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">Visão Geral</div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="quickChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráfico
    renderQuickChart();
}

// Página: Transações
function loadTransactions() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Transações</span>
                <div>
                    <button class="btn btn-sm btn-primary btn-action me-2" data-bs-toggle="modal" data-bs-target="#addTransactionModal">
                        <i class="bi bi-plus"></i> Adicionar
                    </button>
                    <button class="btn btn-sm btn-outline-secondary btn-action">
                        <i class="bi bi-funnel"></i> Filtrar
                    </button>
                </div>
            </div>
            <div class="card-body">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Tipo.</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>
                                    <span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}">
                                        ${t.type === 'income' ? 'Receita' : 'Despesa'}
                                    </span>
                                </td>
                                <td>${t.description}</td>
                                <td>${t.category}</td>
                                <td class="${t.type === 'income' ? 'income' : 'expense'}">
                                    R$ ${t.amount.toFixed(2)}
                                </td>
                                <td>${t.date}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Modal para adicionar transação -->
        <div class="modal fade" id="addTransactionModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Transação</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="transactionForm">
                            <div class="mb-3">
                                <label class="form-label">Tipo</label>
                                <select class="form-select" id="transactionType">
                                    <option value="income">Receita</option>
                                    <option value="expense">Despesa</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Valor</label>
                                <input type="number" class="form-control" id="transactionAmount" step="0.01" min="0">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" id="transactionCategory">
                                    <option value="Salário">Salário</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Alimentação">Alimentação</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Lazer">Lazer</option>
                                    <option value="Moradia">Moradia</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Data</label>
                                <input type="date" class="form-control" id="transactionDate">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Descrição</label>
                                <input type="text" class="form-control" id="transactionDescription">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="addTransaction()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Página: Orçamento
function loadBudget() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>Orçamento Mensal</span>
                <button class="btn btn-sm btn-primary btn-action" data-bs-toggle="modal" data-bs-target="#addBudgetModal">
                    <i class="bi bi-plus"></i> Adicionar Categoria
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Limite</th>
                                <th>Gasto</th>
                                <th>Disponível</th>
                                <th>Progresso</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${budgets.map(b => {
                                const available = b.limit - b.spent;
                                const percentage = (b.spent / b.limit * 100).toFixed(1);
                                
                                return `
                                    <tr>
                                        <td>${b.category}</td>
                                        <td>R$ ${b.limit.toFixed(2)}</td>
                                        <td>R$ ${b.spent.toFixed(2)}</td>
                                        <td class="${available < 0 ? 'expense' : 'income'}">
                                            R$ ${available.toFixed(2)}
                                        </td>
                                        <td>
                                            <div class="progress" style="height: 20px;">
                                                <div class="progress-bar ${percentage > 100 ? 'bg-danger' : ''}" 
                                                     role="progressbar" 
                                                     style="width: ${percentage > 100 ? 100 : percentage}%" 
                                                     aria-valuenow="${percentage}" 
                                                     aria-valuemin="0" 
                                                     aria-valuemax="100">
                                                    ${percentage}%
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Modal para adicionar orçamento -->
        <div class="modal fade" id="addBudgetModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Adicionar Categoria ao Orçamento</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="budgetForm">
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <input type="text" class="form-control" id="budgetCategory">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Limite Mensal</label>
                                <input type="number" class="form-control" id="budgetLimit" step="0.01" min="0">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="addBudget()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Página: Relatórios
function loadReports() {
    const content = document.getElementById('content');
    
    // Agrupar despesas por categoria
    const expensesByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        if (!expensesByCategory[t.category]) {
            expensesByCategory[t.category] = 0;
        }
        expensesByCategory[t.category] += t.amount;
    });
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">Receitas vs Despesas</div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="incomeExpenseChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">Despesas por Categoria</div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="expensesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">Evolução Mensal</div>
                    <div class="card-body">
                        <div class="chart-container" style="height: 400px;">
                            <canvas id="monthlyTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Renderizar gráficos
    renderIncomeExpenseChart();
    renderExpensesChart();
    renderMonthlyTrendChart();
}

// Funções para renderizar gráficos
function renderQuickChart() {
    const ctx = document.getElementById('quickChart').getContext('2d');
    
    // Dados de exemplo para o gráfico rápido
    const incomeData = [3000, 3500, 4000, 3800, 4200, 4500];
    const expenseData = [2500, 2700, 3000, 2800, 3200, 3100];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: ['#28a745', '#dc3545'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = totalIncome + totalExpense;
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderExpensesChart() {
    const ctx = document.getElementById('expensesChart').getContext('2d');
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // Gerar cores dinamicamente
    const backgroundColors = categories.map((_, i) => {
        const hue = (i * 137.508) % 360; // Distribuição uniforme de cores
        return `hsl(${hue}, 70%, 60%)`;
    });
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = amounts.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderMonthlyTrendChart() {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    
    // Dados de exemplo para tendência mensal
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const incomeData = [3000, 3500, 4000, 3800, 4200, 4500];
    const expenseData = [2500, 2700, 3000, 2800, 3200, 3100];
    const balanceData = incomeData.map((income, i) => income - expenseData[i]);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: '#28a745',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: '#dc3545',
                    borderWidth: 1
                },
                {
                    label: 'Saldo',
                    data: balanceData,
                    type: 'line',
                    borderColor: '#007bff',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointBackgroundColor: '#007bff'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: R$ ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Funções para adicionar dados
function addTransaction() {
    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const category = document.getElementById('transactionCategory').value;
    const date = document.getElementById('transactionDate').value;
    const description = document.getElementById('transactionDescription').value;
    
    if (!amount || !date || !description) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    const newTransaction = {
        id: transactions.length + 1,
        type,
        category,
        amount,
        date,
        description
    };
    
    transactions.push(newTransaction);
    
    // Fechar modal e recarregar a página
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
    modal.hide();
    
    loadPage('transactions');
}

function addBudget() {
    const category = document.getElementById('budgetCategory').value;
    const limit = parseFloat(document.getElementById('budgetLimit').value);
    
    if (!category || !limit) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }
    
    const newBudget = {
        category,
        limit,
        spent: 0
    };
    
    budgets.push(newBudget);
    
    // Fechar modal e recarregar a página
    const modal = bootstrap.Modal.getInstance(document.getElementById('addBudgetModal'));
    modal.hide();
    
    loadPage('budget');
}

function updateMonthDisplay() {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                       "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const monthYear = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Atualiza o título principal
    document.getElementById('mainMonthYear').textContent = monthYear;
    
    // Atualiza todas as referências de mês nos cartões (se existirem)
    document.querySelectorAll('.month-reference').forEach(el => {
        el.textContent = monthYear;
    });
}



// Event Listeners
// No DOMContentLoaded, mantenha apenas:
document.addEventListener('DOMContentLoaded', function() {
    updateMonthDisplay(); // Inicializa o display do mês
    loadPage('dashboard'); // Carrega a página inicial
    
    // Configurar navegação
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loadPage(this.getAttribute('data-page'));
        });
    });
    
    // Event listeners para navegação de mês (mantenha os mesmos do código anterior)
    document.getElementById('prevMonth').addEventListener('click', navigateMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', navigateMonth(1));
    document.getElementById('applyDate').addEventListener('click', applyNewDate);
    
    // Definir data atual como padrão para novas transações
    const today = new Date().toISOString().split('T')[0];
    document.addEventListener('show.bs.modal', function(event) {
        if (event.target.id === 'addTransactionModal') {
            document.getElementById('transactionDate').value = today;
        }
    });

});

function applyNewDate() {
    currentMonth = parseInt(document.getElementById('monthSelect').value);
    currentYear = parseInt(document.getElementById('yearSelect').value);
    
    updateMonthDisplay();
    loadPage(getCurrentPage());
    
    const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('monthYearDropdown'));
    dropdown.hide();
}

function getCurrentPage() {
    const activeLink = document.querySelector('.nav-link.active');
    return activeLink ? activeLink.getAttribute('data-page') : 'dashboard';
}