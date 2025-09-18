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
    getLivros();
    carregarEditoras().then(() => {
        transformarSelect("inputEditora");
    });
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

const arrayLivros = []

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
      arrayLivros.length = 0;

      if (Array.isArray(dadosLivros)) {
        arrayLivros.push(...dadosLivros);
      } else {
        arrayLivros.push(dadosLivros);
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
const index = arrayLivros.findIndex(l => l.id == idLivro);
if (index !== -1) {
    arrayLivros[index] = {
        id: parseInt(idLivro),
        name: nome,
        author: autor,
        launchDate: datalancada,
        totalQuantity: parseInt(disponivel),
        totalInUse: parseInt(alugados),
        publisher: { name: nomeEditora }
    };
}

// depois recarrega a tabela
function carregarLivros(page = 1) {
    tbody.innerHTML = '';

    const termoRaw = document.getElementById('pesquisa').value.trim();
    const termo = termoRaw.toLowerCase();

    // Filtra os livros
    const livrosFiltrados = arrayLivros.filter(livro => {
        return (
            livro.name.toLowerCase().includes(termo) ||
            livro.author.toLowerCase().includes(termo) ||
            livro.launchDate.toLowerCase().includes(termo) ||
            livro.totalQuantity.toString().includes(termo) ||
            livro.totalInUse.toString().includes(termo) ||
            livro.publisher.name.toLowerCase().includes(termo)
        );
    });

    const isMobile = window.innerWidth <= 768;
    let livrosParaMostrar;

    if (isMobile) {
        // No celular, mostra todos
        livrosParaMostrar = livrosFiltrados;
        document.getElementById("pagination").style.display = "none";
    } else {
        // Desktop: mantém paginação
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        livrosParaMostrar = livrosFiltrados.slice(start, end);
        document.getElementById("pagination").style.display = "block";
    }

    livrosParaMostrar.forEach((livro, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${livro.id}</td>
            <td>${livro.name}</td>
            <td>${livro.author}</td>
            <td>${livro.launchDate}</td>
            <td>${livro.totalQuantity}</td>
            <td>${livro.totalInUse}</td>
            <td>${livro.publisher.name}</td>
            <td>
                <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" data-index="${index}" alt="Editar">
                <img src="/tudo/icons/lixo.png" class="icone-deletar" data-index="${index}" alt="Deletar">
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (!isMobile) {
        criarBotoesPaginacao(livrosFiltrados.length, page);
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
        const datalist = document.getElementById("listaEditoras");

        // Limpa antes de popular
        datalist.innerHTML = "";

        editoras.forEach(ed => {
            const option = document.createElement("option");
            option.value = ed.name; // mostra o nome da editora
            datalist.appendChild(option);

            // salva no map nome->id
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
    const nomeEditora = document.getElementById('inputEditora').value.trim();
    const idEditora = editorasMap[nomeEditora];
    const alugados = 0;

    if (!nome || !autor || !nomeEditora || !disponivel || !datalancada) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }
    if (!idEditora) {
        alert("Selecione uma editora válida!");
        return;
    }

    try {
        api.post("/book", {
            name: nome,
            author: autor,
            launchDate: datalancada,
            totalQuantity: parseInt(disponivel),
            totalInUse: alugados,
            publisherId: idEditora
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

    const inputEditora = document.getElementById("inputEditora");
    if (inputEditora) {
        inputEditora.value = ""; // limpa o campo
    }

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
                <input type="text" id="editAutor" value="${autor}" required>
                <label for="editAutor">Nome do Autor</label>
            </div>

            <div class="input-group">
                <input type="date" id="editDataLancada" value="${datalancada}" required>
                <label for="editDataLancada">Data Lançamento</label>
            </div>

            <div class="input-group">
                <input type="number" id="editDisponivel" value="${disponivel}" required>
                <label for="editDisponivel">Disponível</label>
            </div>

            <div class="input-group">
                <input type="text" id="editEditora" value="${editora}" required>
                <label for="editEditora">Editora</label>
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

    const idLivro = linhaEditando.children[0].textContent;
    const nome = document.getElementById('editNome').value.trim();
    const autor = document.getElementById('editAutor').value.trim();
    const datalancada = document.getElementById('editDataLancada').value.trim();
    const disponivel = document.getElementById('editDisponivel').value.trim();
    const nomeEditora = document.getElementById('editEditora').value.trim();
    const alugados = parseInt(linhaEditando.children[5].textContent);

    if (!nome || !autor || !datalancada || !disponivel || !nomeEditora) {
        alert("Preencha todos os campos!");
        return;
    }

    const idEditora = editorasMap[nomeEditora];
    if (!idEditora) {
        alert("Editora inválida! Verifique o nome da editora.");
        return;
    }

    api.put(`/book/${idLivro}`, {
        name: nome,
        author: autor,
        launchDate: datalancada,
        totalQuantity: parseInt(disponivel),
        totalInUse: alugados,
        publisherId: parseInt(idEditora)
    })
    .then(() => {
        // Atualiza o array local
        const index = arrayLivros.findIndex(l => l.id == idLivro);
        if (index !== -1) {
            arrayLivros[index] = {
                id: parseInt(idLivro),
                name: nome,
                author: autor,
                launchDate: datalancada,
                totalQuantity: parseInt(disponivel),
                totalInUse: alugados,
                publisher: { name: nomeEditora }
            };
        }

        // Recarrega a tabela
        carregarLivros(currentPage);

        fecharModalAtualizar();
        fecharModalConfirmarEditar();
    })
    .catch(error => {
        console.error("Erro ao atualizar livro:", error.response?.data || error.message);
        alert("Erro ao atualizar livro!");
    });
}

const btnConfirmarEditar = document.getElementById('btnConfirmarEditar');
btnConfirmarEditar.addEventListener('click', () => {
    Atualizar();
});

// Funções para abrir/fechar modais
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

const inputPesquisa = document.getElementById('pesquisa');

inputPesquisa.addEventListener('input', () => {
    carregarLivros(1); // pesquisa integrada à paginação
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

function transformarSelect(selectId) {
    const select = document.getElementById(selectId);
    const wrapper = document.createElement("div");
    wrapper.classList.add("custom-select");

    // Cria a div que mostra a opção selecionada
    const selected = document.createElement("div");
    selected.classList.add("selected");
    selected.textContent = select.options[select.selectedIndex].textContent;

    // Cria a lista de opções
    const optionsList = document.createElement("ul");
    optionsList.classList.add("options");

    Array.from(select.options).forEach((opt, index) => {
        const li = document.createElement("li");
        li.textContent = opt.textContent;

        li.addEventListener("click", () => {
            select.selectedIndex = index;
            selected.textContent = opt.textContent;
            optionsList.classList.remove("show");
        });

        optionsList.appendChild(li);
    });

    selected.addEventListener("click", () => {
        optionsList.classList.toggle("show");
    });

    wrapper.appendChild(selected);
    wrapper.appendChild(optionsList);

    // Esconde o select original e insere o customizado no lugar
    select.style.display = "none";
    select.parentNode.insertBefore(wrapper, select);
}

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




