const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: { "Content-Type": "application/json" }
});

const token = localStorage.getItem('authToken');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    alert("Token não encontrado. Faça login.");
}

window.onload = initDashboard;

let arrayUsuarios = [];
let arrayAlugueis = [];

async function initDashboard() {
    try {
        await getUsuarios();
        await getAlugueis();
        initGraficos();
        carregarTabelaUsuarios();
    } catch (e) {
        console.error("Erro ao inicializar dashboard:", e);
    }
}

async function getUsuarios() {
    try {
        const res = await api.get('/user');
        arrayUsuarios = Array.isArray(res.data) ? res.data : [res.data];
    } catch (e) {
        console.error("Erro ao buscar usuários:", e.response?.data || e.message);
    }
}

async function getAlugueis() {
    try {
        const res = await api.get('/rent');
        arrayAlugueis = Array.isArray(res.data) ? res.data : [res.data];
    } catch (e) {
        console.error("Erro ao buscar aluguéis:", e.response?.data || e.message);
    }
}

// ==========================
// Tabela de locatários
// ==========================
function carregarTabelaUsuarios() {
    const tbody = document.querySelector('#tabela-locadores tbody');
    tbody.innerHTML = '';

    arrayUsuarios.forEach(u => {
        const totalRents = arrayAlugueis.filter(r => r.userId == u.id).length;
        const activeRents = arrayAlugueis.filter(r => r.userId == u.id && !r.returned).length;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${totalRents}</td>
            <td>${activeRents}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================
// Gráficos
// ==========================
function initGraficos() {
    // Locatários x total de empréstimos
    const ctxRelacoes = document.getElementById('grafico-relacoes').getContext('2d');
    const labelsUsuarios = arrayUsuarios.map(u => u.name);
    const dadosRents = arrayUsuarios.map(u => arrayAlugueis.filter(r => r.userId == u.id).length);

    new Chart(ctxRelacoes, {
        type: 'bar',
        data: {
            labels: labelsUsuarios,
            datasets: [{
                label: 'Total de Empréstimos',
                data: dadosRents,
                backgroundColor: '#0a6568'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });

    // Top 3 locatários com mais aluguéis
    const top3 = arrayUsuarios
        .map(u => ({ name: u.name, total: arrayAlugueis.filter(r => r.userId == u.id).length }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);

    const ctxTop3 = document.getElementById('grafico-top3').getContext('2d');
    new Chart(ctxTop3, {
        type: 'bar',
        data: {
            labels: top3.map(u => u.name),
            datasets: [{
                label: 'Mais Alugados',
                data: top3.map(u => u.total),
                backgroundColor: '#aefcfc'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}
