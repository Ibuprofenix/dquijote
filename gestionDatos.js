/**
 * GestionDatos.js - Versión Compacta para Ranking sin Scroll
 */
const GestionDatos = {
    URL_SCRIPT: "https://script.google.com/macros/s/AKfycbyPaCBeE0ioovMSvQfOJCFOABD4KgeYZ-cgHacboL6T2EoIKohWA3k4KmgR3uXn4XA/exec",
    
    enviando: false,

    MAPA_GESTAS: {
        "fase0":    { nivel: 1, nombre: "EL ESPALDARAZO" },
        "arcade1":  { nivel: 2, nombre: "LOS MOLINOS" },
        "fase1":    { nivel: 3, nombre: "EL YELMO DE MAMBRINO" },
        "arcade2":  { nivel: 4, nombre: "LOS GIGANTES" },
        "fase2":    { nivel: 5, nombre: "EL BÁLSAMO DE FIERABRÁS" },
        "arcade3":  { nivel: 6, nombre: "EL COLOSO" },
        "fase3":    { nivel: 7, nombre: "LA CUEVA DE MONTESINOS" },
        "victoria": { nivel: 8, nombre: "¡HÉROE DE LA MANCHA!" }
    },

    setNombre(nombre) {
        let n = (nombre && nombre.trim() !== "") ? nombre.trim().toUpperCase() : "HIDALGO";
        localStorage.setItem('quijote_nombre', n.substring(0, 25));
    },

    getNombre() {
        return localStorage.getItem('quijote_nombre') || "HIDALGO";
    },

    async enviarGesta(puntos, vidas, claveHito) {
        if (this.enviando) return;
        this.enviando = true;

        const info = this.MAPA_GESTAS[claveHito] || { nivel: 0, nombre: "AVENTURA" };

        const payload = {
            nombre: this.getNombre(),
            puntuacion: puntos,
            vidas: vidas,
            nivel: info.nivel,          
            nombreNivel: info.nombre,    
            timestamp: Date.now()
        };

        try {
            await fetch(this.URL_SCRIPT, {
                method: 'POST',
                mode: 'no-cors', 
                body: JSON.stringify(payload)
            });
            this.enviando = false; 
            return true;
        } catch (e) {
            console.error("Error en el envío:", e);
            this.enviando = false;
            return false;
        }
    },

    async obtenerRanking() {
        try {
            await new Promise(r => setTimeout(r, 800));
            const response = await fetch(`${this.URL_SCRIPT}?t=${Date.now()}`);
            const datos = await response.json();
            if (!Array.isArray(datos)) return [];

            // ORDENACIÓN: 1º Nivel, 2º Puntuación
            return datos.sort((a, b) => {
                const nA = Number(a.nivel) || 0;
                const nB = Number(b.nivel) || 0;
                if (nB !== nA) return nB - nA;
                return (Number(b.puntuacion) || 0) - (Number(a.puntuacion) || 0);
            });
        } catch (e) {
            return [];
        }
    },

    async actualizarTablaVisual() {
        const lista = document.getElementById('lista-ranking');
        if (!lista) return;

        lista.innerHTML = `
            <div class="flex flex-col items-center justify-center p-4">
                <div class="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin mb-2"></div>
                <p class='text-center italic text-sm opacity-50'>Consultando crónicas...</p>
            </div>`;

        const ranking = await this.obtenerRanking();

        if (ranking.length === 0) {
            lista.innerHTML = "<p class='text-center p-4 opacity-70'>No hay crónicas disponibles.</p>";
            return;
        }

        // Renderizado con clases compactas para evitar scroll
        lista.innerHTML = ranking.slice(0, 5).map((r, i) => `
            <div class="fila-ranking font-mono">
                <div class="info-caballero">
                    <span class="nombre-texto">${i + 1}. ${r.nombre}</span>
                    <span class="nivel-texto">${r.nombreNivel || 'AVENTURA'}</span>
                </div>
                <div class="puntos-contenedor">
                    <span class="puntos-valor">${r.puntuacion}</span>
                    <span class="puntos-etiqueta">PUNTOS</span>
                </div>
            </div>
        `).join('');
    }
};

window.GestionDatos = GestionDatos;