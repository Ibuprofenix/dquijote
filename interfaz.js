const Interfaz = {
    dibujarHUD: function(ctx, vidas, boss = null) {
        // Corazones
        ctx.font = "30px Arial";
        ctx.textAlign = "left";
        let corazones = "❤️".repeat(vidas);
        ctx.fillText(corazones, 20, 40);

        // Barra de Boss (Solo Nivel 3)
        if (boss && boss.activo) {
            const bx = 150, by = 570, bw = 500, bh = 15;
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = boss.fase === 2 ? "#ff0000" : "#e74c3c";
            ctx.fillRect(bx, by, (boss.vida / boss.vidaMax) * bw, bh);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(bx, by, bw, bh);
        }
    },

    mostrarMensaje: function(ctx, titulo, subtitulo) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, 800, 600);
        ctx.textAlign = "center";
        ctx.fillStyle = "#f1c40f";
        ctx.font = "50px Almendra";
        ctx.fillText(titulo, 400, 280);
        ctx.font = "25px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText(subtitulo, 400, 330);
    }
};

function playSfx(tipo) {
    // Espacio para implementar AudioContext si lo deseas
    console.log("SFX:", tipo);
}
