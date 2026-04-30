const AudioEngine = {
    ctx: null,

    // Inicializa el contexto de audio (obligatorio por seguridad del navegador)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    reproducir(nombre) {
        this.init(); // Aseguramos que el audio esté "despierto"
        const t = this.ctx.currentTime;
        
        // Creamos los nodos básicos: Oscilador (voz) y Gain (volumen)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        switch (nombre) {
            case 'lanza':
                // Sonido de "fiuuu" (silbido descendente)
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1000, t);
                osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.15);
                this.conectar(osc, gain, t, 0.15);
                break;

            case 'impacto':
                // Ruido seco de madera/golpe
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.linearRampToValueAtTime(40, t + 0.1);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.1);
                this.conectar(osc, gain, t, 0.1);
                break;

            case 'click':
                // Pitido corto de menú
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.05);
                this.conectar(osc, gain, t, 0.05);
                break;

            case 'muerte':
                // Sonido de caída trágica
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, t);
                osc.frequency.linearRampToValueAtTime(50, t + 0.6);
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.6);
                this.conectar(osc, gain, t, 0.6);
                break;

            case 'victoria':
                // Pequeña fanfarria triunfal
                this.tocarNota(523.25, t, 0.1);     // Do
                this.tocarNota(659.25, t + 0.1, 0.1); // Mi
                this.tocarNota(783.99, t + 0.2, 0.3); // Sol
                break;

            case 'item':
                // "Pling" brillante
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(1500, t + 0.2);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.2);
                this.conectar(osc, gain, t, 0.2);
                break;

            case 'sancho':
                // Tono amistoso saltarín
                this.tocarNota(300, t, 0.1);
                this.tocarNota(450, t + 0.05, 0.1);
                break;
        }
    },

    // Función auxiliar para conectar y ejecutar el sonido
    conectar(osc, gain, t, duracion) {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + duracion);
    },

    // Para notas musicales simples (como la victoria o Sancho)
    tocarNota(frec, inicio, dur) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(frec, inicio);
        g.gain.setValueAtTime(0.1, inicio);
        g.gain.linearRampToValueAtTime(0, inicio + dur);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(inicio);
        o.stop(inicio + dur);
    }
};