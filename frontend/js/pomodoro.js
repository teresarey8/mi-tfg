let tiempoRestante = 25 * 60;
let temporizador;

function iniciarPomodoro(tareaId) {
    tiempoRestante = 25 * 60;
    actualizarTemporizador();

    temporizador = setInterval(() => {
        tiempoRestante--;
        actualizarTemporizador();

        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            alert("¡Pomodoro finalizado!");
            registrarPomodoro(tareaId);
        }
    }, 1000);
}

function actualizarTemporizador() {
    const min = Math.floor(tiempoRestante / 60);
    const seg = tiempoRestante % 60;
    document.getElementById("temporizador").textContent =
        `${min}:${seg.toString().padStart(2, "0")}`;
}

function registrarPomodoro(tareaId) {
    const inicio = new Date().toISOString();
    const fin = new Date(Date.now() + 1500 * 1000).toISOString();

    fetch("http://localhost:8080/pomodoros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tareaId,
            inicio,
            fin,
            completado: true
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log("Pomodoro registrado:", data);
        })
        .catch(err => {
            console.error("Error:", err);
        });
}
