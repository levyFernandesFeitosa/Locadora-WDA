function logout() {
    // Remove o token do localStorage
    localStorage.removeItem('authToken');

    // (Opcional) Remove qualquer outro dado sensível armazenado
    localStorage.removeItem('usuario');

    // Redireciona para a tela de login
    window.location.href = '/index.html';
}
document.getElementById('btnLogout').addEventListener('click', logout);
