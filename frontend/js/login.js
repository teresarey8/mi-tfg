  async function login() {
    const username = document.getElementById("LoginUsername").value;
    const password = document.getElementById("LoginPassword").value;

    try {
      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({username, password})
      });

      if (!response.ok) {
        alert("Usuario e passwords incorrectos");
        throw new Error("Error en la autenticación");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      //guardamos el username para luego enseñar las reservas de cada cliente
      localStorage.setItem("username", data.username);
      location.href = "tareas.html";
    } catch (error) {
      console.error("Error:", error);
    }
  }

  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("registrarBtn").addEventListener("click", register);

  async function register() {
    window.location("register.js")
  }

