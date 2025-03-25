$(document).ready(function() {
    // Carrega categorias para o select
    loadCategorias();
    
    // Carrega metas
    loadMetas();
    
    // Configura eventos
    setupMetasEventos();
});

function loadCategorias() {
    // Simulação - na prática viria de uma API
    const categorias = [
        { id: 1, nome: 'Alimentação', tipo: 'despesa' },
        { id: 2, nome: 'Moradia', tipo: 'despesa' },
        { id: 3, nome: 'Transporte', tipo: 'despesa' },
        { id: 4, nome: 'Lazer', tipo: 'despesa' },
        { id: 5, nome: 'Investimentos', tipo: 'receita' }
    ];
    
    // Preenche select no modal
    const categoriaSelect = $('#metaCategoria');
    categorias.forEach(categoria => {
        categoriaSelect.append(`<option value="${categoria.id}">${categoria.nome}</option>`);
    });
}

function loadMetas() {
    // Simulação - na prática viria de uma API
    const metas = [
        { 
            id: 1, 
            descricao: 'Economizar para viagem', 
            categoria: 'Lazer', 
            valorAlvo: 5000.00, 
            valorAtual: 3200.00, 
            dataLimite: '2023-12-31',
            status: 'andamento' 
        },
        { 
            id: 2, 
            descricao: 'Reduzir gastos com alimentação', 
            categoria: 'Alimentação', 
            valorAlvo: 800.00, 
            valorAtual: 600.00, 
            dataLimite: '2023-06-30',
            status: 'andamento' 
        },
        { 
            id: 3, 
            descricao: 'Comprar novo notebook', 
            categoria: 'Tecnologia', 
            valorAlvo: 3500.00, 
            valorAtual: 3500.00, 
            dataLimite: '2023-03-15',
            status: 'concluida' 
        },
        { 
            id: 4, 
            descricao: 'Investir em fundo imobiliário', 
            categoria: 'Investimentos', 
            valorAlvo: 10000.00, 
            valorAtual: 7500.00, 
            dataLimite: '2023-12-31',
            status: 'andamento' 
        },
        { 
            id: 5, 
            descricao: 'Pagar dívida do cartão', 
            categoria: 'Dívidas', 
            valorAlvo: 2000.00, 
            valorAtual: 2000.00, 
            dataLimite: '2023-02-28',
            status: 'concluida' 
        },
        { 
            id: 6, 
            descricao: 'Fundo de emergência', 
            categoria: 'Reserva', 
            valorAlvo: 10000.00, 
            valorAtual: 5000.00, 
            dataLimite: '2023-04-30',
            status: 'atrasada' 
        }
    ];
    
    // Preenche tabela
    const tbody = $('#tabelaMetas tbody');
    tbody.empty();
    
    metas.forEach(meta => {
        const progresso = (meta.valorAtual / meta.valorAlvo) * 100;
        const progressoClass = progresso >= 100 ? 'bg-success' : progresso >= 50 ? 'bg-warning' : 'bg-danger';
        const statusClass = 
            meta.status === 'concluida' ? 'text-success' : 
            meta.status === 'andamento' ? 'text-warning' : 'text-danger';
        const statusTexto = 
            meta.status === 'concluida' ? 'Concluída' : 
            meta.status === 'andamento' ? 'Em andamento' : 'Atrasada';
        
        tbody.append(`
            <tr>
                <td>${meta.descricao}</td>
                <td>${meta.categoria}</td>
                <td>R$ ${meta.valorAlvo.toFixed(2).replace('.', ',')}</td>
                <td>R$ ${meta.valorAtual.toFixed(2).replace('.', ',')}</td>
                <td>
                    <div class="progress">
                        <div class="progress-bar ${progressoClass}" role="progressbar" 
                             style="width: ${Math.min(progresso, 100)}%" 
                             aria-valuenow="${progresso}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${progresso.toFixed(0)}%
                        </div>
                    </div>
                </td>
                <td>${formatarData(meta.dataLimite)}</td>
                <td class="${statusClass}">${statusTexto}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 editar-meta" data-id="${meta.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger excluir-meta" data-id="${meta.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
    
    // Inicializa gráfico
    initMetasChart(metas);
}

function initMetasChart(metas) {
    const ctx = document.getElementById('metasChart').getContext('2d');
    
    const concluidas = metas.filter(m => m.status === 'concluida').length;
    const andamento = metas.filter(m => m.status === 'andamento').length;
    const atrasadas = metas.filter(m => m.status === 'atrasada').length;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Em andamento', 'Atrasadas'],
            datasets: [{
                data: [concluidas, andamento, atrasadas],
                backgroundColor: [
                    'rgba(25, 135, 84, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)'
                ],
                borderColor: [
                    'rgba(25, 135, 84, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function setupMetasEventos() {
    // Formulário de meta
    $('#formMeta').submit(function(e) {
        e.preventDefault();
        
        const meta = {
            descricao: $('#metaDescricao').val(),
            categoria: $('#metaCategoria').find('option:selected').text(),
            valorAlvo: parseFloat($('#metaValorAlvo').val()),
            valorAtual: 0, // Inicia com 0
            dataLimite: $('#metaDataLimite').val(),
            status: 'andamento' // Status padrão
        };
        
        console.log('Nova meta:', meta);
        // Aqui você enviaria para a API
        
        // Fecha o modal e recarrega as metas
        $('#novaMetaModal').modal('hide');
        loadMetas();
    });
    
    // Editar meta
    $(document).on('click', '.editar-meta', function() {
        const metaId = $(this).data('id');
        console.log('Editar meta:', metaId);
        // Implementar lógica de edição
    });
    
    // Excluir meta
    $(document).on('click', '.excluir-meta', function() {
        const metaId = $(this).data('id');
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            console.log('Excluir meta:', metaId);
            // Implementar lógica de exclusão
            loadMetas();
        }
    });
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}