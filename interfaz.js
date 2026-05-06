const Interfaz = {
    puntosAcumulados: 0,

    coloresCanvas: {
        lanza: "#ffff00",
        lanzaEspecial: "#00FFFF",
        trizasNivel1: "#8b4513",
        trizasNivel2: "#444444"
    },

    // 1. Esta función debe llamarse desde el botón de "¡INICIAR AVENTURA!" en tu script principal
    mostrarSelectorNiveles() {
        document.getElementById('registro-caballero').classList.add('hidden');
        document.getElementById('resumenGesta').classList.remove('hidden');
    },

    configurarEntornoNivel(nivel) {
        const container = document.getElementById('game-container');
        const hudNivel = document.getElementById('hud-nivel');
        const pueblo = document.querySelector('.pueblo-asset');
        
        // Cambiamos el "momento del día" en el contenedor
        if (container) {
            container.className = `nivel-${nivel} shadow-2xl overflow-hidden relative`;
        }

        // Criptana SIEMPRE ahí, el CSS (maestro.css) la ilumina según la clase nivel-X
        if (pueblo) {
            pueblo.style.display = "block";
        }
        
        const nombresNiveles = { 
            1: "MAÑANA EN CRIPTANA", 
            2: "ATARDECER MANCHEGO", 
            3: "NOCHE CERRADA" 
        };
        if (hudNivel) hudNivel.innerText = nombresNiveles[nivel] || "";

        // Limpieza total de menús
        document.getElementById('registro-caballero').classList.add('hidden');
        document.getElementById('resumenGesta').classList.add('hidden');
        document.getElementById('pantalla-final').classList.add('hidden');
        
        // Activamos el juego
        document.getElementById('hud-superior').style.display = "flex";
        document.getElementById('hud-inferior').style.display = "flex";
        document.getElementById('gameCanvas').style.display = "block";
    },

    actualizarHUD(vidas) {
        const hudCorazones = document.getElementById('hud-corazones');
        const hudNombre = document.getElementById('hud-nombre');
        if (hudNombre && window.GestionDatos) hudNombre.innerText = GestionDatos.getNombre().toUpperCase();
        if (hudCorazones) hudCorazones.innerText = "❤️".repeat(Math.max(0, vidas));
    },

    actualizarDatosDinámicos(puntosNivel, tiempoRestante) {
        const hudPuntos = document.getElementById('hud-puntos');
        const hudTimer = document.getElementById('hud-timer');
        const total = this.puntosAcumulados + puntosNivel;
        if (hudPuntos) hudPuntos.innerText = `🏆 ${total.toString().padStart(6, '0')}`;
        if (hudTimer) {
            let s = tiempoRestante % 60;
            hudTimer.innerText = `⌛ ${Math.floor(tiempoRestante / 60)}:${s < 10 ? '0' : ''}${s}`;
        }
    },

    actualizarVidaBoss(hp, hpMax) {
        const bossUI = document.getElementById('boss-ui');
        const barra = document.getElementById('boss-vida-roja');
        if (!bossUI || !barra) return;
        if (hp > 0) {
            bossUI.classList.remove('hidden');
            barra.style.width = `${(hp / hpMax) * 100}%`;
        } else {
            bossUI.classList.add('hidden');
        }
    },

    mostrarPantallaFinal(victoria, puntosNivel = 0) {
        const pantalla = document.getElementById('pantalla-final');
        document.getElementById('hud-superior').style.display = "none";
        document.getElementById('hud-inferior').style.display = "none";
        document.getElementById('gameCanvas').style.display = "none";
        
        pantalla.classList.remove('hidden');
        document.getElementById('final-puntos').innerText = this.puntosAcumulados + puntosNivel;
        
        if (!victoria) {
            document.getElementById('final-titulo').innerText = "¡DERROTA HONROSA!";
            document.getElementById('btn-siguiente-nivel').classList.add('hidden');
        }
    }
};

window.Interfaz = Interfaz;
