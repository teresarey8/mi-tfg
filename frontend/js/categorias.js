document.addEventListener("DOMContentLoaded", obtenerCategorias);

document.getElementById("nuevaCategoriaBtn").addEventListener("click", nuevaCategoria);
document.getElementById("BtnLogout").addEventListener("click", logout);

async function obtenerCategorias() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8081/categorias", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error al obtener categorías");

        const categorias = await response.json();
        const tbody = document.getElementById("tableBodyCategorias");
        tbody.innerHTML = "";

        categorias.forEach(cat => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${cat.nombre}</td>
        <td><span class="color-box" style="background-color: ${cat.color};"></span> ${cat.color}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarCategoria(${cat.id}, '${cat.nombre}', '${cat.color}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="borrarCategoria(${cat.id})">Borrar</button>
        </td>
      `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error(err);
    }
}

async function nuevaCategoria() {
    const nombre = document.getElementById("nombreCategoria").value;
    const color = document.getElementById("colorCategoria").value;
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8081/categorias", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, color })
        });

        if (!response.ok) throw new Error("Error al crear la categoría");

        document.getElementById("nombreCategoria").value = "";
        obtenerCategorias();

    } catch (err) {
        console.error(err);
    }
}

async function editarCategoria(id, nombreActual, colorActual) {
    const nuevoNombre = prompt("Nuevo nombre:", nombreActual);
    if (!nuevoNombre) return;

    const nuevoColor = prompt("Nuevo color (hex):", colorActual);
    if (!nuevoColor) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8081/categorias/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: nuevoNombre, color: nuevoColor })
        });

        if (!response.ok) throw new Error("Error al editar categoría");

        obtenerCategorias();
    } catch (err) {
        console.error(err);
    }
}

async function borrarCategoria(id) {
    const token = localStorage.getItem("token");
    const confirmar = confirm("¿Estás seguro de que quieres borrar esta categoría?");
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:8081/categorias/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error al borrar la categoría");

        obtenerCategorias();
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem("token");
    location.href = "index.html";
}
