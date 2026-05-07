/**
 * TRIVIA.JS - Sincronizado con el HTML del Caballero
 */
const Trivia = {
    puntosPorAcierto: 250,
    preguntasRespondidasEnFase: 0,
    faseActual: null,
    preguntasMezcladas: [],
    callbackFinal: null,

    fases: {
        '0': { titulo: "El Espaldarazo", dific: "nivel0", cantidad: 1 },
        '1': { titulo: "El Yelmo de Mambrino", dific: "nivel1", cantidad: 2 },
        '2': { titulo: "El Bálsamo de Fierabrás", dific: "nivel2", cantidad: 3 },
        '3': { titulo: "La Cueva de Montesinos", dific: "nivel3", cantidad: 4 }
    },

    lanzar(idNivel, callback) {
        const id = String(idNivel).replace('fase', '');
        
        if (!this.fases[id]) {
            if(callback) callback(false);
            return;
        }

        this.faseActual = { ...this.fases[id], idOriginal: id };
        this.callbackFinal = callback;
        this.preguntasRespondidasEnFase = 0;

        const pool = (window.BibliotecaTrivia && BibliotecaTrivia[this.faseActual.dific]) || [];
        if (pool.length === 0) {
            this.completarFase(true);
            return;
        }
        
        this.preguntasMezcladas = this.mezclarArray([...pool]);

        const overlay = document.getElementById('overlay-trivia');
        if (overlay) {
            // Forzamos el estilo para que se vea sobre todo lo demás
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
            btn.className = "opcion-trivia"; // Asegúrate que trivia.css tenga este estilo
            btn.innerText = opcion;
            btn.onclick = () => this.verificar(opcion, textoCorrecto, btn);
            contenedor.appendChild(btn);
        });
    },

    verificar(seleccion, textoCorrecto, elemento) {
        if (!seleccion || !textoCorrecto) return;
        const esCorrecto = seleccion.trim().toLowerCase() === textoCorrecto.trim().toLowerCase();

        if (esCorrecto) {
            elemento.classList.add('opcion-correcta'); // Estilo verde
            this.preguntasRespondidasEnFase++;
            setTimeout(() => {
                if (this.preguntasRespondidasEnFase >= this.faseActual.cantidad) {
                    this.completarFase(true);
                } else {
                    this.presentarPregunta();
                }
            }, 600);
        } else {
            elemento.classList.add('opcion-incorrecta'); // Estilo rojo
            const box = document.querySelector('.trivia-box');
            if (box) box.classList.add('trivia-error');
            
            setTimeout(() => {
                if (box) box.classList.remove('trivia-error');
                this.completarFase(false);
            }, 800);
        }
    },

    completarFase(victoria) {
        const overlay = document.getElementById('overlay-trivia');
        if (overlay) overlay.style.display = "none";
        if (this.callbackFinal) this.callbackFinal(victoria);
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