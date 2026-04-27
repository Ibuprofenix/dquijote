/**
 * MOTOR DE JUEGO: DON QUIJOTE VS GIGANTES
 */

const AMBIENTES = {
    "index": "linear-gradient(to bottom, #4facfe, #f5deb3)",
    "Nivel1": "linear-gradient(to bottom, #4facfe, #f5deb3)"
};

let canvas, ctx;
let activo = false;
let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [];
let hDir = 1, velHorda = 0.8, tiempoRestante = 120, timerInterval;

// Precarga de Imágenes
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgM = new Image(); imgM.src = 'sprites_molino.png';
const imgA = new Image(); imgA.src = 'sprites_aspas.png';
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';

const teclado = {};
window.onkeydown = (e) => { 
    teclado[e.key] = true;
    if (e.key === " ") {
        if (!activo && quijote.vidas > 0) iniciarPartida();
        else if (activo) lanzas.push({ x: quijote.x, y: quijote.y - 20 });
    }
};
window.onkeyup = (e) => teclado[e.key] = false;

function posicionarEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), rot: 0, cargando: false, t: 0 });
        }
    }
}

function iniciarPartida() {
    if (window.Interfaz) Interfaz.puntuacion = 0;
    quijote.vidas = 3;
    tiempoRestante = 120;
    proyectiles = []; lanzas = [];
    posicionarEnemigos();
    activo = true;
    
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) finalizar(false, "El tiempo se agotó.");
        }
    }, 1000);
}

function finalizar(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    Interfaz.mostrarMenuFinal(victoria ? "¡VICTORIA!" : "¡DERROTA!", msg, victoria, "Nivel2", { vidas: quijote.vidas, tiempo: tiempoRestante });
}

function loop() {
    if (!ctx) return requestAnimationFrame(loop);
    
    // Limpiar pantalla
    ctx.clearRect(0, 0, 800, 600);

    // Dibujar enemigos
    enemigos.forEach(e => {
        if (activo) e.rot += 0.04;
        ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save();
        ctx.translate(e.x, e.y - 10);
        ctx.rotate(e.rot);
        ctx.drawImage(imgA, -50, -50, 100, 100);
        ctx.restore();
    });

    if (activo) {
        // Movimiento horda
        let bajar = false;
        enemigos.forEach(e => {
            e.x += velHorda * hDir;
            if (e.x > 750 || e.x < 50) bajar = true;
            if (Math.random() < 0.005 && !e.cargando) e.cargando = true;
            if (e.cargando && ++e.t > 40) {
                proyectiles.push({ x: e.x, y: e.y, s: 20 });
                e.cargando = false; e.t = 0;
            }
        });
        if (bajar) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

        // Control Quijote
        if (teclado['ArrowLeft']) quijote.x -= 7;
        if (teclado['ArrowRight']) quijote.x += 7;
        quijote.x = Math.max(40, Math.min(760, quijote.x));
        ctx.drawImage(imgQ, 480, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // Lanzas
        lanzas.forEach((l, i) => {
            l.y -= 10;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x, l.y, 3, 15);
            enemigos.forEach((e, ei) => {
                if (Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    Interfaz.añadirPuntos(100);
                }
            });
        });

        // Proyectiles enemigos
        proyectiles.forEach((p, i) => {
            p.y += 4;
            ctx.drawImage(imgF, p.x - 10, p.y - 10, 20, 20);
            if (Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if (quijote.vidas <= 0) finalizar(false, "Habéis mordido el polvo.");
            }
        });

        if (enemigos.length === 0) finalizar(true, "¡Gigantes derrotados!");
    } else {
        // Pantalla de espera
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "30px Almendra";
        ctx.fillText("PULSA ESPACIO PARA COMENZAR", 400, 300);
    }

    // HUD Siempre visible
    ctx.fillStyle = "#f1c40f"; ctx.textAlign = "left"; ctx.font = "20px MedievalSharp";
    ctx.fillText(`VIDAS: ${quijote.vidas} | TIEMPO: ${tiempoRestante}s`, 20, 40);

    requestAnimationFrame(loop);
}

// Inicialización
window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    const path = window.location.pathname.split("/").pop().replace(".html", "") || "index";
    if (AMBIENTES[path]) canvas.style.background = AMBIENTES[path];
    
    posicionarEnemigos();
    loop();
};
