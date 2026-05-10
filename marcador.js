// marcador.js
const marcador = {
    puntos: 0,
    vidasAlFinal: 0,
    tiempoRestante: 0,

    reset() {
        this.puntos = 0;
        this.vidasAlFinal = 0;
        this.tiempoRestante = 0;
        return this.puntos;
    },

    sumarEnemigo() {
        this.puntos += 100;
        return this.puntos;
    },

    sumarBoss() {
        this.puntos += 1000;
        return this.puntos;
    },

    sumarItem() {
        this.puntos += 50;
        return this.puntos;
    },

    /**
     * Esta es la parte clave. 
     * Construimos el objeto que la Interfaz espera recibir.
     */
    obtener(vidas = 3, tiempo = 0) {
        return {
            puntosEnemigos: this.puntos,
            puntosVidas: vidas * 100, // 100 puntos por cada vida que le quede
            puntosTiempo: Math.floor(tiempo), // Puntos por segundos restantes
            total: this.puntos + (vidas * 100) + Math.floor(tiempo)
        };
    }
};

window.marcador = marcador;