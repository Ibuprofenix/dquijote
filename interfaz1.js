const Interfaz = {
    puntosAcumulados: 0,

    coloresCanvas: {
        lanza: "#ffff00",
        lanzaEspecial: "#00FFFF",
        trizasNivel1: "#8b4513",
        trizasNivel2: "#444444"
    },

    /**
     * Efecto de conteo ascendente (Tragaperras)
     */
    animarNumero(elemento, inicio, fin, duracion, prefijo = "", sufijo = " pts") {
        if (!elemento) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duracion, 1);
            const valorActual = Math.floor(progress * (fin - inicio) + inicio);
            
            elemento.innerText = `${prefijo}${valorActual}${sufijo}`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                elemento.innerText = `${prefijo}${fin}${sufijo}`;
            }
        };
        window.requestAnimationFrame(step);
    },

    actualizarHUD(vidas) {
        const hudNombre = document.getElementById('hud-nombre');
        const hudCorazones = document.getElementById('hud-corazones');
        let nombreParaMostrar = window.GestionDatos ? GestionDatos.getNombre() : "HIDALGO";

        if (hudNombre) hudNombre.innerText = nombreParaMostrar.toUpperCase();
        if (hudCorazones) hudCorazones.innerText = "❤️".repeat(Math.max(0, vidas));
    },

    actualizarDatosDinámicos(puntosNivel, tiempoRestante) {
        const hudPuntos = document.getElementById('hud-puntos');
        const hudTimer = document.getElementById('hud-timer');
        const totalVisual = this.puntosAcumulados + puntosNivel;

        if (hudPuntos) hudPuntos.innerText = `🏆 ${totalVisual.toString().padStart(6, '0')}`;
        if (hudTimer) {
            let m = Math.floor(tiempoRestante / 60);
            let s = tiempoRestante % 60;
            hudTimer.innerText = `⌛ ${m}:${s < 10 ? '0' : ''}${s}`;
            
            if (tiempoRestante < 10) hudTimer.classList.add('text-red-500', 'animate-pulse');
            else hudTimer.classList.remove('text-red-500', 'animate-pulse');
        }
    },

    actualizarVidaBoss(hp, hpMax) {
        const bossUI = document.getElementById('boss-ui');
        const barraRed = document.getElementById('boss-vida-roja');
        if (!bossUI || !barraRed) return;

        if (hp > 0) {
            bossUI.classList.remove('hidden');
            barraRed.style.width = `${Math.max(0, (hp / hpMax) * 100)}%`;
        } else {
            bossUI.classList.add('hidden');
        }
    },

    configurarEntornoNivel(nivel) {
        const container = document.getElementById('game-container');
        const hudNivel = document.getElementById('hud-nivel');
        
        // Aplicar clase de nivel para cambiar fondo y astros según tu CSS
        if (container) {
            container.className = `nivel-${nivel} shadow-2xl overflow-hidden relative`;
        }
        
        const nombresNiveles = { 1: "LOS MOLINOS", 2: "LOS GIGANTES", 3: "EL COLOSO" };
        if (hudNivel) hudNivel.innerText = nombresNiveles[nivel] || "";

        // Mostrar/Ocultar capas
        document.getElementById('registro-caballero').classList.add('hidden');
        document.getElementById('resumenGesta').classList.add('hidden');
        document.getElementById('pantalla-final').classList.add('hidden');
        
        document.getElementById('hud-superior').style.display = "flex";
        document.getElementById('hud-inferior').style.display = "flex";
        document.getElementById('gameCanvas').style.display = "block";
    },

    mostrarPantallaFinal(victoria, puntosNivel = 0) {
        const pantallaFinal = document.getElementById('pantalla-final');
        const tituloFinal = document.getElementById('final-titulo');
        const ptsFinalTexto = document.getElementById('final-puntos');
        const resEnemigos = document.getElementById('resumen-enemigos');
        const resVidas = document.getElementById('resumen-vidas');
        const resTiempo = document.getElementById('resumen-tiempo');
        const btnSiguiente = document.getElementById('btn-siguiente-nivel');
        const btnVolver = document.getElementById('btn-volver-selector');

        // Ocultar elementos de juego
        document.getElementById('hud-superior').style.display = "none";
        document.getElementById('hud-inferior').style.display = "none";
        document.getElementById('gameCanvas').style.display = "none";
        document.getElementById('boss-ui').classList.add('hidden');

        pantallaFinal.classList.remove('hidden');

        if (victoria) {
            tituloFinal.innerText = "¡VICTORIA CABALLERESCA!";
            tituloFinal.className = "text-4xl font-black text-amber-600 mb-2 drop-shadow-sm uppercase animate-bounce";

            const bonusVidas = (window.Juego ? Juego.entidades.quijote.vidas * 500 : 0);
            const bonusTiempo = (window.Juego ? Math.max(0, Juego.tiempoRestante * 10) : 0);
            const totalEstaRonda = puntosNivel + bonusVidas + bonusTiempo;

            // Secuencia de animaciones
            this.animarNumero(resEnemigos, 0, puntosNivel, 800);
            
            setTimeout(() => {
                this.animarNumero(resVidas, 0, bonusVidas, 600, "+");
            }, 800);

            setTimeout(() => {
                this.animarNumero(resTiempo, 0, bonusTiempo, 600, "+");
            }, 1400);

            setTimeout(() => {
                const viejoAcumulado = this.puntosAcumulados;
                this.puntosAcumulados += totalEstaRonda;
                this.animarNumero(ptsFinalTexto, viejoAcumulado, this.puntosAcumulados, 1200, "", "");
                if (window.AudioEngine) AudioEngine.reproducir('victoria');
            }, 2000);

            if (btnSiguiente && window.Juego && Juego.nivel < 3) {
                btnSiguiente.classList.remove('hidden');
                btnSiguiente.onclick = () => {
                    pantallaFinal.classList.add('hidden');
                    Juego.iniciarNivel(Juego.nivel + 1);
                };
            }
        } else {
            tituloFinal.innerText = "¡DERROTA HONROSA!";
            tituloFinal.className = "text-4xl font-black text-red-600 mb-2 drop-shadow-sm uppercase";
            
            resEnemigos.innerText = `${puntosNivel} pts`;
            resVidas.innerText = "0 pts";
            resTiempo.innerText = "0 pts";
            
            this.puntosAcumulados += puntosNivel;
            ptsFinalTexto.innerText = this.puntosAcumulados.toString().padStart(6, '0');
            if (btnSiguiente) btnSiguiente.classList.add('hidden');
        }

        if (btnVolver) {
            btnVolver.onclick = () => {
                pantallaFinal.classList.add('hidden');
                document.getElementById('resumenGesta').classList.remove('hidden');
            };
        }
    }
};

window.Interfaz = Interfaz;
