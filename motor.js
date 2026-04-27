/**
 * motor.js - Corazón del juego y sistema de cronómetro
 */

const AMBIENTES = {
    "index": { sky: "linear-gradient(to bottom, #4facfe, #f5deb3)" },
    "Nivel1": { sky: "linear-gradient(to bottom, #4facfe, #f5deb3)" },
    "Nivel2": { sky: "linear-gradient(to bottom, #f093fb, #7b3f00)" }
};

// --- VARIABLES GLOBALES ---
let tiempoGlobalInicio = 0;
const teclado = {};

// --- IMÁGENES (Mismo nivel que el HTML) ---
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgM = new Image(); imgM.src = 'sprites_molino.png';
const imgA = new Image(); imgA.src = 'sprites_aspas.png';
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';

// --- SISTEMA DE PUNTOS Y TIEMPO ---
const SistemaPuntos = {
    puntosPorVida: 500,
    puntosBaseTiempo: 2000,
    iniciarCronometro: () => { 
        tiempoGlobalInicio = Date.now(); 
    },
    calcularPuntosFinales: (puntosActuales, vidas) => {
        const segundos = (Date.now() - tiempoGlobalInicio) / 1000;
        const bonoVidas = vidas * SistemaPuntos.puntosPorVida;
        const bonoTiempo = Math.max(0, SistemaPuntos.puntosBaseTiempo - Math.floor(segundos * 10));
        return {
            total: puntosActuales + bonoVidas + bonoTiempo,
            segundos: segundos.toFixed(1)
        };
    }
};

// --- MOTOR DE AUDIO ---
function playSfx(tipo) {
    const ctxA = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctxA.createOscillator();
    const gain = ctxA.createGain();
    osc.connect(gain); gain.connect(ctxA.destination);
    const ahora = ctxA.currentTime;

    if (tipo === 'trizas') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ahora);
        gain.gain.exponentialRampToValueAtTime(0.01, ahora + 0.2);
    } else if (tipo === 'lanza') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ahora);
        osc.frequency.exponentialRampToValueAtTime(100, ahora + 0.1);
    } else if (tipo === 'daño') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ahora);
    } else if (tipo === 'victoria') {
        osc.frequency.setValueAtTime(440, ahora);
        osc.frequency.exponentialRampToValueAtTime(880, ahora + 0.3);
    }
    osc.start(); osc.stop(ahora + 0.2);
}

// --- UI Y DIBUJO ---
function dibujarUI(ctx, vidas) {
    ctx.save();
    // Vidas
    ctx.fillStyle = "rgba(62, 39, 35, 0.85)";
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    dibujarRectRedondeado(ctx, 15, 15, 170, 40, 10);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 16px Georgia";
    ctx.fillText("HIDALGO:", 30, 41);
    for(let i=0; i<3; i++) {
        ctx.fillStyle = i < vidas ? "#e74c3c" : "#2c3e50";
        ctx.fillText(i < vidas ? "❤" : "💀", 120 + (i * 22), 41);
    }

    // Tiempo
    if (tiempoGlobalInicio > 0) {
        const s = ((Date.now() - tiempoGlobalInicio) / 1000).toFixed(1);
        dibujarRectRedondeado(ctx, 650, 15, 130, 40, 10);
        ctx.fillStyle = "rgba(62, 39, 35, 0.85)"; ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#f1c40f";
        ctx.fillText(`TIEMPO: ${s}s`, 665, 41);
    }
    ctx.restore();
}

function dibujarRectRedondeado(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}

window.addEventListener('keydown', (e) => { teclado[e.key] = true; });
window.addEventListener('keyup', (e) => { teclado[e.key] = false; });
const imgS = new Image(); imgS.src = 'sprites_sancho.png';
