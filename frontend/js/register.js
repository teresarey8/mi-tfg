async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value.trim();
  const password2 = document.getElementById("password2").value.trim() ;
  const email = document.getElementById("email").value;
  const nombre = document.getElementById("nombre").value;
  const apellidos = document.getElementById("apellidos").value;

  console.log("password:", password);
  console.log("password2:", password2);

  // Validar que las contraseñas coinciden
  if (password !== password2) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  // Validar que todos los campos están llenos
  if (!username || !password || !email || !nombre || !apellidos) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    // 1. Registro del usuario
    const registerResponse = await fetch("http://localhost:8081/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({ username, password, password2, email, nombre, apellidos },
          )
    });

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json();
      alert(`Error en el registro: ${errorData.message || "Error desconocido"}`);
      return;
    }

    alert("Usuario registrado correctamente. Iniciando sesión...");

    // 2. Autenticación automática después del registro
    await login(username, password);

  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un error al registrar el usuario.");
  }
}

// Función de login actualizada para recibir parámetros opcionales
async function login(providedUsername, providedPassword) {
  const username = providedUsername || document.getElementById("LoginUsername").value;
  const password = providedPassword || document.getElementById("LoginPassword").value;

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
      throw new Error("Error en la autenticación");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);

    // Redirigir automáticamente después del login exitoso
    window.location.href = "tareas.html";
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un error en la autenticación.");
  }
}

// Asignar eventos a los botones
document.getElementById("registerBTN").addEventListener("click", register);
document.getElementById("loginBtn").addEventListener("click", () => login());
