/** * ARCHIVO: barniz.js
 * Misión: Forzar la visibilidad de los personajes y conectar con Interfaz.js
 */
(function() {
    // 1. RE-VINCULACIÓN DEL CANVAS
    // Forzamos que las variables globales del motor apunten al canvas de arriba
    window.canvas = document.getElementById('gameCanvas');
    window.ctx = window.canvas.getContext('2d');

    if (typeof Juego === 'undefined') return;

    // 2. ESTADO INICIAL
    Juego.activo = false;
    const fCanvas = document.getElementById('fondoCanvas');
    const fCtx = fCanvas.getContext('2d');

    function refrescarFondo() {
        if (typeof Interfaz !== 'undefined') {
            fCtx.clearRect(0, 0, fCanvas.width, fCanvas.height);
            Interfaz.dibujarEscenario(fCtx);
        }
    }

    // 3. LOGICA DEL BOTÓN
    window.addEventListener('load', () => {
        refrescarFondo();
        const btn = document.getElementById('btnAccion');
        btn.onclick = (e) => {
            e.preventDefault();
            document.getElementById('resumenGesta').style.display = "none";
            
            // Si el juego no ha empezado, arrancamos
            if (Juego.nivel === 0 || !Juego.entidades) {
                Juego.iniciarNivel(1);
            }
            Juego.activo = true;
            refrescarFondo();
        };
    });

    // 4. EL BUCLE DE RENDERIZADO (HOOK)
    const originalLoop = Juego.loop;
    Juego.loop = function() {
        // Ejecutamos el motor original para que dibuje Quijote/Enemigos
        originalLoop.call(Juego);

        // Si el motor cambia de nivel, actualizamos el fondo de abajo
        if (document.body.className !== "nivel" + Juego.nivel) {
            document.body.className = "nivel" + Juego.nivel;
            refrescarFondo();
        }

        // Dibujamos la Interfaz (Vidas/Tiempo) en el canvas superior
        if (Juego.activo && typeof Interfaz !== 'undefined') {
            Interfaz.dibujarHUD(window.ctx, Juego.entidades.quijote.vidas, Juego.nivel);
        }
    };
})();