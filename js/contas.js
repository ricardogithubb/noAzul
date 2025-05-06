import { adicionar, listar, atualizar, deletar, listarContas, listarContaId } from './indexedDB.js';
import { formatMoney, mostrarAlerta, handleSubmitConta, contaEditar } from './script.js';

$(document).ready(function () {
    let isSubmitting = false;
    

    async function init() {
        setupEventListeners();
        await carregarContas();
        atualizarResumo();
        $('#contaSaldoInicial, #ajustarSaldoValor, #valorAjuste').mask('#.##0,00', { reverse: true });
    }

    function setupEventListeners() {
        // Formulário nova conta
        // $('#formNovaContaB').submit(async function (e) {
        //     e.preventDefault();
        //     if (isSubmitting) return;
        //     await handleSubmitConta('nova');
        // });

        // Formulário editar conta
        $('#formEditarConta').submit(async function (e) {
            e.preventDefault();
            if (isSubmitting) return;
            await handleSubmitConta('editar');

            carregarContas();
            
        });        
            
        // ao fechar o modal de criar conta
        $('#novaContaModal').on('hidden.bs.modal', function () {
            carregarContas();
        });

        // Formulário ajustar saldo
        $('#formAjustarSaldo').submit(async function (e) {
            e.preventDefault();
            if (isSubmitting) return;
            await handleAjustarSaldo();
        });

        // Confirmação de exclusão
        $('#confirmarExclusao').change(function () {
            $('#btnConfirmarExclusao').prop('disabled', !this.checked);
        });

        $('#btnConfirmarExclusao').click(async function () {
            await handleDeletarConta();
        });
    }


    async function carregarContas(tipo) {
        const contas = await listarContas();
        console.log(contas);
        exibirContas(contas);
        atualizarResumo(contas);
    }

    function exibirContas(contas) {
        const $grid = $('#contasGrid');
        $grid.empty();

        if (contas.length === 0) {
            $('#semContas').show();
            return;
        }

        $('#semContas').hide();
        
        contas.forEach(conta => {
            const card = `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card account-card shadow-sm h-100">
                        <div class="card-header position-relative">
                            <h5 class="card-title mb-0">
                                ${conta.nome}                                
                            </h5>
                            <div class="account-status ${conta.ativa ? 'active-status' : 'inactive-status'}"></div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex flex-column gap-3">
                                <div>
                                    <small class="text-muted">Saldo Atual</small>
                                    <h3 class="mb-0 text-success" id="labelSaldoAtual">${formatMoney(conta.saldo_atual)}</h3>
                                </div>
                                <div>
                                    <small class="text-muted">Saldo Previsto</small>
                                    <h4 class="mb-0 text-primary">${formatMoney(conta.saldo_previsto
                                    )}</h4>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer border-top">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group ms-auto" role="group">
                                    <button class="btn btn-outline-secondary btn-sm btnAjusteConta" data-bs-toggle="modal" data-bs-target="#ajustarSaldoModal" data-id="${conta.id}" title="Ajustar Saldo">
                                        <i class="bi bi-currency-exchange me-2"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm btnEditarConta" data-bs-toggle="modal" data-bs-target="#editarContaModal" data-id="${conta.id}" title="Editar Conta">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm btnExcluirConta" data-bs-toggle="modal" data-bs-target="#confirmarExclusaoModal" data-id="${conta.id}" title="Desativar Conta">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $grid.append(card);
        });
    }

    function atualizarResumo(contas) {
        if (!contas) return;
        
        const total = contas.reduce((sum, c) => sum + c.saldo, 0);
        const ativas = contas.filter(c => c.ativa).length;
        const inativas = contas.filter(c => !c.ativa).length;

        $('#totalBalance').text(formatMoney(total));
        $('#activeAccounts').text(ativas);
        $('#inactiveAccounts').text(inativas);
    }

    // Funções de apoio
    function getTipoNome(tipo) {
        const tipos = {
            banco: 'Conta Bancária',
            cartao: 'Cartão de Crédito',
            dinheiro: 'Dinheiro',
            investimento: 'Investimento',
            outro: 'Outro'
        };
        return tipos[tipo] || 'Outro';
    }

    function getTipoBadge(tipo) {
        const classes = {
            banco: 'bg-info',
            cartao: 'bg-warning text-dark',
            dinheiro: 'bg-success',
            investimento: 'bg-danger',
            outro: 'bg-secondary'
        };
        return `${classes[tipo] || 'bg-secondary'} type-badge`;
    }

    // Funções para modais

    //ao abrir modal de editar conta, preencher os campos
    $('#contasGrid').on('click', '.btnEditarConta', async function () {
        
        const id = $(this).data('id'); // Agora funciona corretamente
        const conta = await listarContaId(id);
        console.log(conta);

        contaEditar(conta);
        
        $('#contaId').val(conta.id);
        $('#editarNomeConta').val(conta.nome);
        $('#editarDescricao').val(conta.descricao);
        $('#editarStatusConta').prop('checked', conta.ativa);
        
        $('#editarContaModal').modal('show');
    });

    $('#contasGrid').on('click', '.btnAjusteConta', async function () {
        
        const id = $(this).data('id'); // Agora funciona corretamente
        const conta = await listarContaId(id);
        console.log(conta);

        $('#ajusteContaId').val(id);
        $('#nomeContaAjuste').text(conta.nome);
        $('#saldoAtualAjuste').text($('#labelSaldoAtual').text());
        $('#ajustarSaldoModal').modal('show');
    });

    $('#contasGrid').on('click', '.btnExcluirConta', async function () {
        const id = $(this).data('id'); // Agora funciona corretamente
        const conta = await listarContaId(id);
        console.log(conta);
        $('#contaExclusaoNome').text(conta.nome); // Limpa o campo de nome da conta
        $('#contaTipoExclusao').text(conta.tipo); // Limpa o campo de tipo da conta        
        $('#confirmarExclusaoModal').data('id', id);
    });



    async function handleAjustarSaldo() {
        isSubmitting = true;
        const btn = $('#btnConfirmarAjuste');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Aplicando...');

        try {
            const id = parseInt($('#ajusteContaId').val());
            const valor = parseFloat($('#valorAjuste').val().replace(/\./g, '').replace(',', '.'));
            const tipo = $('#tipoAjuste').val();
            const data = $('#dataAjuste').val();
            const descricao = $('#observacaoAjuste').val();

            const conta = await listarContaId(id);
            let novoSaldo = conta.saldo_inicial;
            console.log(id);
            console.log(conta);
            console.log(tipo);

            if (tipo === 'ajuste') {
                novoSaldo = valor;
            } else if (tipo === 'entrada') {
                novoSaldo += valor;
            } else {
                novoSaldo -= valor;
            }

            await atualizar('contas', id, { saldo_inicial: novoSaldo });
            await carregarContas();
            $('#ajustarSaldoModal').modal('hide');
            mostrarAlerta('Saldo ajustado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao ajustar saldo', 'danger');
        } finally {
            isSubmitting = false;
            btn.prop('disabled', false).text('Confirmar Ajuste');
        }
    }

    async function handleDeletarConta() {
        isSubmitting = true;
        $('#btnConfirmarExclusao').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Processando...');

        try {
            const id = $('#confirmarExclusaoModal').data('id');
            alert(id);
            await atualizar('contas', id, { ativa: false });
            await carregarContas();
            $('#confirmarExclusaoModal').modal('hide');
            mostrarAlerta('Conta desativada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro:', error);
            mostrarAlerta('Erro ao desativar conta', 'danger');
        } finally {
            isSubmitting = false;
            $('#btnConfirmarExclusao').prop('disabled', false).text('Desativar Conta');
        }
    }

    // Inicialização
    init();
});