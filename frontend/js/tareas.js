document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    obtenerTareas();

    const filtro = document.getElementById("filtroCategoria");
    filtro.addEventListener("change", filtrarPorCategoria);
});

const API = "http://localhost:8081";
const token = localStorage.getItem("token");

async function obtenerTareas() {
    const res = await fetch(`${API}/tareas`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const tareas = await res.json();
    mostrarTareas(tareas);
}

function mostrarTareas(tareas) {
    const contenedor = document.getElementById("tareasContainer");
    contenedor.innerHTML = "";

    tareas.forEach(tarea => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        col.innerHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5>${tarea.titulo}</h5>
                    <p>${tarea.descripcion}</p>
                    <p><strong>Inicio:</strong> ${tarea.horaInicio?.replace("T", " ").slice(0, 16)}</p>
                    <p><strong>Duración:</strong> ${tarea.duracionMinutos} min</p>
                    <p><strong>Tipo:</strong> ${tarea.tipo}</p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary" onclick="iniciarPomodoro(${tarea.id})">Pomodoro</button>
                        <button class="btn btn-sm btn-success" onclick="completarTarea(${tarea.id})">Completar</button>
                        <button class="btn btn-sm btn-warning" onclick="editarTarea(${tarea.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="borrarTarea(${tarea.id})">Borrar</button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

async function cargarCategorias() {
    const res = await fetch(`${API}/categorias`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const categorias = await res.json();
    const select = document.getElementById("categoria_id");
    const filtro = document.getElementById("filtroCategoria");

    select.innerHTML = filtro.innerHTML = `<option value="">Todas</option>`;
    categorias.forEach(cat => {
        const opt1 = new Option(cat.nombre, cat.id);
        const opt2 = new Option(cat.nombre, cat.id);
        select.add(opt1);
        filtro.add(opt2);
    });
}

function mostrarFormulario() {
    document.getElementById("formularioTarea").showModal();
}

function cerrarFormulario() {
    document.getElementById("formularioTarea").close();
}

async function crearTarea() {
    const id = document.getElementById("tareaIdEdit").value;
    const dto = {
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        duracionMinutos: parseInt(document.getElementById("duracion").value),
        tipo: document.getElementById("tipo").value,
        horaInicio: document.getElementById("horaInicio").value,
        categoriaId: parseInt(document.getElementById("categoria_id").value),
        tareaPadreId: null,
        tareaSiguienteId: null,
        notificarAlTerminar: document.getElementById("notificar").checked
    };

    const url = id ? `${API}/tareas/${id}` : `${API}/tareas`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dto)
    });

    if (res.ok) {
        cerrarFormulario();
        obtenerTareas();
    } else {
        alert("Error al " + (id ? "actualizar" : "crear") + " la tarea");
    }
}

async function editarTarea(id) {
    try {
        const response = await fetch(`${API}/tareas/${id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener la tarea");

        const tarea = await response.json();

        await cargarCategorias();

        document.getElementById("tareaIdEdit").value = tarea.id;
        document.getElementById("titulo").value = tarea.titulo;
        document.getElementById("descripcion").value = tarea.descripcion;
        document.getElementById("duracion").value = tarea.duracionMinutos;
        document.getElementById("tipo").value = tarea.tipo;
        document.getElementById("horaInicio").value = tarea.horaInicio?.slice(0, 16);
        document.getElementById("categoria_id").value = tarea.categoria?.id || "";
        document.getElementById("notificar").checked = tarea.notificarAlTerminar;

        document.getElementById("formularioTarea").showModal();
    } catch (error) {
        console.error("Error al editar tarea:", error);
        alert("Ocurrió un error al cargar la tarea para editar.");
    }
}

async function completarTarea(id) {
    const res = await fetch(`${API}/tareas/${id}/completar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
        obtenerTareas();
    }
}

async function borrarTarea(id) {
    const res = await fetch(`${API}/tareas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
        obtenerTareas();
    }
}

async function filtrarPorCategoria() {
    const categoriaId = document.getElementById("filtroCategoria").value;
    const url = categoriaId
        ? `${API}/tareas/categoria/${categoriaId}`
        : `${API}/tareas`;

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const tareas = await res.json();
    mostrarTareas(tareas);
}

function logout() {
    localStorage.clear();
    location.href = "index.html";
}
