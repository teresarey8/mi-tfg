const API = "http://localhost:8081";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    obtenerTareas();

    const filtro = document.getElementById("filtroCategoria");
    filtro.addEventListener("change", filtrarPorCategoria);
});

let temporizadorInterval = null;
let tiempoRestanteSegundos = 0;
let tareaActual = null;

async function obtenerTareas() {
    const res = await fetch(`${API}/tareas`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const tareas = await res.json();
    mostrarTareas(tareas);
    resetTemporizador();
}

function mostrarTareas(tareas, contenedor = document.getElementById("tareasContainer"), nivel = 0) {
    if (nivel === 0) contenedor.innerHTML = ""; // Limpia solo al principio

    tareas.forEach(tarea => {
        const col = document.createElement("div");
        col.className = "col-md-12"; // Usa ancho completo para subtareas
        col.style.marginLeft = `${nivel * 30}px`; // Sangría visual

        col.innerHTML = `
      <div class="card mb-2" style="border-left: 5px solid ${nivel === 0 ? '#007bff' : '#28a745'};">
        <div class="card-body p-2">
          <h6>${tarea.titulo}</h6>
          <p class="mb-1">${tarea.descripcion}</p>
          <p class="mb-1"><strong>Inicio:</strong> ${tarea.horaInicio?.replace("T", " ").slice(0, 16)}</p>
          <p class="mb-1"><strong>Duración:</strong> ${tarea.duracionMinutos} min</p>
          <p class="mb-1"><strong>Tipo:</strong> ${tarea.tipo}</p>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-sm btn-primary btn-pomodoro">Pomodoro</button>
            <button class="btn btn-sm btn-secondary btn-subtarea">Crear subtarea</button>
            <button class="btn btn-sm btn-warning" onclick="editarTarea(${tarea.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="borrarTarea(${tarea.id})">Borrar</button>
          </div>
        </div>
      </div>
    `;

        contenedor.appendChild(col);

        // Botón Pomodoro
        const btnPomodoro = col.querySelector(".btn-pomodoro");
        btnPomodoro.addEventListener("click", () => iniciarPomodoro(tarea));

        // Botón crear subtarea
        const btnSubtarea = col.querySelector(".btn-subtarea");
        btnSubtarea.addEventListener("click", () => {
            mostrarFormulario();
            prepararFormularioSubtarea(tarea.id);
        });

        // Mostrar subtareas recursivamente
        if (tarea.subtareas && tarea.subtareas.length > 0) {
            mostrarTareas(tarea.subtareas, contenedor, nivel + 1);
        }
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
    // Limpiar campo tareaPadreId para tarea independiente
    document.getElementById("tareaPadreId").value = "";
    document.getElementById("tituloFormulario").textContent = "Nueva Tarea";
    document.getElementById("tareaIdEdit").value = "";
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("duracion").value = "25";
    document.getElementById("tipo").value = "trabajo";
    document.getElementById("horaInicio").value = "";
    document.getElementById("categoria_id").value = "";
    document.getElementById("notificar").checked = true;

    document.getElementById("formularioTarea").showModal();
}

function prepararFormularioSubtarea(tareaPadreId) {
    // Limpiar y preparar el formulario para subtarea
    document.getElementById("tareaIdEdit").value = "";
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("duracion").value = "25";
    document.getElementById("tipo").value = "trabajo";
    document.getElementById("horaInicio").value = "";
    document.getElementById("categoria_id").value = "";
    document.getElementById("notificar").checked = true;

    // Guardar tareaPadreId
    document.getElementById("tareaPadreId").value = tareaPadreId;

    // Cambiar título formulario
    document.getElementById("tituloFormulario").textContent = "Crear subtarea";

    document.getElementById("formularioTarea").showModal();
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
        // Crear o actualizar la tarea principal
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

        if (!res.ok) {
            throw new Error("Error al crear/editar la tarea");
        }

        const tareaCreada = await res.json();

        // Si es una nueva subtarea, actualizar el padre
        if (dto.tareaPadreId && !tareaIdEdit) {
            await actualizarTareaPadre(dto.tareaPadreId, tareaCreada.id);
        }

        cerrarFormulario();
        obtenerTareas();
    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
}

async function actualizarTareaPadre(tareaPadreId, tareaSiguienteId) {
    try {
        // Primero obtenemos la tarea padre actual
        const resPadre = await fetch(`${API}/tareas/${tareaPadreId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!resPadre.ok) {
            throw new Error("Error al obtener la tarea padre");
        }

        const tareaPadre = await resPadre.json();

        // Actualizamos solo el campo tareaSiguienteId
        const resActualiza = await fetch(`${API}/tareas/${tareaPadreId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                tareaSiguienteId: tareaSiguienteId,
                // Mantenemos todos los otros campos igual
                titulo: tareaPadre.titulo,
                descripcion: tareaPadre.descripcion,
                duracionMinutos: tareaPadre.duracionMinutos,
                tipo: tareaPadre.tipo,
                horaInicio: tareaPadre.horaInicio,
                categoriaId: tareaPadre.categoria?.id,
                notificarAlTerminar: tareaPadre.notificarAlTerminar,
                completada: tareaPadre.completada
            })
        });

        if (!resActualiza.ok) {
            throw new Error("Error al actualizar la tarea padre");
        }
    } catch (error) {
        console.error("Error al actualizar tarea padre:", error);
        throw error;
    }
}



async function editarTarea(id) {
    const res = await fetch(`${API}/tareas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        alert("Error al obtener tarea para editar");
        return;
    }
    const tarea = await res.json();

    document.getElementById("tareaIdEdit").value = tarea.id;
    document.getElementById("titulo").value = tarea.titulo;
    document.getElementById("descripcion").value = tarea.descripcion;
    document.getElementById("duracion").value = tarea.duracionMinutos;
    document.getElementById("tipo").value = tarea.tipo;
    document.getElementById("horaInicio").value = tarea.horaInicio ? tarea.horaInicio.slice(0, 16) : "";
    document.getElementById("categoria_id").value = tarea.categoriaId || "";
    document.getElementById("notificar").checked = tarea.notificarAlTerminar;

    // Si la tarea tiene tareaPadreId lo ponemos para editar
    document.getElementById("tareaPadreId").value = tarea.tareaPadreId || "";

    document.getElementById("tituloFormulario").textContent = "Editar tarea";

    document.getElementById("formularioTarea").showModal();
}

async function borrarTarea(id) {
    if (!confirm("¿Seguro que quieres borrar esta tarea?")) return;
    const res = await fetch(`${API}/tareas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        alert("Error al borrar la tarea");
        return;
    }
    obtenerTareas();
}

function filtrarPorCategoria() {
    const filtro = document.getElementById("filtroCategoria").value;
    fetch(`${API}/tareas?categoriaId=${filtro}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(tareas => mostrarTareas(tareas));
}

// Temporizador Pomodoro básico (inicia y muestra cuenta atrás)
async function iniciarPomodoro(tarea) {
    if (temporizadorInterval) clearInterval(temporizadorInterval);

    // Actualizar horaInicio a "ahora" en backend antes de empezar temporizador
    const ahoraISO = new Date().toISOString().slice(0, 16);

    const res = await fetch(`${API}/tareas/${tarea.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            ...tarea,
            horaInicio: ahoraISO
        })
    });

    if (!res.ok) {
        alert("Error al actualizar hora de inicio");
        return;
    }

    tarea.horaInicio = ahoraISO; // actualizar localmente también
    tareaActual = tarea;
    tiempoRestanteSegundos = tarea.duracionMinutos * 60;

    actualizarTemporizadorUI();

    temporizadorInterval = setInterval(async () => {
        tiempoRestanteSegundos--;
        actualizarTemporizadorUI();

        if (tiempoRestanteSegundos <= 0) {
            clearInterval(temporizadorInterval);
            alert(`¡Pomodoro terminado para la tarea "${tarea.titulo}"!`);

            // Usar el nuevo endpoint que maneja tanto tareas siguientes como subtareas
            const resSiguiente = await fetch(`${API}/tareas/${tarea.id}/finalizar-y-empezar-siguiente`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (resSiguiente.ok) {
                const tareaSiguiente = await resSiguiente.json();
                if (tareaSiguiente) {
                    iniciarPomodoro(tareaSiguiente);
                }
            } else if (resSiguiente.status !== 204) { // 204 significa que no hay siguiente
                alert("Error al obtener la tarea siguiente");
            }
        }
    }, 1000);
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
