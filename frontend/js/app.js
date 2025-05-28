document.addEventListener("DOMContentLoaded", obtenerTareas);

document.getElementById("cargarTareasBtn").addEventListener("click", obtenerTareas);
document.getElementById("nuevaTareaBtn").addEventListener("click", nuevaTarea);

const addTareaDialog = document.getElementById("nuevaTareaDialog");
document.getElementById("openDialogAddTareaBtn").addEventListener("click", () => {
  addTareaDialog.showModal();
  const fechaInput = document.getElementById("fecha_limite");
  const today = new Date().toISOString().split('T')[0];
  fechaInput.setAttribute('min', today);
  fechaInput.value = today;
  cargarCategoriasDisponibles();
});

document.getElementById('cancelTareaBtn').addEventListener("click", () => {
  addTareaDialog.close();
});

document.getElementById("fecha_limite").addEventListener("change", cargarCategoriasDisponibles);
document.getElementById("prioridad").addEventListener("change", cargarCategoriasDisponibles);

let usuarioActual = null;

async function obtenerTareas() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:8080/tareas", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error en la respuesta:", error);
      throw new Error(error || "Error al obtener las tareas");
    }

    const tareas = await response.json();
    if (Array.isArray(tareas) && tareas.length > 0) {
      usuarioActual = tareas[0].usuario;
    }

    document.getElementById("tableBody").innerHTML = "";

    tareas.forEach(tarea => {
      const fila = document.createElement("tr");
      fila.id = "filaTarea_" + tarea.id;
      fila.innerHTML = `
        <td>${tarea.titulo}</td>
        <td>${tarea.descripcion}</td>
        <td>${tarea.fecha_limite}</td>
        <td>${tarea.prioridad}</td>
        <td>${tarea.estado}</td>
        <td>${tarea.categoria ? tarea.categoria.nombre : ''}</td>
        <td>${tarea.usuario ? tarea.usuario.nombre : ''}</td>
        <td><button class="btn btn-danger btn-sm" onclick="borrarTarea(${tarea.id})">Borrar</button></td>
      `;
      document.getElementById("tableBody").appendChild(fila);
    });

    return tareas; // para poder usar en borrarTarea

  } catch (error) {
    console.log("Error en la solicitud:", error);
  }
}

async function cargarCategoriasDisponibles() {
  const fecha = document.getElementById("fecha_limite").value;
  const prioridad = document.getElementById("prioridad").value;
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:8080/categorias/disponibles?fecha=${fecha}&prioridad=${prioridad}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Error al obtener las categorías disponibles");
    }

    const categorias = await response.json();
    const categoriaSelect = document.getElementById("categoria_id");
    categoriaSelect.innerHTML = "";

    categorias.forEach(categoria => {
      const option = document.createElement("option");
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      categoriaSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}

async function nuevaTarea() {
  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const fecha_limite = document.getElementById("fecha_limite").value;
  const prioridad = document.getElementById("prioridad").value;
  const estado = document.getElementById("estado").value;
  const categoriaId = document.getElementById("categoria_id").value;

  const tarea = {
    titulo,
    descripcion,
    fecha_limite,
    prioridad,
    estado,
    categoria: { id: categoriaId }
  };

  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/tareas", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tarea)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Error al insertar la tarea");
    }

    const tareaInsertada = await response.json();
    const fila = document.createElement("tr");
    fila.id = "filaTarea_" + tareaInsertada.id;
    fila.innerHTML = `
      <td>${tareaInsertada.titulo}</td>
      <td>${tareaInsertada.descripcion}</td>
      <td>${tareaInsertada.fecha_limite}</td>
      <td>${tareaInsertada.prioridad}</td>
      <td>${tareaInsertada.estado}</td>
      <td>${tareaInsertada.categoria ? tareaInsertada.categoria.nombre : ''}</td>
      <td>${tareaInsertada.usuario ? tareaInsertada.usuario.nombre : ''}</td>
      <td><button class="btn btn-danger btn-sm" onclick="borrarTarea(${tareaInsertada.id})">Borrar</button></td>
    `;
    document.getElementById("tableBody").appendChild(fila);

    // Limpiar inputs
    document.getElementById('titulo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('fecha_limite').value = '';
    document.getElementById('prioridad').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('categoria_id').value = '';

    addTareaDialog.close();

  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}

async function borrarTarea(id) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:8080/tareas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Error al borrar la tarea");
    }

    const tareas = await obtenerTareas();
    const tarea = tareas.find(t => t.id === id);
    if (tarea && tarea.usuario && tarea.usuario.id === usuarioActual.id) {
      document.getElementById("filaTarea_" + id).remove();
    } else {
      throw new Error("No tienes permiso para borrar esta tarea");
    }

  } catch (error) {
    console.log("Error al borrar la tarea:", error);
  }
}

async function logout(){
  localStorage.removeItem("token");
  location.href = 'index.html';
}
document.getElementById("BtnLogout").addEventListener("click", logout);
