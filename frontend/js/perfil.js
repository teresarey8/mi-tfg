document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8081/usuario/perfil", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("No autorizado");
            return res.json();
        })
        .then(usuario => {
            document.getElementById("perfilNombre").textContent = usuario.nombre;
            document.getElementById("perfilApellidos").textContent = usuario.apellidos;
            document.getElementById("perfilEmail").textContent = usuario.email;
            document.getElementById("perfilUsername").textContent = usuario.username;
            document.getElementById("perfilTelefono").textContent = usuario.telefono;
        })
        .catch(error => {
            console.error("Error al obtener perfil:", error);
            window.location.href = "login.html";
        });
});
