import { listarReceitas, listarDespesas } from './indexedDB.js';
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

        const transacaos = await listarReceitas(mes, ano);
        const despesas = await listarDespesas(mes, ano);

        listaTransacoes = [...transacaos, ...despesas];

        console.log('listaTransacoes');
        console.log(listaTransacoes);

        listaTransacoes.sort((a, b) => new Date(b.data_vencimento) - new Date(a.data_vencimento));


        const $container = $('.transactions-list');
        $container.empty();
    
        if (listaTransacoes.length === 0) {
            $container.append('<div class="text-center text-muted mt-3">Nenhuma transação encontrada</div>');
            return;
        }

        
        let printData = "";

        listaTransacoes.forEach(transacao => {
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
                        <div class="transaction-title">${transacao.descricao}</div>
                        <div class="transaction-details small text-muted">${transacao.categoria} | ${transacao.conta}</div> <!-- Texto menor e baixa densidade -->
                    </div>

                    <div class="transaction-amount text-danger" style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span>${valorFormatado}</span>
                        ${status}
                    </div>
                </div>
            `);
        });
    
    }