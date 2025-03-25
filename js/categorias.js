$(document).ready(function() {
    // Carrega categorias
    loadCategorias();
    
    // Configura eventos
    setupCategoriasEventos();
});

function loadCategorias() {
    // Simulação - na prática viria de uma API
    const categorias = [
        { id: 1, nome: 'Salário', tipo: 'receita' },
        { id: 2, nome: 'Freelance', tipo: 'receita' },
        { id: 3, nome: 'Investimentos', tipo: 'receita' },
        { id: 4, nome: 'Alimentação', tipo: 'despesa' },
        { id: 5, nome: 'Moradia', tipo: 'despesa' },
        { id: 6, nome: 'Transporte', tipo: 'despesa' },
        { id: 7, nome: 'Lazer', tipo: 'despesa' },
        { id: 8, nome: 'Saúde', tipo: 'despesa' }
    ];
    
    // Preenche tabela
    const tbody = $('#tabelaCategorias tbody');
    tbody.empty();
    
    categorias.forEach(categoria => {
        const tipoTexto = categoria.tipo === 'receita' ? 'Receita' : 'Despesa';
        const tipoClass = categoria.tipo === 'receita' ? 'text-success' : 'text-danger';
        
        tbody.append(`
            <tr>
                <td>${categoria.nome}</td>
                <td class="${tipoClass}">${tipoTexto}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 editar-categoria" data-id="${categoria.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger excluir-categoria" data-id="${categoria.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function setupCategoriasEventos() {
    // Formulário de categoria
    $('#formCategoria').submit(function(e) {
        e.preventDefault();
        
        const categoria = {
            nome: $('#categoriaNome').val(),
            tipo: $('#categoriaTipo').val()
        };
        
        console.log('Nova categoria:', categoria);
        // Aqui você enviaria para a API
        
        // Fecha o modal e recarrega as categorias
        $('#novaCategoriaModal').modal('hide');
        loadCategorias();
    });
    
    // Editar categoria
    $(document).on('click', '.editar-categoria', function() {
        const categoriaId = $(this).data('id');
        console.log('Editar categoria:', categoriaId);
        // Implementar lógica de edição
    });
    
    // Excluir categoria
    $(document).on('click', '.excluir-categoria', function() {
        const categoriaId = $(this).data('id');
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            console.log('Excluir categoria:', categoriaId);
            // Implementar lógica de exclusão
            loadCategorias();
        }
    });
}