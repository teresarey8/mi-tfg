async function login() {
  const username = document.getElementById("LoginUsername").value;
  const password = document.getElementById("LoginPassword").value;

  try {
    const response = await fetch("http://localhost:8081/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      alert("Usuario o contraseña incorrectos");
      return; // detenemos aquí si falla
    }

    const data = await response.json();
    console.log("Respuesta del login:", data);  // para depurar

    if (!data.token || !data.username) {
      alert("Error en la respuesta del servidor");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    location.href = "tareas.html";

  } catch (error) {
    console.error("Error:", error);
    alert("Error inesperado al intentar loguear");
  }
}
