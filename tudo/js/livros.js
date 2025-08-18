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

    let imgCad = document.createElement('img');
    imgCad.src = "/tudo/icons/livro-de-capa-preta-fechado.png";
    imgCad.className = 'icone-cadastrarAluguel';
    imgCad.setAttribute("onclick", "preparaLocatario(" + JSON.stringify(arrayLocatarios[i]) + ")");
    td_acoes.appendChild(imgCad);

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
const rowsPerPage = 7;

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
                <img src="/tudo/icons/livro-de-capa-preta-fechado.png" class="icone-cadastrarAluguel" data-index="${start + index}" alt="Aluguel">
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
            carregarLocatarios(currentPage);
        });

        pagination.appendChild(btn);
    }
}
async function carregarEditoras() {
  try {
    const response = await api.get("/publisher"); // <-- confere se o endpoint é /publisher
    const editoras = response.data;

    const select = document.getElementById("inputEditora");
    select.innerHTML = "";

    editoras.forEach(editora => {
      const option = document.createElement("option");
      option.value = editora.id;
      option.textContent = editora.name; // ou editora.nome, depende da API
      select.appendChild(option);
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

        alert("Livro cadastrado com sucesso!");
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

// Excluir
tbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('icone-deletar')) {
        const linha = e.target.closest('tr');
        abrirModalConfirmarDeletar(linha);
    }
    document.getElementById('btnConfirmarDeletar').addEventListener('click', () => {
        const nomeLivro = locatarioASerDeletado.children[0].textContent;

        // Pega os alugueis salvos
        const alugueis = JSON.parse(localStorage.getItem("alugueis")) || [];

        // Verifica se existe aluguel com esse livro
        const existeAluguel = alugueis.some(aluguel => aluguel.tituloLivro === nomeLivro);

        if (existeAluguel) {
            alert("Este livro não pode ser apagado porque possui alugueis ativos.");
            fecharModalConfirmarDeletar();
            return;
        }

        // Se não existir aluguel, exclui o livro
        let catalogo = JSON.parse(localStorage.getItem("catalogoLivros")) || [];
        catalogo = catalogo.filter(livro => livro.nome !== nomeLivro);
        localStorage.setItem("catalogoLivros", JSON.stringify(catalogo));

        if (locatarioASerDeletado) {
            locatarioASerDeletado.remove();
            locatarioASerDeletado = null;
            fecharModalConfirmarDeletar();
        }
    });

    //editar
    document.getElementById('btnConfirmarEditar').addEventListener('click', () => {
        Atualizar();
        fecharModalConfirmarEditar();
    });
    if (e.target.classList.contains('icone-cadastrarAluguel')) {
        const linha = e.target.closest('tr');
        abrirModalAluguel(linha);
    }
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
                    <input type="text" id="editNome" placeholder="Nome do Livro" value="${nome}">
                    <input type="text" id="editAutor" placeholder="Autor" value="${autor}">
                    <input type="text" id="editGenero" placeholder="Gênero" value="${datalancada}">
                    <input type="text" id="editDisponivel" placeholder="Disponivel" value="${disponivel}">
                    <input type="email" id="editEditora" placeholder="Editora" value="${editora}">
                    

                    
                `;

        document.getElementById('modal-editar').style.display = 'flex';
    }
    const nomeOriginal = linhaEditando.children[0].getAttribute("data-nome") || linhaEditando.children[0].textContent;

    let catalogo = JSON.parse(localStorage.getItem("catalogoLivros")) || [];

    catalogo = catalogo.map(livro => {
        if (livro.nome === nomeOriginal) {
            return { nome, autor, datalancada, disponivel, alugados, editora };
        }
        return livro;
    });

    localStorage.setItem("catalogoLivros", JSON.stringify(catalogo));


});

function Atualizar() {
    const nome = document.getElementById('editNome').value.trim();
    const autor = document.getElementById('editAutor').value.trim();
    const datalancada = document.getElementById('editDataLancada').value.trim();
    const disponivel = document.getElementById('editDisponivel').value.trim();
    const alugados = document.getElementById('editAluguel').value.trim();
    const editora = document.getElementById('editEditora').value.trim();
    

    if (!nome || !autor || !editora || !disponivel || !alugados || !datalancada) {
        alert("Preencha todos os campos!");
        return;
    }

    // Atualiza a linha na tabela
    linhaEditando.children[1].textContent = nome;
    linhaEditando.children[2].textContent = autor;
    linhaEditando.children[3].textContent = datalancada;
    linhaEditando.children[4].textContent = disponivel;
    linhaEditando.children[5].textContent = alugados;
    linhaEditando.children[6].textContent = editora;
    

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
let livroSelecionadoParaAluguel = null;

// Função para abrir modal de aluguel com os dados preenchidos
function abrirModalAluguel(linha) {
    livroSelecionadoParaAluguel = linha;

    const nome = linha.children[1].textContent;
    const autor = linha.children[2].textContent;
    const editora = linha.children[6].textContent;
    const datalancada = linha.children[3].textContent;

    // Preencher data de devolução com hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataDevolucao').value = hoje;

    // Exibir como texto
    document.getElementById('infoLivro').innerHTML = `
                <div class="textResposta1">Título do Livro: ${nome}</div>
                <div class="textResposta1">Data Lançada: ${datalancada}</div>
                <div class="textResposta1">Autor: ${autor}</div>
                <div class="textResposta1">Editora: ${editora}</div>
            `;


    document.getElementById('modal-cadastrarAluguel').style.display = 'flex';
}

// Fechar modal de aluguel
function fecharModalAluguel() {
    document.getElementById('modal-cadastrarAluguel').style.display = 'none';
}

// Confirmação do aluguel
document.getElementById('btnConfirmarAluguel').addEventListener('click', () => {
    const nomeLocatario = document.getElementById('nomeLocatario').value.trim();
    const emailLocatario = document.getElementById('emailLocatario').value.trim();
    const dataDevolucao = document.getElementById('dataDevolucao').value;

    if (!nomeLocatario || !emailLocatario || !dataDevolucao) {
        alert("Preencha todos os campos do aluguel!");
        return;
    }

    // Verificar se o locatário está cadastrado
    const locatarios = JSON.parse(localStorage.getItem("locatarios")) || [];

    const locatarioValido = locatarios.find(l =>
        l.nome.toLowerCase() === nomeLocatario.toLowerCase() &&
        l.email.toLowerCase() === emailLocatario.toLowerCase()
    );

    if (!locatarioValido) {
        alert("Locatário não cadastrado! Por favor, cadastre o locatário antes de realizar o aluguel.");
        return;
    }


    // Atualiza a tabela
    const disponivel = parseInt(livroSelecionadoParaAluguel.children[4].textContent);
    const alugados = parseInt(livroSelecionadoParaAluguel.children[5].textContent);
    if (disponivel <= 0) {
        alert("Este livro não está disponível para aluguel.");
        return;
    }

    // Atualiza a tabela de livros (reduz estoque e aumenta alugados)
    livroSelecionadoParaAluguel.children[3].textContent = disponivel - 1;
    livroSelecionadoParaAluguel.children[4].textContent = alugados + 1;

    // Pega os dados do livro
    const tituloLivro = livroSelecionadoParaAluguel.children[1].textContent;
    const autor = livroSelecionadoParaAluguel.children[2].textContent;
    const editora = livroSelecionadoParaAluguel.children[6].textContent;

    // Calcula o status 
    const hoje = new Date().toISOString().split('T')[0];
    const status = dataDevolucao >= hoje ? "No Prazo" : "Atrasado";

    // Salva no localStorage o aluguel
    const alugueis = JSON.parse(localStorage.getItem("alugueis")) || [];
    alugueis.push({
        locatario: nomeLocatario,
        email: emailLocatario,
        tituloLivro,
        autor,
        editora,
        dataDevolucao,
        status
    });
    localStorage.setItem("alugueis", JSON.stringify(alugueis));

    if (disponivel <= 0) {
        alert("Este livro não está disponível para aluguel.");
        return;
    }

    livroSelecionadoParaAluguel.children[3].textContent = disponivel - 1;
    livroSelecionadoParaAluguel.children[4].textContent = alugados + 1;

    fecharModalAluguel();
    alert("Aluguel cadastrado com sucesso!");

    // Opcional: Pode guardar as informações do aluguel em uma lista se quiser exibir depois.
});
window.addEventListener('load', () => {
    const catalogo = JSON.parse(localStorage.getItem("catalogoLivros")) || [];

    catalogo.forEach(livro => {
        const novaLinha = document.createElement('tr');
        novaLinha.innerHTML = `
                    <td>${livro.nome}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.datalancada}</td>
                    <td>${livro.disponivel}</td>
                    <td>${livro.alugados}</td>
                    <td>${livro.editora}</td>
                    
                    <td>
                        <img src="/tudo/icons/livro-de-capa-preta-fechado.png" class="icone-cadastrarAluguel" alt="Aluguel">
                        <img src="/tudo/icons/ferramenta-lapis.png" class="icone-editar" alt="Editar">
                        <img src="/tudo/icons/lixo.png" class="icone-deletar" alt="Deletar">
                    </td>
                `;
        tbody.appendChild(novaLinha);
    });
});
// Função de filtro da tabela
document.getElementById('filter').addEventListener('click', function () {
    const termo = document.getElementById('pesquisa').value.toLowerCase();
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

// Opcional: fazer a pesquisa enquanto digita (modo dinâmico)
document.getElementById('pesquisa').addEventListener('input', function () {
    const termo = this.value.toLowerCase();
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




