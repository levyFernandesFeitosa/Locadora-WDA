const api= axios.create({
    baseURL: "https://locadora-ryan-back.altislabtech.com.br/", 
    headers: {
        "Content-Type":"aplication/json"
    }
})

const token = localStorage.getItem('authToken');
if(token){
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

//login

async function login(){
    
var email = document.getElementById("email").value
var password = document.getElementById("senha").value
const inputs = document.getElementsByClassName("formInput");

    if(email === "" || password === ""){
        document.getElementById("alert").innerHTML = "Os campos devem ser preenchidos!"
        document.getElementById("alert").style.color = "red"
        let labels = document.getElementsByClassName("formLabel")
        for (let i = 0; i < labels.length; i++) {
        labels[i].style.color = "red"
    }
        for (let i = 0; i < inputs.length; i++) {
        inputs[i].style.boxShadow = "  0px 2px 0px #FF6347";
        inputs[i].addEventListener("input", function () {
        if (this.value.trim() !== "") {
            this.style.boxShadow = "";
            this.style.borderColor = "";
            this.style.color = "";
            labels[i].style.color = ""; 
        }
    });
    }
    return
    }

    try {
        const {data} = await api.post('/auth/login', { email, password });
        if (data?.token) {
        localStorage.setItem('authToken', data.token);
        console.log("Login ok");
        window.location.href = 'dashboard.html';
        } else {
        console.warn("Resposta sem token:", data);
        document.getElementById("alert").innerHTML = "Erro ao resgatar o token."
        document.getElementById("alert").style.color = "red"
        }
    } catch(err) {
        const msg = err.response?.data?.message || err.response?.data || err.message;
        console.error("Erro ao obter token:", msg);
        document.getElementById("alert").innerHTML = `Erro de login: ${msg}`;
        document.getElementById("alert").style.color = "red";
    }
}
