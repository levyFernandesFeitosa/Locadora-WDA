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

    td_id.innerText = arrayUsuario[i].id;
    td_nome.innerText = arrayUsuario[i].name;
    td_email.innerText = arrayUsuario[i].email;
    td_role.innerText = arrayUsuario[i].role;
    

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_email.setAttribute('data-label', 'E-mail:');
    td_role.setAttribute('data-label', 'Permição:');

    let imgVisu = document.createElement('img');
    imgVisu.src = "/tudo/icons/olho.png";
    imgVisu.className = 'icone-visualizar';
    imgVisu.setAttribute("onclick", "preparaLocatario(" + JSON.stringify(arrayLocatarios[i]) + ")");
    td_acoes.appendChild(imgVisu);

    let imgEdit = document.createElement('img');
    imgEdit.src = "/tudo/icons/ferramenta-lapis.png";
    imgEdit.className = 'icone-editar';
    imgEdit.setAttribute("onclick", "preparaLocatario(" + JSON.stringify(arrayLocatarios[i]) + ")");
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
const rowsPerPage = 7;

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
            editora.email.toLowerCase().includes(termo) ||
            editora.role.toLowerCase().includes(termo)
        );
    });

    let start = (page - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = usuarioFiltradas.slice(start, end);

    paginatedItems.forEach((usuario, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.name}</td>
            <td>${usuario.email}</td>
            <td>${usuario.role}</td>
            <td>
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${start + index}" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" data-index="${start + index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    criarBotoesPaginacao(usuarioFiltradas.length, page);
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
    const permissao = document.querySelector('input[name="tipo"]:checked').value;

    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Preencha todos os campos!");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não conferem!");
        return;
    }

    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
                <td>${nome}</td>
                <td>${email}</td>
                <td>${permissao}</td>
                <td>
                    <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" alt="Editar">
                    <img src="/tudo/icons/lixo.png" class="icone-deletar" alt="Deletar">
                </td>
            `;

    tbody.appendChild(novaLinha);

    // Salvar no LocalStorage
    const novoUsuario = { nome, email, permissao };
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    fecharModal();
    limparCampos();
});

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
    document.getElementById('modal-editar').style.display = 'flex';

    document.getElementById('editNome').value = linha.children[0].textContent;
    document.getElementById('editEmail').value = linha.children[1].textContent;

    const permissao = linha.children[2].textContent;
    document.querySelectorAll('input[name="editTipo"]').forEach(radio => {
        radio.checked = (radio.value === permissao);
    });
}

document.getElementById('btnConfirmarEditar').addEventListener('click', () => {
    const nome = document.getElementById('editNome').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const senha = document.getElementById('editSenha').value.trim();
    const confirmarSenha = document.getElementById('editConfirmarSenha').value.trim();
    const permissao = document.querySelector('input[name="editTipo"]:checked').value;

    if (!nome || !email) {
        alert("Nome e email são obrigatórios!");
        return;
    }

    if (senha && senha !== confirmarSenha) {
        alert("As senhas não conferem!");
        return;
    }

    // Atualizar na tabela
    const emailAntigo = linhaEditando.children[1].textContent;
    linhaEditando.children[0].textContent = nome;
    linhaEditando.children[1].textContent = email;
    linhaEditando.children[2].textContent = permissao;

    // Atualizar no LocalStorage
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios = usuarios.map(u => {
        if (u.email === emailAntigo) {
            return { nome, email, permissao };
        }
        return u;
    });

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    fecharModalAtualizar();
    fecharModalConfirmarEditar();
});

function abrirModalConfirmarDeletar(linha) {
    linhaParaDeletar = linha;
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';
}

document.getElementById('btnConfirmarDeletar').addEventListener('click', () => {
    if (linhaParaDeletar) {
        const emailDeletado = linhaParaDeletar.children[1].textContent;

        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios = usuarios.filter(u => u.email !== emailDeletado);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        linhaParaDeletar.remove();
        linhaParaDeletar = null;
        document.getElementById('modal-confirmar-deletar').style.display = 'none';
    }
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
    const termo = inputPesquisa.value.toLowerCase();
    const linhas = document.querySelectorAll('#tbody-locatarios tr');

    linhas.forEach(linha => {
        const textoLinha = linha.textContent.toLowerCase();
        if (textoLinha.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
});