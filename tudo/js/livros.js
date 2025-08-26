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
    getLivros()
    carregarEditoras()
}

function listaTabela() {
  let tbody = document.getElementById('tbody-locatarios');
  tbody.innerText = '';
  for (let i = 0; i < arrayLocatarios.length; i++) {
    let tr = tbody.insertRow();
    let td_id = tr.insertCell();
    let td_nome = tr.insertCell();
    let td_autor = tr.insertCell();
    let td_dataLancamento = tr.insertCell();
    let td_quantidadeTotal = tr.insertCell();
    let td_quantidadeUso = tr.insertCell();
    let td_editor = tr.insertCell();
    let td_acoes = tr.insertCell();

    td_id.innerText = arrayLocatarios[i].id;
    td_nome.innerText = arrayLocatarios[i].name;
    td_autor.innerText = arrayLocatarios[i].author;
    td_dataLancamento.innerText = arrayLocatarios[i].launchDate;
    td_quantidadeTotal.innerText = arrayLocatarios[i].totalQuantity;
    td_quantidadeUso.innerText = arrayLocatarios[i].totalInUse;
    td_editor.innerText = arrayLocatarios[i].publisher.name;

    td_id.setAttribute('data-label', 'Id:');
    td_nome.setAttribute('data-label', 'Nome:');
    td_autor.setAttribute('data-label', 'Autor:');
    td_dataLancamento.setAttribute('data-label', 'DataLaçamento:');
    td_quantidadeTotal.setAttribute('data-label', 'QuantidadeTotal:');
    td_quantidadeUso.setAttribute('data-label', 'QuantidadeUso:');
    td_editor.setAttribute('data-label', 'Editor:');
    td_acoes.setAttribute('data-label', 'Ações:');

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

function getLivros() {
  if (!token) {
    console.error("Não foi possível fazer a requisição: token ausente.");
    return;
  }

  api.get('/book')
    .then(response => {
      console.log(response.data);
      let dadosLivros = response.data;
      livros = response.data; // ou ajuste conforme o formato da API
      // Limpar o array antes de inserir os dados
      arrayLocatarios.length = 0;

      if (Array.isArray(dadosLivros)) {
        arrayLocatarios.push(...dadosLivros);
      } else {
        arrayLocatarios.push(dadosLivros);
      }

      carregarLivros(currentPage);
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

function salvarLivros() {
    localStorage.setItem('livros', JSON.stringify(livros));
}

function carregarLivros(page = 1) {
    tbody.innerHTML = '';

    const campoPesquisa = document.getElementById('pesquisa');
    const termo = campoPesquisa.value.toLowerCase();

    const livrosFiltradas = arrayLocatarios.filter(livros => {
        return (
            livros.name.toLowerCase().includes(termo) ||
            livros.author.toLowerCase().includes(termo) ||
            livros.launchDate.toLowerCase().includes(termo) ||
            livros.totalQuantity.toLowerCase().includes(termo) ||
            livros.totalInUse.toLowerCase().includes(termo) ||
            livros.publisher.toLowerCase().includes(termo)
        );
    });

    let start = (page - 1) * rowsPerPage;
    let end = start + rowsPerPage;
    let paginatedItems = livrosFiltradas.slice(start, end);

    paginatedItems.forEach((livros, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${livros.id}</td>
            <td>${livros.name}</td>
            <td>${livros.author}</td>
            <td>${livros.launchDate}</td>
            <td>${livros.totalQuantity}</td>
            <td>${livros.totalInUse}</td>
            <td>${livros.publisher.name}</td>
            
            <td>
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${start + index}" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" data-index="${start + index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    criarBotoesPaginacao(livrosFiltradas.length, page);
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
            carregarLivros(currentPage);
        });

        pagination.appendChild(btn);
    }
}
let editorasMap = {};

async function carregarEditoras() {
    try {
        const response = await api.get("/publisher");
        const editoras = response.data;
        const select = document.getElementById("inputEditora");
        
        // Limpa as opções existentes para evitar duplicatas
        select.innerHTML = '<option value="">Selecione a Editora</option>';

        editoras.forEach(ed => {
            const option = document.createElement("option");
            option.value = ed.id; // Define o valor como o ID
            option.textContent = ed.name; // Define o texto visível como o nome
            select.appendChild(option);

            // guarda a relação nome -> id para o caso de edição
            editorasMap[ed.name] = ed.id;
        });

    } catch (error) {
        console.error("Erro ao carregar editoras:", error.response?.data || error.message);
    }
}


botaoCadastrar.addEventListener('click', () => {
    limparCampos();
    editando = false;
    abrirModal();
});

btnCadastrar.addEventListener('click', () => {
    const nome = document.getElementById('inputNome').value.trim();
    const autor = document.getElementById('inputAutor').value.trim();
    const datalancada = document.getElementById('inputDataLancada').value.trim();
    const disponivel = document.getElementById('inputEstoque').value.trim();
    const editora = document.getElementById('inputEditora').value.trim();
    const alugados = 0;

    if (!nome || !autor || !editora || !disponivel || !datalancada) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    try {
        api.post("/book", {
            name: nome,
            author: autor,
            launchDate: datalancada,
            totalQuantity: parseInt(disponivel),
            totalInUse: alugados,
            publisherId: parseInt(editora)
        });

        fecharModal();
        limparCampos();
        getLivros(); // recarrega a tabela

    } catch (error) {
        console.error("Erro ao cadastrar livro:", error.response?.data || error.message);
        alert("Erro ao cadastrar livro!");
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


tbody.addEventListener('click', (e) => {
    // Lógica para deletar livro
    if (e.target.classList.contains('icone-deletar')) {
        const linha = e.target.closest('tr');
        const idLivro = linha.children[0].textContent; // Pega o ID do livro
        
        // Abre o modal de confirmação de exclusão
        abrirModalConfirmarDeletar(idLivro);
    }
    // Lógica para alugar livro
    if (e.target.classList.contains('icone-cadastrarAluguel')) {
        const linha = e.target.closest('tr');
        abrirModalAluguel(linha);
    }
});

tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('icone-editar')) {
        linhaEditando = e.target.closest('tr');

        const nome = linhaEditando.children[1].textContent;
        const autor = linhaEditando.children[2].textContent;
        const datalancada = linhaEditando.children[3].textContent;
        const disponivel = linhaEditando.children[4].textContent;
        const alugados = linhaEditando.children[5].textContent;
        const editora = linhaEditando.children[6].textContent;

        const container = document.getElementById('dadosAtualização');
        container.innerHTML = `
            <div class="input-group">
                <input type="text" id="editNome" value="${nome}" required>
                <label for="editNome">Nome do Livro</label>
            </div>

            <div class="input-group">
                <input type="text" id="editTelefone" value="${autor}" required>
                <label for="editTelefone">Nome do Autor</label>
            </div>

            <div class="input-group">
                <input type="date" id="editEmail" value="${datalancada}" required>
                <label for="editEmail">Data Lançada</label>
            </div>

            <div class="input-group">
                <input type="text" id="editSite" value="${disponivel}" required>
                <label for="editSite">Disponivel</label>
            </div>
            <div class="input-group">
                <input type="text" id="editSite" value="${editora}" required>
                <label for="editSite">Editora</label>
            </div>
            
        `;

        document.getElementById('modal-editar').style.display = 'flex';
    }
});


function Atualizar() {
    if (!linhaEditando) {
        alert("Nenhuma linha selecionada para edição.");
        return;
    }

    const idLivro = linhaEditando.children[0].textContent; // pega o ID do livro
    const nome = document.getElementById('editNome').value.trim();
    const autor = document.getElementById('editAutor').value.trim();
    const datalancada = document.getElementById('editDataLancada').value.trim();
    const disponivel = document.getElementById('editDisponivel').value.trim();
    const nomeEditora = document.getElementById('editEditora').value.trim(); // nome da editora
    const alugados = linhaEditando.children[5].textContent;

    if (!nome || !autor || !nomeEditora || !disponivel || !datalancada) {
        alert("Preencha todos os campos!");
        return;
    }

    // Pega o ID da editora pelo nome usando o editorasMap
    const idEditora = editorasMap[nomeEditora];
    if (!idEditora) {
        alert("Editora inválida! Verifique o nome da editora.");
        return;
    }

    // Chamada PUT na API
    api.put(`/book/${idLivro}`, {
        name: nome,
        author: autor,
        launchDate: datalancada,
        totalQuantity: parseInt(disponivel),
        totalInUse: parseInt(alugados),
        publisherId: parseInt(idEditora) // envia o ID correto
    })
    .then(() => {   
        fecharModalAtualizar();
        fecharModalConfirmarEditar()
        // Atualiza os valores na tabela
        linhaEditando.children[1].textContent = nome;
        linhaEditando.children[2].textContent = autor;
        linhaEditando.children[3].textContent = datalancada;
        linhaEditando.children[4].textContent = disponivel;
        linhaEditando.children[5].textContent = alugados;
        linhaEditando.children[6].textContent = nomeEditora; // mostra o nome

        
    })
    .catch(error => {
        console.error("Erro ao atualizar livro:", error.response?.data || error.message);
        alert("Erro ao atualizar livro!");
    });
}

document.getElementById('btnConfirmarEditar').addEventListener('click', () => {
    Atualizar();
    fecharModalConfirmarEditar();
});

function fecharModalAtualizar() {
    document.getElementById('modal-editar').style.display = 'none';
}

function abrirModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'flex';
}

function fecharModalConfirmarEditar() {
    document.getElementById('modal-confirmar-editar').style.display = 'none';
}


// Variável para armazenar o ID do livro a ser deletado
let idLivroParaDeletar = null;

function abrirModalConfirmarDeletar(id) {
    idLivroParaDeletar = id;
    document.getElementById('modal-confirmar-deletar').style.display = 'flex';
}

function fecharModalConfirmarDeletar() {
    document.getElementById('modal-confirmar-deletar').style.display = 'none';
    idLivroParaDeletar = null; // Limpa o ID após fechar
}

document.getElementById('btnConfirmarDeletar').addEventListener('click', () => {
    if (idLivroParaDeletar) {
        deletarLivro(idLivroParaDeletar);
    }
});

// Função para deletar um livro via API
function deletarLivro(id) {
    if (!token) {
        console.error("Não foi possível fazer a requisição: token ausente.");
        return;
    }

    api.delete(`/book/${id}`)
        .then(() => {
            fecharModalConfirmarDeletar();
            getLivros(); // Recarrega a lista de livros para atualizar a tabela
        })
        .catch(e => {
            console.error('Erro ao deletar livro:', e.response?.data || e.message);
            alert("Erro ao deletar livro!");
            fecharModalConfirmarDeletar();
        });
}



