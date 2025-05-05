import { adicionar, listar, atualizar, deletar, totalEfetivado, totalPendente, listarOrcamentos } from './indexedDB.js';
import { carregarCategorias,formatMoney } from './script.js';
$(document).ready(function () {

    let isSubmitting = false;

    $('#orcamentoValor').mask('###.###.###.###.###,00', {reverse: true}); 

    async function init() {
        setupEventListeners();
        carregarOrcamentos();
    }

    init();

    async function carregarOrcamentos() {
        const mes = localStorage.getItem('selectedMonth');
        const ano = localStorage.getItem('selectedYear');
    
        const listarOrc = await listarOrcamentos(mes, ano);

        $('#qtdCategorias').text(listarOrc.length+' Categorias');

        exibirOrcamento(listarOrc);
        console.log(listarOrc); // Aqui deve aparecer o array de orçamentos
    }
    

    function setupEventListeners() {
        // Formulário de nova receita
        $('#formNovoOrcamento').submit(async function (e) {
           //desativar o botão de salvar
           e.preventDefault();

           if (isSubmitting) return; // Se já estiver enviando, não faz nada

           isSubmitting = true; // trava envio
           $('#btnSalvarOrcamento').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');

           console.log('Salvando 2');
           await salvarOrcamento(); // Aguarda o salvamento terminar

           await carregarOrcamentos();

           isSubmitting = false; // libera envio novamente
           $('#btnSalvarOrcamento').prop('disabled', false).text('Salvar Orçamento');
       });

    }

    async function exibirOrcamento(listarOrcamento) {
        const $container = $('#orcamentosContainer');
        $container.empty();
    
        // Cabeçalho
        $container.append(`
            <div class="d-flex fw-bold border-bottom py-2">
                <div class="flex-fill">Orçado</div>
                <div class="flex-fill">Gasto</div>
                <div class="flex-fill">Diferença</div>
                <div class="flex-fill">Utilizado</div>
            </div>
        `);
    
        let totalOrcado = 0;
        let totalGasto = 0;
    
        listarOrcamento.forEach((orcamento) => {
            const valor = parseFloat(orcamento.valor || 0);
            const gasto = parseFloat(orcamento.total_gasto || 0);
            const diferenca = valor - gasto;
            const percentual = valor ? ((gasto / valor) * 100).toFixed(0) : 0;
    
            totalOrcado += valor;
            totalGasto += gasto;
    
            $container.append(`
                <div class="fw-bold py-2 border-top  bg-info px-1 rounded">${orcamento.categoria || 'Sem categoria'}</div>
                <div class="d-flex align-items-center py-2 border-bottom">
                    <div class="flex-fill">${formatMoney(valor)}</div>
                    <div class="flex-fill">${formatMoney(gasto)}</div>
                    <div class="flex-fill text-${diferenca >= 0 ? 'success' : 'danger'}">
                        ${formatMoney(diferenca)}
                    </div>
                    <div class="flex-fill d-inline-flex gap-1 align-items-center">
                        <div class="w-100">
                            <div class="progress" style="height: 20px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${percentual}%;">
                                    ${percentual}%
                                </div>
                            </div>
                        </div>
                       
                    </div>
                </div>
            `);
        });
    
        // Rodapé
        const totalDiferenca = totalOrcado - totalGasto;
        const percentualTotal = totalOrcado ? ((totalGasto / totalOrcado) * 100).toFixed(0) : 0;
    
        $container.append(`
            <div class="d-flex align-items-center py-3 mt-3 bg-light fw-bold border-top">
                <div class="flex-fill">${formatMoney(totalOrcado)}</div>
                <div class="flex-fill">${formatMoney(totalGasto)}</div>
                <div class="flex-fill text-${totalDiferenca >= 0 ? 'success' : 'danger'}">
                    ${totalDiferenca >= 0 ? '+' : '-'}${formatMoney(Math.abs(totalDiferenca))}
                </div>
                <div class="flex-fill">
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" role="progressbar" style="width: ${percentualTotal}%;">
                            ${percentualTotal}%
                        </div>
                    </div>
                </div>
                <div class="flex-fill"></div>
            </div>
        `);
    }
    

    async function salvarOrcamento() {
        // Obter valores do formulário
        const categoria_id = $('#orcamentoCategoria').val();
        const valor = parseFloat($('#orcamentoValor').val().replace('.', '').replace(',', '.'));
        const mes = localStorage.getItem('selectedMonth');
        const ano = localStorage.getItem('selectedYear');
    
        // Validação dos campos obrigatórios
        if (!categoria_id || isNaN(valor) || isNaN(mes) || isNaN(ano)) {
            alert('Preencha todos os campos obrigatórios do orçamento');
            return;
        }
    
        // Objeto com os dados do orçamento
        const dadosOrcamento = {
            categoria_id: parseInt(categoria_id),
            valor,
            mes,
            ano
        };
    
        try {
            // Desativa botão enquanto salva
            $('#btnSalvarOrcamento').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');
    
            console.log('Salvando orçamento:', dadosOrcamento);
            adicionar('orcamentos', dadosOrcamento); // Supondo que você esteja salvando no "banco" chamado 'orcamentos'
    
            // Fecha modal, limpa formulário e exibe sucesso
            $('#novoOrcamentoModal').modal('hide');
            $('#formNovoOrcamento')[0].reset(); // Supondo que o formulário tenha esse ID
            alert('Orçamento salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            mostrarAlerta(error.message || 'Erro ao salvar orçamento. Tente novamente.', 'danger');
        } finally {
            $('#btnSalvarOrcamento').prop('disabled', false).text('Salvar Orçamento');
        }
    }
    

    // Inicialização
    carregarCategorias('O');

});