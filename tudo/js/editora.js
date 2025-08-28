const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        "Content-Type": "application/json"
    }
})

const token = localStorage.getItem('authToken');
if (token) {
        
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    alert("Token não encontrado. Por favor, faça login.");
    // Aqui você pode redirecionar para a página de login se quiser:
    // window.location.href = '/login.html';
}

window.onload = function(){
    getEditoras()
}

function listaTabela() {
  let tbody = document.getElementById('tbody-locatarios');
  tbody.innerText = '';
  for (let i = 0; i < arrayEditoras.length; i++) {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_nome = tr.insertCell();
    let td_email = tr.insertCell();
    let td_telefone = tr.insertCell();
    let td_site = tr.insertCell();
    let td_acoes = tr.insertCell();

    td_id.innerText = arrayEditoras[i].id;
    td_nome.innerText = arrayEditoras[i].name;
    td_email.innerText = arrayEditoras[i].email;
    td_telefone.innerText = arrayEditoras[i].telephone;
    td_site.innerText = arrayEditoras[i].site;

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_email.setAttribute('data-label', 'E-mail:');
    td_telefone.setAttribute('data-label', 'Telefone:');
    td_site.setAttribute('data-label', 'Site:');
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
      let dadosEditora = response.data;

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

const btnCadastrar = document.querySelector('.btn-cadastrar');
const tbody = document.getElementById('tbody-locatarios');
const botaoCadastrar = document.getElementById('button');
const modalOverlay = document.getElementById('modal-overlay');
const paginationDiv = document.getElementById('pagination');

let editoras = JSON.parse(localStorage.getItem('editoras')) || [];
if (!editoras || editoras.length === 0) {
    editoras = [
        { nome: "Companhia das Letras", telefone: "(11) 3333-4444", email: "contato@companhia.com.br", site: "https://www.companhiadasletras.com.br" },
        { nome: "Editora Abril", telefone: "(11) 2222-3333", email: "contato@abril.com.br", site: "https://www.abril.com.br" },
        { nome: "Saraiva", telefone: "(11) 4444-5555", email: "sac@saraiva.com.br", site: "https://www.saraiva.com.br" },
        { nome: "Nova Fronteira", telefone: "(21) 1111-2222", email: "contato@novafronteira.com", site: "https://www.novafronteira.com" },
        { nome: "L&PM", telefone: "(51) 8888-9999", email: "contato@lpm.com", site: "https://www.lpm.com" },
        { nome: "Rocco", telefone: "(21) 7777-6666", email: "contato@rocco.com", site: "https://www.rocco.com" }
    ];
    localStorage.setItem('editoras', JSON.stringify(editoras));
}

let currentPage = 1;
const rowsPerPage = 6;
let linhaEditando = null;

function salvarEditoras() {
    localStorage.setItem('editoras', JSON.stringify(editoras));
}

function carregarEditoras(page = 1) {
    tbody.innerHTML = '';

    const campoPesquisa = document.getElementById('pesquisa');
    const termo = campoPesquisa.value.toLowerCase();

    const editorasFiltradas = arrayEditoras.filter(editora => {
        return (
            editora.name.toLowerCase().includes(termo) ||
            editora.email.toLowerCase().includes(termo) ||
            editora.telephone.toLowerCase().includes(termo) ||
            editora.site.toLowerCase().includes(termo)
        );
    });

    const isMobile = window.innerWidth <= 768;
    let editorasParaMostrar;

    if (isMobile) {
        // no celular mostra tudo de uma vez
        editorasParaMostrar = editorasFiltradas;
        document.getElementById("pagination").style.display = "none";
    } else {
        // no desktop usa paginação
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        editorasParaMostrar = editorasFiltradas.slice(start, end);
        document.getElementById("pagination").style.display = "block";
    }

    editorasParaMostrar.forEach((editora, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${editora.id}</td>
            <td>${editora.name}</td>
            <td>${editora.email}</td>
            <td>${editora.telephone}</td>
            <td>${editora.site}</td>
            <td>
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${index}" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" data-index="${index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (!isMobile) {
        criarBotoesPaginacao(editorasFiltradas.length, page);
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
            carregarEditoras(currentPage);
        });

        pagination.appendChild(btn);
    }
}


botaoCadastrar.addEventListener('click', () => {
    limparCampos();
    abrirModal();
});

btnCadastrar.addEventListener('click', () => {
    const nome = document.getElementById('inputNomeEditora').value.trim();
    const telefone = document.getElementById('inputTelefoneEditora').value.trim();
    const email = document.getElementById('inputEmailEditora').value.trim();
    const site = document.getElementById('inputSiteEditora').value.trim();

    if (!nome || !telefone || !email ) {
        alert("Preencha todos os campos.");
        return;
    }

    api.post('/publisher', {
        name: nome,
        telephone: telefone,
        email: email,
        site: site
    })
    .then(res => {
        getEditoras(); // Recarrega a lista da API
        fecharModal();
    })
    .catch(err => {
        console.error(err.response?.data || err.message);
        alert("Erro ao cadastrar editora.");
    });
});


tbody.addEventListener('click', (e) => {
    const index = e.target.dataset.index;

    if (e.target.classList.contains('icone-editar')) {
        linhaEditando = index;
        const editora = arrayEditoras[index]; // <<< antes usava editoras[index]
        document.getElementById('dadosAtualizacao').innerHTML = ` 
            <div class="input-group">
                <input type="text" id="editNome" value="${editora.name}" required>
                <label for="editNome">Nome da Editora</label>
            </div>

            <div class="input-group">
                <input type="text" id="editTelefone" value="${editora.telephone}" required>
                <label for="editTelefone">Número de Telefone da Editora</label>
            </div>

            <div class="input-group">
                <input type="email" id="editEmail" value="${editora.email}" required>
                <label for="editEmail">Email da Editora</label>
            </div>

            <div class="input-group">
                <input type="text" id="editSite" value="${editora.site}" required>
                <label for="editSite">Site da Editora</label>
            </div>
        `;
        document.getElementById('modal-editar').style.display = 'flex';
    }

    if (e.target.classList.contains('icone-deletar')) {
        abrirModalConfirmarDeletar(index);
    }
});


document.getElementById('btnConfirmarEditar').addEventListener('click', () => {
    const nome = document.getElementById('editNome').value.trim();
    const telefone = document.getElementById('editTelefone').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const site = document.getElementById('editSite').value.trim();

    if (!nome || !telefone || !email) {
        alert("Preencha todos os campos.");
        return;
    }

    const editora = arrayEditoras[linhaEditando];

    api.put(`/publisher/${editora.id}`, {
        name: nome,
        telephone: telefone,
        email: email,
        site: site
    })
    .then(res => {
        getEditoras();
        fecharModalAtualizar();
        fecharModalConfirmarEditar()
    })
    .catch(err => {
        console.error(err.response?.data || err.message);
        alert("Erro ao atualizar editora.");
    });
});

function abrirModalConfirmarDeletar(index) {
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';
    document.getElementById('btnConfirmarDeletar').onclick = () => {
        const editora = arrayEditoras[index];

        api.delete(`/publisher/${editora.id}`)
        .then(res => {
            getEditoras();
            fecharModalConfirmarDeletar();
        })
        .catch(err => {
            console.error(err.response?.data || err.message);
            alert("Erro ao deletar editora.");
        });
    };
}


function abrirModal() { modalOverlay.style.display = 'flex'; }
function fecharModal() { modalOverlay.style.display = 'none'; }
function limparCampos() { document.querySelectorAll('.modal-form input').forEach(input => input.value = ''); }
function abrirModalConfirmarEditar() { document.getElementById('modal-confirmar-editar').style.display = 'flex'; }
function fecharModalConfirmarEditar() { document.getElementById('modal-confirmar-editar').style.display = 'none'; }
function fecharModalAtualizar() { document.getElementById('modal-editar').style.display = 'none'; }




function fecharModalConfirmarDeletar() { document.getElementById('modal-confirmar-deletar').style.display = 'none'; }

document.getElementById('pesquisa').addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    filtrarEditoras(texto);
});

document.getElementById('pesquisa').addEventListener('input', () => {
    currentPage = 1; // sempre volta para a primeira página
    carregarEditoras(currentPage);
});


// Inicializa a tabela com paginação
carregarEditoras(currentPage);

const inputPesquisa = document.getElementById('pesquisa');

inputPesquisa.addEventListener('input', () => {
    carregarEditoras(1); // pesquisa integrada à paginação
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


