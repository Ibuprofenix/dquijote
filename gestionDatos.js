/**
 * GESTIÓN DE DATOS UNIFICADA: Quijote Invaders
 * Maneja el almacenamiento local y la comunicación con Google Sheets
 */

const GestionDatos = {
    // 1. Persistencia del nombre del jugador
    guardarNombre(nombre) {
        if (!nombre || nombre.trim() === "") nombre = "Hidalgo Anónimo";
        localStorage.setItem('quijote_nombre', nombre.trim());
    },

    getNombre() {
        return localStorage.getItem('quijote_nombre') || "Hidalgo Anónimo";
    },

    // 2. Envío de datos a Google Sheets
    // Esta función es la que llaman los motores al terminar cada nivel
    enviarAlScript(estado, vidas, nivel, puntos) {
        const URL_WEBAPP = "TU_URL_DE_APPS_SCRIPT_AQUI"; // <--- PEGA AQUÍ TU URL
        
        const datos = {
            nombre: this.getNombre(),
            estado: estado, // Ejemplo: "VICTORIA N1", "DERROTA N3"
            vidas: vidas,
            nivel: nivel,
            puntos: puntos,
            fecha: new Date().toLocaleString('es-ES')
        };

        console.log("Enviando gesta a la biblioteca real...", datos);

        // Usamos fetch con modo 'no-cors' para evitar bloqueos de seguridad del navegador
        fetch(URL_WEBAPP, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(() => console.log("Gesta registrada correctamente."))
        .catch(err => console.error("Error al registrar la gesta:", err));
    }
};

// Alias global para compatibilidad con tus motores actuales
function enviarDatos(estado, vidas, nivel, puntos) {
    GestionDatos.enviarAlScript(estado, vidas, nivel, puntos);
}