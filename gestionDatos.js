const GestionDatos = {
    // REEMPLAZA ESTA URL POR LA TUYA DE GOOGLE APPS SCRIPT
    URL_SCRIPT: "https://script.google.com/macros/s/AKfycbyPaCBeE0ioovMSvQfOJCFOABD4KgeYZ-cgHacboL6T2EoIKohWA3k4KmgR3uXn4XA/exec",

    setNombre(nombre) {
        // Limpiamos espacios y pasamos a mayúsculas
        const nombreLimpio = (nombre && nombre.trim() !== "") ? nombre.trim().toUpperCase() : "HIDALGO";
        
        // Guardamos en localStorage sobrescribiendo cualquier valor previo
        localStorage.setItem('quijote_nombre', nombreLimpio);
        
        // Log para confirmar el cambio en consola
        console.log("Caballero registrado como:", nombreLimpio);
    },

    getNombre() {
        // Recuperamos el nombre, si no existe devolvemos el genérico
        return localStorage.getItem('quijote_nombre') || "HIDALGO";
    },

    async enviarGesta(puntos, vidas, nivel) {
        const nombreActual = this.getNombre();
        
        // Evitamos enviar si el nombre es el genérico por error (opcional)
        const payload = {
            nombre: nombreActual,
            puntuacion: puntos,
            vidas: vidas,
            nivel: nivel
        };

        try {
            // Usamos 'no-cors' para evitar problemas de política de origen con Google Scripts
            await fetch(this.URL_SCRIPT, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("Gesta de " + nombreActual + " enviada a los anales.");
        } catch (e) {
            console.error("Error al enviar gesta:", e);
        }
    },

    async obtenerRanking() {
        try {
            // El fetch por defecto es GET, que es lo que espera el script para leer
            const response = await fetch(this.URL_SCRIPT);
            const datos = await response.json();
            
            // Opcional: Aseguramos que el ranking venga ordenado por puntuación de mayor a menor
            return datos.sort((a, b) => b.puntuacion - a.puntuacion);
        } catch (e) {
            console.error("Error al obtener ranking:", e);
            return [];
        }
    }
};

window.GestionDatos = GestionDatos;