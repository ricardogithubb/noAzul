// Gerenciamento de autenticação e login

$(document).ready(function() {
    // Verifica se há um usuário logado
    // if (localStorage.getItem('userLoggedIn') && window.location.pathname.endsWith('index.html')) {
    //     window.location.href = 'dashboard.html';
    // }

    // Formulário de login
    $('#btEntrar').click(function(e) {
        // e.preventDefault();

        alert('Autenticando...');
        
        const email = $('#email').val();
        const password = $('#password').val();
        const remember = $('#remember').is(':checked');

        // Simulação de autenticação - em produção, seria uma chamada AJAX para o backend
        if (email && password) {

            try {
                
                $.ajax({
                    type: "POST",
                    url: "https://apinoazul.markethubplace.com/api/login",
                    contentType: "application/json",
                    data: JSON.stringify({ email, password }),
                    dataType: "json",
                    success: function (response) {
                        alert('Sucesso');
                        //converter objeto para json
                        // JSON.stringify(response)
                        alert(response.access_token); // Exibe a mensagem de sucesso
                        console.log("Token:", response.token); // Exibe o token no console
                
                        // Opcional: armazenar o token no localStorage
                        localStorage.setItem("authToken", response.token);
    
                        // Redireciona para o dashboard
                        window.location.href = 'dashboard.html';
                    },
                    error: function (xhr, status, error) {
                        console.error("Erro na requisição:", xhr.status, xhr.responseText);
                        alert("Erro ao fazer login: " + (xhr.responseJSON?.message || "Tente novamente."));
                    }
                });
            } catch (error) {
                alert('Erro ao fazer login: ' + error.message);
            }

            // Salva o estado de login
            // localStorage.setItem('userLoggedIn', 'true');
            
            // // Se "Lembrar-me" estiver marcado, salva as credenciais (não seguro - apenas para demonstração)
            // if (remember) {
            //     localStorage.setItem('userEmail', email);
            //     localStorage.setItem('userPassword', password); // Nunca faça isso em produção!
            // } else {
            //     localStorage.removeItem('userEmail');
            //     localStorage.removeItem('userPassword');
            // }
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