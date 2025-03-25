$(document).ready(function() {
    // Verifica se o usuário está autenticado ao carregar páginas protegidas
    if (window.location.pathname !== '/index.html' && !localStorage.getItem('userToken')) {
        window.location.href = 'index.html';
    }
    
    // Configura o formulário de login
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();
        
        // Simulação de autenticação
        if (email && password) {
            // Em uma aplicação real, aqui seria uma chamada AJAX para o backend
            localStorage.setItem('userToken', 'simulated-token');
            window.location.href = 'dashboard.html';
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });
});

function logout() {
    localStorage.removeItem('userToken');
    window.location.href = 'index.html';
}   