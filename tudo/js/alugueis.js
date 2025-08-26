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
    getAluguel()
}

function listaTabela() {
  let tbody = document.getElementById('tbody-locatarios');
  tbody.innerText = '';
  for (let i = 0; i < arrayAluguel.length; i++) {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_locatario = tr.insertCell();
    let td_livro = tr.insertCell();
    let td_tempo = tr.insertCell();
    let td_alugado = tr.insertCell();
    let td_devolucao = tr.insertCell();
    let td_status = tr.insertCell();
    let td_acoes = tr.insertCell();

    td_id.innerText = arrayAluguel[i].id;
    td_locatario.innerText = arrayAluguel[i].renter?.name;
    td_livro.innerText = arrayAluguel[i].book?.name;
    td_tempo.innerText = arrayAluguel[i].deadLine;
    td_alugado.innerText = arrayAluguel[i].rentDate;
    td_devolucao.innerText = arrayAluguel[i].devolutionDate;
    td_status.innerText = statusPT[arrayAluguel[i].status] || arrayAluguel[i].status;


    td_id.setAttribute('data-label', 'Id:');
    td_locatario.setAttribute('data-label', 'Locatário:');
    td_livro.setAttribute('data-label', 'Livro:');
    td_alugado.setAttribute('data-label', 'Alugado:');
    td_devolucao.setAttribute('data-label', 'Devolução:');
    td_status.setAttribute('data-label', 'Status:');
    td_acoes.setAttribute('data-label', 'Ações:');

    let imgConfirm = document.createElement('img');
    imgConfirm.src = "/tudo/icons/gostar.png";
    imgConfirm.className = 'icone-recebido';
    imgConfirm.setAttribute("onclick", "preparaAluguel(" + JSON.stringify(arrayAluguel[i]) + ")");
    td_acoes.appendChild(imgConfirm);

    let imgEdit = document.createElement('img');
    imgEdit.src = "/tudo/icons/ferramenta-lapis.png";
    imgEdit.className = 'icone-editar';
    imgEdit.setAttribute("onclick", "preparaAluguel(" + JSON.stringify(arrayAluguel[i]) + ")");
    td_acoes.appendChild(imgEdit);
  }
  atualizarPaginacao();
}

const arrayAluguel = []

const statusPT = {
    'IN_TIME': 'NO PRAZO',
    'DELIVERED_WITH_DELAY': "RECEBIDO COM ATRASO",
    "RENTED": "ALUGADO",
    // adicione outros status conforme necessário
};

function getAluguel() {
  if (!token) {
    console.error("Não foi possível fazer a requisição: token ausente.");
    return;
  }

  api.get('/rent')
    .then(response => {
      console.log(response.data);
      let dadosAluguel = response.data;
      aluguel = response.data; // ou ajuste conforme o formato da API
      // Limpar o array antes de inserir os dados
      arrayAluguel.length = 0;

      if (Array.isArray(dadosAluguel)) {
        arrayAluguel.push(...dadosAluguel);
      } else {
        arrayAluguel.push(dadosAluguel);
      }

      carregarAluguel(currentPage);
    })
    .catch(e => {
      console.error('Erro:', e.response?.data || e.message);
      if (e.response && e.response.status === 403) {
        alert('Acesso negado (403). Verifique suas credenciais ou permissões.');
      }
    });
}
let currentPage = 1;
const rowsPerPage = 6   ;

function salvarAluguel() {
    localStorage.setItem('aluguel', JSON.stringify(aluguel));
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
            carregarAluguel(currentPage);
        });

        pagination.appendChild(btn);
    }   
}

const tipoUsuario = localStorage.getItem("tipoUsuario");
const emailUsuario = localStorage.getItem("emailUsuario");
const tbody = document.getElementById('tbody-locatarios');
const botaoCadastrar = document.getElementById('button');
const modalOverlay = document.getElementById('modal-overlay');

let editando = false;
let linhaEditando = null;

function abrirModal() {
    modalOverlay.style.display = 'flex';
}

function fecharModal() {
    modalOverlay.style.display = 'none';
}

function limparCampos() {
    document.querySelectorAll('.modal-form input').forEach(input => input.value = '');
}

// Filtro de pesquisa na tabela
document.getElementById('pesquisa').addEventListener('input', function () {
    const termoPesquisa = this.value.toLowerCase();
    const linhas = document.querySelectorAll('#tbody-locatarios tr');

    linhas.forEach(linha => {
        const textoLinha = linha.textContent.toLowerCase();

        if (textoLinha.includes(termoPesquisa)) {
            linha.style.display = ''; // Mostra a linha
        } else {
            linha.style.display = 'none'; // Oculta a linha
        }
    });
});
const btnAbrirCadastro = document.getElementById('button');
const modalCadastrar = document.getElementById('modal-cadastrarAluguel');
const btnConfirmarAluguel = document.getElementById('btnConfirmarAluguel');

btnAbrirCadastro.addEventListener('click', () => {
    modalCadastrar.style.display = 'flex';
    limparCamposAluguel();
    carregarLocatariosELivros();
});

function fecharModalAluguel() {
    modalCadastrar.style.display = 'none';
}

function limparCamposAluguel() {
    document.getElementById('nomeLocatario').value = '';
    document.getElementById('livro').value = '';
    document.getElementById('tempo').value = '';
}

btnConfirmarAluguel.addEventListener('click', async () => {
    // Pega os valores do formulário
    const renterId = document.getElementById('nomeLocatario')?.value.trim(); 
    const bookId = document.getElementById('livro')?.value.trim(); 
    const tempo = document.getElementById('tempo')?.value; // tempo em dias

    if (!renterId || !bookId || !tempo) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Rent date é hoje
    const rentDate = new Date();

    // Calcula a data de devolução somando o tempo (dias) à data de aluguel
    const devolutionDate = new Date(rentDate);
    devolutionDate.setDate(devolutionDate.getDate() + parseInt(tempo, 10));

    // Formata para yyyy-mm-dd
    const devolutionDateFormatted = devolutionDate.toISOString().split("T")[0];
    const rentDateFormatted = rentDate.toISOString().split("T")[0];

    // Cria o objeto para enviar à API
    const novoAluguel = {
        renterId, 
        bookId,   
        rentDate: rentDateFormatted,
        devolutionDate: devolutionDateFormatted,
        deadLine: tempo
    };

    try {
        const response = await api.post("/rent", novoAluguel);
        alert("Aluguel cadastrado com sucesso!");

        // Atualiza lista
        getAluguel(); 
        fecharModalAluguel();
    } catch (error) {
        console.error("Erro ao cadastrar aluguel:", error.response?.data || error.message);
        alert("Não foi possível cadastrar o aluguel.");
    }
});

async function carregarLocatariosELivros() {
    try {
        // Pega locatários
        const resLocatarios = await api.get('/renter'); // Ajuste a rota conforme sua API
        const locatarios = resLocatarios.data;
        const selectLocatario = document.getElementById('nomeLocatario');
        selectLocatario.innerHTML = '<option value="">Selecione um locatário</option>';
        locatarios.forEach(l => {
            const option = document.createElement('option');
            option.value = l.id;
            option.textContent = l.name;
            selectLocatario.appendChild(option);
        });

        // Pega livros disponíveis
        const resLivros = await api.get('/book'); // Ajuste a rota conforme sua API
        const livros = resLivros.data;
        const selectLivro = document.getElementById('livro');
        selectLivro.innerHTML = '<option value="">Selecione um livro</option>';
        livros.forEach(l => {
            const option = document.createElement('option');
            option.value = l.id;
            option.textContent = l.name;
            selectLivro.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar locatários ou livros:', error.response?.data || error.message);
    }
}

// Modal e variáveis globais para edição
const modalEditar = document.getElementById('modal-editar');
const dadosAtualizacao = document.getElementById('dadosAtualização');
const modalConfirmarEditar = document.getElementById('modal-confirmar-editar');

let aluguelSelecionado = null;        // Guarda o aluguel que está sendo editado
let dadosEdicaoPendentes = null;      // Guarda os dados temporários antes da confirmação

// Função para abrir modal de edição com dados preenchidos
async function preparaAluguel(aluguel) {
    aluguelSelecionado = aluguel;

    modalEditar.style.display = 'flex';
    dadosAtualizacao.innerHTML = `
        <select id="editarLocatario">
            <option value="">Selecione um locatário</option>
        </select>

        <select id="editarLivro">
            <option value="">Selecione um livro</option>
        </select>
        <div class="input-group">
            <input type="date" id="editarPrazo" value="${aluguel.deadLine}" required>
            <label for="editarPrazo">Prazo</label>
        </div>
        <div class="input-group">
            <input type="date" id="editarDataAluguel" value="${aluguel.rentDate}" required>
            <label for="editarDataAluguel">Aluguel</label>
        </div>
        
    `;

    await carregarLocatariosELivrosEdicao();

    document.getElementById('editarLocatario').value = aluguel.renter?.id || '';
    document.getElementById('editarLivro').value = aluguel.book?.id || '';
}

// Carrega locatários e livros no modal de edição
async function carregarLocatariosELivrosEdicao() {
    try {
        const resLocatarios = await api.get('/renter');
        const selectLocatario = document.getElementById('editarLocatario');
        resLocatarios.data.forEach(l => {
            const option = document.createElement('option');
            option.value = l.id;
            option.textContent = l.name;
            selectLocatario.appendChild(option);
        });

        const resLivros = await api.get('/book');
        const selectLivro = document.getElementById('editarLivro');
        resLivros.data.forEach(l => {
            const option = document.createElement('option');
            option.value = l.id;
            option.textContent = l.name;
            selectLivro.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar locatários ou livros para edição:', error.response?.data || error.message);
    }
}

// Função chamada ao clicar em "Atualizar" no modal de edição
function abrirModalConfirmarEditar() {
    const renterId = document.getElementById('editarLocatario').value;
    const bookId = document.getElementById('editarLivro').value;
    const deadLine = document.getElementById('editarPrazo').value;
    const rentDate = document.getElementById('editarDataAluguel').value;

    // Guarda dados temporários
    dadosEdicaoPendentes = { renterId, bookId, deadLine, rentDate};

    // Abre modal de confirmação
    modalConfirmarEditar.style.display = 'flex';    
}

// Confirma atualização e envia para API
document.getElementById('btnConfirmarEditar').addEventListener('click', async () => {
    if (!aluguelSelecionado || !dadosEdicaoPendentes) return;

    try {
        await api.put(`/rent/${aluguelSelecionado.id}`, dadosEdicaoPendentes);
        alert('Aluguel atualizado com sucesso!');
        getAluguel();                    
        fecharModalAtualizar();
        fecharModalConfirmarEditar();
    } catch (error) {
        console.error('Erro ao atualizar aluguel:', error.response?.data || error.message);
        alert('Não foi possível atualizar o aluguel.');
    }
});

// Fechar modal de edição
function fecharModalAtualizar() {
    modalEditar.style.display = 'none';
}

// Fechar modal de confirmação
function fecharModalConfirmarEditar() {
    modalConfirmarEditar.style.display = 'none';
    dadosEdicaoPendentes = null;
}


// Função para registrar recebimento do livro diretamente na tabela
async function registrarRecebimento(aluguel) {
    if (!confirm('Deseja marcar este livro como recebido?')) return;

    const devolutionDate = new Date().toISOString().split('T')[0]; // Data atual

    try {
        await api.put(`/rent/${aluguel.id}`, {
            ...aluguel,
            status: 'Recebido',
            devolutionDate
        });
        alert('Livro recebido com sucesso!');
        getAluguel();
    } catch (error) {
        console.error('Erro ao registrar recebimento:', error.response?.data || error.message);
        alert('Não foi possível registrar o recebimento.');
    }
}

// Alterar os ícones da tabela para usar as funções corretas
function carregarAluguel(page = 1) {
    tbody.innerHTML = '';

    const campoPesquisa = document.getElementById('pesquisa');
    const termo = campoPesquisa.value.toLowerCase();

    const aluguelFiltradas = arrayAluguel.filter(aluguel => {
        return (
            aluguel.id.toString().toLowerCase().includes(termo) ||
            aluguel.renter?.name.toLowerCase().includes(termo) ||
            aluguel.book?.name.toLowerCase().includes(termo) ||
            aluguel.deadLine.toLowerCase().includes(termo) ||
            aluguel.rentDate.toLowerCase().includes(termo) ||
            aluguel.devolutionDate.toLowerCase().includes(termo) ||
            aluguel.status.toLowerCase().includes(termo)    
        );
    });

    let start = (page - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = aluguelFiltradas.slice(start, end);

    paginatedItems.forEach((aluguel, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluguel.id}</td>
            <td>${aluguel.renter?.name}</td>
            <td>${aluguel.book?.name}</td>
            <td>${aluguel.deadLine}</td>
            <td>${aluguel.rentDate}</td>
            <td>${aluguel.devolutionDate}</td>
            <td>${statusPT[aluguel.status.charAt(0).toUpperCase() + aluguel.status.slice(1)] || aluguel.status}</td>


            
            <td>
                <img src="/tudo/icons/gostar.png" class="icone-recebido" alt="Recebido">
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" alt="Editar">
            </td>
        `;
        tbody.appendChild(tr);

        tr.querySelector('.icone-recebido').addEventListener('click', () => registrarRecebimento(aluguel));
        tr.querySelector('.icone-editar').addEventListener('click', () => preparaAluguel(aluguel));
    });

    criarBotoesPaginacao(aluguelFiltradas.length, page);
}