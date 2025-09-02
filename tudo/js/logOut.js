function logout() {
    // Remove o token do localStorage
    localStorage.removeItem('authToken');

    // (Opcional) Remove qualquer outro dado sensível armazenado
    localStorage.removeItem('usuario');

    // Redireciona para a tela de login
    window.location.href = '/index.html';
}
document.getElementById('btnLogout').addEventListener('click', logout);


const containerMenu = document.querySelector('.containerMenu');
const containerOptions = document.querySelector('.containerOptions');

function ajustarMenuAltura() {
    const alturaMenu = containerOptions.offsetHeight;
    containerMenu.style.height = alturaMenu * 0.07 + 'px'; // exemplo, 7% da altura
}

window.addEventListener('resize', ajustarMenuAltura);
ajustarMenuAltura();

const hamburger = document.getElementById('hamburger');
const telaUsuario = document.querySelector('.TelaLocal');

hamburger.addEventListener('click', () => {
    containerOptions.classList.toggle('ativo');
    telaUsuario.classList.toggle('menu-ativo');
    hamburger.classList.toggle('active');
});

const btnFechar = document.querySelector('.btn-fechar-menu');
const menu = document.querySelector('.containerOptions');
const tela = document.querySelector('.TelaLocal');

btnFechar.addEventListener('click', () => {
    menu.classList.remove('ativo');
    tela.classList.remove('menu-ativo');
});

function mostrarMensagem(texto, duracao = 3000) {
  const mensagem = document.getElementById('mensagem');
  mensagem.textContent = texto;
  mensagem.classList.add('show');

  // Esconde depois de 'duracao' ms
  setTimeout(() => {
    mensagem.classList.remove('show');
  }, duracao);
}
// Sobrescreve o alert padrão
window.alert = function(msg) {
    mostrarMensagem(msg, 3000); // 3000ms = 3 segundos de duração
};