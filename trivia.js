/**
 * trivia.js - Lógica con Cronómetro Circular y Registro de Fase
 */
const Trivia = {
    preguntasActuales: [],
    indicePregunta: 0,
    callbackFinal: null,
    faseActualId: null, 
    
    // --- NUEVAS PROPIEDADES DEL CRONÓMETRO ---
    timerInterval: null,
    tiempoRestante: 0,
    tiempoLimite: 10, // Segundos por pregunta
    circunferencia: 163.36, // 2 * Math.PI * r (r=26)

    config: {
        'fase0': 1, // EL ESPALDARAZO
        'fase1': 2, // EL YELMO DE MAMBRINO
        'fase2': 3, // EL BÁLSAMO DE FIERABRÁS
        'fase3': 4  // LA CUEVA DE MONTESINOS
    },

    lanzar(faseId, callback) {
        if (!window.BibliotecaPreguntas || !window.BibliotecaPreguntas[faseId]) {
            if (callback) callback();
            return;
        }

        this.faseActualId = faseId;
        let pool = [...window.BibliotecaPreguntas[faseId]];
        pool = this.mezclarArray(pool);

        const limite = this.config[faseId] || 1;
        this.preguntasActuales = pool.slice(0, limite);

        this.indicePregunta = 0;
        this.callbackFinal = callback;

        if (window.Interfaz) {
            Interfaz.mostrarTrivia(faseId); 
        }
        
        this.presentarPregunta();
    },

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

        if (elProgreso) {
            elProgreso.innerText = `Prueba de Valor: ${this.indicePregunta + 1} de ${this.preguntasActuales.length}`;
        }
        
        elPregunta.innerText = data.pregunta;

        let opciones = data.opciones.map((texto, i) => ({ texto, correcta: i === data.correcta }));
        opciones = this.mezclarArray(opciones);

        opciones.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = "btn-cartoon w-full text-left p-4 text-lg bg-white/80 hover:bg-amber-200 transition-all border-b-4 border-amber-900/20 text-amber-950 font-bold mb-2";
            btn.innerHTML = `<span class="text-amber-700 mr-2">${String.fromCharCode(65 + i)})</span> ${opt.texto}`;
            
            btn.onclick = () => this.verificarRespuesta(opt.correcta, btn);
            elOpciones.appendChild(btn);
        });

        // Iniciar el tiempo para esta pregunta
        this.iniciarCronometro();
    },

    // --- LÓGICA DEL CRONÓMETRO ---
    iniciarCronometro() {
        this.detenerCronometro(); // Limpiar cualquier intervalo previo
        this.tiempoRestante = this.tiempoLimite;
        
        const elTexto = document.getElementById('trivia-timer-text');
        const elCirculo = document.getElementById('trivia-timer-circle');
        
        // Reset visual
        if (elTexto) elTexto.innerText = this.tiempoRestante;
        if (elCirculo) {
            elCirculo.style.strokeDashoffset = "0";
            elCirculo.style.stroke = "#ef4444"; // Rojo inicial
        }

        this.timerInterval = setInterval(() => {
            this.tiempoRestante--;
            
            if (elTexto) elTexto.innerText = this.tiempoRestante;
            
            // Actualizar círculo (stroke-dashoffset)
            if (elCirculo) {
                const offset = this.circunferencia - (this.tiempoRestante / this.tiempoLimite) * this.circunferencia;
                elCirculo.style.strokeDashoffset = offset;
                
                // Efecto visual si queda poco tiempo
                if (this.tiempoRestante <= 5) {
                    elCirculo.style.stroke = "#7f1d1d"; // Rojo oscuro/sangre
                }
            }

            if (this.tiempoRestante <= 0) {
                this.detenerCronometro();
                this.verificarRespuesta(false, null); // Tiempo agotado = Error
            }
        }, 1000);
    },

    detenerCronometro() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    verificarRespuesta(esCorrecta, boton) {
        this.detenerCronometro(); // El tiempo se para al elegir

        const botones = document.querySelectorAll('#trivia-opciones button');
        botones.forEach(b => b.style.pointerEvents = 'none');

        if (esCorrecta) {
            if (boton) boton.classList.replace('bg-white/80', 'bg-green-400');
            if (window.AudioEngine) AudioEngine.reproducir('acierto'); 

            this.indicePregunta++;

            if (this.indicePregunta < this.preguntasActuales.length) {
                setTimeout(() => this.presentarPregunta(), 1000);
            } else {
                this.finalizarExitosamente();
            }
        } else {
            if (boton) {
                boton.classList.replace('bg-white/80', 'bg-red-400');
            }
            
            const fb = document.getElementById('trivia-feedback');
            fb.innerText = this.tiempoRestante <= 0 
                ? "¡TIEMPO AGOTADO! Habéis tardado demasiado en reflexionar."
                : "¡RESPUESTA INCORRECTA! Vuestra gesta termina aquí por falta de sabiduría.";
            
            fb.className = "mt-4 p-3 rounded-xl text-center font-black bg-red-100 text-red-700 border-2 border-red-700 block";
            fb.classList.remove('hidden');

            if (window.AudioEngine) AudioEngine.reproducir('error');

            setTimeout(() => {
                this.finalizarPorFracaso();
            }, 2000);
        }
    },

    finalizarExitosamente() {
        const fb = document.getElementById('trivia-feedback');
        fb.innerText = "¡HABÉIS DEMOSTRADO VUESTRA SABIDURÍA!";
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
    },

    finalizarPorFracaso() {
        if (window.Interfaz) {
            Interfaz.ocultarTrivia();
            Interfaz.mostrarPantallaFinal(false, {
                total: 0,
                puntosEnemigos: 0,
                puntosVidas: 0,
                puntosTiempo: 0,
                esTrivia: true,
                faseTrivia: this.faseActualId
            });
        }
    }
};

window.Trivia = Trivia;