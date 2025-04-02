// Funções globais compartilhadas por todas as páginas

// Inicializa tooltips
$(function () {
    $('[data-bs-toggle="tooltip"]').tooltip();
});

// Formata valores monetários
function formatMoney(value) {
    return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
}

// Atualiza o mês/ano exibido
function updateMonthYear(month, year) {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    month !== undefined ? month : month = new Date().getMonth();
    year !== undefined ? year : year = new Date().getFullYear();

    localStorage.setItem('selectedMonth', (month+1));
    localStorage.setItem('selectedYear', year);

    $('#currentYear').text(year);

    const currentMonth = months[month];
    const currentYear = year;
    $('#currentMonthYear').text(`${currentMonth} ${currentYear}`);

}

// Configuração do seletor de mês/ano
function setupMonthYearSelector() {

    $('.month-btn').removeClass('btn-primary').addClass('btn-outline-primary');
    
    //remover a classe btn-outline-primary e adicionar a classe btn-primary no botão que data-month for igual ao mês atual
    const currentMonth = new Date().getMonth();
    $('.month-btn[data-month="' + currentMonth + '"]').removeClass('btn-outline-primary').addClass('btn-primary');


    $('#monthYearBtn').click(function() {
        $('#monthYearModal').modal('show');
    });

    $('.month-btn').click(function() {
        $('.month-btn').removeClass('btn-primary').addClass('btn-outline-primary');
        $(this).removeClass('btn-outline-primary').addClass('btn-primary');
    });

    

    $('#prevYear').click(function() {
        const currentYear = parseInt($('#currentYear').text());
        $('#currentYear').text(currentYear - 1);
    });

    $('#nextYear').click(function() {
        const currentYear = parseInt($('#currentYear').text());
        $('#currentYear').text(currentYear + 1);
    });

    $('#confirmMonthYear').click(function() {
        const selectedMonth = $('.month-btn.btn-primary').data('month');
        const selectedYear = $('#currentYear').text();
        updateMonthYear(selectedMonth, selectedYear);
        $('#monthYearModal').modal('hide');

        $('#currentYear').text(selectedYear);

        
        // Atualiza os dados conforme o mês/ano selecionado
        if (typeof loadData === 'function') {
            loadData(selectedMonth, selectedYear);
        }
    });
}

// Função para alternar opções de repetição
function setupRepeatOptions() {
    $('[id$="Repetir"]').change(function() {
        const optionsId = $(this).attr('id').replace('Repetir', 'repeticaoOptions');
        if ($(this).is(':checked')) {
            $('#' + optionsId).slideDown();
        } else {
            $('#' + optionsId).slideUp();
        }
    });

    $('input[name="repetirAte"]').change(function() {
        if ($(this).attr('id') === 'repetirAteVezes') {
            $('#repetirAteVezesValue').prop('disabled', false);
            $('#repetirAteDataValue').prop('disabled', true);
        } else {
            $('#repetirAteVezesValue').prop('disabled', true);
            $('#repetirAteDataValue').prop('disabled', false);
        }
    });
}

function appendModalToBody() {
    const modalHTML = `
    <!-- Modal de seleção de mês/ano -->
    <div class="modal fade" id="monthYearModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Selecione o Mês e Ano</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-outline-primary" id="prevYear">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button type="button" class="btn btn-primary" id="currentYear">2023</button>
                            <button type="button" class="btn btn-outline-primary" id="nextYear">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    <div class="row g-2">
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="0">Jan</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="1">Fev</button></div>
                        <div class="col-3"><button class="btn btn-primary w-100 month-btn" data-month="2">Mar</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="3">Abr</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="4">Mai</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="5">Jun</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="6">Jul</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="7">Ago</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="8">Set</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="9">Out</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="10">Nov</button></div>
                        <div class="col-3"><button class="btn btn-outline-primary w-100 month-btn" data-month="11">Dez</button></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="confirmMonthYear">Aplicar</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}


function getTotalDespesas(mes, ano) {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('authToken');
        const url = `https://apinoazul.markethubplace.com/api/total-despesas/${mes}/${ano}`;

        $.ajax({
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            method: 'GET',
            success: function(response) {
                resolve(formatMoney(response.total));
            },
            error: function(xhr, status, error) {
                console.log('Erro ao obter o total de despesas:', error);
                reject(error);
            }
        });
    });
}


// executar endpoint para carregar total receita com token
function getTotalReceitas(mes, ano) {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('authToken');
        const url = `https://apinoazul.markethubplace.com/api/total-receitas/${mes}/${ano}`;

        console.log("Token:", token);

        $.ajax({
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            method: 'GET',
            success: function(response) {
                resolve(formatMoney(response.total));
            },
            error: function(xhr, status, error) {
                console.log('Erro ao obter o total de receitas:', error);
                reject(error);
            }
        });
    });
}


// Inicializa funções globais quando o DOM estiver pronto
$(document).ready(function() {
    appendModalToBody();
    updateMonthYear();
    setupMonthYearSelector();
    setupRepeatOptions();
});