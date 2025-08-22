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
    td_status.innerText = arrayAluguel[i].status;

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
            <td>${aluguel.status}</td>
            
            <td>
                <img src="/tudo/icons/gostar.png" class="icone-recebido" data-index="${start + index}" alt="Editar">
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${start + index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    criarBotoesPaginacao(aluguelFiltradas.length, page);
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

// Excluir
tbody.addEventListener('click', (e) => {
    //editar
    document.getElementById('btnConfirmarEditar').addEventListener('click', () => {
        Atualizar();
        fecharModalConfirmarEditar();
    });
    if (e.target.classList.contains('icone-editar')) {
        linhaEditando = e.target.closest('tr');

        const locatario = linhaEditando.children[0].textContent;
        const livro = linhaEditando.children[1].textContent;
        const autor = linhaEditando.children[2].textContent;
        const editora = linhaEditando.children[3].textContent;
        const devolucao = linhaEditando.children[4].textContent;
        const status = linhaEditando.children[5].textContent;

        const container = document.getElementById('dadosAtualização');
        container.innerHTML = `
                    <input type="text" id="editLocatario" value="${locatario}">
                    <input type="text" id="editLivro" value="${livro}">
                    <input type="date" id="editAutor" value="${devolucao}">
                `;

        document.getElementById('modal-editar').style.display = 'flex';
    }

    if (e.target.classList.contains('icone-recebido')) {
        const linha = e.target.closest('tr');
        const locatario = linha.children[0].textContent;
        const tituloLivro = linha.children[1].textContent;

        let alugueis = JSON.parse(localStorage.getItem("alugueis")) || [];

        alugueis = alugueis.map(aluguel => {
            if (aluguel.locatario === locatario && aluguel.tituloLivro === tituloLivro) {
                aluguel.status = "Recebido";
                aluguel.dataRecebimento = new Date().toISOString().split('T')[0]; // Salva data atual
            }
            return aluguel;
        });

        localStorage.setItem("alugueis", JSON.stringify(alugueis));
        carregarAlugueis();
    }




});
function Atualizar() {
    linhaEditando.children[0].textContent = document.getElementById('editLocatario').value.trim();
    linhaEditando.children[1].textContent = document.getElementById('editLivro').value.trim();
    linhaEditando.children[2].textContent = document.getElementById('editAutor').value.trim();
    linhaEditando.children[3].textContent = document.getElementById('editEditora').value.trim();
    linhaEditando.children[4].textContent = document.getElementById('editDevolucao').value.trim();
    linhaEditando.children[5].textContent = document.getElementById('editStatus').value.trim();

    fecharModalAtualizar();
}


function fecharModalAtualizar() {
    document.getElementById('modal-editar').style.display = 'none';
}
// Variável global para controlar qual ação está sendo confirmada
let locatarioASerDeletado = null;

function abrirModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'flex';
}

function fecharModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'none';
}

function abrirModalConfirmarDeletar(linha) {
    locatarioASerDeletado = linha;
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';
}

function fecharModalConfirmarDeletar() {
    document.getElementById('modal-confirmar-deletar').style.display = 'none';
}
function carregarAlugueis() {
    const alugueis = JSON.parse(localStorage.getItem("alugueis")) || [];
    const tbody = document.getElementById("tbody-locatarios");
    tbody.innerHTML = ""; // Limpa a tabela antes

    const hoje = new Date().toISOString().split('T')[0];

    alugueis.forEach(aluguel => {
        let status;
        const hoje = new Date().toISOString().split('T')[0];

        if (aluguel.status === "Recebido") {
            status = "Recebido";

            // Verifica se já passaram 7 dias do recebimento
            const dataRecebimento = new Date(aluguel.dataRecebimento);
            const hojeDate = new Date();
            const diferencaDias = Math.floor((hojeDate - dataRecebimento) / (1000 * 60 * 60 * 24));

            if (diferencaDias >= 0.01
            ) {
                return; // Não renderiza esse aluguel na tabela
            }

        } else {
            status = aluguel.dataDevolucao >= hoje ? "No Prazo" : "Atrasado";
        }

        const linha = document.createElement("tr");
        linha.innerHTML = `
                    <td>${aluguel.id}</td>
                    <td>${aluguel.renter?.name}</td>
                    <td>${aluguel.book?.name}</td>
                    <td>${aluguel.rentDate}</td>
                    <td>${aluguel.devolutionDate}</td>
                    <td>${aluguel.status}</td>
                    <td>
                        <img src="/tudo/icons/gostar.png" class="icone-recebido" alt="Marcar como Recebido">
                        <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" alt="Editar">
                        
                    </td>
                `;
        tbody.appendChild(linha);
    });

}


function irParaLocatarios() {
    window.location.href = "/tudo/html/locatario.html";
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

