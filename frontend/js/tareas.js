const API = "http://localhost:8081";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    obtenerTareas();
    document.getElementById("filtroCategoria").addEventListener("change", filtrarPorCategoria);
});

let temporizadorInterval = null;
let tiempoRestanteSegundos = 0;
let tareaActual = null;

function construirArbolTareas(tareas) {
    const mapaTareas = {};
    tareas.forEach(t => (mapaTareas[t.id] = { ...t, subtareas: [] }));

    const tareasRaiz = [];
    tareas.forEach(t => {
        if (t.tareaPadreId) {
            mapaTareas[t.tareaPadreId]?.subtareas.push(mapaTareas[t.id]);
        } else {
            tareasRaiz.push(mapaTareas[t.id]);
        }
    });

    return tareasRaiz;
}

async function obtenerTareas() {
    try {
        const res = await fetch(`${API}/tareas`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al cargar tareas");
        const tareas = await res.json();
        const tareasArbol = construirArbolTareas(tareas);
        mostrarTareas(tareasArbol);
        resetTemporizador();
    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las tareas");
    }
}

function mostrarTareas(tareas, contenedor = document.getElementById("tareasContainer"), nivel = 0) {
    if (nivel === 0) {
        contenedor.innerHTML = "";
    }

    tareas.forEach(tarea => {
        const tareaWrapper = document.createElement("div");
        tareaWrapper.className = `tarea-nivel-${nivel}`;
        tareaWrapper.style.marginLeft = `${nivel * 30}px`;

        const card = document.createElement("div");
        card.className = `card tarea nivel-${nivel} ${nivel > 0 ? 'subtarea' : ''}`;

        card.innerHTML = `
            <div class="card-body">
                <h6 class="mb-1 d-flex align-items-center">
                    ${tarea.titulo}
                    ${nivel > 0 ? '<span class="etiqueta-subtarea">Subtarea</span>' : ''}
                </h6>
                <p class="mb-1">${tarea.descripcion || ""}</p>
                <p class="mb-1"><strong>Inicio:</strong> ${tarea.horaInicio ? tarea.horaInicio.replace("T", " ").slice(0, 16) : 'No programada'}</p>
                <p class="mb-1"><strong>Duración:</strong> ${tarea.duracionMinutos} min</p>
                <p class="mb-1"><strong>Tipo:</strong> ${tarea.tipo}</p>
                <div class="d-flex gap-2 flex-wrap mt-2">
                    <button class="btn btn-sm btn-primary btn-pomodoro">Pomodoro</button>
                    ${nivel < 2 ? '<button class="btn btn-sm btn-secondary btn-subtarea">Crear subtarea</button>' : ''}
                    <button class="btn btn-sm btn-warning btn-editar">Editar</button>
                    <button class="btn btn-sm btn-danger btn-borrar">Borrar</button>
                </div>
            </div>
        `;

        // Event listeners (manteniendo tu implementación original)
        card.querySelector(".btn-pomodoro").addEventListener("click", () => iniciarPomodoro(tarea));
        if (nivel < 2) {
            card.querySelector(".btn-subtarea")?.addEventListener("click", () => {
                mostrarFormulario();
                prepararFormularioSubtarea(tarea.id);
            });
        }
        card.querySelector(".btn-editar").addEventListener("click", () => editarTarea(tarea.id));
        card.querySelector(".btn-borrar").addEventListener("click", () => borrarTarea(tarea.id));

        tareaWrapper.appendChild(card);
        contenedor.appendChild(tareaWrapper);

        // Mostrar subtareas recursivamente
        if (tarea.subtareas && tarea.subtareas.length > 0) {
            mostrarTareas(tarea.subtareas, contenedor, nivel + 1);
        }
    });
}

async function cargarCategorias() {
    try {
        const res = await fetch(`${API}/categorias`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al cargar categorías");
        const categorias = await res.json();

        const select = document.getElementById("categoria_id");
        const filtro = document.getElementById("filtroCategoria");

        select.innerHTML = filtro.innerHTML = `<option value="">Todas</option>`;
        categorias.forEach(cat => {
            select.add(new Option(cat.nombre, cat.id));
            filtro.add(new Option(cat.nombre, cat.id));
        });
    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las categorías");
    }
}

function mostrarFormulario() {
    limpiarFormulario();
    document.getElementById("tituloFormulario").textContent = "Nueva Tarea";
    document.getElementById("formularioTarea").showModal();
}

function prepararFormularioSubtarea(tareaPadreId) {
    limpiarFormulario();
    document.getElementById("tareaPadreId").value = tareaPadreId;
    document.getElementById("tituloFormulario").textContent = "Crear subtarea";
    document.getElementById("formularioTarea").showModal();
}

function limpiarFormulario() {
    document.getElementById("tareaIdEdit").value = "";
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("duracion").value = "25";
    document.getElementById("tipo").value = "trabajo";
    document.getElementById("horaInicio").value = "";
    document.getElementById("categoria_id").value = "";
    document.getElementById("tareaPadreId").value = "";
    document.getElementById("notificar").checked = true;
}

function cerrarFormulario() {
    document.getElementById("formularioTarea").close();
}

async function crearTarea() {
    const dto = {
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        duracionMinutos: parseInt(document.getElementById("duracion").value),
        tipo: document.getElementById("tipo").value,
        horaInicio: document.getElementById("horaInicio").value || null,
        categoriaId: document.getElementById("categoria_id").value ? parseInt(document.getElementById("categoria_id").value) : null,
        tareaPadreId: document.getElementById("tareaPadreId").value ? parseInt(document.getElementById("tareaPadreId").value) : null,
        tareaSiguienteId: null,
        notificarAlTerminar: document.getElementById("notificar").checked,
        completada: false
    };

    const tareaIdEdit = document.getElementById("tareaIdEdit").value;

    try {
        const url = tareaIdEdit ? `${API}/tareas/${tareaIdEdit}` : `${API}/tareas`;
        const method = tareaIdEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dto)
        });

        if (!res.ok) throw new Error("Error al crear/editar la tarea");

        const tareaCreada = await res.json();

        if (dto.tareaPadreId && !tareaIdEdit) {
            await actualizarTareaPadre(dto.tareaPadreId, tareaCreada.id);
        }

        cerrarFormulario();
        obtenerTareas();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function actualizarTareaPadre(tareaPadreId, tareaSiguienteId) {
    try {
        const resPadre = await fetch(`${API}/tareas/${tareaPadreId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!resPadre.ok) throw new Error("Error al obtener la tarea padre");

        const tareaPadre = await resPadre.json();

        const resActualiza = await fetch(`${API}/tareas/${tareaPadreId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ...tareaPadre, tareaSiguienteId })
        });

        if (!resActualiza.ok) throw new Error("Error al actualizar la tarea padre");
    } catch (error) {
        console.error("Error al actualizar tarea padre:", error);
    }
}

async function editarTarea(id) {
    try {
        const res = await fetch(`${API}/tareas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener tarea para editar");
        const tarea = await res.json();

        document.getElementById("tareaIdEdit").value = tarea.id;
        document.getElementById("titulo").value = tarea.titulo;
        document.getElementById("descripcion").value = tarea.descripcion;
        document.getElementById("duracion").value = tarea.duracionMinutos;
        document.getElementById("tipo").value = tarea.tipo;
        document.getElementById("horaInicio").value = tarea.horaInicio ? tarea.horaInicio.slice(0, 16) : "";
        document.getElementById("categoria_id").value = tarea.categoriaId || "";
        document.getElementById("notificar").checked = tarea.notificarAlTerminar;
        document.getElementById("tareaPadreId").value = tarea.tareaPadreId || "";

        document.getElementById("tituloFormulario").textContent = "Editar tarea";
        document.getElementById("formularioTarea").showModal();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function borrarTarea(id) {
    if (!confirm("¿Seguro que quieres borrar esta tarea?")) return;
    try {
        const res = await fetch(`${API}/tareas/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al borrar la tarea");
        obtenerTareas();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function filtrarPorCategoria() {
    const filtro = document.getElementById("filtroCategoria").value;
    fetch(`${API}/tareas${filtro ? `?categoriaId=${filtro}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(tareas => {
            const arbol = construirArbolTareas(tareas);
            mostrarTareas(arbol);
        })
        .catch(error => {
            console.error(error);
            alert("Error al filtrar tareas");
        });
}

async function iniciarPomodoro(tarea) {
    if (temporizadorInterval) clearInterval(temporizadorInterval);

    const ahoraISO = new Date().toISOString().slice(0, 16);

    try {
        const res = await fetch(`${API}/tareas/${tarea.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ...tarea, horaInicio: ahoraISO })
        });

        if (!res.ok) throw new Error("Error al actualizar hora de inicio");

        tarea.horaInicio = ahoraISO;
        tareaActual = tarea;
        tiempoRestanteSegundos = tarea.duracionMinutos * 60;

        actualizarTemporizadorUI();

        temporizadorInterval = setInterval(async () => {
            tiempoRestanteSegundos--;
            actualizarTemporizadorUI();

            if (tiempoRestanteSegundos <= 0) {
                clearInterval(temporizadorInterval);
                alert(`¡Pomodoro terminado para la tarea "${tarea.titulo}"!`);

                const resSiguiente = await fetch(`${API}/tareas/${tarea.id}/finalizar-y-empezar-siguiente`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (resSiguiente.ok) {
                    const tareaSiguiente = await resSiguiente.json();
                    if (tareaSiguiente) iniciarPomodoro(tareaSiguiente);
                    else alert("No hay tarea siguiente para comenzar.");
                } else if (resSiguiente.status !== 204) {
                    alert("Error al obtener la tarea siguiente");
                }
            }
        }, 1000);
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

function actualizarTemporizadorUI() {
    const minutos = Math.floor(tiempoRestanteSegundos / 60).toString().padStart(2, "0");
    const segundos = (tiempoRestanteSegundos % 60).toString().padStart(2, "0");
    document.getElementById("temporizador").textContent = `${minutos}:${segundos}`;
}

function resetTemporizador() {
    if (temporizadorInterval) clearInterval(temporizadorInterval);
    document.getElementById("temporizador").textContent = "25:00";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
