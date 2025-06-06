document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8081/usuario/perfil", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => {
            if (!res.ok) throw new Error("No autorizado");
            return res.json();
        })
        .then(usuario => {
            document.getElementById("perfilNombre").textContent = usuario.nombre;
            document.getElementById("perfilApellidos").textContent = usuario.apellidos;
            document.getElementById("perfilEmail").textContent = usuario.email;
            document.getElementById("perfilUsername").textContent = usuario.username;
            document.getElementById("sobreMi").value = usuario.sobreMi || "";

            if (usuario.curriculumUrl) {
                const ext = usuario.curriculumUrl.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

                const previewContainer = document.getElementById("curriculumPreviewContainer");
                previewContainer.innerHTML = ""; // Limpia antes de insertar

                if (isImage) {
                    const img = document.createElement("img");
                    img.src = `http://localhost:8081${usuario.curriculumUrl}`;
                    img.alt = "Currículum";
                    img.classList.add("img-fluid", "rounded", "shadow-sm");
                    img.style.maxWidth = "300px";
                    previewContainer.appendChild(img);
                } else {
                    const link = document.createElement("a");
                    link.href = `http://localhost:8081${usuario.curriculumUrl}`;
                    link.textContent = "Ver Curriculum";
                    link.target = "_blank";
                    previewContainer.appendChild(link);
                }

                previewContainer.style.display = "block";
            }

        })
        .catch(error => {
            console.error("Error al obtener perfil:", error);
            window.location.href = "login.html";
        });

    const perfilForm = document.getElementById("perfilForm");
    perfilForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData();
        const sobreMi = document.getElementById("sobreMi").value;
        const curriculum = document.getElementById("curriculum").files[0];

        formData.append("sobreMi", sobreMi);
        if (curriculum) {
            formData.append("curriculum", curriculum);
        }

        fetch("http://localhost:8081/usuario/perfil", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        })
            .then(res => {
                if (!res.ok) throw new Error("Error al actualizar el perfil");
                return res.text();
            })
            .then(msg => {
                alert("Perfil actualizado correctamente");
                location.reload(); // Recarga para mostrar cambios
            })
            .catch(err => {
                console.error("Error:", err);
                alert("Hubo un error al actualizar el perfil");
            });
    });
});
