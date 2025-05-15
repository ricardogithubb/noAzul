$(document).ready(function () {
    const mainButton = document.getElementById('mainButton');
        const fabContainer = document.querySelector('.fab-container');
        
        mainButton.addEventListener('click', () => {
            fabContainer.classList.toggle('active');
            mainButton.classList.toggle('rotate-plus');
            if($('#modalTelaInteira').is(':hidden')) {
                $('#modalTelaInteira').modal('show');
            } else {
                $('#modalTelaInteira').modal('hide');
            }
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('active');
                mainButton.classList.remove('rotate-plus');
                $('#modalTelaInteira').modal('hide');
            }
        });
        
        // Adicionar eventos para os botões secundários
        document.getElementById('despesas').addEventListener('click', () => {
            alert('Cadastrar Despesa');
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
        });
        
        document.getElementById('receitas').addEventListener('click', () => {
            alert('Cadastrar Receita');
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
        });
        
        document.getElementById('categorias').addEventListener('click', () => {
            alert('Cadastrar Categoria');
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
        });
        
        document.getElementById('contas').addEventListener('click', () => {
            alert('Cadastrar Conta');
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
        });
});