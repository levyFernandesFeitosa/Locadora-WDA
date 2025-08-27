
const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        "Content-Type": "application/json"
    }
})

const token = localStorage.getItem('authToken');
if (token) {
    console.log('Token encontrado:', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    alert("Token não encontrado. Por favor, faça login.");
    // Aqui você pode redirecionar para a página de login se quiser:
    // window.location.href = '/login.html';
}

window.onload = function(){
    getUsuario()
}

function listaTabela() {
  let tbody = document.getElementById('tbody-locatarios');
  tbody.innerText = '';
  for (let i = 0; i < arrayUsuario.length; i++) {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_nome = tr.insertCell();
    let td_email = tr.insertCell();
    let td_role = tr.insertCell();
    let td_acoes = tr.insertCell();


    td_id.innerText = arrayUsuario[i].id;
    td_nome.innerText = arrayUsuario[i].name;
    td_email.innerText = arrayUsuario[i].email;
    td_role.innerText = arrayUsuario[i].role;
    

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_email.setAttribute('data-label', 'E-mail:');
    td_role.setAttribute('data-label', 'Permição:');
    td_acoes.setAttribute('data-label', 'Ações:');

    let imgEdit = document.createElement('img');
    imgEdit.src = "/tudo/icons/ferramenta-lapis.png";
    imgEdit.className = 'icone-editar';
    imgEdit.setAttribute("onclick", "preparaUsuario(" + JSON.stringify(arrayUsuario[i]) + ")");
    td_acoes.appendChild(imgEdit);

    let imgExcluir = document.createElement('img');
    imgExcluir.src = "/tudo/icons/lixo.png";
    imgExcluir.className = 'icone-deletar';
    td_acoes.appendChild(imgExcluir);
  }
  atualizarPaginacao();
}

const arrayUsuario = []

function getUsuario() {
  if (!token) {
    console.error("Não foi possível fazer a requisição: token ausente.");
    return;
  }

  api.get('/user')
    .then(response => {
      console.log(response.data);
      let dadosUsuario = response.data;
      usuario = response.data; // ou ajuste conforme o formato da API
      // Limpar o array antes de inserir os dados
      arrayUsuario.length = 0;

      if (Array.isArray(dadosUsuario)) {
        arrayUsuario.push(...dadosUsuario);
      } else {
        arrayUsuario.push(dadosUsuario);
      }

      carregarUsuario(currentPage);
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message);
      if (e.response && e.response.status === 403) {
        alert('Acesso negado (403). Verifique suas credenciais ou permissões.');
      }
    });
}




const btnCadastrar = document.querySelector('.btn-cadastrar');
const tbody = document.getElementById('tbody-locatarios');
const botaoCadastrar = document.getElementById('button');
const modalOverlay = document.getElementById('modal-overlay');

let currentPage = 1;
const rowsPerPage = 6;

function salvarUsuario() {
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function carregarUsuario(page = 1) {
    tbody.innerHTML = '';

    const campoPesquisa = document.getElementById('pesquisa');
    const termo = campoPesquisa.value.toLowerCase();

    const usuarioFiltradas = arrayUsuario.filter(usuario => {
        return (
            usuario.name.toLowerCase().includes(termo) ||
            usuario.email.toLowerCase().includes(termo) ||
            usuario.role.toLowerCase().includes(termo)
        );
    });

    const isMobile = window.innerWidth <= 768;
    let usuariosParaMostrar;

    if (isMobile) {
        // no celular, mostra todos de uma vez
        usuariosParaMostrar = usuarioFiltradas;
        document.getElementById("pagination").style.display = "none";
    } else {
        // no desktop, mantém a paginação
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        usuariosParaMostrar = usuarioFiltradas.slice(start, end);
        document.getElementById("pagination").style.display = "block";
    }

    usuariosParaMostrar.forEach((usuario, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.name}</td>
            <td>${usuario.email}</td>
            <td>${usuario.role}</td>
            <td>
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${index}" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" data-index="${index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (!isMobile) {
        criarBotoesPaginacao(usuarioFiltradas.length, page);
    }
}


function criarBotoesPaginacao(totalItems, paginaAtual) {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.margin = '0 5px';
        btn.style.padding = '5px 10px';
        btn.style.borderRadius = '5px';
        btn.style.border = i === paginaAtual ? '2px solid #0a6568' : '1px solid #ccc';
        btn.style.background = i === paginaAtual ? '#aefcfc' : 'white';
        btn.style.cursor = 'pointer';

        btn.addEventListener('click', () => {
            currentPage = i;
            carregarUsuario(currentPage);
        });

        pagination.appendChild(btn);
    }
}



botaoCadastrar.addEventListener('click', () => {
    limparCampos();
    abrirModal();
});

btnCadastrar.addEventListener('click', () => {
    const nome = document.getElementById('inputNomeUsuario').value.trim();
    const email = document.getElementById('inputEmailUsuario').value.trim();
    const senha = document.getElementById('inputSenhaUsuario').value.trim();
    const confirmarSenha = document.getElementById('inputConfirmarSenha').value.trim();
    const permissao = document.getElementById('selectTipoUsuario').value;

    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Preencha todos os campos!");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não conferem!");
        return;
    }
    api.post('/user', {
        name: nome,
        email: email,
        password: senha,
        role: permissao
    })
    .then(response => {
        alert("Usuário cadastrado com sucesso!");
        console.log("Novo usuário:", response.data);

        // Atualiza tabela com o novo usuário
        getUsuario();

        fecharModal();
        limparCampos();
    })
    .catch(error => {
        console.error("Erro ao cadastrar:", error.response?.data || error.message);
        alert("Erro ao cadastrar usuário!");
    });
});

let tipoUsuario = "admin";

tbody.addEventListener('click', (e) => {
    const linha = e.target.closest('tr');

    if (e.target.classList.contains('icone-editar')) {
        if (tipoUsuario !== "admin") {
            alert("Você não tem permissão para editar.");
            return;
        }
        linhaEditando = linha;
        abrirModalEditar(linha);
    }

    if (e.target.classList.contains('icone-deletar')) {
        if (tipoUsuario !== "admin") {
            alert("Você não tem permissão para deletar.");
            return;
        }
        abrirModalConfirmarDeletar(linha);
    }
});

function abrirModal() {
    modalOverlay.style.display = 'flex';
}

function fecharModal() {
    modalOverlay.style.display = 'none';
}

function limparCampos() {
    document.querySelectorAll('.modal-form input').forEach(input => input.value = '');
}

function abrirModalEditar(linha) {
    linhaEditando = linha;

    document.getElementById('modal-editar').style.display = 'flex';
    document.getElementById('editNome').value = linha.children[1].textContent;
    document.getElementById('editEmail').value = linha.children[2].textContent;

    // Sincroniza o select com o role do usuário
    const selectRole = document.getElementById('selectTipoUsuarioEditar');
    selectRole.value = linha.children[3].textContent; // role da tabela
}


// Abrir modal de edição com dados da linha
function abrirModalEditar(linha) {
    linhaEditando = linha;

    document.getElementById('modal-editar').style.display = 'flex';
    document.getElementById('editNome').value = linha.children[1].textContent;
    document.getElementById('editEmail').value = linha.children[2].textContent;

    const selectRole = document.getElementById('selectTipoUsuarioEditar');
    selectRole.value = linha.children[3].textContent;
}

// Fechar modal de edição
function fecharModalAtualizar() {
    document.getElementById('modal-editar').style.display = 'none';
    linhaEditando = null;
    limparCamposEditar();
}

// Limpar campos do modal de edição
function limparCamposEditar() {
    document.getElementById('editNome').value = '';
    document.getElementById('editEmail').value = '';
    document.getElementById('editSenha').value = '';
    document.getElementById('editConfirmarSenha').value = '';
}

// Função de atualização do usuário
function atualizarUsuario() {
    if (!linhaEditando) return;

    const nome = document.getElementById('editNome').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const senha = document.getElementById('editSenha').value.trim();
    const confirmarSenha = document.getElementById('editConfirmarSenha').value.trim();
    const permissao = document.getElementById('selectTipoUsuarioEditar').value;

    if (!nome || !email) {
        alert("Nome e email são obrigatórios!");
        return;
    }

    if (senha && senha !== confirmarSenha) {
        alert("As senhas não conferem!");
        return;
    }

    const idUsuario = linhaEditando.children[0].textContent;

    const dadosAtualizados = { name: nome, email: email, role: permissao };
    if (senha) dadosAtualizados.password = senha;

    api.put(`/user/${idUsuario}`, dadosAtualizados)
       .then(res => {

           // Atualiza linha na tabela
           linhaEditando.children[1].textContent = nome;
           linhaEditando.children[2].textContent = email;
           linhaEditando.children[3].textContent = permissao;

           // Atualiza arrayUsuario
           const index = arrayUsuario.findIndex(u => u.id == idUsuario);
           if (index !== -1) {
               arrayUsuario[index] = { ...arrayUsuario[index], ...dadosAtualizados };
           }

           fecharModalAtualizar();
           fecharModalConfirmarEditar();
       })
       .catch(err => {
           console.error("Erro ao atualizar:", err.response?.data || err.message);
           alert("Não foi possível atualizar o usuário.");
       });
}

// Listener do botão de confirmar edição
document.getElementById('btnConfirmarEditar').addEventListener('click', atualizarUsuario);




function abrirModalConfirmarDeletar(linha) {
    linhaParaDeletar = linha;
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';
}

document.getElementById('btnConfirmarDeletar').addEventListener('click', () => {
    if (!linhaParaDeletar) return;

    const idUsuario = linhaParaDeletar.children[0].textContent;

    api.delete(`/user/${idUsuario}`)
       .then(res => {
           alert("Usuário deletado com sucesso!");
           linhaParaDeletar.remove();
           linhaParaDeletar = null;
           fecharModalConfirmarDeletar();
       })
       .catch(err => {
           console.error("Erro ao deletar:", err.response?.data || err.message);
           alert("Não foi possível deletar o usuário.");
       });
});



// Variáveis globais
let linhaEditando = null;
let linhaParaDeletar = null;

function abrirModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'flex';
}

function fecharModalAtualizar() {
    document.getElementById('modal-editar').style.display = 'none';
    linhaEditando = null;
}

function fecharModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'none';
}

function fecharModalConfirmarDeletar() {
    document.getElementById('modal-confirmar-deletar').style.display = 'none';
    linhaParaDeletar = null;
}

const inputPesquisa = document.getElementById('pesquisa');

inputPesquisa.addEventListener('input', () => {
    carregarUsuario(1); // pesquisa integrada à paginação
});



const containerMenu = document.querySelector('.containerMenu');
const containerOptions = document.querySelector('.containerOptions');

function ajustarMenuAltura() {
    const alturaMenu = containerOptions.offsetHeight;
    containerMenu.style.height = alturaMenu * 0.07 + 'px'; // exemplo, 7% da altura
}

window.addEventListener('resize', ajustarMenuAltura);
ajustarMenuAltura();

const hamburger = document.getElementById('hamburger');
const telaUsuario = document.querySelector('.TelaUsuario');

hamburger.addEventListener('click', () => {
    containerOptions.classList.toggle('ativo');
    telaUsuario.classList.toggle('menu-ativo');
    hamburger.classList.toggle('active');
});

const btnFechar = document.querySelector('.btn-fechar-menu');
const menu = document.querySelector('.containerOptions');
const tela = document.querySelector('.TelaUsuario');

btnFechar.addEventListener('click', () => {
    menu.classList.remove('ativo');
    tela.classList.remove('menu-ativo');
});

