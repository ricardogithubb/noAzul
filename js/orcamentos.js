import { adicionar, listar, atualizar, deletar, listarMesesOrcamentos, totalPendente, listarOrcamentos } from './indexedDB.js';
import { carregarCategorias,formatMoney, updateMonthYear } from './script.js';
$(document).ready(function () {

    let isSubmitting = false;

    $('#orcamentoValor').mask('###.###.###.###.###,00', {reverse: true}); 

    async function init() {
        setupEventListeners();
        carregarOrcamentos();
    }

    init();

    async function confirmarExclusao(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            await excluirOrcamento(id);
        } 
    }

    async function excluirOrcamento(id) {
        return new Promise(async (resolve, reject) => {
            await deletar('orcamentos',id);
            await carregarOrcamentos();
        });
        
    }

    async function copiarOrcamento() {
        return new Promise(async (resolve, reject) => {
            
            const mesOrigem = $('#mesOrigem').val().split('-')[0];
            const anoOrigem = $('#mesOrigem').val().split('-')[1];
            const mesDestino = $('#mesDestino').val().split('-')[0];
            const anoDestino = $('#mesDestino').val().split('-')[1];
    
            const orcamentoDe = await listarOrcamentos(mesOrigem,anoOrigem);

            if($('#sobrescreverDestino').is(':checked')) {
                const orcamentoPara = await listarOrcamentos(mesDestino,anoDestino);
                
                await orcamentoPara.forEach(async orcamento => {
                    await deletar('orcamentos',orcamento.id);
                });
            }

            
    
            await orcamentoDe.forEach(async orcamento => {
                const dadosOrcamento = {
                        categoria_id: null,
                        valor: null,
                        mes: null,
                        ano: null
                    };
                dadosOrcamento.categoria_id = parseInt(orcamento.categoria_id);
                dadosOrcamento.valor = parseFloat(orcamento.valor);
                dadosOrcamento.mes = parseInt(mesDestino);
                dadosOrcamento.ano = parseInt(anoDestino);

                console.log('dataOrcamento',dadosOrcamento);

                await adicionar('orcamentos',dadosOrcamento);

                await updateMonthYear(mesDestino, anoDestino);
        
                await carregarOrcamentos();
        
            });
            
            resolve();
            
        })

    }

    $('#formCopiarOrcamentos').submit(async function(e) {
        e.preventDefault();
        await copiarOrcamento();
        $('#sobrescreverDestino').prop('checked', false);
        $('#copiarOrcamentoModal').modal('hide');
    });

    $('#confirmMonthYear').on('click', function () {
        init();
    });

    async function carregarMesesOrcamento() {

        const mesesPortugues = [
            '', 'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const meses = await listarMesesOrcamentos();
        // console.log(meses);
        $('#mesOrigem').empty();
        meses.forEach(orcamento => {
            const option = $('<option>').val(orcamento.valId).text(orcamento.mesAno);
            $('#mesOrigem').append(option);
        });

        //mes destino popular com 12 meses futuros
        $('#mesDestino').empty();
        const dataAtual = new Date();

        for (let i = 1; i <= 12; i++) {
            // Calcula a data futura adicionando 'i' meses à data atual
            const dataFutura = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + i, 1);
            
            // Obtém mês (0-11) e ano ajustado
            const mes = dataFutura.getMonth() + 1; // Converte para 1-12
            const ano = dataFutura.getFullYear();
            
            // Formata os valores
            const valId = `${mes}-${ano}`;
            const textoExibicao = `${mesesPortugues[mes]}/${ano}`;

            // Cria a opção
            const option = $('<option>')
                .val(valId)
                .text(textoExibicao);
                
            $('#mesDestino').append(option);
        }
    }


    $(document).on('click', '.btnExcluirOrcamento', function () {
              
            const id = $(this).data('id');
            confirmarExclusao(id);
        });


    $(document).on('click', '.btnEditarOrcamento', function () {
        const id = $(this).data('id');
        const categoria = $(this).data('categoria');
        const valor = $(this).data('valor');
        const recorrente = $(this).data('recorrente');

        $('#orcamentoId').val(id);
        $('#orcamentoCategoria').val(categoria);
        $('#orcamentoValor').val(valor.toFixed(2).replace('.', ','));
        $('#orcamentoRecorrente').prop('checked', recorrente == 1);

        $('#novoOrcamentoModal').modal('show'); // <- isso abre o modal
    });


    async function carregarOrcamentos() {
        return new Promise(async (resolve, reject) => {
            
            const mes = parseInt(localStorage.getItem('selectedMonth'));
            const ano = parseInt(localStorage.getItem('selectedYear'));
        
            const listarOrc = await listarOrcamentos(mes, ano);
    
            $('#qtdCategorias').text(listarOrc.length+' Categorias');
    
            exibirOrcamento(listarOrc);
            carregarMesesOrcamento();
            console.log(listarOrc); // Aqui deve aparecer o array de orçamentos
            resolve();
        })
    }
    

    function setupEventListeners() {
        // Formulário de nova receita
        $('#formNovoOrcamento').submit(async function (e) {
            e.preventDefault();
            if (isSubmitting) return;

            isSubmitting = true;
            $('#btnSalvarOrcamento').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...');

            const id = parseInt($('#orcamentoId').val());
            if (id) {
                await atualizarOrcamento(id);
            } else {
                await salvarOrcamento();
            }

            await carregarOrcamentos();

            isSubmitting = false;
            $('#btnSalvarOrcamento').prop('disabled', false).text('Salvar Orçamento');
        });


    }

    async function atualizarOrcamento(id) {
        const categoria_id = parseInt($('#orcamentoCategoria').val())
        const valor = parseFloat($('#orcamentoValor').val().replace('.', '').replace(',', '.'));
        const mes = parseInt(localStorage.getItem('selectedMonth'));
        const ano = parseInt(localStorage.getItem('selectedYear'));
        const recorrente = $('#orcamentoRecorrente').is(':checked') ? 1 : 0;

        if (!categoria_id || isNaN(valor)) {
            alert('Preencha todos os campos obrigatórios do orçamento');
            return;
        }

        const dadosAtualizados = {
            id: parseInt(id),
            categoria_id: parseInt(categoria_id),
            valor,
            mes,
            ano,
            recorrente
        };

        console.log('Dados atualizados do orçamento:', dadosAtualizados);

        try {
            await atualizar('orcamentos', id, dadosAtualizados);
            $('#novoOrcamentoModal').modal('hide');
            $('#formNovoOrcamento')[0].reset();
            $('#orcamentoId').val('');
            alert('Orçamento atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar orçamento:', error);
            alert('Erro ao atualizar orçamento.');
        }
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
                <div class="fw-bold py-2 border-top bg-info px-1 rounded d-flex align-items-center">
                    <div class="flex-fill">${orcamento.categoria || 'Sem categoria'}</div>
                    <div class="d-inline-flex gap-1 justify-content-end">
                        <button 
                            class="btn btn-sm btn-outline-primary btnEditarOrcamento" 
                            title="Editar"
                            data-id="${orcamento.id}"
                            data-categoria="${orcamento.categoria_id}"
                            data-valor="${valor}"
                            data-recorrente="${orcamento.recorrente || 0}"
                            >
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btnExcluirOrcamento" title="Excluir"  data-id="${orcamento.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
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
        const categoria_id = parseInt($('#orcamentoCategoria').val()); // Converte para número $('#orcamentoCategoria').val();
        const valor = parseFloat($('#orcamentoValor').val().replace('.', '').replace(',', '.'));
        const mes = parseInt(localStorage.getItem('selectedMonth'));
        const ano = parseInt(localStorage.getItem('selectedYear'));
    
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