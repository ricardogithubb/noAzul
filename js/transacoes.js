import { listarReceitas, listarDespesas, listarTransacoesCategorias,listarTransacoesConta } from './indexedDB.js';
import { formatMoney, formatarDataExtenso } from './script.js';

let listaTransacoes = [];

$(document).ready(function () {
    init();
});

async function init() {
    const mes = localStorage.getItem('selectedMonth');
    const ano = localStorage.getItem('selectedYear');
    await carregarTransacoes(mes,ano);  
}
    
async function carregarTransacoes(mes,ano) {

    listaTransacoes = [];

    const receitas = await listarReceitas(mes, ano);
    const despesas = await listarDespesas(mes, ano);

    listaTransacoes = [...receitas, ...despesas];

    console.log('listaTransacoes');
    console.log(listaTransacoes);

    listaTransacoes.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento));


    const $container = $('.transactions-list');
    $container.empty();

    if (listaTransacoes.length === 0) {
        $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
        return;
    }

    
    let printData = "";

    listaTransacoes.forEach(transacao => {
        const valorClass = transacao.tipo === 'R' ? 'text-primary' : 'text-danger';
        const icone = transacao.tipo === 'R' ? 
            '<i class="bi bi-arrow-down-circle text-success me-2"></i>' :  
            '<i class="bi bi-arrow-up-circle text-danger me-2"></i>';
        const dataFormatada = formatarDataExtenso(transacao.data_vencimento);
        const valorFormatado = formatMoney(transacao.valor);
        const status = transacao.data_efetivacao != null ? 
            '<span style="display: inline-block; width: 15px; height: 15px; background-color: green; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>' : 
            '<span style="display: inline-block; width: 15px; height: 15px; background-color: red; border-radius: 50%; margin-top: 4px;margin-right: 10px"></span>';
        
        //verificar se dataFormatada é diferente de printData
        console.log(dataFormatada+" != "+printData);
        if (dataFormatada != printData) {
            if(printData != "") {
                printData = dataFormatada;
                $container.append(`</div>
                        <div class="transaction-group">
                            <div class="transaction-date bg-light p-0">${dataFormatada}</div>                   
                        `);
            } else {    
                printData = dataFormatada;
                $container.append(`<div class="transaction-group">
                                        <div class="transaction-date bg-light p-0 fw-bold">${dataFormatada}</div>                    
                        `);
            }
        }

        $container.append(`
            <div class="transaction-item" data-id="${transacao.id}">
                <div class="transaction-main">
                    <div class="transaction-title">${icone} ${transacao.descricao}</div>
                    <div class="transaction-details small text-muted">${transacao.categoria} | ${transacao.conta}</div> <!-- Texto menor e baixa densidade -->
                </div>

                <div class="transaction-amount ${valorClass}" style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span>${valorFormatado}</span>
                    ${status}
                </div>
            </div>
        `);
    });

}

async function carregarTransacoesCategoria(mes, ano) {

    const listaTransacoes = await listarTransacoesCategorias(mes,ano);

    console.log(listaTransacoes);


    // Renderizar no mesmo container
    const $container = $('.transactions-list');
    $container.empty();

    if (Object.keys(listaTransacoes).length === 0) {
        $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
        return;
    }

    //ordenar lista pelo nome
    listaTransacoes.sort((a, b) => a.nome.localeCompare(b.nome));


    listaTransacoes.forEach(transacao => {
        const classeValor = transacao.tipo === 'R' ? 'text-primary' : 'text-danger';
        const icone = transacao.tipo === 'R' ? 
            '<i class="bi bi-arrow-down-circle text-success me-2"></i>' :  
            '<i class="bi bi-arrow-up-circle text-danger me-2"></i>';
        const valorTotal = transacao.total;
        const valorFormatado = formatMoney(valorTotal);

        $container.append(`
            <div class="d-flex justify-content-between border-bottom py-2">
                <div class="fw-semibold">${icone} ${transacao.nome}</div>
                <div class="${classeValor}">${valorFormatado}</div>
            </div>
        `);
    })


}

async function carregarTransacoesConta(mes, ano) {

    const listaTransacoes = await listarTransacoesConta(mes,ano);

    console.log(listaTransacoes);


    // Renderizar no mesmo container
    const $container = $('.transactions-list');
    $container.empty();

    if (Object.keys(listaTransacoes).length === 0) {
        $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
        return;
    }

    //ordenar lista pelo nome
    listaTransacoes.sort((a, b) => a.nome.localeCompare(b.nome));


    listaTransacoes.forEach(transacao => {
        const classeValor = transacao.tipo === 'R' ? 'text-primary' : 'text-danger';
        const icone = transacao.tipo === 'R' ? 
            '<i class="bi bi-arrow-down-circle text-success me-2"></i>' :  
            '<i class="bi bi-arrow-up-circle text-danger me-2"></i>';
        const valorTotal = transacao.total;
        const valorFormatado = formatMoney(valorTotal);

        $container.append(`
            <div class="d-flex justify-content-between border-bottom py-2">
                <div class="fw-semibold">${icone} ${transacao.nome}</div>
                <div class="${classeValor}">${valorFormatado}</div>
            </div>
        `);
    })


}



$(document).ready(function () {
    
    $('#btnAplicarAgrupamento').on('click', async function () {
        const valorSelecionado = $('input[name="agrupamento"]:checked').val();
        console.log('Agrupamento selecionado:', valorSelecionado);

        const mes = localStorage.getItem('selectedMonth');
        const ano = localStorage.getItem('selectedYear');

        // Fechar o modal manualmente (opcional, se não usar data-bs-dismiss)
        $('#modalAgrupamento').modal('hide');

        switch (valorSelecionado) {
            case 'categoria':
                await carregarTransacoesCategoria(mes,ano);
                break;
            case 'conta':
                console.log('conta');
                await carregarTransacoesConta(mes,ano);
                break;
            case 'dia':
                await carregarTransacoesCategoria(mes,ano);
                break;
            default:
                console.log('Agrupamento inválido');
        }
        
        

        // Aqui você pode chamar uma função para processar os dados com base no agrupamento selecionado
    });

});