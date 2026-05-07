/**
 * TRIVIA.JS - Motor de Sabiduría Dinámica
 * BLOQUEO DE BUCLE: Control absoluto sobre la Fase 3 (Cueva de Montesinos).
 */
const Trivia = {
    puntosPorAcierto: 250,
    preguntasRespondidasEnFase: 0,
    faseActual: null,
    preguntasMezcladas: [],
    callbackFinal: null,

    fases: {
        'fase0': { titulo: "EL ESPALDARAZO", dific: "nivel0", cantidad: 1 },
        'fase1': { titulo: "EL YELMO DE MAMBRINO", dific: "nivel1", cantidad: 2 },
        'fase2': { titulo: "EL BÁLSAMO DE FIERABRÁS", dific: "nivel2", cantidad: 3 },
        'fase3': { titulo: "LA CUEVA DE MONTESINOS", dific: "nivel3", cantidad: 4 }
    },

    lanzar(idFase, callback) {
        if (!this.fases[idFase]) return;

        this.faseActual = { ...this.fases[idFase], idOriginal: idFase };
        this.callbackFinal = callback;
        this.preguntasRespondidasEnFase = 0;

        const pool = typeof BibliotecaTrivia !== 'undefined' ? BibliotecaTrivia[this.faseActual.dific] : [];
        if (pool.length === 0) {
            console.error("Biblioteca de trivia no encontrada para:", this.faseActual.dific);
            if(callback) callback();
            return;
        }

        this.preguntasMezcladas = this.mezclarArray([...pool]);

        const overlay = document.getElementById('overlay-trivia');
        if (overlay) {
            overlay.style.display = "flex";
            this.presentarPregunta();
        }
    },

    presentarPregunta() {
        const datos = this.preguntasMezcladas[this.preguntasRespondidasEnFase];
        if (!datos) return;

        const textoCorrecto = datos.opciones[datos.correcta];
        const contenedor = document.getElementById('trivia-opciones');
        
        document.getElementById('trivia-titulo').innerText = this.faseActual.titulo;
        document.getElementById('trivia-pregunta').innerText = datos.texto;
        contenedor.innerHTML = "";

        const opcionesParaMostrar = this.mezclarArray([...datos.opciones]);

        opcionesParaMostrar.forEach((opcion) => {
            const btn = document.createElement('button');
            btn.className = "opcion-trivia";
            btn.innerText = opcion;
            btn.onclick = () => this.verificar(opcion, textoCorrecto, btn);
            contenedor.appendChild(btn);
        });
    },

    verificar(seleccion, textoCorrecto, elemento) {
        if (!seleccion || !textoCorrecto) return;
        const esCorrecto = seleccion.trim().toLowerCase() === textoCorrecto.trim().toLowerCase();

        if (esCorrecto) {
            elemento.style.backgroundColor = "#22c55e"; 
            elemento.style.color = "white";
            elemento.innerText = "✓ " + seleccion;
            
            if (window.Juego) window.Juego.puntos += this.puntosPorAcierto;
            this.preguntasRespondidasEnFase++;

            setTimeout(() => {
                if (this.preguntasRespondidasEnFase >= this.faseActual.cantidad) {
                    this.completarFase();
                } else {
                    this.presentarPregunta();
                }
            }, 600);
        } else {
            elemento.style.backgroundColor = "#ef4444";
            elemento.style.color = "white";
            elemento.innerText = "✗ " + seleccion;
            
            const box = document.querySelector('.trivia-box');
            if (box) box.classList.add('trivia-error');
            if (window.AudioEngine) window.AudioEngine.reproducir('muerte');

            setTimeout(() => {
                const overlay = document.getElementById('overlay-trivia');
                if (overlay) overlay.style.display = "none";
                if (box) box.classList.remove('trivia-error');
                
                if (window.Juego) {
                    window.Juego.fin(false, this.faseActual.titulo);
                }
            }, 800);
        }
    },

    completarFase() {
        const overlay = document.getElementById('overlay-trivia');
        if (overlay) overlay.style.display = "none";
        
        // --- CIERRE DE GESTA ---
        if (this.faseActual.idOriginal === 'fase3') {
            if (window.Interfaz) {
                // Forzamos la victoria total: no hay más niveles
                window.Interfaz.mostrarPantallaFinal(true, 1000, "¡HÉROE DE LA MANCHA!");
            }
        } else {
            // Seguir flujo normal (subir de nivel)
            if (this.callbackFinal) this.callbackFinal();
        }
    },

    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};

window.Trivia = Trivia;