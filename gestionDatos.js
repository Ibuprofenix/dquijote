/** * ARCHIVO: gestionDatos.js 
 * FUNCIÓN: Centraliza el registro, persistencia y envío de datos a Google Sheets.
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyPaCBeE0ioovMSvQfOJCFOABD4KgeYZ-cgHacboL6T2EoIKohWA3k4KmgR3uXn4XA/exec";
const WEB_PUNTUACIONES = "https://educastur.sharepoint.com/sites/lospasosdelcid/SitePages/La_Mancha_Invaders.aspx?csf=1&web=1&e=GZTQm7&CID=c144ab21-57f7-4f02-a507-0e15c77abb06";

// Recuperamos el nombre si ya existe de sesiones o niveles anteriores
let nombreJugador = localStorage.getItem('nombreQuijote') || "";
let registroEnviado = false;

/**
 * Envía los resultados al Google Script.
 */
function enviarDatos(resultadoFinal, vidas, nivel) {
    if (registroEnviado) return;
    
    // Aseguramos que siempre haya un nombre, rescatándolo de la memoria si nombreJugador está vacío
    const nombreParaEnviar = nombreJugador || localStorage.getItem('nombreQuijote') || "Anónimo";
    
    // Detectar puntuación si existe en el objeto Interfaz o globalmente
    let puntos = 0;
    if (typeof Interfaz !== 'undefined' && Interfaz.puntuacion !== undefined) puntos = Interfaz.puntuacion;
    else if (typeof score !== 'undefined') puntos = score;

    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ 
            nombre: nombreParaEnviar, 
            resultado: resultadoFinal, 
            puntos: resultadoFinal, 
            vidas: vidas, 
            nivel: nivel 
        })
    });
    
    registroEnviado = true;
    
    // Mostrar botón de clasificación si el elemento existe en el HTML
    const btn = document.getElementById('btnPuntuaciones');
    if (btn) btn.style.display = "block";
}

/**
 * Redirige a la página de puntuaciones.
 */
function verPuntuaciones() { 
    window.open(WEB_PUNTUACIONES, '_blank'); 
}

/**
 * Controla el inicio del juego mediante clic en el canvas.
 * Pide el nombre solo la primera vez.
 */
function configurarInicio(canvas, callbackIniciar) {
    if (!canvas) return;
    
    canvas.onclick = () => {
        // Solo actúa si el juego no está activo
        if (typeof activo !== 'undefined' && !activo) {
            
            // Si no tenemos nombre en memoria, lo pedimos
            if (!nombreJugador) {
                nombreJugador = prompt("¿Vuestro nombre, hidalgo?", "Alonso Quijano");
                if (nombreJugador) {
                    localStorage.setItem('nombreQuijote', nombreJugador);
                }
            }
            
            registroEnviado = false;
            
            // Ocultar el botón de clasificación al reiniciar partida
            const btn = document.getElementById('btnPuntuaciones');
            if (btn) btn.style.display = "none";
            
            // Ejecutamos la función de inicio del motor
            if (typeof callbackIniciar === 'function') {
                callbackIniciar();
            }
        }
    };
}

/**
 * Objeto SistemaGesta: Compatibilidad con motores que llaman a estas funciones.
 */
const SistemaGesta = {
    enviarYMostrar: function(res, vid, niv) { 
        enviarDatos(res, vid, niv); 
    },
    generarPolvo: function(x, y) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.left = x + 'px';
        p.style.top = (y + 40) + 'px';
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.background = 'rgba(210, 180, 140, 0.5)';
        p.style.borderRadius = '50%';
        p.style.pointerEvents = 'none';
        p.style.zIndex = '999';
        document.body.appendChild(p);
        setTimeout(() => { if(p.parentNode) p.remove(); }, 600);
    }
};
