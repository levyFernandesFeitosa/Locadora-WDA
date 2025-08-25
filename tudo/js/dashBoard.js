const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: { "Content-Type": "application/json" }
});

const token = localStorage.getItem('authToken');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    alert("Token não encontrado. Por favor, faça login.");
}

// --- Funções auxiliares ---
function createHorizontalBarChart(canvasId, labels, data, bgColor) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; // protege contra null
    const ctx = canvas.getContext('2d');
    if (window[canvasId + 'Instance']) window[canvasId + 'Instance'].destroy();

    window[canvasId + 'Instance'] = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: "", data, backgroundColor: bgColor, borderRadius: 5 }] },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
        }
    });

    // garante que o canvas esteja visível
    canvas.style.display = 'block';

    // remove mensagem de "Nenhum dado" se existir
    const container = canvas.parentElement;
    const p = container.querySelector("p");
    if (p) container.removeChild(p);
}

function showNoDataMessage(canvasId, message) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    canvas.style.display = 'none'; // oculta canvas
    const container = canvas.parentElement;
    // evita duplicar a mensagem
    if (!container.querySelector("p")) {
        const p = document.createElement("p");
        p.style.textAlign = "center";
        p.textContent = message;
        container.appendChild(p);
    }
}

function populateRenterTable(rentsPerRenter) {
    const tbody = document.querySelector("#tabela-locadores tbody");
    tbody.innerHTML = "";

    if (!rentsPerRenter.length) {
        tbody.innerHTML = "<tr><td colspan='3' style='text-align:center'>Nenhum locatário encontrado</td></tr>";
        return;
    }

    rentsPerRenter.forEach(renter => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${renter.name || renter.locatario || "-"}</td>
            <td>${renter.totalRents || renter.total || renter.qtd || 0}</td>
            <td>${renter.activeRents || renter.active || 0}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Função principal ---
async function initDashboard() {
    const numberOfMonths = 12;

    const endpoints = {
        moreRented: '/dashboard/bookMoreRented',
        deliveredInTime: '/dashboard/deliveredInTimeQuantity',
        deliveredWithDelay: '/dashboard/deliveredWithDelayQuantity',
        rentsLate: '/dashboard/rentsLateQuantity',
        rentsPerRenter: '/dashboard/rentsPerRenter'
    };

    try {
        const [
            moreRentedRes,
            deliveredInTimeRes,
            deliveredWithDelayRes,
            rentsLateRes,
            rentsPerRenterRes
        ] = await Promise.all([
            api.get(endpoints.moreRented, { params: { numberOfMonths } }),
            api.get(endpoints.deliveredInTime, { params: { numberOfMonths } }),
            api.get(endpoints.deliveredWithDelay, { params: { numberOfMonths } }),
            api.get(endpoints.rentsLate, { params: { numberOfMonths } }),
            api.get(endpoints.rentsPerRenter, { params: { numberOfMonths } })
        ]);

        // --- Preparar dados ---
        const moreRented = Array.isArray(moreRentedRes.data) ? moreRentedRes.data : moreRentedRes.data?.data || [];
        const deliveredInTime = deliveredInTimeRes.data?.quantity || deliveredInTimeRes.data?.total || 0;
        const deliveredWithDelay = deliveredWithDelayRes.data?.quantity || deliveredWithDelayRes.data?.total || 0;
        const rentsLate = rentsLateRes.data?.quantity || rentsLateRes.data?.total || 0;
        const rentsPerRenter = Array.isArray(rentsPerRenterRes.data) ? rentsPerRenterRes.data : rentsPerRenterRes.data?.data || [];

        console.log("Dados da API:", { moreRented, deliveredInTime, deliveredWithDelay, rentsLate, rentsPerRenter });

        // --- Gráfico: Livros mais alugados ---
        if (moreRented.length) {
            const labels = moreRented.map(item => item.title || item.name || "Livro");
            const values = moreRented.map(item => item.totalRents || item.total || item.qtd || 0);
            if (values.some(v => v > 0)) {
                createHorizontalBarChart("grafico-livros", labels, values, "rgba(10, 101, 104, 0.7)");
            } else {
                showNoDataMessage("grafico-livros", "Nenhum dado de livros disponível");
            }
        } else {
            showNoDataMessage("grafico-livros", "Nenhum dado de livros disponível");
        }

        // --- Gráfico: Relações de aluguéis ---
        const relacoesValues = [deliveredInTime, deliveredWithDelay, rentsLate];
        if (relacoesValues.some(v => v > 0)) {
            createHorizontalBarChart(
                "grafico-relacoes",
                ["Entregues no prazo", "Entregues com atraso", "Aluguéis atrasados"],
                relacoesValues,
                ["#0a6568", "#9ffcff", "#ff6b6b"]
            );
        } else {
            showNoDataMessage("grafico-relacoes", "Nenhum dado de aluguéis disponível");
        }

        // --- Gráfico: Top 3 livros ---
        const top3 = moreRented.slice(0, 3);
        if (top3.length) {
            const labels = top3.map(item => item.title || item.name || "Livro");
            const values = top3.map(item => item.totalRents || 0);
            if (values.some(v => v > 0)) {
                createHorizontalBarChart("grafico-top3", labels, values, ["#88B6EE", "#4B6B92", "#404668"]);
            } else {
                showNoDataMessage("grafico-top3", "Nenhum dado disponível");
            }
        } else {
            showNoDataMessage("grafico-top3", "Nenhum dado disponível");
        }

        // --- Tabela: Locatários ---
        populateRenterTable(rentsPerRenter);

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        showNoDataMessage("grafico-livros", "Erro ao carregar dados de livros");
        showNoDataMessage("grafico-relacoes", "Erro ao carregar dados de aluguéis");
        showNoDataMessage("grafico-top3", "Erro ao carregar relação de livros");
        populateRenterTable([]);
    }
}

// --- Executar apenas quando o DOM estiver pronto ---
document.addEventListener("DOMContentLoaded", initDashboard);
