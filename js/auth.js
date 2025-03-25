// Gerenciamento de autenticação e login

$(document).ready(function() {
    // Verifica se há um usuário logado
    if (localStorage.getItem('userLoggedIn') && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }

    // Formulário de login
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();
        const remember = $('#remember').is(':checked');

        // Simulação de autenticação - em produção, seria uma chamada AJAX para o backend
        if (email && password) {
            // Salva o estado de login
            localStorage.setItem('userLoggedIn', 'true');
            
            // Se "Lembrar-me" estiver marcado, salva as credenciais (não seguro - apenas para demonstração)
            if (remember) {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userPassword', password); // Nunca faça isso em produção!
            } else {
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userPassword');
            }

            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    // Preenche os campos se houver credenciais salvas
    if (localStorage.getItem('userEmail')) {
        $('#email').val(localStorage.getItem('userEmail'));
        $('#password').val(localStorage.getItem('userPassword'));
        $('#remember').prop('checked', true);
    }

    // Logout
    $('.logout-btn').click(function() {
        localStorage.removeItem('userLoggedIn');
        window.location.href = 'index.html';
    });
});