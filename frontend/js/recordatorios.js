let recordatoriosCargados = false;

document.addEventListener("DOMContentLoaded", async () => {
    await cargarRecordatorios();
});

async function cargarRecordatorios() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:8081/recordatorios", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error("Error al cargar los recordatorios");

        const recordatorios = await response.json();
        renderizarRecordatorios(recordatorios);
    } catch (error) {
        console.error("Error cargando recordatorios:", error);
    }
}

function renderizarRecordatorios(recordatorios) {
    const contenedor = document.getElementById("cardContainer");
    document.querySelectorAll(".card-recordatorio").forEach(e => e.remove());

    recordatorios.forEach(recordatorio => {
        const card = document.createElement("div");
        card.className = "col-md-4 card-recordatorio";

        card.innerHTML = `
            <div class="card border-warning">
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="card-title">${recordatorio.titulo}</h5>
                        <p class="card-text">
                            <strong>Fecha:</strong> ${new Date(recordatorio.fecha_recordatorio).toLocaleString()}<br>
                            <strong>Frecuencia:</strong> ${recordatorio.frecuencia}
                        </p>
                    </div>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button class="btn btn-sm btn-outline-primary" onclick='editarRecordatorio(${JSON.stringify(recordatorio)})'>
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarRecordatorio(${recordatorio.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });
}


async function guardarRecordatorio() {
    const token = localStorage.getItem("token");
    const id = document.getElementById("recordatorioId").value;
    const titulo = document.getElementById("recordatorioTitulo").value.trim();
    const fecha = document.getElementById("recordatorioFecha").value;
    const frecuencia = document.getElementById("recordatorioFrecuencia").value;
    const tareaId = document.getElementById("recordatorioTareaId").value;

    const body = {
        titulo,
        fecha_recordatorio: fecha,
        frecuencia,
        tarea: { id: tareaId }
    };

    try {
        const response = await fetch(`http://localhost:8081/recordatorios${id ? "/" + id : ""}`, {
            method: id ? "PUT" : "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("Error al guardar el recordatorio");

        document.getElementById("recordatorioDialog").close();
        await cargarRecordatorios();
    } catch (error) {
        alert("No se pudo guardar el recordatorio.");
        console.error(error);
    }
}

async function eliminarRecordatorio(id) {
    const token = localStorage.getItem("token");

    if (!confirm("¿Seguro que quieres eliminar este recordatorio?")) return;

    try {
        const response = await fetch(`http://localhost:8081/recordatorios/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Error al eliminar el recordatorio");

        await cargarRecordatorios();
    } catch (error) {
        alert("No se pudo eliminar el recordatorio.");
        console.error(error);
    }
}

function abrirDialogRecordatorio(tareaId) {
    document.getElementById("recordatorioDialogTitle").textContent = "Crear nuevo recordatorio";
    document.getElementById("recordatorioTitulo").value = "";
    document.getElementById("recordatorioFecha").value = "";
    document.getElementById("recordatorioFrecuencia").value = "NINGUNA";
    document.getElementById("recordatorioId").value = "";
    document.getElementById("recordatorioTareaId").value = tareaId;
    document.getElementById("recordatorioDialog").showModal();
}

function editarRecordatorio(recordatorio) {
    document.getElementById("recordatorioDialogTitle").textContent = "Editar recordatorio";
    document.getElementById("recordatorioTitulo").value = recordatorio.titulo;
    document.getElementById("recordatorioFecha").value = recordatorio.fecha_recordatorio.slice(0, 16);
    document.getElementById("recordatorioFrecuencia").value = recordatorio.frecuencia;
    document.getElementById("recordatorioId").value = recordatorio.id;
    document.getElementById("recordatorioTareaId").value = recordatorio.tarea.id;
    document.getElementById("recordatorioDialog").showModal();
}

document.getElementById("guardarRecordatorioBtn").addEventListener("click", guardarRecordatorio);
document.getElementById("cancelarRecordatorioBtn").addEventListener("click", () => {
    document.getElementById("recordatorioDialog").close();
});
async function obtenerRecordatoriosPorTarea(tareaId) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://localhost:8081/recordatorios/tarea/${tareaId}?${new Date().getTime()}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Cache-Control": "no-cache"
            },
            cache: 'no-store'
        });

        if (!response.ok) throw new Error("Error al obtener recordatorios");

        const recordatorios = await response.json();

        // Filtrar recordatorios duplicados
        const recordatoriosUnicos = [];
        const idsVistos = new Set();

        recordatorios.forEach(r => {
            if (!idsVistos.has(r.id)) {
                idsVistos.add(r.id);
                recordatoriosUnicos.push(r);
            }
        });

        return recordatoriosUnicos;
    } catch (error) {
        console.error("Error al obtener recordatorios:", error);
        return [];
    }
}
