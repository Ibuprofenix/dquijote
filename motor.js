/**
 * MOTOR DE JUEGO: DON QUIJOTE VS GIGANTES
 * Versión Final Corregida (Audio + Soporte Sancho)
 */

// --- 1. CONFIGURACIÓN VISUAL ---
const AMBIENTES = {
    "Nivel1": { sky: "linear-gradient(to bottom, #4facfe, #f5deb3)", nombre: "Campos de Criptana" },
    "Nivel2": { sky: "linear-gradient(to bottom, #f093fb, #7b3f00)", nombre: "Atardecer en Montiel" },
    "Nivel3": { sky: "linear-gradient(to bottom, #09203f, #000000)", nombre: "Duelo en el Castillo" }
};

// --- 2. AUTODETECCIÓN DE NIVEL ---
window.addEventListener('load', () => {
    const nombreArchivo = window.location.pathname.split("/").pop().replace(".html", "");
    const canvas = document.getElementById('gameCanvas');
    if (canvas && AMBIENTES[nombreArchivo]) {
        canvas.style.background = AMBIENTES[nombreArchivo].sky;
    }
});

// --- 3. MOTOR DE AUDIO (Sintetizador Retro) ---
function playSfx(tipo) {
    const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    const ahora = ctxAudio.currentTime;
    const gain = ctxAudio.createGain();
    gain.connect(ctxAudio.destination);

    if (tipo === 'trizas') {
        // SONIDO DE EXPLOSIÓN / CRASH
        const bufferSize = ctxAudio.sampleRate * 0.2;
        const buffer = ctxAudio.createBuffer(1, bufferSize, ctxAudio.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
        const noise = ctxAudio.createBufferSource();
        noise.buffer = buffer;
        const filter = ctxAudio.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ahora);
        filter.frequency.exponentialRampToValueAtTime(100, ahora + 0.2);
        noise.connect(filter);
        filter.connect(gain);
        gain.gain.setValueAtTime(0.3, ahora);
        gain.gain.linearRampToValueAtTime(0, ahora + 0.2);
        noise.start(); noise.stop(ahora + 0.2);
    } else {
        const osc = ctxAudio.createOscillator();
        osc.connect(gain);
        switch(tipo) {
            case 'lanza':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ahora);
                osc.frequency.exponentialRampToValueAtTime(100, ahora + 0.1);
                gain.gain.setValueAtTime(0.2, ahora);
                gain.gain.linearRampToValueAtTime(0, ahora + 0.1);
                osc.start(); osc.stop(ahora + 0.1);
                break;
            case 'daño':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, ahora);
                osc.frequency.linearRampToValueAtTime(50, ahora + 0.2);
                gain.gain.setValueAtTime(0.3, ahora);
                gain.gain.linearRampToValueAtTime(0, ahora + 0.2);
                osc.start(); osc.stop(ahora + 0.2);
                break;
            case 'victoria':
                osc.type = 'square';
                [440, 554, 659, 880].forEach((f, i) => {
                    osc.frequency.setValueAtTime(f, ahora + i * 0.08);
                });
                gain.gain.setValueAtTime(0.1, ahora);
                gain.gain.linearRampToValueAtTime(0, ahora + 0.4);
                osc.start(); osc.stop(ahora + 0.4);
                break;
        }
    }
}

// --- 4. GESTIÓN DE ENTRADA ---
const teclado = {};
window.addEventListener('keydown', (e) => { teclado[e.key] = true; });
window.addEventListener('keyup', (e) => { teclado[e.key] = false; });

function irANivel(nivel) {
    window.location.href = nivel + ".html"; 
}

// --- 5. AMBIENTE: POLVAREDA ---
let particulasPolvo = [];
function dibujarPolvareda(ctx) {
    if (particulasPolvo.length < 25) {
        particulasPolvo.push({
            x: Math.random() * 800,
            y: 600,
            v: 0.3 + Math.random() * 0.8,
            op: 0.1 + Math.random() * 0.3,
            size: 1 + Math.random() * 2
        });
    }
    ctx.save();
    particulasPolvo.forEach((p, i) => {
        p.y -= p.v;
        p.x += Math.sin(p.y / 30) * 0.5;
        ctx.fillStyle = `rgba(210, 180, 140, ${p.op})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.y < -10) particulasPolvo.splice(i, 1);
    });
    ctx.restore();
}

// --- 6. INTERFAZ DE USUARIO (UI) ---
function dibujarUI(ctx, vidas) {
    ctx.save();
    dibujarPolvareda(ctx);
    ctx.fillStyle = "rgba(62, 39, 35, 0.85)"; 
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    dibujarRectRedondeado(ctx, 15, 15, 170, 40, 10);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 16px 'Georgia', serif";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("HIDALGO:", 30, 41);
    for(let i=0; i<3; i++) {
        ctx.font = "18px Arial";
        ctx.fillStyle = i < vidas ? "#e74c3c" : "#2c3e50";
        ctx.fillText(i < vidas ? "❤" : "💀", 120 + (i * 22), 41);
    }
    ctx.restore();
}

// --- 7. MENSAJES ---
function mostrarMensaje(ctx, titulo, subtitulo) {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, 800, 600);
    ctx.textAlign = "center";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "black";
    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 45px 'Georgia', serif";
    ctx.fillText(titulo, 400, 280);
    ctx.font = "22px 'Georgia', serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(subtitulo, 400, 330);
    ctx.restore();
}

function dibujarRectRedondeado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

// Imágenes Globales
const imgQ = new Image(); imgQ.src = 'img/sprites_quijote.png';
const imgG = new Image(); imgG.src = 'img/sprites_gigantes.png';
const imgR = new Image(); imgR.src = 'img/sprites_roca.png';
const imgM = new Image(); imgM.src = 'img/sprites_molino.png';
const imgA = new Image(); imgA.src = 'img/sprites_aspas.png';
const imgF = new Image(); imgF.src = 'img/sprites_rafaga.png';
const imgS = new Image(); imgS.src = 'img/sprites_sancho.png';
