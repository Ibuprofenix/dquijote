/**
 * GESTIONDATOS.JS - Crónicas de la Mancha
 * AJUSTE: Integración de títulos de gesta dinámicos y envío de crónicas.
 */
const GestionDatos = {
    URL_SCRIPT: "https://script.google.com/macros/s/AKfycbyPaCBeE0ioovMSvQfOJCFOABD4KgeYZ-cgHacboL6T2EoIKohWA3k4KmgR3uXn4XA/exec",

    setNombre(nombre) {
        const nombreLimpio = (nombre && nombre.trim() !== "") ? nombre.trim().toUpperCase() : "HIDALGO";
        localStorage.setItem('quijote_nombre', nombreLimpio);
        console.log("Caballero registrado como:", nombreLimpio);
    },

    getNombre() {
        return localStorage.getItem('quijote_nombre') || "HIDALGO";
    },

    async enviarGesta(puntos, vidas, nivel, gestaNombre) {
    const nombreActual = this.getNombre();
    
    // Si no viene gestaNombre, usamos el número de nivel como fallback
    const nivelTexto = gestaNombre || `NIVEL ${nivel}`;

    const payload = {
        nombre: nombreActual,
        puntuacion: puntos,
        vidas: vidas,
        nivel: nivelTexto // <--- AHORA PASA EL NOMBRE A LA HOJA
    };

    try {
        await fetch(this.URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Error al enviar crónicas:", e);
    }
},

    async obtenerRanking() {
        try {
            const response = await fetch(this.URL_SCRIPT);
            const datos = await response.json();
            // Ordenar por puntuación de mayor a menor
            return datos.sort((a, b) => b.puntuacion - a.puntuacion);
        } catch (e) {
            console.error("Error al obtener el libro de honor:", e);
            return [];
        }
    },

    /**
     * FUNCIÓN CLAVE PARA EL FINAL DEL JUEGO
     * @param {number} puntosTotales 
     * @param {boolean} esVictoriaDefinitiva 
     * @param {string} gestaNombre - Nombre del nivel o trivia donde terminó
     */
    async guardarYMostrarRanking(puntosTotales, esVictoriaDefinitiva, gestaNombre) {
        // 1. PRIMERO mostramos la interfaz (el ranking puede cargar después)
        if (window.Interfaz) {
            Interfaz.mostrarRanking(esVictoriaDefinitiva);
        }

        // 2. DESPUÉS enviamos los datos en segundo plano
        try {
            // El nivel enviado es el actual del juego
            const nivelActual = window.Juego ? window.Juego.nivel : 0;
            const vidasRestantes = (window.Juego && window.Juego.entidades.quijote) ? window.Juego.entidades.quijote.vidas : 0;

            await this.enviarGesta(puntosTotales, vidasRestantes, nivelActual, gestaNombre);
            
            // 3. Una vez enviados, refrescamos la vista del ranking para incluir la nueva entrada
            if (window.Interfaz) {
                // Pequeño delay para que el Script de Google procese si es necesario
                setTimeout(() => Interfaz.mostrarRanking(esVictoriaDefinitiva), 500);
            }
        } catch (e) {
            console.error("Error en el envío final a los anales:", e);
        }
    }
};

window.GestionDatos = GestionDatos;