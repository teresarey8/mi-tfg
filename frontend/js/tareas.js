
document.addEventListener("DOMContentLoaded", () => {
  obtenerTareas();
  cargarCategorias();
});

document.getElementById("nuevaTareaBtn").addEventListener("click", nuevaTarea);
document.getElementById("openDialogAddTareaBtn").addEventListener("click", () => {
  document.getElementById("nuevaTareaDialog").showModal();
  const fechaInput = document.getElementById("fecha_limite");
  const today = new Date().toISOString().split('T')[0];
  fechaInput.setAttribute('min', today);
  fechaInput.value = today;
});

document.getElementById("cancelTareaBtn").addEventListener("click", () => {
  document.getElementById("nuevaTareaDialog").close();
});

document.getElementById("BtnLogout").addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("BtnCategorias").addEventListener("click", () => {
    window.location.href = "categorias.html";
  });
});


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
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    tareas.forEach(tarea => {
      const fila = document.createElement("tr");
      fila.id = `filaTarea_${tarea.id}`;
      fila.innerHTML = `
        <td>${tarea.titulo}</td>
        <td>${tarea.descripcion}</td>
        <td>${tarea.fecha_limite}</td>
        <td>${tarea.prioridad}</td>
        <td>${tarea.estado}</td>
        <td>${tarea.categoria ? tarea.categoria.nombre : ''}</td>
        <td><button class="btn btn-warning btn-sm" onclick="editarTarea(${tarea.id})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="borrarTarea(${tarea.id})">Borrar</button></td>
      `;
      tbody.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al obtener tareas:", error);
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

async function nuevaTarea() {
  const token = localStorage.getItem("token");
  const categoriaId = document.getElementById("categoria_id").value;
  const tareaId = document.getElementById("tareaIdEdit").value;

  if (!categoriaId) {
    alert("Por favor selecciona una categoría");
    return;
  }

  const tareaData = {
    titulo: document.getElementById("titulo").value,
    descripcion: document.getElementById("descripcion").value,
    fecha_limite: document.getElementById("fecha_limite").value.split('T')[0],
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

    document.getElementById("nuevaTareaDialog").close();
    document.getElementById("tareaIdEdit").value = ""; // limpia ID para modo creación
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

    document.getElementById(`filaTarea_${id}`).remove();
  } catch (error) {
    console.error("Error al borrar tarea:", error);
  }
}



function logout() {
  localStorage.removeItem("token");
  location.href = "index.html";
}