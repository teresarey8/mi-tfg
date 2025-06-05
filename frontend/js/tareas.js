    let tareasCargadas = false;
    let categoriasCargadas = false;

    document.addEventListener("DOMContentLoaded", function() {
        if (!tareasCargadas) {
            obtenerTareas();
            tareasCargadas = true;
        }

        if (!categoriasCargadas) {
            cargarCategorias();
            cargarCategoriasParaFiltro();
            categoriasCargadas = true;
        }

        const limpiarListener = (id, evento, funcion) => {
            const elemento = document.getElementById(id);
            elemento.removeEventListener(evento, funcion);
            elemento.addEventListener(evento, funcion);
        };

        limpiarListener("nuevaTareaBtn", "click", nuevaTarea);
        limpiarListener("openDialogAddTareaBtn", "click", abrirDialogoTarea);
        limpiarListener("cancelTareaBtn", "click", cerrarDialogoTarea);
        limpiarListener("BtnLogout", "click", logout);
        limpiarListener("BtnCategorias", "click", () => {
            window.location.href = "categorias.html";
        });
        limpiarListener("filtroCategoria", "change", (e) => {
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
        document.getElementById("tituloModal").textContent = "Crear nueva tarea";

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
        const container = document.getElementById("cardContainer");
        container.innerHTML = "<div class='text-center'><div class='spinner-border text-primary' role='status'><span class='visually-hidden'>Cargando...</span></div></div>";

        try {
            const response = await fetch("http://localhost:8081/tareas?" + new Date().getTime(), {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Cache-Control": "no-cache"
                },
                cache: 'no-store'
            });

            if (!response.ok) throw new Error(await response.text());

            const tareas = await response.json();

            // Filtrar tareas duplicadas
            const tareasUnicas = [];
            const idsVistos = new Set();

            for (const tarea of tareas) {
                if (!idsVistos.has(tarea.id)) {
                    idsVistos.add(tarea.id);
                    tareasUnicas.push(tarea);
                }
            }

            renderizarTareas(tareasUnicas);

        } catch (error) {
            console.error("Error al obtener tareas:", error);
            container.innerHTML = `<div class="alert alert-danger">Error al cargar tareas: ${error.message}</div>`;
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

    function renderizarTareas(tareas) {
        const container = document.getElementById("cardContainer");
        container.innerHTML = "";

        for (const tarea of tareas) {
            const cardCol = document.createElement("div");
            cardCol.className = "col-md-4";
            cardCol.id = `container${tarea.id}`;

            // obtenemos el color de la categoría (si no existe, asigna un color por defecto)
            let colorCategoria = "#6c757d";
            if (tarea.categoria && tarea.categoria.color) {
                colorCategoria = tarea.categoria.color;
            } else if (tarea.categoria && tarea.categoria.nombre) {
                // Asignar color según nombre (puedes modificarlo)
                switch (tarea.categoria.nombre.toLowerCase()) {
                    case "trabajo": colorCategoria = "#ffc107"; break; // amarillo
                    case "personal": colorCategoria = "#17a2b8"; break; // azul
                    case "estudio": colorCategoria = "#6c757d"; break; // gris
                    default: colorCategoria = "#6c757d"; break;
                }
            }

            const card = document.createElement("div");
            card.className = "flip-card";
            card.addEventListener("click", () => {
                card.classList.toggle("flipped");
            });

            card.innerHTML = `
      <div class="categoria-color" style="border-top-color: ${colorCategoria};"></div>            <div class="flip-card-inner">
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
                      <!-- Ya no mostramos categoría en texto -->
                    </div>
                    <div class="mt-2 d-flex justify-content-between">
                      <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); editarTarea(${tarea.id})">Editar</button>
                      <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); borrarTarea(${tarea.id})">Borrar</button>
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
        const select = document.getElementById("filtroCategoria");
        select.innerHTML = '<option value="">Todas</option>';

        try {
            const response = await fetch("http://localhost:8081/categorias?" + new Date().getTime(), {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Cache-Control": "no-cache"
                },
                cache: 'no-store'
            });

            if (!response.ok) throw new Error("Error al obtener categorías");

            const categorias = await response.json();

            // Filtrar categorías duplicadas
            const categoriasUnicas = [];
            const nombresVistos = new Set();

            categorias.forEach(cat => {
                if (!nombresVistos.has(cat.nombre)) {
                    nombresVistos.add(cat.nombre);
                    categoriasUnicas.push(cat);
                }
            });

            categoriasUnicas.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.nombre;
                select.appendChild(option);
            });

        } catch (err) {
            console.error(err);
            select.innerHTML = '<option value="">Error al cargar categorías</option>';
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

        let tareaData;

        if (tareaId) {
            tareaData = {
                titulo: document.getElementById("titulo").value,
                descripcion: document.getElementById("descripcion").value,
                fecha_limite: fechaISO,
                prioridad: document.getElementById("prioridad").value,
                estado: document.getElementById("estado").value,
                categoriaId: parseInt(categoriaId)
            };
        } else {
            // Para crear (POST), enviar el DTO con categoriaId plano
            tareaData = {
                titulo: document.getElementById("titulo").value,
                descripcion: document.getElementById("descripcion").value,
                fecha_limite: fechaISO,
                prioridad: document.getElementById("prioridad").value,
                estado: document.getElementById("estado").value,
                categoriaId: parseInt(categoriaId)
            };
        }

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
        const confirmar = confirm("¿Estás seguro de que quieres borrar esta categoría?");
        if (!confirmar) return;

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
            // 1. Obtener la tarea
            const response = await fetch(`http://localhost:8081/tareas/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener la tarea");

            const tarea = await response.json();

            // 2. Cargar las categorías antes de mostrar el form
            await cargarCategorias();

            // 3. Rellenar campos del formulario
            document.getElementById("tareaIdEdit").value = tarea.id;
            document.getElementById("titulo").value = tarea.titulo;
            document.getElementById("descripcion").value = tarea.descripcion;
            document.getElementById("fecha_limite").value = tarea.fecha_limite?.slice(0, 16);
            document.getElementById("prioridad").value = tarea.prioridad;
            document.getElementById("estado").value = tarea.estado;

            // 4. Asegurar que el select tenga la categoría seleccionada
            if (tarea.categoria?.id) {
                document.getElementById("categoria_id").value = tarea.categoria.id;
            }

            // 5. Abrir modal
            document.getElementById("tituloModal").textContent = "Editar tarea";
            document.getElementById("nuevaTareaDialog").showModal();

        } catch (error) {
            console.error("Error al editar tarea:", error);
            alert("Ocurrió un error al cargar la tarea para editar.");
        }
    }



    function logout() {
        localStorage.removeItem("token");
        location.href = "index.html";
    }
