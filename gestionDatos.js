const GestionDatos = {
    URL_SCRIPT: "https://script.google.com/macros/s/AKfycbyPaCBeE0ioovMSvQfOJCFOABD4KgeYZ-cgHacboL6T2EoIKohWA3k4KmgR3uXn4XA/exec",

    setNombre(nombre) {
        // CORRECCIÓN: Límite de 25 caracteres al guardar
        let nombreLimpio = (nombre && nombre.trim() !== "") ? nombre.trim().toUpperCase() : "HIDALGO";
        if (nombreLimpio.length > 25) nombreLimpio = nombreLimpio.substring(0, 25);
        
        localStorage.setItem('quijote_nombre', nombreLimpio);
    },

    getNombre() {
        return localStorage.getItem('quijote_nombre') || "HIDALGO";
    },

    async guardarPartida(puntos, vidas, nivel) {
        return await this.enviarGesta(puntos, vidas, nivel);
    },

    async enviarGesta(puntos, vidas, nivel) {
        const payload = {
            nombre: this.getNombre(),
            puntuacion: puntos,
            vidas: vidas,
            nivel: nivel
        };
        try {
            await fetch(this.URL_SCRIPT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("Gesta enviada.");
        } catch (e) { console.error("Error al enviar:", e); }
    },

    async obtenerRanking() {
        try {
            const response = await fetch(this.URL_SCRIPT);
            const datos = await response.json();
            // Ordenamos por puntuación
            return datos.sort((a, b) => b.puntuacion - a.puntuacion);
        } catch (e) { return []; }
    },

    async actualizarTablaVisual() {
        const listaRanking = document.getElementById('lista-ranking');
        if (!listaRanking) return;

        listaRanking.innerHTML = "<p class='text-center animate-pulse'>Consultando crónicas...</p>";

        const ranking = await this.obtenerRanking();

        if (ranking.length === 0) {
            listaRanking.innerHTML = "<p class='text-center'>No hay gestas registradas.</p>";
            return;
        }

        // CORRECCIÓN: .slice(0, 5) para mostrar máximo 5 registros
        listaRanking.innerHTML = ranking.slice(0, 5).map((r, i) => `
            <div class="flex justify-between items-center border-b border-amber-900/10 py-2 font-mono text-amber-900">
                <span class="font-bold">${i + 1}. ${r.nombre}</span>
                <div class="flex gap-4">
                    <span class="text-xs opacity-70">NV.${r.nivel}</span>
                    <span class="font-black">${r.puntuacion}</span>
                </div>
            </div>
        `).join('');
    },

    async mostrarTablaRecords() {
    const pantallaRanking = document.getElementById('pantalla-ranking');
    const mensajeEpico = document.getElementById('mensaje-epico');
    
    // Si venimos de ganar el Nivel 3...
    if (window.Juego && window.Juego.nivel === 3 && window.Juego.tiempoRestante > 0) {
        if (mensajeEpico) {
            // Mostramos el cartel maquetado
            mensajeEpico.classList.remove('hidden');
            
            // Esperamos 3.5 segundos para que el jugador disfrute su gloria
            await new Promise(resolve => setTimeout(resolve, 3500));
            
            // Ocultamos el cartel para que no tape el ranking
            mensajeEpico.classList.add('hidden');
        }
    }

    // Mostramos la pantalla de ranking normal
    if (pantallaRanking) {
        pantallaRanking.classList.remove('hidden');
        await this.actualizarTablaVisual();
    }
}
};

window.GestionDatos = GestionDatos;