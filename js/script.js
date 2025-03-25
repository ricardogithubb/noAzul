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
    const currentMonth = month !== undefined ? months[month] : months[new Date().getMonth()];
    const currentYear = year !== undefined ? year : new Date().getFullYear();
    $('#currentMonthYear').text(`${currentMonth} ${currentYear}`);
}

// Configuração do seletor de mês/ano
function setupMonthYearSelector() {
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

// Inicializa funções globais quando o DOM estiver pronto
$(document).ready(function() {
    updateMonthYear();
    setupMonthYearSelector();
    setupRepeatOptions();
});