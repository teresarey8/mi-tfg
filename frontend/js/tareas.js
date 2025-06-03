document.addEventListener("DOMContentLoaded", () => {
    obtenerTareas();
    cargarCategorias();
    cargarCategoriasParaFiltro(); // 🔍 nuevo

    document.getElementById("nuevaTareaBtn").addEventListener("click", nuevaTarea);
    document.getElementById("openDialogAddTareaBtn").addEventListener("click", abrirDialogoTarea);
    document.getElementById("cancelTareaBtn").addEventListener("click", cerrarDialogoTarea);
    document.getElementById("BtnLogout").addEventListener("click", logout);
    document.getElementById("BtnCategorias").addEventListener("click", () => {
        window.location.href = "categorias.html";
    });

    document.getElementById("filtroCategoria").addEventListener("change", (e) => {
        const categoriaId = e.target.value;
        if (categoriaId === "") {
            obtenerTareas();
        } else {
            obtenerTareasPorCategoria(categoriaId);
        }
    });
});

function abrirDialogoTarea() {
    const dialog = document.getElementById("nuevaTareaDialog");
    dialog.showModal();

    const fechaInput = document.getElementById("fecha_limite");
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    fechaInput.min = now.toISOString().slice(0, 16);
    fechaInput.value = now.toISOString().slice(0, 16);

    limpiarFormulario();
}

function cerrarDialogoTarea() {
    document.getElementById("nuevaTareaDialog").close();
    limpiarFormulario();
}

function limpiarFormulario() {
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("fecha_limite").value = "";
    document.getElementById("prioridad").value = "MEDIA";
    document.getElementById("categoria_id").selectedIndex = 0;
    document.getElementById("tareaIdEdit").value = "";
}

async function obtenerTareas() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8081/tareas", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(await response.text());

        const tareas = await response.json();
        renderizarTareas(tareas);

    } catch (error) {
        console.error("Error al obtener tareas:", error);
    }
}

async function obtenerTareasPorCategoria(categoriaId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8081/tareas/categoria/${categoriaId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error al obtener tareas por categoría");

        const tareas = await response.json();
        renderizarTareas(tareas);

    } catch (err) {
        console.error(err);
        alert("No se pudieron obtener las tareas filtradas");
    }
}

async function renderizarTareas(tareas) {
    const container = document.getElementById("cardContainer");
    container.innerHTML = "";

    for (const tarea of tareas) {
        const recordatorios = await obtenerRecordatoriosPorTarea(tarea.id);

        const recordatoriosHTML = recordatorios.length > 0
            ? `<ul class="list-group list-group-flush mb-2">
                ${recordatorios.map(r => `
                    <li class="list-group-item p-1">
                        <i class="bi bi-bell-fill text-warning"></i> ${r.titulo} — 
                        <small>${new Date(r.fecha).toLocaleString('es-ES')}</small>
                    </li>
                `).join('')}
               </ul>`
            : `<p class="text-muted fst-italic">No hay recordatorios</p>`;

        const cardCol = document.createElement("div");
        cardCol.className = "col-md-4";
        cardCol.id = `container${tarea.id}`;

        const card = document.createElement("div");
        card.className = "flip-card";
        card.addEventListener("click", () => {
            card.classList.toggle("flipped");
        });

        card.innerHTML = `
            <div class="flip-card-inner">
              <div class="flip-card-front">
                <h5>${tarea.titulo}</h5>
                <p><strong>Fecha límite:</strong><br>${new Date(tarea.fecha_limite).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</p>
              </div>
              <div class="flip-card-back d-flex flex-column justify-content-between">
                <div>
                  <p><strong>Descripción:</strong> ${tarea.descripcion}</p>
                  <p><strong>Prioridad:</strong> ${tarea.prioridad}</p>
                  <p><strong>Estado:</strong> ${tarea.estado}</p>
                  <p><strong>Categoría:</strong> ${tarea.categoria ? tarea.categoria.nombre : 'Sin categoría'}</p>
                  <hr>
                  <h6>Recordatorios:</h6>
                  ${recordatoriosHTML}
                </div>
                <div class="mt-2 d-flex flex-column gap-2">
                  <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); abrirDialogRecordatorio(${tarea.id})">
                    <i class="bi bi-bell"></i> Añadir recordatorio
                  </button>
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); editarTarea(${tarea.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); borrarTarea(${tarea.id})">Borrar</button>
                  </div>
                </div>
              </div>
            </div>
        `;

        cardCol.appendChild(card);
        container.appendChild(cardCol);
    }
}


async function cargarCategorias() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8081/categorias", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error al cargar categorías");

        const categorias = await response.json();
        const select = document.getElementById("categoria_id");
        select.innerHTML = "";
        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
}

async function cargarCategoriasParaFiltro() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8081/categorias", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al obtener categorías");

        const categorias = await response.json();
        const select = document.getElementById("filtroCategoria");
        select.innerHTML = '<option value="">-- Todas --</option>';

        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });

    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar las categorías para el filtro");
    }
}

async function nuevaTarea() {
    const token = localStorage.getItem("token");
    const categoriaId = document.getElementById("categoria_id").value;
    const tareaId = document.getElementById("tareaIdEdit").value;

    if (!categoriaId) {
        alert("Por favor selecciona una categoría");
        return;
    }

    let fechaInput = document.getElementById("fecha_limite").value;

    if (!fechaInput) {
        alert("Fecha límite obligatoria");
        return;
    }

    const fechaISO = fechaInput;

    const tareaData = {
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        fecha_limite: fechaISO,
        prioridad: document.getElementById("prioridad").value,
        categoriaId: parseInt(categoriaId)
    };

    try {
        const url = tareaId
            ? `http://localhost:8081/tareas/${tareaId}`
            : "http://localhost:8081/tareas";
        const method = tareaId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tareaData)
        });

        if (!response.ok) {
            let errorText = "Error al guardar tarea";
            try {
                const error = await response.json();
                errorText = error.message || JSON.stringify(error);
            } catch (e) {
                errorText = await response.text();
            }
            throw new Error(errorText);
        }

        cerrarDialogoTarea();
        obtenerTareas();
    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar tarea: " + error.message);
    }
}

async function borrarTarea(id) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8081/tareas/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error al borrar tarea");

        const container = document.getElementById(`container${id}`);
        if (container) container.remove();
    } catch (error) {
        console.error("Error al borrar tarea:", error);
    }
}

async function editarTarea(id) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8081/tareas/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("No se pudo obtener la tarea");

        const tarea = await response.json();

        document.getElementById("titulo").value = tarea.titulo || "";
        document.getElementById("descripcion").value = tarea.descripcion || "";
        document.getElementById("fecha_limite").value = new Date(tarea.fecha_limite).toISOString().slice(0, 16);
        document.getElementById("prioridad").value = tarea.prioridad || "MEDIA";
        document.getElementById("categoria_id").value = tarea.categoria?.id || "";
        document.getElementById("tareaIdEdit").value = tarea.id;

        document.getElementById("nuevaTareaDialog").showModal();

    } catch (error) {
        console.error("Error al cargar tarea para editar:", error);
        alert("Error al cargar tarea para editar");
    }
}

function logout() {
    localStorage.removeItem("token");
    location.href = "index.html";
}
