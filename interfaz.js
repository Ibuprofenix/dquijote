const Interfaz = {
    dibujarEscenario: function(ctx, nivel) {
        const w = 800; const h = 600;
        let c1 = "#1e90ff", c2 = "#87ceeb";
        if (nivel === 2) { c1 = "#ff4500"; c2 = "#ff8c00"; }
        if (nivel === 3) { c1 = "#1a0b2e"; c2 = "#483d8b"; }

        let g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, c1); g.addColorStop(0.8, c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        if (nivel !== 3) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            this.nube(ctx, 150, 80, 30);
            this.nube(ctx, 450, 60, 40);
        }

        ctx.fillStyle = "#5d2e0a";
        ctx.fillRect(0, h - 70, w, 70);
    },
    nube: function(ctx, x, y, r) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.arc(x+r, y-5, r*0.8, 0, 7); ctx.fill();
    },
    dibujarHUD: function(ctx, vidas, nivel) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, 800, 40);
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 20px 'Cinzel', serif";
        ctx.fillText("CABALLERO: " + "❤️".repeat(Math.max(0, vidas)), 20, 28);
        ctx.fillText("GESTA: " + nivel, 650, 28);
    }
};