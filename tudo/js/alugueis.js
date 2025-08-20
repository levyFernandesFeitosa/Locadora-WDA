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

  api.get('/rent')
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


const tipoUsuario = localStorage.getItem("tipoUsuario");
const emailUsuario = localStorage.getItem("emailUsuario");
window.onload = function () {
    // Verifica se já existe algum aluguel no localStorage
    let alugueis = JSON.parse(localStorage.getItem("alugueis"));

    if (!alugueis || alugueis.length === 0) {
        // Dados de exemplo
        alugueis = [
            {
                locatario: "João Silva",
                email: "joao@example.com",
                tituloLivro: "O Senhor dos Anéis",
                autor: "J.R.R. Tolkien",
                editora: "HarperCollins",
                dataDevolucao: "2025-08-15",
                status: "No Prazo"
            },
            {
                locatario: "Maria Souza",
                email: "maria@example.com",
                tituloLivro: "Dom Casmurro",
                autor: "Machado de Assis",
                editora: "Nova Fronteira",
                dataDevolucao: "2025-08-05",
                status: "Atrasado"
            },
            {
                locatario: "Carlos Pereira",
                email: "carlos@example.com",
                tituloLivro: "Harry Potter e a Pedra Filosofal",
                autor: "J.K. Rowling",
                editora: "Rocco",
                dataDevolucao: "2025-08-10",
                status: "No Prazo"
            }
        ];

        localStorage.setItem("alugueis", JSON.stringify(alugueis));
    }

    carregarAlugueis();
}


// Exibir email no topo
document.querySelector('.emailUser').textContent = emailUsuario;

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
                    <input type="text" id="editLocatario" value="Locatário: ${locatario}">
                    <input type="text" id="editLivro" value="Livro: ${livro}">
                    <input type="text" id="editAutor" value="Autor: ${autor}">
                    <input type="text" id="editEditora" value="Editora: ${editora}">
                    <input type="text" id="editDevolucao" value="Devolução: ${devolucao}">
                `;

        document.getElementById('modal-editar').style.display = 'flex';
    }
    if (e.target.classList.contains('icone-visualizar')) {
        const linha = e.target.closest('tr');
        abrirModalVisualizar(linha);
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
function abrirModalVisualizar(linha) {
    const locatario = linha.children[0].textContent;
    const tituloLivro = linha.children[1].textContent;

    // Buscar o aluguel correspondente no localStorage
    const alugueis = JSON.parse(localStorage.getItem("alugueis")) || [];

    const aluguelSelecionado = alugueis.find(aluguel =>
        aluguel.locatario === locatario && aluguel.tituloLivro === tituloLivro
    );

    if (!aluguelSelecionado) {
        alert("Aluguel não encontrado!");
        return;
    }

    document.getElementById('dadosVisualizacao').innerHTML = `
                <div class="tituloVisualizacao">${aluguelSelecionado.tituloLivro}</div>

                <label>Nome do Locatário</label>
                <input type="text" value="${aluguelSelecionado.locatario}" readonly>

                <label>Email do Locatário</label>
                <input type="text" value="${aluguelSelecionado.email}" readonly>

                <label>Data de Devolução</label>
                <input type="text" value="${aluguelSelecionado.dataDevolucao}" readonly>

                <p>Autor: ${aluguelSelecionado.autor}</p>
                <p>Editora: ${aluguelSelecionado.editora}</p>
            `;

    document.getElementById('modal-visualizar').style.display = 'flex';
}



function fecharModalVisualizar() {
    document.getElementById('modal-visualizar').style.display = 'none';
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
                    <td>${aluguel.locatario}</td>
                    <td>${aluguel.tituloLivro}</td>
                    <td>${aluguel.autor}</td>
                    <td>${aluguel.editora}</td>
                    <td>${aluguel.dataDevolucao}</td>
                    <td>${status}</td>
                    <td>
                        <img src="/tudo/icons/gostar.png" class="icone-recebido" alt="Marcar como Recebido">
                        <img src="/tudo/icons/olho.png" class="icone-visualizar" alt="Visualizar">
                        <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" alt="Editar">
                        
                    </td>
                `;
        tbody.appendChild(linha);
    });

}

window.onload = carregarAlugueis;
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
});

function fecharModalAluguel() {
    modalCadastrar.style.display = 'none';
}

function limparCamposAluguel() {
    document.getElementById('nomeLocatario').value = '';
    document.getElementById('emailLocatario').value = '';
    document.getElementById('nomeLivro').value = '';
    document.getElementById('autor').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('editora').value = '';
    document.getElementById('dataDevolucao').value = '';
}

btnConfirmarAluguel.addEventListener('click', () => {
    // Pega os valores do formulário
    const locatario = document.getElementById('nomeLocatario').value.trim();
    const email = document.getElementById('emailLocatario').value.trim();
    const tituloLivro = document.getElementById('nomeLivro').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const editora = document.getElementById('editora').value.trim();
    const dataDevolucao = document.getElementById('dataDevolucao').value;

    if (!locatario || !email || !tituloLivro || !autor || !editora || !dataDevolucao) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Cria o objeto do novo aluguel
    const novoAluguel = {
        locatario,
        email,
        tituloLivro,
        autor,
        genero,
        editora,
        dataDevolucao,
        status: 'No Prazo' // status inicial padrão
    };

    // Busca alugueis do localStorage
    const alugueis = JSON.parse(localStorage.getItem('alugueis')) || [];
    alugueis.push(novoAluguel);
    localStorage.setItem('alugueis', JSON.stringify(alugueis));

    // Atualiza a tabela e fecha o modal
    carregarAlugueis();
    fecharModalAluguel();
});