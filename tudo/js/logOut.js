// Exibir o email no topo (opcional, se quiser manter isso na tela)
            const emailUsuario = localStorage.getItem("emailUsuario");
            document.querySelector('.emailUser').textContent = emailUsuario;

            // Evento do botão de logout
            document.getElementById('btnLogout').addEventListener('click', () => {
                // Limpar o localStorage (remove email e tipo de usuário)
                localStorage.removeItem("emailUsuario");
                localStorage.removeItem("tipoUsuario");

                // Ou se quiser limpar tudo do localStorage:
                // localStorage.clear();

                // Redirecionar para a tela de login
                window.location.href = "/index.html"; // Ajuste o caminho se for diferente
            });