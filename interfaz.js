const Interfaz = {
    puntuacion: 0,
    
    // Dibuja el fondo dinámico: degradado y césped
    dibujarEscenario: function(ctx) {
        // Cielo: Degradado recuperado
        const cielo = ctx.createLinearGradient(0, 0, 0, 450);
        cielo.addColorStop(0, "#1e90ff"); // Azul profundo arriba
        cielo.addColorStop(1, "#87CEEB"); // Azul claro horizonte
        ctx.fillStyle = cielo;
        ctx.fillRect(0, 0, 800, 600);

        // Césped verde
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(0, 450, 800, 150);
        
        // Detalle de línea de tierra
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(0, 450, 800, 5);
    },

    añadirPuntos: function(pts) { this.puntuacion += pts; },

    dibujarHUD: function(ctx, vidas, tiempo) {
        ctx.save();
        // Sombra de texto global para legibilidad
        ctx.shadowColor = "black";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Pergamino de HUD
        ctx.shadowBlur = 0; // Quitar sombra para el cuadro
        ctx.fillStyle = "rgba(62, 39, 35, 0.9)";
        ctx.strokeStyle = "#f1c40f"; ctx.lineWidth = 2;
        const x=15, y=15, w=200, h=45, r=10;
        ctx.beginPath(); ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
        ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Vidas
        ctx.font = "bold 16px 'Almendra'"; ctx.fillStyle = "#f1c40f";
        ctx.fillText("HIDALGO:", 30, 42);
        for(let i=0; i<3; i++) {
            ctx.font = "18px Arial";
            ctx.fillStyle = i < vidas ? "#e74c3c" : "#2c3e50";
            ctx.fillText(i < vidas ? "❤" : "💀", 120 + (i * 22), 43);
        }

        // Timer con sombra extra para resaltar sobre azul
        ctx.shadowBlur = 6;
        ctx.textAlign = "right"; ctx.font = "bold 24px 'MedievalSharp'";
        ctx.fillStyle = tiempo < 20 ? "#ff4d4d" : "#f1c40f";
        let m = Math.floor(tiempo/60), s = tiempo%60;
        ctx.fillText(`TIEMPO: ${m}:${s<10?'0':''}${s}`, 770, 42);
        ctx.restore();
    },

    mostrarMenuFinal: function(titulo, mensaje, victoria, siguienteNivel, stats) {
        const contenedor = document.getElementById('escenario');
        const bVidas = victoria ? stats.vidas * 500 : 0;
        const bTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = this.puntuacion + bVidas + bTiempo;

        const div = document.createElement('div');
        div.id = 'menu-final';
        div.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'}">${titulo}</h2>
            <p style="font-size: 1.5rem;">${mensaje}</p>
            <div style="border: 2px solid #f1c40f; padding: 20px; background: rgba(0,0,0,0.8); margin: 20px; border-radius: 10px;">
                <p>Enemigos: ${this.puntuacion}</p>
                <p>Bonus Vidas (x500): ${bVidas}</p>
                <p>Bonus Tiempo (x10): ${bTiempo}</p>
                <hr style="border: 0.5px solid #f1c40f">
                <h3 style="color: #f1c40f; font-size: 2rem;">TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion">${victoria ? 'AVANZAR' : 'REINTENTAR'}</button>
        `;
        contenedor.appendChild(div);
        document.getElementById('btn-accion').onclick = () => {
            if(victoria && siguienteNivel) window.location.href = siguienteNivel + ".html";
            else location.reload();
        };
    }
};
