$(document).ready(function () {
    const mainButton = document.getElementById('mainButton');
        const fabContainer = document.querySelector('.fab-container');

        let transparenciaTimeout;

        $('#mainButton').css('opacity', 0.05);
        
        mainButton.addEventListener('click', () => {
            fabContainer.classList.toggle('active');
            mainButton.classList.toggle('rotate-plus');
            $('#mainButton').css('opacity', 1);
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
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
            window.location.href = 'despesas.html';
        });
        
        document.getElementById('receitas').addEventListener('click', () => {
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
            window.location.href = 'receitas.html';
        });
        
        document.getElementById('categorias').addEventListener('click', () => {
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
            window.location.href = 'categorias.html';
        });
        
        document.getElementById('contas').addEventListener('click', () => {
            fabContainer.classList.remove('active');
            mainButton.classList.remove('rotate-plus');
            window.location.href = 'contas.html';
        });

        // Escuta o scroll da página
        $(window).on('scroll', function () {
        $('#mainButton').css('opacity', 1); // Torna opaco ao rolar
        console.log('opa');

        // Cancela o timeout anterior se estiver rolando continuamente
        clearTimeout(transparenciaTimeout);

        // Reaplica transparência após 3 segundos parado
        transparenciaTimeout = setTimeout(function () {
            $('#mainButton').css('opacity', 0.05);
        }, 3000);
        });



});