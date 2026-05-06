const Interfaz = {
    puntosAcumulados: 0,

    coloresCanvas: {
        lanza: "#ffff00",
        lanzaEspecial: "#00FFFF",
        trizasNivel1: "#8b4513",
        trizasNivel2: "#444444"
    },

    animarNumero(elemento, inicio, fin, duracion, prefijo = "", sufijo = " pts") {
        if (!elemento) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duracion, 1);
            const valorActual = Math.floor(progress * (fin - inicio) + inicio);
            elemento.innerText = `${prefijo}${valorActual}${sufijo}`;
            if (progress < 1) window.requestAnimationFrame(step);
            else elemento.innerText = `${prefijo}${fin}${sufijo}`;
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
        if (hp > 0) {
            bossUI.classList.remove('hidden');
            barraRed.style.width = `${Math.max(0, (hp / hpMax) * 100)}%`;
        } else {
            bossUI.classList.add('hidden');
        }
    },

    configurarEntornoNivel(nivel) {
        const container = document.getElementById('game-container');
        if (container) container.className = `nivel-${nivel} shadow-2xl overflow-hidden relative`;
        document.getElementById('hud-nivel').innerText = { 1: "LOS MOLINOS", 2: "LOS GIGANTES", 3: "EL COLOSO" }[nivel];
        document.getElementById('registro-caballero').classList.add('hidden');
        document.getElementById('resumenGesta').classList.add('hidden');
        document.getElementById('pantalla-final').classList.add('hidden');
        document.getElementById('hud-superior').style.display = "flex";
        document.getElementById('hud-inferior').style.display = "flex";
        document.getElementById('gameCanvas').style.display = "block";
        this.actualizarHUD(window.Juego ? Juego.entidades.quijote.vidas : 3);
    },

    async mostrarRanking() {
        const pantalla = document.getElementById('pantalla-ranking');
        const lista = document.getElementById('lista-ranking');
        const btnVolver = document.getElementById('btn-ranking-volver');
        
        pantalla.classList.remove('hidden');
        lista.innerHTML = "<p class='text-center animate-pulse py-4 italic text-amber-800 text-sm'>Consultando anales reales...</p>";
        
        btnVolver.onclick = () => {
            pantalla.classList.add('hidden');
            document.getElementById('resumenGesta').classList.remove('hidden');
            this.puntosAcumulados = 0; 
        };

        const datos = await GestionDatos.obtenerRanking();
        if (!datos || datos.length === 0) {
            lista.innerHTML = "<p class='text-center italic py-4 text-amber-900 text-sm'>No hay hazañas registradas aún.</p>";
            return;
        }

        const top5 = datos.slice(0, 5);
        lista.innerHTML = top5.map((entry, index) => {
            const esPrimero = index === 0;
            return `
                <div class="flex justify-between items-center py-2 px-3 border-b border-amber-900/10 ${esPrimero ? 'bg-amber-500/5 rounded-lg' : ''}">
                    <div class="flex items-center gap-3">
                        <span class="font-bold text-base w-6 ${esPrimero ? 'text-yellow-600' : 'text-amber-800/40'}">
                            ${esPrimero ? '🥇' : (index + 1 + '.')}
                        </span>
                        <span class="font-black text-amber-950 uppercase ${esPrimero ? 'text-base' : 'text-sm'} tracking-tight">
                            ${entry.nombre}
                        </span>
                    </div>
                    <span class="text-amber-700 font-mono font-black ${esPrimero ? 'text-base' : 'text-sm'}">
                        ${entry.puntuacion.toLocaleString()}
                    </span>
                </div>
            `;
        }).join('');
    },

    mostrarPantallaFinal(victoria, puntosNivel = 0) {
        const pantallaFinal = document.getElementById('pantalla-final');
        const btnRanking = document.getElementById('btn-ver-ranking-final');
        const btnSiguiente = document.getElementById('btn-siguiente-nivel');

        document.getElementById('hud-superior').style.display = "none";
        document.getElementById('hud-inferior').style.display = "none";
        document.getElementById('gameCanvas').style.display = "none";
        document.getElementById('boss-ui').classList.add('hidden');
        
        pantallaFinal.classList.remove('hidden');

        const bonusVidas = (window.Juego && victoria ? Juego.entidades.quijote.vidas * 500 : 0);
        const bonusTiempo = (window.Juego && victoria ? Math.max(0, Juego.tiempoRestante * 10) : 0);
        const totalEstaRonda = puntosNivel + bonusVidas + bonusTiempo;
        const totalFinal = this.puntosAcumulados + totalEstaRonda;

        // --- LÓGICA DE ENVÍO ÚNICO ---
        const esUltimoNivel = (window.Juego && Juego.nivel === 3);
        const esDerrota = !victoria;

        if (esDerrota || (victoria && esUltimoNivel)) {
            GestionDatos.enviarGesta(
                totalFinal, 
                window.Juego ? Juego.entidades.quijote.vidas : 0, 
                window.Juego ? Juego.nivel : 1
            );
        }
        // -----------------------------

        if (victoria) {
            document.getElementById('final-titulo').innerText = esUltimoNivel ? "¡GESTA COMPLETADA!" : "¡VICTORIA CABALLERESCA!";
            document.getElementById('final-titulo').className = "text-2xl font-black text-amber-600 mb-2 uppercase";
            
            this.animarNumero(document.getElementById('resumen-enemigos'), 0, puntosNivel, 800);
            setTimeout(() => this.animarNumero(document.getElementById('resumen-vidas'), 0, bonusVidas, 600, "+"), 800);
            setTimeout(() => this.animarNumero(document.getElementById('resumen-tiempo'), 0, bonusTiempo, 600, "+"), 1400);
            
            if (Juego.nivel < 3) {
                btnSiguiente.classList.remove('hidden');
                btnSiguiente.onclick = () => {
                    this.puntosAcumulados = totalFinal;
                    pantallaFinal.classList.add('hidden');
                    Juego.iniciarNivel(Juego.nivel + 1);
                };
            } else {
                btnSiguiente.classList.add('hidden'); // No hay más niveles
            }
        } else {
            document.getElementById('final-titulo').innerText = "¡DERROTA HONROSA!";
            document.getElementById('final-titulo').className = "text-2xl font-black text-red-700 mb-2 uppercase";
            document.getElementById('resumen-enemigos').innerText = puntosNivel + " pts";
            document.getElementById('resumen-vidas').innerText = "0 pts";
            document.getElementById('resumen-tiempo').innerText = "0 pts";
            btnSiguiente.classList.add('hidden');
        }

        setTimeout(() => {
            const viejo = this.puntosAcumulados;
            if (esDerrota || esUltimoNivel) this.puntosAcumulados = totalFinal;
            this.animarNumero(document.getElementById('final-puntos'), viejo, totalFinal, 1000, "", "");
            if (victoria && window.AudioEngine) AudioEngine.reproducir('victoria');
        }, 1800);

        btnRanking.onclick = () => {
            pantallaFinal.classList.add('hidden');
            this.mostrarRanking();
        };
    }
};

window.Interfaz = Interfaz;