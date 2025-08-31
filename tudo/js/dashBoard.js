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
            quantidadeAlugueisRes
        ] = await Promise.all([
            api.get('/dashboard/bookMoreRented', { params }),
            api.get('/dashboard/deliveredInTimeQuantity', { params }),
            api.get('/dashboard/deliveredWithDelayQuantity', { params }),
            api.get('/dashboard/rentsLateQuantity', { params }),
            api.get('/dashboard/rentsPerRenter', { params }),
            api.get('/dashboard/rentsQuantity', { params })
        ]);

        // --- Totais (Aluguéis) ---
        document.getElementById("totalAlugueis").textContent = quantidadeAlugueisRes.data ?? 0;
    
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
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
                        'rgba(75, 192, 192, 0.6)',   // Verde-água
                        'rgba(255, 206, 86, 0.6)',   // Amarelo
                        'rgba(255, 99, 132, 0.6)'    // Vermelho
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
                        position: 'left'
                    }
                }
            }
        });

        // --- Tabela de Aluguéis por Locatário ---
        const content = alugueisPorLocatarioRes.data.content ?? [];

        let currentPage = 1;
        const rowsPerPage = 3;

        function renderTablePage(page) {
            const tbody = document.querySelector("#tabelaLocatarios tbody");
            tbody.innerHTML = "";

            const start = (page - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedItems = content.slice(start, end);

            paginatedItems.forEach(item => {
                const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.rentsQuantity}</td>
                    <td>${item.activeRents ?? 0}</td>
                </tr>
                `;
                tbody.insertAdjacentHTML("beforeend", row);
            });

            document.getElementById("paginaInfo").textContent = `${page} / ${Math.ceil(content.length / rowsPerPage)}`;
        }

        document.getElementById("prevPage").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTablePage(currentPage);
            }
        });

        document.getElementById("nextPage").addEventListener("click", () => {
            if (currentPage < Math.ceil(content.length / rowsPerPage)) {
                currentPage++;
                renderTablePage(currentPage);
            }
        });

        // Renderiza primeira página
        renderTablePage(currentPage);


        
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
