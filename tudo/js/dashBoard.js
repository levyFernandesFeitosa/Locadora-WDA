// =========================
// Axios Config
// =========================
const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: { "Content-Type": "application/json" }
});

// === TOKEN AUTH ===
const token = localStorage.getItem('authToken');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    console.warn("Token não encontrado. Redirecionando para login...");
    window.location.href = "login.html";
}

// =========================
// Funções de Input Seguro
// =========================
function getMesesInput(id, defaultValue = 12) {
    const input = document.getElementById(id);
    if (!input) return defaultValue;
    const valor = Number(input.value);
    return isNaN(valor) || valor <= 0 ? defaultValue : valor;
}

// =========================
// Gráfico 1 - Aluguéis x Devoluções
// =========================
async function carregarAlugueis() {
    const meses = getMesesInput('mesesAlugueis');
    console.log("Carregando alugueis com meses =", meses);

    let rentsLate = 0, deliveredDelay = 0, deliveredTime = 0, rents = 0;

    try { rentsLate = (await api.get(`/dashboard/rentsLateQuantity?months=${meses}`)).data; } 
    catch(e){ console.error("RentsLate:", e); }

    try { deliveredDelay = (await api.get(`/dashboard/deliveredWithDelayQuantity?months=${meses}`)).data; } 
    catch(e){ console.error("DeliveredDelay:", e); }

    try { deliveredTime = (await api.get(`/dashboard/deliveredInTimeQuantity?months=${meses}`)).data; } 
    catch(e){ console.error("DeliveredTime:", e); }

    try { rents = (await api.get(`/dashboard/rentsQuantity?months=${meses}`)).data; } 
    catch(e){ console.error("Rents:", e); }

    new Chart(document.getElementById("graficoAlugueis"), {
        type: "bar",
        data: {
            labels: ["Alugados", "Atrasados", "Devolvidos no Prazo", "Devolvidos com Atraso"],
            datasets: [{
                label: "Quantidade",
                data: [rents || 0, rentsLate || 0, deliveredTime || 0, deliveredDelay || 0],
                backgroundColor: ["#36A2EB","#FF6384","#4CAF50","#FFC107"]
            }]
        }
    });
}

// =========================
// Gráfico 2 - Top 3 Livros
// =========================
async function carregarTopLivros() {
    const meses = getMesesInput('mesesTopLivros');
    console.log("Carregando top livros com meses =", meses);

    try {
        const { data } = await api.get(`/dashboard/bookMoreRented?months=${meses}`);
        if (!Array.isArray(data)) { console.error("Resposta inesperada:", data); return; }

        new Chart(document.getElementById("graficoTopLivros"), {
            type: "bar",
            data: {
                labels: data.map(l => l.bookTitle),
                datasets: [{ label: "Aluguéis", data: data.map(l => l.totalRents), backgroundColor: "#36A2EB" }]
            },
            options: { indexAxis: "y" }
        });

    } catch (err) { console.error("Erro API Top Livros:", err); }
}

// =========================
// Tabela Locatários + Paginação
// =========================
let dadosLocatarios = [], paginaAtual = 1;
const itensPorPagina = 3;

async function carregarTabela() {
    console.log("Carregando tabela de locatários...");
    try {
        const { data } = await api.get("/dashboard/rentsPerRenter");
        dadosLocatarios = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Erro API Locatários:", err);
        dadosLocatarios = []; // fallback vazio
    }
    renderTabela();
}

function renderTabela() {
    const tbody = document.querySelector("#tabelaLocatarios tbody");
    tbody.innerHTML = "";

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const paginaDados = dadosLocatarios.slice(inicio, fim);

    paginaDados.forEach(l => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${l.renterName}</td><td>${l.totalRents}</td><td>${l.activeRents}</td>`;
        tbody.appendChild(tr);
    });

    renderPaginacao();
}

function renderPaginacao() {
    const totalPaginas = Math.ceil(dadosLocatarios.length / itensPorPagina);
    const paginacao = document.getElementById("paginacao");
    paginacao.innerHTML = "";

    const btnAnterior = document.createElement("button");
    btnAnterior.textContent = "Anterior";
    btnAnterior.disabled = paginaAtual === 1;
    btnAnterior.onclick = () => { paginaAtual--; renderTabela(); };
    paginacao.appendChild(btnAnterior);

    const span = document.createElement("span");
    span.textContent = ` Página ${paginaAtual} de ${totalPaginas} `;
    paginacao.appendChild(span);

    const btnProximo = document.createElement("button");
    btnProximo.textContent = "Próximo";
    btnProximo.disabled = paginaAtual === totalPaginas;
    btnProximo.onclick = () => { paginaAtual++; renderTabela(); };
    paginacao.appendChild(btnProximo);
}

// =========================
// Gráfico 3 - Meses sem aluguel
// =========================
async function carregarSemAluguel() {
    const ano = getAnoInput('anoSemAluguel');
    console.log("Carregando meses sem aluguel para ano =", ano);

    try {
        const { data } = await api.get(`/dashboard/rentsQuantity?year=${ano}`);
        const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        const alugueis = meses.map((_, i) => data[i] || 0);

        new Chart(document.getElementById("graficoSemAluguel"), {
            type: "bar",
            data: {
                labels: meses,
                datasets: [{
                    label: "Aluguéis",
                    data: alugueis,
                    backgroundColor: alugueis.map(qtd => qtd === 0 ? "#FF6384" : "#4CAF50")
                }]
            }
        });
    } catch (err) { console.error("Erro API Sem Aluguel:", err); }
}

// =========================
// Event Listeners - Atualização Dinâmica
// =========================
document.getElementById('mesesAlugueis')?.addEventListener('input', carregarAlugueis);
document.getElementById('mesesTopLivros')?.addEventListener('input', carregarTopLivros);
document.getElementById('anoSemAluguel')?.addEventListener('input', carregarSemAluguel);

// =========================
// Inicialização
// =========================
carregarAlugueis();
carregarTopLivros();
carregarTabela();
carregarSemAluguel();
