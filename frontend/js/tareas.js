const API = "http://localhost:8081";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
    await cargarCategorias();
    await obtenerTareas();
    document.body.classList.remove("hidden");


});

let temporizadorInterval = null;
let tiempoRestanteSegundos = 0;
let tareaActual = null;


async function obtenerTareas() {
    const res = await fetch(`${API}/tareas`, {
        headers: {Authorization: `Bearer ${token}`}
    });
    const tareas = await res.json();

    // Filtra solo tareas raíz (sin padre)
    const tareasRaiz = tareas.filter(t => t.tareaPadre === null);

    mostrarTareas(tareasRaiz);
    resetTemporizador();
}


function mostrarTareas(tareas, contenedor = document.getElementById("tareasContainer"), nivel = 0) {
    if (nivel === 0) contenedor.innerHTML = ""; // Limpia solo al principio

    tareas.forEach(tarea => {
        const col = document.createElement("div");
        col.className = "col-md-12"; // Usa ancho completo para subtareas
        col.style.marginLeft = `${nivel * 30}px`; // Sangría visual

        col.innerHTML = `
<div class="card tarea-item mb-2" data-tarea-id="${tarea.id}" style="border-left: 5px solid ${obtenerColorCategoria(tarea.categoria?.id)};">
  <div class="card-body p-2">
    <h4 class="fw-bold">${tarea.titulo}</h4>
    <p class="mb-1">${tarea.descripcion}</p>
    <p class="mb-1"><strong>Duración:</strong> ${tarea.duracionMinutos} min</p>
    <p class="mb-1"><strong>Tipo:</strong> ${tarea.tipo}</p>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-sm btn-primary btn-pomodoro">Iniciar Tarea</button>
      <button class="btn btn-sm btn-secondary btn-subtarea">Crear subtarea</button>
      <button class="btn btn-sm btn-warning" onclick="editarTarea(${tarea.id})">Editar</button>
      <button class="btn btn-sm btn-danger" onclick="borrarTarea(${tarea.id})">Borrar</button>
    </div>
  </div>
</div>
        `;

        contenedor.appendChild(col);

        // Marcar visualmente si está completada
        if (tarea.completada) {
            marcarTareaCompletadaVisual(tarea.id);
            // Deshabilitar botón Pomodoro
            const btnPomodoro = col.querySelector(".btn-pomodoro");
            if (btnPomodoro) btnPomodoro.disabled = true;
        }

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

function marcarTareaCompletadaVisual(tareaId) {
    // Busca el contenedor donde está la tarea por su ID
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        // Suponiendo que tienes el ID en un atributo data-tarea-id
        if (card.dataset.tareaId == tareaId) {
            card.style.opacity = "0.5";
            const titulo = card.querySelector("h4");
            if (titulo) {
                titulo.style.textDecoration = "line-through";
            }
        }
    });
}

function marcarTareaEnProgresoVisual(tareaId) {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        if (card.dataset.tareaId == tareaId) {
            card.style.border = "2px solid orange";
            card.style.backgroundColor = "#f1e69c";

            // Asegurarse de que no esté tachado
            const titulo = card.querySelector("h4");
            if (titulo) {
                titulo.style.textDecoration = "none";
                titulo.style.fontWeight = "bold";
            }

            // Añadir etiqueta "En progreso" si no existe
            if (!card.querySelector(".estado-en-progreso")) {
                const estado = document.createElement("div");
                estado.classList.add("estado-en-progreso");
                estado.textContent = "⏳ En progreso";
                estado.style.color = "orange";
                estado.style.fontSize = "1em";
                estado.style.marginTop = "5px";
                card.appendChild(estado);
            }
        }
    });
}
function quitarMarcaEnProgreso(tareaId) {
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        if (card.dataset.tareaId == tareaId) {
            card.style.border = "";
            card.style.backgroundColor = "";

            const estado = card.querySelector(".estado-en-progreso");
            if (estado) estado.remove();
        }
    });
}



let categoriasGlobal = [];

async function cargarCategorias() {
    try {
        const res = await fetch(`${API}/categorias`, {
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!res.ok) throw new Error("Error al cargar categorías");
        const categorias = await res.json();

        categoriasGlobal = categorias;

        const select = document.getElementById("categoria_id");

        select.innerHTML = `<option value="">Todas</option>`;
        categorias.forEach(cat => {
            select.add(new Option(cat.nombre, cat.id));
        });
    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar las categorías");
    }
}
function obtenerColorCategoria(idCategoria) {if (!idCategoria) return "#fd3cfa"; // color rosa si no hay categoría
    const categoria = categoriasGlobal.find(cat => cat.id == idCategoria);
    return categoria?.color || "#fd3cfa";
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
    document.getElementById("duracion").value = "00";
    document.getElementById("tipo").value = "trabajo";
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
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!resPadre.ok) throw new Error("Error al obtener la tarea padre");

        const tareaPadre = await resPadre.json();

        const resActualiza = await fetch(`${API}/tareas/${tareaPadreId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({...tareaPadre, tareaSiguienteId})
        });

        if (!resActualiza.ok) throw new Error("Error al actualizar la tarea padre");
    } catch (error) {
        console.error("Error al actualizar tarea padre:", error);
    }
}

async function editarTarea(id) {
    try {
        const res = await fetch(`${API}/tareas/${id}`, {
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!res.ok) throw new Error("Error al obtener tarea para editar");
        const tarea = await res.json();

        document.getElementById("tareaIdEdit").value = tarea.id;
        document.getElementById("titulo").value = tarea.titulo;
        document.getElementById("descripcion").value = tarea.descripcion;
        document.getElementById("duracion").value = tarea.duracionMinutos;
        document.getElementById("tipo").value = tarea.tipo;
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
            headers: {Authorization: `Bearer ${token}`}
        });
        if (!res.ok) throw new Error("Error al borrar la tarea");
        obtenerTareas();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function iniciarPomodoro(tarea) {
    if (temporizadorInterval) clearInterval(temporizadorInterval);

    try {
        // Crear Pomodoro en backend
        const resPomodoro = await fetch(`${API}/pomodoros/${tarea.id}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!resPomodoro.ok) throw new Error("Error al crear el pomodoro");

        const pomodoroCreado = await resPomodoro.json();

        tareaActual = tarea;
        tiempoRestanteSegundos = tarea.duracionMinutos * 60;
        let pomodoroIdActual = pomodoroCreado.id;

        marcarTareaEnProgresoVisual(tarea.id);
        actualizarTemporizadorUI();

        temporizadorInterval = setInterval(async () => {
            tiempoRestanteSegundos--;
            actualizarTemporizadorUI();

            if (tiempoRestanteSegundos <= 0) {
                clearInterval(temporizadorInterval);
                alert(`¡Pomodoro terminado para la tarea "${tarea.titulo}"!`);
                quitarMarcaEnProgreso(tarea.id);
                marcarTareaCompletadaVisual(tarea.id);

                const card = document.querySelector(`.card[data-tarea-id="${tarea.id}"]`);
                if (card) {
                    const btn = card.querySelector(".btn-pomodoro");
                    if (btn) btn.disabled = true;
                }

                // Marcar Pomodoro completado en backend
                await fetch(`${API}/pomodoros/${pomodoroIdActual}/complete`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Continuar con la siguiente tarea encadenada
                const resSiguiente = await fetch(`${API}/tareas/${tarea.id}/finalizar-y-empezar-siguiente`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (resSiguiente.ok) {
                    const tareaSiguiente = await resSiguiente.json();
                    if (tareaSiguiente) {
                        iniciarPomodoro(tareaSiguiente);
                    } else {
                        alert("No hay tarea siguiente para comenzar.");
                    }
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
    document.getElementById("temporizador").textContent = "00:00";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
