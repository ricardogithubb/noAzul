// Variáveis globais
let currentCalculation = '';
let targetField = '';
let campoCurrente = '';

// HTML da calculadora
const calculatorHTML = `
<div class="modal fade p-3" id="calculadoraModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header bg-light">
                <h5 class="modal-title">Calculadora</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="calculator">
                    <div class="display mb-2">
                        <input type="text" class="form-control text-end" id="calcDisplay" readonly>
                    </div>
                    <div class="buttons row g-2">
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcClear()">C</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcOperation('/')">/</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcOperation('*')">×</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcOperation('-')">-</button></div>
                        
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('7')">7</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('8')">8</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('9')">9</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcOperation('+')">+</button></div>
                        
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('4')">4</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('5')">5</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('6')">6</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcDecimal()">,</button></div>
                        
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('1')">1</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('2')">2</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('3')">3</button></div>
                        <div class="col-3"><button class="btn btn-outline-secondary w-100" onclick="calcCalculate()">=</button></div>
                        
                        <div class="col-6"><button class="btn btn-outline-secondary w-100" onclick="calcNumber('0')">0</button></div>
                        <div class="col-6"><button class="btn btn-primary w-100" onclick="insertResult()">OK</button></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`;

// Funções globais
window.openCalculator = function(fieldId) {    
    targetField = fieldId;
    const currentValue = $('#' + fieldId).val();
    $('#calcDisplay').val(currentValue || '0');
    currentCalculation = currentValue.replace(',', '.') || '';
    new bootstrap.Modal(document.getElementById('calculadoraModal')).show();
};

window.calcNumber = function(num) {
    const display = $('#calcDisplay');
    if (display.val() === '0') display.val('');
    display.val(display.val() + num);
    currentCalculation += num;
};

window.calcOperation = function(op) {
    currentCalculation += op;
    $('#calcDisplay').val('');
};

window.calcDecimal = function() {
    const display = $('#calcDisplay');
    if (!display.val().includes(',')) {
        display.val(display.val() + ',');
        currentCalculation += '.';
    }
};

window.calcClear = function() {
    $('#calcDisplay').val('0');
    currentCalculation = '';
};

window.calcCalculate = function() {
    try {
        const result = eval(currentCalculation);
        $('#calcDisplay').val(result);
        currentCalculation = result.toString();
    } catch (e) {
        $('#calcDisplay').val('Erro');
        currentCalculation = '';
    }
};

window.insertResult = function() {
    if (targetField) {
        const valor = parseFloat($('#calcDisplay').val().replace(',', '.'));
        let valorFormatado = isNaN(valor) ? $('#calcDisplay').val() : valor.toFixed(2).replace('.', ',');
        $('#' + targetField).val(valorFormatado);
    }
    $('#calculadoraModal').modal('hide');
};

$(document).ready(function () {
    // Adiciona a calculadora ao DOM
    if ($('#calculadoraModal').length === 0) {
        $('body').append(calculatorHTML);
    }

    // Evento do botão da calculadora
    $(document).on('click', '#btnCalculadora', function() {
        $(this).data('value')
        openCalculator($(this).data('value'));
    });
});