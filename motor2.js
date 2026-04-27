/** * MOTOR DE JUEGO: NIVEL 2 (LA HORDA) 
 * Instrucciones: Este archivo debe guardarse como motor2.js
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3 };
let sancho = { x: -100, y: 530, activo: false, yaAparecio: false, entregado: false };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.2, tiempoRestante = 100, timerInterval;

// --- SISTEMA DE PRECARGA ---
let imagenesCargadas = 0;
const totalImagenes = 5;

function comprobarCarga() {
    imagenesCargadas++;
    if (imagenesCargadas === totalImagenes) {
        spawnEnemigos();
        loop();
    }
}

// Referencias a tus archivos originales
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png'; imgQ.onload = comprobarCarga;
const imgG = new Image(); imgG.src = 'sprites_gigantes.png'; imgG.onload = comprobarCarga;
const imgS = new Image(); imgS.src = 'sprites_sancho.png';   imgS.onload = comprobarCarga;
const imgR = new Image(); imgR.src = 'sprites_roca.png';     imgR.onload = comprobarCarga;
const imgV = new Image(); imgV.src = 'sprites_vida.png';     imgV.onload = comprobarCarga;

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " ") {
        if(!activo && quijote.vidas > 0) iniciar();
        else if(activo) lanzas.push({x: quijote.x, y: quijote.y - 30});
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

function spawnEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100) });
        }
    }
}

function iniciar() {
    if(typeof Interfaz !== 'undefined') Interfaz.puntuacion = 0;
    quijote.vidas = 3;
    tiempoRestante = 100;
    proyectiles = []; lanzas = [];
    sancho.yaAparecio = false; sancho.activo = false;
    spawnEnemigos();
    activo = true;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "El tiempo ha expirado.");
        }
    }, 1000);
}

function fin(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    if(typeof Interfaz !== 'undefined') {
        Interfaz.mostrarMenuFinal(victoria ? "¡VICTORIA!" : "¡DERROTA!", msg, victoria, "nivel3", { vidas: quijote.vidas, tiempo: tiempoRestante });
    }
}

function loop() {
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);
    
    // Lógica de Sancho Panza
    if (quijote.vidas === 1 && !sancho.yaAparecio) {
        sancho.activo = true;
        sancho.yaAparecio = true;
    }

    if (sancho.activo) {
        if (!sancho.entregado) {
            sancho.x += 3;
            if (sancho.x > 150) sancho.entregado = true;
        } else {
            sancho.x -= 3;
            if (sancho.x < -100) sancho.activo = false;
        }
        ctx.drawImage(imgS, 0, 0, 1024, 1024, sancho.x, 480, 100, 100);
        if (sancho.entregado && sancho.x > 0) {
            ctx.drawImage(imgV, 150, 530, 40, 40);
            if (Math.abs(quijote.x - 150) < 40) { 
                quijote.vidas = 3;
                sancho.entregado = false;
            }
        }
    }

    // Lógica de la Horda
    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            if(Math.random() < 0.003) proyectiles.push({ x: e.x, y: e.y });
        }
        // Renderizado de gigante (recorte original)
        ctx.drawImage(imgG, 2048, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
    });

    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 25); }

    if(activo) {
        if(teclas['ArrowLeft']) quijote.x -= 8;
        if(teclas['ArrowRight']) quijote.x += 8;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
        ctx.drawImage(imgQ, fx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        lanzas.forEach((l, i) => {
            l.y -= 12;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 25);
            ctx.fillStyle = "white"; ctx.fillRect(l.x - 1, l.y, 2, 8);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    if(typeof Interfaz !== 'undefined') Interfaz.añadirPuntos(150);
                }
            });
            if(l.y < 0) lanzas.splice(i, 1);
        });

        proyectiles.forEach((p, i) => {
            p.y += 5;
            ctx.drawImage(imgR, p.x - 15, p.y - 15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Los gigantes te han aplastado!");
            }
            if(p.y > 600) proyectiles.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Camino despejado!");
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "bold 30px 'Almendra'";
        ctx.fillText("PULSA ESPACIO PARA COMBATIR LA HORDA", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}