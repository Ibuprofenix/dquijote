/**
 * interfaz.js - Gestión del DOM y HUD
 * Funciona como puente entre el motor Arcade y el sistema de Trivia.
 */
const Interfaz = {
    puntosAcumulados: 0,

    coloresCanvas: {
        lanza: "#ffff00",
        lanzaEspecial: "#00FFFF",
        trizasNivel1: "#8b4513",
        trizasNivel2: "#444444"
    },

    // --- GESTIÓN DE TRIVIA ---

    mostrarTrivia() {
        // Ocultamos elementos del juego para centrar la atención en la pregunta
        document.getElementById('gameCanvas').style.display = "none";
        document.getElementById('hud-superior').style.display = "none";
        document.getElementById('hud-inferior').style.display = "none";
        document.getElementById('boss-ui').classList.add('hidden');
        
        // Mostramos el contenedor de la trivia definido en el HTML
        const contenedorTrivia = document.getElementById('trivia-container');
        if (contenedorTrivia) {
            contenedorTrivia.classList.remove('hidden');
            // Usamos flex para centrar el modal si el CSS lo requiere
            contenedorTrivia.style.display = "flex";
        }
    },

    ocultarTrivia() {
        const contenedorTrivia = document.getElementById('trivia-container');
        if (contenedorTrivia) {
            contenedorTrivia.classList.add('hidden');
            contenedorTrivia.style.display = "none";
        }
    },

    // --- ACTUALIZACIÓN DEL HUD ---

    actualizarHUD(vidas) {
        const hudNombre = document.getElementById('hud-nombre');
        const hudCorazones = document.getElementById('hud-corazones');
        let nombreParaMostrar = window.GestionDatos ? GestionDatos.getNombre() : "HIDALGO";
        
        if (hudNombre) hudNombre.innerText = nombreParaMostrar.toUpperCase();
        if (hudCorazones) {
            // Renderizamos corazones según las vidas actuales del Quijote
            hudCorazones.innerText = "❤️".repeat(Math.max(0, vidas));
        }
    },

    actualizarDatosDinámicos(datosMarcador, tiempoRestante) {
        const hudPuntos = document.getElementById('hud-puntos');
        const hudTimer = document.getElementById('hud-timer');
        
        // Sumamos los puntos de la ronda actual a los acumulados de rondas previas
        const totalVisual = this.puntosAcumulados + datosMarcador.total;
        
        if (hudPuntos) hudPuntos.innerText = `🏆 ${totalVisual.toString().padStart(6, '0')}`;
        
        if (hudTimer) {
            let m = Math.floor(tiempoRestante / 60);
            let s = tiempoRestante % 60;
            hudTimer.innerText = `⌛ ${m}:${s < 10 ? '0' : ''}${s}`;
            
            // Feedback visual cuando queda poco tiempo
            if (tiempoRestante < 10) {
                hudTimer.classList.add('text-red-500', 'animate-pulse');
            } else {
                hudTimer.classList.remove('text-red-500', 'animate-pulse');
            }
        }
    },

    actualizarVidaBoss(hp, hpMax) {
        const barraBoss = document.getElementById('boss-ui');
        const fill = document.getElementById('boss-vida-roja');
        
        if (hp > 0) {
            barraBoss.classList.remove('hidden');
            const porcentaje = (hp / hpMax) * 100;
            if (fill) fill.style.width = `${porcentaje}%`;
        } else {
            barraBoss.classList.add('hidden');
        }
    },

    // --- FLUJO DE NIVELES ---

    configurarEntornoNivel(nivel) {
        const container = document.getElementById('game-container');
        if (container) container.className = `nivel-${nivel} shadow-2xl overflow-hidden relative`;
        
        const nombresNiveles = { 1: "LOS MOLINOS", 2: "LOS GIGANTES", 3: "EL COLOSO" };
        const elNivel = document.getElementById('hud-nivel');
        if (elNivel) elNivel.innerText = nombresNiveles[nivel] || "TRIVIA";

        // Limpiar pantallas superpuestas
        document.getElementById('registro-caballero').classList.add('hidden');
        document.getElementById('pantalla-final').classList.add('hidden');
        document.getElementById('resumenGesta').classList.add('hidden');
        this.ocultarTrivia();
        
        // Reactivamos visuales del arcade
        document.getElementById('hud-superior').style.display = "flex";
        document.getElementById('hud-inferior').style.display = "flex";
        document.getElementById('gameCanvas').style.display = "block";
        
        if(window.Juego && Juego.entidades.quijote) {
            this.actualizarHUD(Juego.entidades.quijote.vidas);
        }
    },

    mostrarPantallaFinal(victoria, datosRonda) {
        const pantallaFinal = document.getElementById('pantalla-final');
        const btnSiguiente = document.getElementById('btn-siguiente-nivel');
        const btnRanking = document.getElementById('btn-ver-ranking-final');

        // Ocultar elementos de juego
        document.getElementById('hud-superior').style.display = "none";
        document.getElementById('hud-inferior').style.display = "none";
        document.getElementById('gameCanvas').style.display = "none";
        document.getElementById('boss-ui').classList.add('hidden');
        
        pantallaFinal.classList.remove('hidden');

        // Cálculo de puntuación final sumando acumulados + ronda actual
        const totalEstaRonda = datosRonda.total; 
        const totalFinalPartida = this.puntosAcumulados + totalEstaRonda;

        if (victoria) {
            document.getElementById('final-titulo').innerText = "¡NIVEL SUPERADO!";
            document.getElementById('final-titulo').className = "text-4xl font-black text-amber-600 mb-2 uppercase";
            
            // Animación de los puntos obtenidos
            this.animarNumero(document.getElementById('resumen-enemigos'), 0, datosRonda.puntosEnemigos, 800);
            setTimeout(() => this.animarNumero(document.getElementById('resumen-vidas'), 0, datosRonda.puntosVidas, 600, "+"), 800);
            setTimeout(() => this.animarNumero(document.getElementById('resumen-tiempo'), 0, datosRonda.puntosTiempo, 600, "+"), 1400);
            
            // CONFIGURACIÓN DEL BOTÓN PARA TRIVIA
            btnSiguiente.classList.remove('hidden');
            btnSiguiente.innerText = "PROBAR VALOR (TRIVIA)";
            btnSiguiente.onclick = () => {
                this.puntosAcumulados = totalFinalPartida; // Guardamos progreso
                pantallaFinal.classList.add('hidden');
                
                // Lanzamos la trivia correspondiente al nivel que acaba de pasar
                const faseTrivia = `fase${window.Juego.nivel}`; 
                if (window.Trivia) {
                    Trivia.lanzar(faseTrivia, () => {
                        // Al ganar la trivia, pasamos al siguiente nivel del arcade
                        Juego.iniciarNivel(Juego.nivel + 1);
                    });
                }
            };
        } else {
            // Caso Derrota
            document.getElementById('final-titulo').innerText = "¡DERROTA HONROSA!";
            document.getElementById('final-titulo').className = "text-4xl font-black text-red-700 mb-2 uppercase";
            btnSiguiente.classList.add('hidden');
            
            // Si pierde, guardamos los puntos finales en la base de datos
            if (window.GestionDatos) GestionDatos.enviarGesta(totalFinalPartida, 0, Juego.nivel);
        }

        // Mostrar total acumulado
        setTimeout(() => {
            this.animarNumero(document.getElementById('final-puntos'), this.puntosAcumulados, totalFinalPartida, 1000, "", "");
        }, 1800);

        // --- En interfaz.js ---
// Botón de Ranking corregido
if (btnRanking) {
    btnRanking.onclick = () => {
        if(window.GestionDatos) {
            // Obtenemos los datos actuales del juego para mandarlos completos
            const puntos = window.marcador.total;
            const vidas = window.Juego.entidades.quijote.vidas;
            const nivel = window.Juego.nivel;

            // Llamamos a la función (que ya arreglamos en gestionDatos.js)
            GestionDatos.enviarGesta(puntos, vidas, nivel);
        }
        this.mostrarRanking();
    };
}
    },

    // --- SISTEMA DE RANKING ---

    mostrarRanking() {
        const pantalla = document.getElementById('pantalla-ranking');
        if (pantalla) {
            pantalla.classList.remove('hidden');
            if (window.GestionDatos) GestionDatos.actualizarTablaVisual();
        }
        
        const btnVolver = document.getElementById('btn-ranking-volver');
        if (btnVolver) {
            btnVolver.onclick = () => {
                pantalla.classList.add('hidden');
                document.getElementById('resumenGesta').classList.remove('hidden');
            };
        }
    },

    // --- UTILIDADES ---

    animarNumero(elemento, inicio, fin, duracion, prefijo = "", sufijo = " pts") {
        if (!elemento) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duracion, 1);
            const valorActual = Math.floor(progress * (fin - inicio) + inicio);
            elemento.innerText = `${prefijo}${valorActual}${sufijo}`;
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
};

window.Interfaz = Interfaz;