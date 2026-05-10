/**
 * interfaz.js - Versión Tabla de Honor con NombreNivel Dinámico
 */
const Interfaz = {
    puntosAcumulados: 0,

    nombresTrivia: {
        fase0: "EL ESPALDARAZO",
        fase1: "EL YELMO DE MAMBRINO",
        fase2: "EL BÁLSAMO DE FIERABRÁS",
        fase3: "LA CUEVA DE MONTESINOS"
    },
    
    nombresArcade: {
        1: "LOS MOLINOS",
        2: "LOS GIGANTES",
        3: "EL COLOSO"
    },

    mostrarTrivia(fase) {
        this.limpiarPantallas();
        document.getElementById('gameCanvas').style.display = "none";
        document.getElementById('hud-superior').style.display = "none";
        document.getElementById('hud-inferior').style.display = "none";
        
        const titulo = document.getElementById('trivia-titulo');
        if (titulo) titulo.innerText = this.nombresTrivia[fase] || "PRUEBA DE VALOR";

        const contenedor = document.getElementById('trivia-container');
        if (contenedor) {
            contenedor.classList.remove('hidden');
            contenedor.style.display = "flex";
        }
    },

    ocultarTrivia() {
        const contenedor = document.getElementById('trivia-container');
        if (contenedor) {
            contenedor.classList.add('hidden');
            contenedor.style.display = "none";
        }
    },

    configurarEntornoNivel(nivel) {
        this.limpiarPantallas();
        const container = document.getElementById('game-container');
        if (container) container.className = `nivel-${nivel} shadow-2xl overflow-hidden relative`;
        
        const elNivel = document.getElementById('hud-nivel');
        if (elNivel) elNivel.innerText = this.nombresArcade[nivel] || "AVENTURA";

        document.getElementById('hud-superior').style.display = "flex";
        document.getElementById('hud-inferior').style.display = "flex";
        document.getElementById('gameCanvas').style.display = "block";
        
        if(window.Juego && Juego.entidades.quijote) {
            this.actualizarHUD(Juego.entidades.quijote.vidas);
        }
    },

    mostrarPantallaFinal(victoria, datosRonda) {
        this.limpiarPantallas();
        const pantallaFinal = document.getElementById('pantalla-final');
        const btnSiguiente = document.getElementById('btn-siguiente-nivel');
        const btnRankingFinal = document.getElementById('btn-ver-ranking-final');

        pantallaFinal.classList.remove('hidden');
        pantallaFinal.style.display = "flex";

        const totalEstaRonda = datosRonda.total || 0; 
        const totalFinalPartida = this.puntosAcumulados + totalEstaRonda;

        if (victoria) {
            document.getElementById('final-titulo').innerText = "¡NIVEL SUPERADO!";
            document.getElementById('final-titulo').className = "text-4xl font-black text-amber-600 mb-2 uppercase";
            
            btnSiguiente.classList.remove('hidden');
            btnSiguiente.style.display = "block";
            btnSiguiente.innerText = "PRUEBA DE SABIDURÍA";
            
            btnRankingFinal.classList.add('hidden');
            btnRankingFinal.style.display = "none";
            
            btnSiguiente.onclick = () => {
                this.puntosAcumulados = totalFinalPartida;
                this.limpiarPantallas();
                const faseTrivia = `fase${window.Juego.nivel}`; 
                if (window.Trivia) {
                    Trivia.lanzar(faseTrivia, () => {
                        if (window.Juego.nivel === 3) {
                            this.mostrarMensajeVictoriaFinal();
                        } else {
                            Juego.iniciarNivel(Juego.nivel + 1);
                        }
                    });
                }
            };
        } else {
            document.getElementById('final-titulo').innerText = "¡DERROTA HONROSA!";
            document.getElementById('final-titulo').className = "text-4xl font-black text-red-700 mb-2 uppercase";
            
            btnSiguiente.classList.add('hidden'); 
            btnSiguiente.style.display = "none";
            
            btnRankingFinal.classList.remove('hidden');
            btnRankingFinal.style.display = "block";
            btnRankingFinal.innerText = "REGISTRAR GESTA EN TABLA DE HONOR";

            // Clonamos para limpiar eventos previos
            const nuevoBtn = btnRankingFinal.cloneNode(true);
            btnRankingFinal.parentNode.replaceChild(nuevoBtn, btnRankingFinal);
            
            nuevoBtn.onclick = async () => {
                nuevoBtn.innerText = "REGISTRANDO...";
                nuevoBtn.disabled = true;
                
                if (window.GestionDatos) {
                    /** 
                     * LÓGICA DE CLAVE DINÁMICA:
                     * Si datosRonda tiene la marca 'esTrivia', usamos su faseTrivia.
                     * Si no, es una derrota en combate arcade.
                     */
                    const hito = datosRonda.esTrivia ? datosRonda.faseTrivia : `arcade${window.Juego.nivel}`;
                    
                    await GestionDatos.enviarGesta(totalFinalPartida, 0, hito);
                }
                this.mostrarRanking();
            };
        }

        // Animación de puntos
        this.animarNumero(document.getElementById('resumen-enemigos'), 0, (datosRonda.puntosEnemigos || 0), 800);
        setTimeout(() => this.animarNumero(document.getElementById('resumen-vidas'), 0, (datosRonda.puntosVidas || 0), 600, "+"), 800);
        setTimeout(() => this.animarNumero(document.getElementById('resumen-tiempo'), 0, (datosRonda.puntosTiempo || 0), 600, "+"), 1400);
        setTimeout(() => {
            this.animarNumero(document.getElementById('final-puntos'), this.puntosAcumulados, totalFinalPartida, 1000, "", "");
        }, 1800);
    },

    mostrarMensajeVictoriaFinal() {
        this.limpiarPantallas();
        const msj = document.getElementById('mensaje-epico');
        const btnVic = document.getElementById('btn-continuar-victoria');
        const nombreInyectar = document.getElementById('nombre-victoria');
        const nombreReal = window.GestionDatos ? window.GestionDatos.getNombre() : "HIDALGO";
        
        if (nombreInyectar) nombreInyectar.innerText = nombreReal;
        
        msj.style.display = "flex"; 
        msj.classList.remove('hidden');
        
        btnVic.innerText = "REGISTRAR GESTA EN TABLA DE HONOR";
        btnVic.onclick = async () => {
            btnVic.innerText = "REGISTRANDO...";
            btnVic.disabled = true;
            if(window.GestionDatos) {
                const vidasFinales = (window.Juego && Juego.entidades.quijote) ? Juego.entidades.quijote.vidas : 0;
                // Enviamos la clave 'victoria' para el mapeo final
                await GestionDatos.enviarGesta(this.puntosAcumulados, vidasFinales, 'victoria');
            }
            this.mostrarRanking();
        };
    },

    mostrarRanking() {
        this.limpiarPantallas();
        const pantalla = document.getElementById('pantalla-ranking');
        if (pantalla) {
            pantalla.classList.remove('hidden');
            pantalla.style.display = "flex";
            if (window.GestionDatos) GestionDatos.actualizarTablaVisual();
        }
        const btnVolver = document.getElementById('btn-ranking-volver');
        if(btnVolver) btnVolver.onclick = () => location.reload();
    },

    limpiarPantallas() {
        const pantallas = ['registro-caballero', 'resumenGesta', 'pantalla-ranking', 'pantalla-final', 'mensaje-epico', 'trivia-container', 'boss-ui'];
        pantallas.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.style.display = "none";
            }
        });
    },

    actualizarHUD(vidas) {
        const hudNombre = document.getElementById('hud-nombre');
        const hudCorazones = document.getElementById('hud-corazones');
        if (hudNombre) hudNombre.innerText = window.GestionDatos ? GestionDatos.getNombre() : "HIDALGO"; 
        if (hudCorazones) hudCorazones.innerText = "❤️".repeat(Math.max(0, vidas));
    },

    actualizarDatosDinámicos(datosMarcador, tiempoRestante) {
        const totalVisual = this.puntosAcumulados + datosMarcador.total;
        const hudPuntos = document.getElementById('hud-puntos');
        const hudTimer = document.getElementById('hud-timer');
        
        if(hudPuntos) hudPuntos.innerText = `🏆 ${totalVisual.toString().padStart(6, '0')}`;
        
        if(hudTimer) {
            let m = Math.floor(tiempoRestante / 60);
            let s = tiempoRestante % 60;
            hudTimer.innerText = `⌛ ${m}:${s < 10 ? '0' : ''}${s}`;
        }
    },

    actualizarVidaBoss(hp, hpMax) {
        const barraBoss = document.getElementById('boss-ui');
        const fill = document.getElementById('boss-vida-roja');
        if (hp > 0) {
            barraBoss.classList.remove('hidden');
            barraBoss.style.display = "block";
            if (fill) fill.style.width = `${(hp / hpMax) * 100}%`;
        } else {
            barraBoss.classList.add('hidden');
            barraBoss.style.display = "none";
        }
    },

    animarNumero(elemento, inicio, fin, duracion, prefijo = "", sufijo = " pts") {
        if (!elemento) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duracion, 1);
            elemento.innerText = `${prefijo}${Math.floor(progress * (fin - inicio) + inicio)}${sufijo}`;
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
};

window.Interfaz = Interfaz;