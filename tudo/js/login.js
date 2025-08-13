const api = axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br",
    headers: {
        "Content-Type": "application/json"
    }
})

const token = localStorage.getItem('authToken');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const authenticate = (email, password) => {
    return api.post('/auth/login', {
        email: email,
        password: password
    })
        .then(response => {
            const token = response.data.token;
            if (token)
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        })
        .catch(error => {
            console.error('Autenticação deu errado:', error)
        })
}

async function logar() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("senha").value;
    const res = document.getElementById("res");

    document.getElementById("email").classList.remove("erro");
    document.getElementById("senha").classList.remove("erro");
    
    try {
        const { data } = await api.post('/auth/login',
            {   email: email,
                password: password 
            });
        if (data?.token) {
            localStorage.setItem('authToken', data.token);
            console.log("Login ok");
            window.location.href = "/tudo/html/dashboard.html";
        } else {
            console.warn("Resposta sem token:", data);
            document.getElementById("alert").innerHTML = "Erro ao resgatar o token."
            document.getElementById("alert").style.color = "red"
        }
    } catch (err) {
        res.style.display = "block";
        document.getElementById("email").classList.add("erro");
        document.getElementById("senha").classList.add("erro");
    }


}