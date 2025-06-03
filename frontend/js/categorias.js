document.addEventListener("DOMContentLoaded", obtenerCategorias);

document.getElementById("nuevaCategoriaBtn").addEventListener("click", nuevaCategoria);
document.getElementById("BtnLogout").addEventListener("click", logout);
let categoriaEditandoId = null;


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
        const container = document.getElementById("categoriasContainer");
        container.innerHTML = "";

        categorias.forEach(cat => {
            const card = document.createElement("div");
            card.className = "col";
            card.innerHTML = `
                <div class="categoria-card">
                    <div class="categoria-header" style="background-color: ${cat.color}">
                        ${cat.nombre}
                    </div>
                    <div class="categoria-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-dark">${cat.color}</span>
                            <div class="categoria-actions">
                                <button class="btn btn-sm btn-outline-warning" onclick="editarCategoria(${cat.id}, '${cat.nombre}', '${cat.color}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="borrarCategoria(${cat.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        alert("Error al cargar las categorías");
    }
}

async function nuevaCategoria() {
    const nombre = document.getElementById("nombreCategoria").value.trim();
    const color = document.getElementById("colorCategoria").value;
    const token = localStorage.getItem("token");

    if (!nombre) {
        alert("Por favor ingresa un nombre para la categoría");
        return;
    }

    try {
        const response = await fetch("http://localhost:8081/categorias", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, color })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al crear la categoría");
        }

        document.getElementById("nombreCategoria").value = "";
        obtenerCategorias();

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function editarCategoria(id, nombreActual, colorActual) {
    categoriaEditandoId = id;
    document.getElementById("editarNombre").value = nombreActual;
    document.getElementById("editarColor").value = colorActual;

    const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
    modal.show();
}

async function guardarEdicion() {
    const nuevoNombre = document.getElementById("editarNombre").value.trim();
    const nuevoColor = document.getElementById("editarColor").value;
    const token = localStorage.getItem("token");

    if (!nuevoNombre) {
        alert("El nombre no puede estar vacío");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/categorias/${categoriaEditandoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: nuevoNombre, color: nuevoColor })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al editar categoría");
        }

        bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
        obtenerCategorias();
    } catch (err) {
        console.error(err);
        alert(err.message);
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

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error al borrar la categoría");
        }

        obtenerCategorias();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

function logout() {
    localStorage.removeItem("token");
    location.href = "index.html";
}