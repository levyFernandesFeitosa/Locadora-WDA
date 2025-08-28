
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
    td_endereco.innerText = arrayLocatarios[i].address;

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_email.setAttribute('data-label', 'E-mail:');
    td_telefone.setAttribute('data-label', 'Telefone:');
    td_CPF.setAttribute('data-label', 'CPF:');
    td_endereco.setAttribute('data-label', 'endereco:');
    td_acoes.setAttribute('data-label', 'Ações:');

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

const arrayLocatarios = []

function getLocatarios() {
  if (!token) {
    console.error("Não foi possível fazer a requisição: token ausente.");
    return;
  }

  api.get('/renter')
    .then(response => {
      console.log(response.data);
      let dadosLocatarios = response.data;
      locatarios = response.data; // ou ajuste conforme o formato da API
      // Limpar o array antes de inserir os dados
      arrayLocatarios.length = 0;

      if (Array.isArray(dadosLocatarios)) {
        arrayLocatarios.push(...dadosLocatarios);
      } else {
        arrayLocatarios.push(dadosLocatarios);
      }

      carregarLocatarios(currentPage);
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message);
      if (e.response && e.response.status === 403) {
        alert('Acesso negado (403). Verifique suas credenciais ou permissões.');
      }
    });
}

let locatarios = JSON.parse(localStorage.getItem('locatarios')) || [];

const tbody = document.getElementById('tbody-locatarios');
const botaoCadastrar = document.getElementById('button');
const btnCadastrar = document.querySelector('.btn-cadastrar');
const modalOverlay = document.getElementById('modal-overlay');
const campoPesquisa = document.getElementById('pesquisa');

let editando = false;
let linhaEditando = null;
let currentPage = 1;
const rowsPerPage = 6;

function salvarLocatarios() {
    localStorage.setItem('', JSON.stringify(locatarios));
}

function carregarLocatarios(page = 1) {
    tbody.innerHTML = '';

    const termo = campoPesquisa.value.toLowerCase();

    const locatariosFiltrados = arrayLocatarios.filter(locatario => {
        return (
            locatario.name.toLowerCase().includes(termo) ||
            locatario.email.toLowerCase().includes(termo) ||
            locatario.telephone.toLowerCase().includes(termo) ||
            locatario.cpf.toLowerCase().includes(termo) ||
            locatario.address.toLowerCase().includes(termo)
        );
    });

    const isMobile = window.innerWidth <= 768;
    let locatariosParaMostrar;

    if (isMobile) {
        locatariosParaMostrar = locatariosFiltrados;
        document.getElementById("pagination").style.display = "none";
    } else {
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        locatariosParaMostrar = locatariosFiltrados.slice(start, end);
        document.getElementById("pagination").style.display = "block";
    }

    locatariosParaMostrar.forEach((locatario, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${locatario.id}</td>
            <td>${locatario.name}</td>
            <td>${locatario.email}</td>
            <td>${locatario.telephone}</td>
            <td>${locatario.cpf}</td>
            <td>${locatario.address}</td>
            <td>
                <img src="/tudo/icons/olho.png" class="icone-visualizar" data-index="${index}" alt="Visualizar">
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${index}" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" data-index="${index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (!isMobile) {
        criarBotoesPaginacao(locatariosFiltrados.length, page);
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
    const cpf = document.getElementById('inputCPF').value.trim();
    const endereco = document.getElementById('inputEndereco').value.trim();
    
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
    api.post('/renter', {
        name: nome,
        email,
        telephone: telefone,
        cpf,
        address: endereco
    })
    .then(res => {
        getLocatarios(); // Recarrega a lista da API
        fecharModal();
    })
    .catch(err => {
        console.error(err.response?.data || err.message);
        alert("Erro ao cadastrar editora.");
    });

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

function visualizarLocatario(linha) {
    const index = linha.querySelector('.icone-visualizar').dataset.index;
    const locatario = arrayLocatarios[index];

    const container = document.getElementById('dadosVisualizacao');
    container.innerHTML = `
       <div class="input-group">
            <input type="text" id="editNome" value="${locatario.name}" required>
            <label for="editNome">Nome do Locatário</label>
        </div>

        <div class="input-group">
            <input type="email" id="editEmail" value="${locatario.email}" required>
            <label for="editEmail">Email</label>
        </div>

        <div class="input-group">
            <input type="text" id="editTelefone" value="${locatario.telephone}" required>
            <label for="editTelefone">Telefone</label>
        </div>

        <div class="input-group">
            <input type="text" id="editCPF" value="${locatario.cpf}" required>
            <label for="editCPF">CPF</label>
        </div>

        <div class="input-group">
            <input type="text" id="editEndereco" value="${locatario.address}" required>
            <label for="editEndereco">Endereço</label>
        </div>
    `;
    document.getElementById('modal-visualizar').style.display = 'flex';
}

function editarLocatario(linha) {
    const index = linha.querySelector('.icone-editar').dataset.index;
    const locatario = arrayLocatarios[index];

    linhaEditando = index;
    editando = true;

    const container = document.getElementById('dadosAtualização');
    container.innerHTML = `
        <div class="input-group">
            <input type="text" id="editNome" value="${locatario.name}" required>
            <label for="editNome">Nome do Locatário</label>
        </div>

        <div class="input-group">
            <input type="email" id="editEmail" value="${locatario.email}" required>
            <label for="editEmail">Email</label>
        </div>

        <div class="input-group">
            <input type="text" id="editTelefone" value="${locatario.telephone}" required>
            <label for="editTelefone">Telefone</label>
        </div>

        <div class="input-group">
            <input type="text" id="editCPF" value="${locatario.cpf}" required>
            <label for="editCPF">CPF</label>
        </div>

        <div class="input-group">
            <input type="text" id="editEndereco" value="${locatario.address}" required>
            <label for="editEndereco">Endereço</label>
        </div>
    `;


    document.getElementById('modal-editar').style.display = 'flex';

    document.getElementById('btnConfirmarEditar').onclick = () => {
       const locatario = arrayLocatarios[linhaEditando];

        const dadosAtualizados = {
            name: document.getElementById('editNome').value.trim(),
            email: document.getElementById('editEmail').value.trim(),
            telephone: document.getElementById('editTelefone').value.trim(),
            cpf: document.getElementById('editCPF').value.trim(),
            address: document.getElementById('editEndereco').value.trim()
        };

        api.put(`/renter/${locatario.id}`, dadosAtualizados)
        .then(response => {
            arrayLocatarios[linhaEditando] = response.data; // atualiza array local
            carregarLocatarios(currentPage);
            fecharModalAtualizar();
            fecharModalConfirmarEditar();
        })
        .catch(err => {
            console.error('Erro ao atualizar locatário:', err.response?.data || err.message);
            alert('Não foi possível atualizar o locatário.');
        });
    };
}

function abrirModalConfirmarDeletar(linha) {
    locatarioASerDeletado = linha;
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';

    document.getElementById('btnConfirmarDeletar').onclick = () => {
        document.getElementById('btnConfirmarDeletar').onclick = () => {
            const index = locatarioASerDeletado.rowIndex - 1; // ajusta para índice do array
            const locatario = arrayLocatarios[index];

            api.delete(`/renter/${locatario.id}`)
            .then(() => {
                arrayLocatarios.splice(index, 1);
                carregarLocatarios(currentPage);
                fecharModalConfirmarDeletar();
            })
            .catch(err => {
                console.error('Erro ao deletar locatário:', err.response?.data || err.message);
                alert('Não foi possível deletar o locatário.');
            });
        };

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

const inputPesquisa = document.getElementById('pesquisa');

inputPesquisa.addEventListener('input', () => {
    carregarLocatarios(1); // pesquisa integrada à paginação
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


