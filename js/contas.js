import { adicionar, listar, atualizar, deletar, listarContas } from './indexedDB.js';
import { formatMoney, mostrarAlerta } from './script.js';

$(document).ready(function () {
    let isSubmitting = false;
    let contaEditando = null;

    async function init() {
        setupEventListeners();
        await carregarContas();
        atualizarResumo();
        $('#contaSaldoInicial, #ajustarSaldoValor').mask('#.##0,00', { reverse: true });
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
                                    <h3 class="mb-0 text-success">${formatMoney(conta.saldo_atual)}</h3>
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
                                <div class="dropdown">
                                    <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="dropdown">
                                        <i class="bi bi-gear"></i> Gerenciar
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><button class="dropdown-item" onclick="abrirAjustarSaldo('${conta.id}')">
                                            <i class="bi bi-pencil me-2"></i>Ajustar Saldo
                                        </button></li>
                                        <li><button class="dropdown-item" onclick="abrirEditarConta('${conta.id}')">
                                            <i class="bi bi-sliders me-2"></i>Editar Conta
                                        </button></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><button class="dropdown-item text-danger" onclick="abrirConfirmarExclusao('${conta.id}')">
                                            ${conta.ativa ? '<i class="bi bi-x-circle me-2"></i>Desativar' : '<i class="bi bi-arrow-clockwise me-2"></i>Reativar'}
                                        </button></li>
                                    </ul>
                                </div>
                                <a href="#" class="btn btn-primary btn-sm">
                                    Nova Transação <i class="bi bi-arrow-right ms-1"></i>
                                </a>
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
    window.abrirEditarConta = async (id) => {
        const conta = await listar('contas', id);
        contaEditando = conta;
        
        $('#editarContaNome').val(conta.nome);
        $('#editarContaTipo').val(conta.tipo);
        $('#editarContaDescricao').val(conta.descricao);
        $('#editarContaAtiva').prop('checked', conta.ativa);
        
        $('#editarContaModal').modal('show');
    };

    window.abrirAjustarSaldo = async (id) => {
        const conta = await listar('contas', id);
        $('#ajustarSaldoContaId').val(id);
        $('#nomeContaAjuste').text(conta.nome);
        $('#saldoAtualAjuste').text(formatMoney(conta.saldo));
        $('#ajustarSaldoModal').modal('show');
    };

    window.abrirConfirmarExclusao = async (id) => {
        const conta = await listar('contas', id);
        $('#contaExclusaoNome').text(conta.nome);
        $('#contaTipoExclusao').text(getTipoNome(conta.tipo));
        $('#confirmarExclusaoModal').modal('show');
    };

    async function handleAjustarSaldo() {
        isSubmitting = true;
        const btn = $('#btnConfirmarAjuste');
        btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Aplicando...');

        try {
            const id = $('#ajustarSaldoContaId').val();
            const valor = parseFloat($('#ajustarSaldoValor').val().replace(/\./g, '').replace(',', '.'));
            const tipo = $('#ajustarSaldoTipo').val();
            const data = $('#ajustarSaldoData').val();
            const descricao = $('#ajustarSaldoDescricao').val();

            const conta = await listar('contas', id);
            let novoSaldo = conta.saldo;

            if (tipo === 'ajuste') {
                novoSaldo = valor;
            } else if (tipo === 'entrada') {
                novoSaldo += valor;
            } else {
                novoSaldo -= valor;
            }

            await atualizar('contas', id, { saldo: novoSaldo });
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
            const id = $('#ajustarSaldoContaId').val();
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