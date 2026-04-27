/**
 * MOTOR DE JUEGO: DON QUIJOTE VS GIGANTES
 */

// --- 1. CONFIGURACIÓN VISUAL DINÁMICA ---
const AMBIENTES = {
    "index": { sky: "linear-gradient(to bottom, #4facfe, #f5deb3)", nombre: "Criptana" },
    "Nivel1": { sky: "linear-gradient(to bottom, #4facfe, #f5deb3)", nombre: "Criptana" },
    "Nivel2": { sky: "linear-gradient(to bottom, #f093fb, #7b3f00)", nombre: "Montiel" },
    "Nivel3": { sky: "linear-gradient(to bottom, #09203f, #000000)", nombre: "Castillo" }
};

let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [], trizas = [], activo = false;
let hDir = 1, velHorda = 0.8;
let tiempoRestante = 120; // 2 minutos
let timerInterval;

const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgM = new Image(); imgM.src = 'sprites_molino.png';
const imgA = new Image(); imgA.src = 'sprites_aspas.png';
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';

// --- AUDIO ---
function playSfx(tipo) {
    const ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    const ahora = ctxAudio.currentTime;
    const gain = ctxAudio.createGain();
    gain.connect(ctxAudio.destination);
    const osc = ctxAudio.createOscillator();
    osc.connect(gain);

    if (tipo === 'trizas') {
        gain.gain.setValueAtTime(0.3, ahora);
        gain.gain.linearRampToValueAtTime(0, ahora + 0.2);
        osc.start(); osc.stop(ahora + 0.2);
    } else {
        switch(tipo) {
            case 'lanza': osc.frequency.setValueAtTime(600, ahora); break;
            case 'daño': osc.frequency.setValueAtTime(150, ahora); break;
            case 'victoria': [440, 880].forEach((f, i) => osc.frequency.setValueAtTime(f, ahora + i*0.1)); break;
        }
        gain.gain.setValueAtTime(0.1, ahora);
        gain.gain.linearRampToValueAtTime(0, ahora + 0.2);
        osc.start(); osc.stop(ahora + 0.3);
    }
}

// --- LÓGICA DE JUEGO ---
function posicionarEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), cargando: false, timer: 0, rot: Math.random() * Math.PI });
        }
    }
}

function init() {
    if (window.Interfaz) Interfaz.puntuacion = 0;
    proyectiles = []; lanzas = []; trizas = [];
    quijote.vidas = 3; quijote.x = 400; tiempoRestante = 120;
    posicionarEnemigos();
    activo = true;

    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) finalizar(false, "El tiempo se ha agotado.");
        }
    }, 1000);
}

function finalizar(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    if(victoria) playSfx('victoria');
    Interfaz.mostrarMenuFinal(victoria ? "¡VICTORIA!" : "¡DERROTA!", msg, victoria, "Nivel2", { vidas: quijote.vidas, tiempo: tiempoRestante });
}

function loop() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 800, 600);
    
    // UI: Vidas y Tiempo
    dibujarUI(ctx, quijote.vidas);
    ctx.fillStyle = tiempoRestante < 20 ? "#e74c3c" : "#f1c40f";
    ctx.font = "bold 20px MedievalSharp";
    ctx.textAlign = "right";
    ctx.fillText(`TIEMPO: ${Math.floor(tiempoRestante/60)}:${(tiempoRestante%60).toString().padStart(2,'0')}`, 770, 42);

    enemigos.forEach(e => {
        if (activo) e.rot += 0.04;
        ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save();
        ctx.translate(e.x, e.y - 10); ctx.rotate(e.rot);
        ctx.drawImage(imgA, -50, -50, 100, 100);
        ctx.restore();
    });

    if (activo) {
        let bajar = false;
        enemigos.forEach(e => {
            e.x += velHorda * hDir;
            if (e.x > 760 || e.x < 40) bajar = true;
            if (!e.cargando && Math.random() < 0.005) e.cargando = true;
            if (e.cargando && ++e.timer > 40) {
                proyectiles.push({ x: e.x, y: e.y, size: 20 });
                e.cargando = false; e.timer = 0;
            }
            if (e.y > 520) finalizar(false, "Los gigantes han invadido la tierra.");
        });
        if (bajar) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

        if (teclado['ArrowLeft'] || teclado['a']) quijote.x -= 7;
        if (teclado['ArrowRight'] || teclado['d']) quijote.x += 7;
        quijote.x = Math.max(40, Math.min(760, quijote.x));

        proyectiles.forEach((p, i) => {
            p.y += 4;
            ctx.drawImage(imgF, p.x - 10, p.y - 10, 20, 20);
            if (Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; playSfx('daño'); proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) finalizar(false, "Has caído en combate.");
            }
        });

        lanzas.forEach((l, i) => {
            l.y -= 10;
            ctx.drawImage(imgQ, 480, 440, 480, 440, l.x - 15, l.y - 15, 30, 30);
            enemigos.forEach((e, ei) => {
                if (Math.abs(l.x - e.x) < 45 && Math.abs(l.y - e.y) < 45) {
                    playSfx('trizas'); Interfaz.añadirPuntos(100);
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                }
            });
        });

        if (enemigos.length === 0) finalizar(true, "¡Has derrotado a los gigantes!");
        let sx = (teclado['ArrowLeft'] || teclado['ArrowRight']) ? 0 : 480;
        ctx.drawImage(imgQ, sx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);
    } else if (quijote.vidas > 0 && enemigos.length > 0) {
        mostrarMensaje(ctx, "PANTALLA 1", "PULSA ESPACIO PARA LUCHAR");
    }

    requestAnimationFrame(loop);
}

// --- UI Y SOPORTE ---
const teclado = {};
window.addEventListener('keydown', (e) => { 
    teclado[e.key] = true; 
    if(e.key === " " && !activo && quijote.vidas > 0) init();
    if(e.key === " " && activo) { lanzas.push({x: quijote.x, y: quijote.y-30}); playSfx('lanza'); }
});
window.addEventListener('keyup', (e) => teclado[e.key] = false);

function dibujarUI(ctx, vidas) {
    ctx.fillStyle = "rgba(62, 39, 35, 0.8)";
    ctx.fillRect(15, 15, 170, 40);
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("VIDAS:", 70, 41);
    for(let i=0; i<3; i++) ctx.fillText(i < vidas ? "❤" : "💀", 120 + (i*22), 41);
}

function mostrarMensaje(ctx, t, s) {
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0,0,800,600);
    ctx.textAlign = "center"; ctx.fillStyle = "#f1c40f";
    ctx.font = "40px Georgia"; ctx.fillText(t, 400, 280);
    ctx.font = "20px Georgia"; ctx.fillText(s, 400, 330);
}

window.onload = () => {
    const canvas = document.getElementById('gameCanvas');
    const path = window.location.pathname.split("/").pop().replace(".html", "") || "index";
    if (AMBIENTES[path]) canvas.style.background = AMBIENTES[path].sky;
    posicionarEnemigos();
    loop();
};
