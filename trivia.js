/**
 * trivia.js - Lógica de validación con Aleatoriedad y Control de Cantidad
 */
const Trivia = {
    preguntasActuales: [],
    indicePregunta: 0,
    callbackFinal: null,

    // CONFIGURACIÓN: Aquí definimos el límite de preguntas por fase
    config: {
        'fase0': 1, // Mostrará 1 pregunta (tienes 2 en biblioteca)
        'fase1': 2, // Mostrará 2 preguntas (tienes 3 en biblioteca)
        'fase2': 3, // Mostrará 3 preguntas (tienes 3 en biblioteca)
        'fase3': 4  // Mostrará 4 preguntas (tienes 4 en biblioteca)
    },

    /**
     * Inicia una fase de trivia
     */
    lanzar(faseId, callback) {
        if (!window.BibliotecaPreguntas || !window.BibliotecaPreguntas[faseId]) {
            console.error(`Error: No existe la fase ${faseId}`);
            if (callback) callback();
            return;
        }

        // 1. Obtener el pool y barajarlo
        let pool = [...window.BibliotecaPreguntas[faseId]];
        pool = this.mezclarArray(pool);

        // 2. APLICAR LÍMITE: Extraemos solo la cantidad definida en config
        const limite = this.config[faseId] || 1;
        this.preguntasActuales = pool.slice(0, limite);

        // Debug para confirmar en consola
        console.log(`[Trivia] Cargada ${faseId}. Preguntas a responder: ${this.preguntasActuales.length}`);

        this.indicePregunta = 0;
        this.callbackFinal = callback;

        if (window.Interfaz) Interfaz.mostrarTrivia();
        this.presentarPregunta();
    },

    /**
     * Mezcla aleatoria (Fisher-Yates)
     */
    mezclarArray(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    presentarPregunta() {
        const elPregunta = document.getElementById('trivia-pregunta');
        const elOpciones = document.getElementById('trivia-opciones');
        const elProgreso = document.getElementById('trivia-progreso');
        const elFeedback = document.getElementById('trivia-feedback');

        if (!elPregunta || !elOpciones) return;

        elFeedback.classList.add('hidden');
        elOpciones.innerHTML = '';

        const data = this.preguntasActuales[this.indicePregunta];

        // Mostrar progreso real (Ej: "1 de 1")
        if (elProgreso) {
            elProgreso.innerText = `Prueba de Valor: ${this.indicePregunta + 1} de ${this.preguntasActuales.length}`;
        }
        
        elPregunta.innerText = data.pregunta;

        // Barajar opciones para que la correcta no sea siempre la misma letra
        let opciones = data.opciones.map((texto, i) => ({ texto, correcta: i === data.correcta }));
        opciones = this.mezclarArray(opciones);

        opciones.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = "btn-cartoon w-full text-left p-4 text-lg bg-white/80 hover:bg-amber-200 transition-all border-b-4 border-amber-900/20 text-amber-950 font-bold mb-2";
            btn.innerHTML = `<span class="text-amber-700 mr-2">${String.fromCharCode(65 + i)})</span> ${opt.texto}`;
            
            btn.onclick = () => this.verificarRespuesta(opt.correcta, btn);
            elOpciones.appendChild(btn);
        });
    },

    verificarRespuesta(esCorrecta, boton) {
        if (esCorrecta) {
            boton.classList.replace('bg-white/80', 'bg-green-400');
            if (window.AudioEngine) AudioEngine.reproducir('acierto'); 

            this.indicePregunta++;

            if (this.indicePregunta < this.preguntasActuales.length) {
                setTimeout(() => this.presentarPregunta(), 1000);
            } else {
                this.finalizarExitosamente();
            }
        } else {
            boton.classList.replace('bg-white/80', 'bg-red-400');
            const fb = document.getElementById('trivia-feedback');
            fb.innerText = "¡RESPUESTA INCORRECTA! Debéis estudiar más los libros de caballería.";
            fb.className = "mt-4 p-3 rounded-xl text-center font-black bg-red-100 text-red-700 border-2 border-red-700 block";
            fb.classList.remove('hidden');

            setTimeout(() => {
                location.reload(); // Reinicio por fallo
            }, 1500);
        }
    },

    finalizarExitosamente() {
        const fb = document.getElementById('trivia-feedback');
        fb.innerText = "¡IDENTIDAD CONFIRMADA! Podéis proseguir, Caballero.";
        fb.className = "mt-4 p-3 rounded-xl text-center font-black bg-green-100 text-green-700 border-2 border-green-700 block";
        fb.classList.remove('hidden');

        setTimeout(() => {
            if (window.Interfaz) Interfaz.ocultarTrivia();
            if (this.callbackFinal) {
                const cb = this.callbackFinal;
                this.callbackFinal = null;
                cb();
            }
        }, 1500);
    }
};

window.Trivia = Trivia;