const Interfaz = {
    dibujarEscenario: function(ctx) {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const claseNivel = document.body.className;

        // 1. Definir Colores de Cielo según Nivel
        let colTop, colBot;
        if (claseNivel === "nivel3") {
            colTop = "#2e1a47"; colBot = "#483d8b"; // Violáceo
        } else if (claseNivel === "nivel2") {
            colTop = "#ff4500"; colBot = "#ff8c00"; // Naranja
        } else {
            colTop = "#1e90ff"; colBot = "#87ceeb"; // Azul
        }

        // 2. Dibujar Cielo
        let grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, colTop);
        grad.addColorStop(0.8, colBot);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // 3. Dibujar Nubes
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        this.dibujarNube(ctx, 150, 100, 40);
        this.dibujarNube(ctx, 450, 70, 55);
        this.dibujarNube(ctx, 700, 120, 35);

        // 4. Dibujar Suelo de Tierra (DQ Style)
        ctx.fillStyle = "#8B4513"; // Tierra base
        ctx.fillRect(0, h - 100, w, 100);
        
        // Textura de tierra (matorrales y piedras)
        ctx.fillStyle = "#5D2E0A";
        for(let i=0; i<w; i+=60) {
            ctx.beginPath();
            ctx.ellipse(i + (i%30), h-90, 20, 5, 0, 0, Math.PI*2);
            ctx.fill();
        }
    },

    dibujarNube: function(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.arc(x+r*0.7, y-r*0.3, r*0.8, 0, Math.PI*2);
        ctx.arc(x+r*1.4, y, r*0.6, 0, Math.PI*2);
        ctx.fill();
    },

    dibujarHUD: function(ctx, vidas, tiempo) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, 800, 50);
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 20px Almendra";
        ctx.textAlign = "left";
        ctx.fillText("CABALLERO: " + "❤️".repeat(vidas), 20, 32);
        ctx.textAlign = "right";
        ctx.fillText("TIEMPO: " + tiempo + "s", 780, 32);
    },

    mostrarMenuFinal: function(titulo, msg, victoria, sigNivel, stats) {
        const panel = document.getElementById('resumenGesta');
        panel.style.display = "block";
        panel.innerHTML = `
            <h2 style="font-family:Cinzel; color:#3e2723; border-bottom:2px solid #5d4037">${titulo}</h2>
            <p style="font-size:1.2rem">${msg}</p>
            <p style="font-weight:bold">Vidas: ${stats.vidas} | Tiempo: ${stats.tiempo}s</p>
        `;
    }
};