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

const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        "Content-Type": "application/json",
    },
});

const token = localStorage.getItem('authToken');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    alert("Token não encontrado. Faça login.");
}

async function carregarDashboard() {
    try {
        const params = { numberOfMonths: 1 };

        const [
            livrosMaisAlugadosRes,
            entreguesNoPrazoRes,
            entreguesAtrasoRes,
            alugueisAtrasadosRes,
            alugueisPorLocatarioRes,
            alugueisRes,
            locatariosRes
        ] = await Promise.all([
            api.get('/dashboard/bookMoreRented', { params }),
            api.get('/dashboard/deliveredInTimeQuantity', { params }),
            api.get('/dashboard/deliveredWithDelayQuantity', { params }),
            api.get('/dashboard/rentsLateQuantity', { params }),
            api.get('/dashboard/rentsPerRenter', { params }),
            api.get('/rent'),
            api.get('/renter')
        ]);

        const totalAlugueis = Array.isArray(alugueisRes.data) ? alugueisRes.data.length : 0;
        document.getElementById("totalAlugueis").textContent = totalAlugueis;

        // --- Totais (Locatários) ---
        const totalLocatarios = Array.isArray(locatariosRes.data) ? locatariosRes.data.length : 0;
        document.getElementById("totalLocatarios").textContent = totalLocatarios;



        const livrosLabels = livrosMaisAlugadosRes.data.map(item => item.name);
        const livrosData = livrosMaisAlugadosRes.data.map(item => item.totalRents);

        const ctxLivros = document.getElementById('graficoLivrosMaisAlugados').getContext('2d');
        new Chart(ctxLivros, {
            type: 'bar',
            data: {
                labels: livrosLabels,
                datasets: [{
                    label: 'Livros Mais Alugados',
                    data: livrosData,
                    backgroundColor: 'rgba(75, 192, 192, 1)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: { responsive: true }
        });

        // --- Gráfico de Pizza: Entregues no Prazo, Atraso, Atrasados ---
        const ctxPizza = document.getElementById('graficoDistribuicaoAlugueis').getContext('2d');
        new Chart(ctxPizza, {
            type: 'pie',
            data: {
                labels: ['Entregues no Prazo', 'Entregues com Atraso', 'Atualmente Atrasados'],
                datasets: [{
                    label: 'Distribuição de Aluguéis',
                    data: [
                        entreguesNoPrazoRes.data,
                        entreguesAtrasoRes.data,
                        alugueisAtrasadosRes.data
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 1)',   // Verde-água
                        'rgba(255, 183, 0, 0.6)',   // Amarelo
                        'rgba(255, 0, 55, 0.6)'    // Vermelho
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: window.innerWidth <= 768 ? 'bottom' : 'left'
                    }
                }
            }
        });

        // --- Monta tabela de locatários com todos os dados ---
        const locatarios = Array.isArray(locatariosRes.data) ? locatariosRes.data : [];
        const alugueis = Array.isArray(alugueisRes.data) ? alugueisRes.data : [];

        const tabelaLocatarios = locatarios.map(loc => {
            const alugueisDoLoc = alugueis.filter(r => r.renter?.id === loc.id);

            const totalAlugueis = alugueisDoLoc.length;
            const alugueisAtivos = alugueisDoLoc.filter(r => r.status === "ATIVO").length;
            const livrosDevolvidos = alugueisDoLoc.filter(r =>
                r.status === "DELIVERED" || r.status === "DELIVERED_WITH_DELAY" || r.status === "IN_TIME"
            ).length;

            return {
                nome: loc.name,
                totalAlugueis,
                alugueisAtivos,
                livrosDevolvidos
            };
        });

        // --- Paginação ---
        let currentPage = 1;
        const rowsPerPage = 3;

        function renderTablePage(page) {
            const tbody = document.querySelector("#tabelaLocatarios tbody");
            tbody.innerHTML = "";

            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedItems = tabelaLocatarios.slice(start, end);

            paginatedItems.forEach(item => {
                const row = `
        <tr>
            <td>${item.nome}</td>
            <td>${item.totalAlugueis}</td>
            <td>${item.livrosDevolvidos}</td>
        </tr>
        `;
                tbody.insertAdjacentHTML("beforeend", row);
            });

            document.getElementById("paginaInfo").textContent =
                `${page} / ${Math.ceil(tabelaLocatarios.length / rowsPerPage)}`;
        }

        // --- Botões de paginação ---
        document.getElementById("prevPage").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTablePage(currentPage);
            }
        });

        document.getElementById("nextPage").addEventListener("click", () => {
            if (currentPage < Math.ceil(tabelaLocatarios.length / rowsPerPage)) {
                currentPage++;
                renderTablePage(currentPage);
            }
        });

        // --- Primeira renderização ---
        renderTablePage(currentPage);

        function renderTablePage(page = 1) {
            const tbody = document.querySelector("#tabelaLocatarios tbody");
            tbody.innerHTML = "";

            const isMobile = window.innerWidth <= 768; // Ajuste conforme necessário
            let paginatedItems;

            if (isMobile) {
                // Se for celular, mostra todos os itens
                paginatedItems = tabelaLocatarios;
                document.getElementById("prevPage").style.display = "none";
                document.getElementById("nextPage").style.display = "none";
                document.getElementById("paginaInfo").style.display = "none";
            } else {
                // Desktop: aplica paginação
                const start = (page - 1) * rowsPerPage;
                const end = start + rowsPerPage;
                paginatedItems = tabelaLocatarios.slice(start, end);

                document.getElementById("prevPage").style.display = "inline-block";
                document.getElementById("nextPage").style.display = "inline-block";
                document.getElementById("paginaInfo").style.display = "inline-block";
                document.getElementById("paginaInfo").textContent =
                    `${page} / ${Math.ceil(tabelaLocatarios.length / rowsPerPage)}`;
            }

            paginatedItems.forEach(item => {
                const row = `
        <tr>
            <td>${item.nome}</td>
            <td>${item.totalAlugueis}</td>
            <td>${item.livrosDevolvidos}</td>
        </tr>
        `;
                tbody.insertAdjacentHTML("beforeend", row);
            });
        }

        // Atualiza tabela ao redimensionar
        window.addEventListener('resize', () => renderTablePage(currentPage));



    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        if (error.response) {
            console.error('Status do erro:', error.response.status);
            console.error('Mensagem do erro:', error.response.data);
        } else if (error.request) {
            console.error('Nenhuma resposta recebida:', error.request);
        } else {
            console.error('Erro ao configurar requisição:', error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', carregarDashboard);
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