/** * SISTEMA DE INTERFAZ Y ESCENARIO
 * Maneja el HUD estilo pergamino y fondos decorativos
 */
const Interfaz = {
    puntuacion: 0,

    dibujarEscenario: function(ctx) {
        const nivel = document.body.className;
        
        // Dibujamos suelo según nivel
        ctx.fillStyle = nivel.includes('nivel3') ? "#1a0f00" : "#8b4513";
        ctx.fillRect(0, 550, 800, 50);

        // Decoración simple: nubes o bruma
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        for(let i=0; i<3; i++) {
            ctx.beginPath();
            ctx.arc(100 + (i*300), 100, 50, 0, Math.PI*2);
            ctx.fill();
        }
    },

    dibujarHUD: function(ctx, vidas, tiempo) {
        // Dibujar Pergamino Superior
        ctx.fillStyle = "#fdf5e6"; // Color papel viejo
        ctx.strokeStyle = "#5d4037";
        ctx.lineWidth = 4;
        
        // Caja del HUD
        ctx.beginPath();
        ctx.rect(50, 10, 700, 45);
        ctx.fill();
        ctx.stroke();

        // Textos
        ctx.fillStyle = "#3e2723";
        ctx.font = "bold 22px 'Almendra'";
        ctx.textAlign = "left";
        
        // Vidas con corazones
        let corazones = "❤️".repeat(vidas);
        ctx.fillText(`CABALLERO: ${corazones}`, 70, 40);
        
        // Tiempo
        ctx.textAlign = "right";
        ctx.fillText(`RELOJ DE ARENA: ${tiempo}s`, 730, 40);
    },

    mostrarMenuFinal: function(titulo, mensaje, victoria, callback, stats) {
        const banner = document.getElementById('resumenGesta');
        if(!banner) return;

        banner.style.display = "block";
        banner.innerHTML = `
            <h2 style="color: ${victoria ? '#2e7d32' : '#b71c1c'}">${titulo}</h2>
            <p>${mensaje}</p>
            <hr border="1">
            <div style="font-size: 0.9rem">
                Vidas restantes: ${stats.vidas}<br>
                Segundos sobrantes: ${stats.tiempo}
            </div>
        `;
    }
};

// Función global de ayuda para el inicio
function configurarInicio(canvas, callback) {
    canvas.addEventListener('click', () => {
        callback();
    }, { once: true });
}