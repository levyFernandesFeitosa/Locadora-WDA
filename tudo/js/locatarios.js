
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
    getLocatarios()
}

function listaTabela() {
  let tbody = document.getElementById('tbody-locatarios');
  tbody.innerText = '';
  for (let i = 0; i < arrayLocatarios.length; i++) {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_nome = tr.insertCell();
    let td_email = tr.insertCell();
    let td_telefone = tr.insertCell();
    let td_CPF = tr.insertCell();
    let td_endereco = tr.insertCell();
    let td_acoes = tr.insertCell();

    td_id.innerText = arrayLocatarios[i].id;
    td_nome.innerText = arrayLocatarios[i].name;
    td_email.innerText = arrayLocatarios[i].email;
    td_telefone.innerText = arrayLocatarios[i].telephone;
    td_CPF.innerText = arrayLocatarios[i].cpf;
    td_endereco.innerText = arrayLocatarios[i].endereco;

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_email.setAttribute('data-label', 'E-mail:');
    td_telefone.setAttribute('data-label', 'Telefone:');
    td_CPF.setAttribute('data-label', 'CPF:');
    td_endereco.setAttribute('data-label', 'endereco:');
    td_acoes.setAttribute('data-label', 'Ações:');

    let imgEdit = document.createElement('img');
    imgEdit.className = 'fas fa-edit';
    td_acoes.appendChild(imgEdit);
    imgEdit.setAttribute("onclick", "preparaEditar(" + JSON.stringify(arrayEditoras[i]) + ")");

    let imgExcluir = document.createElement('img');
    imgEdit.src = "/tudo/icons/ferramenta-lapis.png"
    td_acoes.appendChild(imgEdit);
    td_acoes.appendChild(imgExcluir);
    imgExcluir.src = "/tudo/icons/lixo.png"
  }
  atualizarPaginacao();
}

const arrayEditoras = []

function getEditoras() {
  if (!token) {
    console.error("Não foi possível fazer a requisição: token ausente.");
    return;
  }

  api.get('/publisher')
    .then(response => {
      console.log(response.data);
      let dadosLocadora = response.data;

      // Limpar o array antes de inserir os dados
      arrayEditoras.length = 0;

      if (Array.isArray(dadosEditora)) {
        arrayEditoras.push(...dadosEditora);
      } else {
        arrayEditoras.push(dadosEditora);
      }

      carregarEditoras(currentPage);
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message);
      if (e.response && e.response.status === 403) {
        alert('Acesso negado (403). Verifique suas credenciais ou permissões.');
      }
    });
}






const tipoUsuario = localStorage.getItem("tipoUsuario");
const emailUsuario = localStorage.getItem("emailUsuario");

document.querySelector('.emailUser').textContent = emailUsuario;

let locatarios = JSON.parse(localStorage.getItem('locatarios')) || [];

const tbody = document.getElementById('tbody-locatarios');
const botaoCadastrar = document.getElementById('button');
const btnCadastrar = document.querySelector('.btn-cadastrar');
const modalOverlay = document.getElementById('modal-overlay');
const campoPesquisa = document.getElementById('pesquisa');

let editando = false;
let linhaEditando = null;
let currentPage = 1;
const rowsPerPage = 5;

function salvarLocatarios() {
    localStorage.setItem('locatarios', JSON.stringify(locatarios));
}

function carregarLocatarios(pagina = 1) {
    tbody.innerHTML = '';

    // Filtra locatarios conforme pesquisa
    const termo = campoPesquisa.value.toLowerCase();
    const locatariosFiltrados = locatarios.filter(loc => {
        return (
            loc.nome.toLowerCase().includes(termo) ||
            loc.telefone.toLowerCase().includes(termo) ||
            loc.email.toLowerCase().includes(termo) ||
            loc.cpf.toLowerCase().includes(termo)
        );
    });

    const start = (pagina - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const locatariosPagina = locatariosFiltrados.slice(start, end);

    locatariosPagina.forEach(loc => {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
            <td>${loc.nome}</td>
            <td>${loc.telefone}</td>
            <td>${loc.email}</td>
            <td>${loc.cpf}</td>
            <td>
                <img src="/tudo/icons/olho.png" class="icone-visualizar" alt="Visualizar">
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" alt="Deletar">
            </td>
        `;
        novaLinha.dataset.cep = loc.cep;
        novaLinha.dataset.uf = loc.uf;
        novaLinha.dataset.cidade = loc.cidade;
        novaLinha.dataset.bairro = loc.bairro;
        novaLinha.dataset.rua = loc.rua;
        novaLinha.dataset.numero = loc.numeroDaCasa;

        tbody.appendChild(novaLinha);
    });

    criarBotoesPaginacao(locatariosFiltrados.length, pagina);
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
            carregarLocatarios(currentPage);
        });

        pagination.appendChild(btn);
    }
}

botaoCadastrar.addEventListener('click', () => {
    limparCampos();
    editando = false;
    abrirModal();
});

btnCadastrar.addEventListener('click', () => {
    const nome = document.getElementById('inputNome').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const telefone = document.getElementById('inputTelefone').value.trim();
    const endereco = document.getElementById('inputEndereco').value.trim();
    const cpf = document.getElementById('inputCPF').value.trim();
    
    // const cep = document.getElementById('inputCEP').value.trim();
    // const uf = document.getElementById('inputUF').value.trim();
    // const cidade = document.getElementById('inputCidade').value.trim();
    // const bairro = document.getElementById('inputBairro').value.trim();
    // const rua = document.getElementById('inputRua').value.trim();
    // const numeroDaCasa = document.getElementById('inputNumero').value.trim();

    if (!nome || !email || !telefone || !cpf || !endereco ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    const novoLocatario = {
        nome, email, telefone, cpf, endereco
    };

    locatarios.push(novoLocatario);
    salvarLocatarios();
    carregarLocatarios(currentPage);
    fecharModal();
    limparCampos();
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

let locatarioASerDeletado = null;

tbody.addEventListener('click', (e) => {
    const linha = e.target.closest('tr');

    if (e.target.classList.contains('icone-deletar')) {
        abrirModalConfirmarDeletar(linha);
    }

    if (e.target.classList.contains('icone-editar')) {
        editarLocatario(linha);
    }

    if (e.target.classList.contains('icone-visualizar')) {
        visualizarLocatario(linha);
    }
});

function editarLocatario(linha) {
    linhaEditando = linha;
    editando = true;

    const nome = linha.children[0].textContent;
    const telefone = linha.children[1].textContent;
    const email = linha.children[2].textContent;
    const cpf = linha.children[3].textContent;

    const cep = linha.dataset.cep;
    const uf = linha.dataset.uf;
    const cidade = linha.dataset.cidade;
    const bairro = linha.dataset.bairro;
    const rua = linha.dataset.rua;
    const numero = linha.dataset.numero;

    const container = document.getElementById('dadosAtualização');
    container.innerHTML = `
                <input type="text" id="editNome" value="${nome}">
                <input type="text" id="editTelefone" value="${telefone}">
                <input type="email" id="editEmail" value="${email}">
                <input type="text" id="editCPF" value="${cpf}">
                <input type="text" id="editCEP" value="${cep}">
                <input type="text" id="editUF" value="${uf}">
                <input type="text" id="editCidade" value="${cidade}">
                <input type="text" id="editBairro" value="${bairro}">
                <input type="text" id="editRua" value="${rua}">
                <input type="text" id="editNumero" value="${numero}">
            `;

    document.getElementById('modal-editar').style.display = 'flex';

    document.getElementById('btnConfirmarEditar').onclick = () => {
        const nomeEdit = document.getElementById('editNome').value.trim();
        const telefoneEdit = document.getElementById('editTelefone').value.trim();
        const emailEdit = document.getElementById('editEmail').value.trim();
        const cpfEdit = document.getElementById('editCPF').value.trim();
        const cepEdit = document.getElementById('editCEP').value.trim();
        const ufEdit = document.getElementById('editUF').value.trim();
        const cidadeEdit = document.getElementById('editCidade').value.trim();
        const bairroEdit = document.getElementById('editBairro').value.trim();
        const ruaEdit = document.getElementById('editRua').value.trim();
        const numeroEdit = document.getElementById('editNumero').value.trim();

        const index = locatarios.findIndex(l => l.cpf === linha.children[3].textContent);
        locatarios[index] = {
            nome: nomeEdit,
            telefone: telefoneEdit,
            email: emailEdit,
            cpf: cpfEdit,
            cep: cepEdit,
            uf: ufEdit,
            cidade: cidadeEdit,
            bairro: bairroEdit,
            rua: ruaEdit,
            numeroDaCasa: numeroEdit
        };

        salvarLocatarios();
        carregarLocatarios(currentPage);
        fecharModalAtualizar();
        fecharModalConfirmarEditar();
    };
}

function visualizarLocatario(linha) {
    const container = document.getElementById('dadosVisualizacao');
    container.innerHTML = `
                <input type="text" value="Nome: ${linha.children[0].textContent}" readonly>
                <input type="text" value="Telefone: ${linha.children[1].textContent}" readonly>
                <input type="text" value="Email: ${linha.children[2].textContent}" readonly>
                <input type="text" value="CPF: ${linha.children[3].textContent}" readonly>
                <input type="text" value="CEP: ${linha.dataset.cep}" readonly>
                <input type="text" value="UF: ${linha.dataset.uf}" readonly>
                <input type="text" value="Cidade: ${linha.dataset.cidade}" readonly>
                <input type="text" value="Bairro: ${linha.dataset.bairro}" readonly>
                <input type="text" value="Rua: ${linha.dataset.rua}" readonly>
                <input type="text" value="Número: ${linha.dataset.numero}" readonly>
            `;
    document.getElementById('modal-visualizar').style.display = 'flex';
}

function abrirModalConfirmarDeletar(linha) {
    locatarioASerDeletado = linha;
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';

    document.getElementById('btnConfirmarDeletar').onclick = () => {
        const cpf = linha.children[3].textContent;
        locatarios = locatarios.filter(loc => loc.cpf !== cpf);
        salvarLocatarios();
        // Ajusta currentPage se deletar última linha da última página
        const maxPage = Math.ceil(locatarios.length / rowsPerPage);
        if (currentPage > maxPage) currentPage = maxPage > 0 ? maxPage : 1;
        carregarLocatarios(currentPage);
        fecharModalConfirmarDeletar();
    };
}

function fecharModalConfirmarDeletar() {
    document.getElementById('modal-confirmar-deletar').style.display = 'none';
}

function abrirModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'flex';
}

function fecharModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'none';
}

function fecharModalAtualizar() {
    document.getElementById('modal-editar').style.display = 'none';
}

function fecharModalVisualizar() {
    document.getElementById('modal-visualizar').style.display = 'none';
}

// Pesquisa atualizada com paginação
campoPesquisa.addEventListener('input', () => {
    currentPage = 1; // volta para a página 1 na pesquisa
    carregarLocatarios(currentPage);
});

// Inicializa exibindo a página 1
carregarLocatarios(currentPage);
