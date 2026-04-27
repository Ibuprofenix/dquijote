/** * MOTOR DE JUEGO: NIVEL 2 - VERSIÓN REPARADA
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado inicial
let quijote = { x: 400, y: 530, vidas: 3, dir: 1 };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.2, tiempoRestante = 100, timerInterval;
let frameGigante = 0; 

// Imágenes
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgG = new Image(); imgG.src = 'sprites_gigantes.png';
const imgR = new Image(); imgR.src = 'sprites_roca.png';

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " " && !activo) iniciar();
    if(e.key === " " && activo) lanzas.push({x: quijote.x, y: quijote.y - 30});
};
window.onkeyup = (e) => teclas[e.key] = false;

function spawnEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), hp: 2 });
        }
    }
}

function iniciar() {
    quijote.vidas = 3;
    tiempoRestante = 100;
    spawnEnemigos();
    activo = true;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            frameGigante = (frameGigante + 1) % 4;
            if(frameGigante % 2 === 0) tiempoRestante--;
        }
    }, 500);
}

function loop() {
    // 1. FONDO SEGURO
    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarEscenario(ctx);
    } else {
        ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,800,600);
    }

    // 2. GIGANTES COORDINADOS
    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            if((frameGigante === 1 || frameGigante === 3) && Math.random() < 0.005) {
                proyectiles.push({ x: e.x, y: e.y });
            }
        }

        ctx.save();
        if(e.hp === 1) ctx.filter = "brightness(40%)";
        
        if(imgG.complete && imgG.naturalWidth > 0) {
            // Recorte dinámico basado en tus 4 frames
            let sx = (frameGigante * 1024) % imgG.width; 
            ctx.drawImage(imgG, sx, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
        } else {
            ctx.fillStyle = "orange"; ctx.fillRect(e.x-20, e.y-25, 40, 50);
        }
        ctx.restore();
    });
    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 25); }

    // 3. QUIJOTE
    if(activo) {
        if(teclas['ArrowLeft']) { quijote.x -= 8; quijote.dir = -1; }
        if(teclas['ArrowRight']) { quijote.x += 8; quijote.dir = 1; }
        quijote.x = Math.max(50, Math.min(750, quijote.x));

        ctx.save();
        ctx.translate(quijote.x, quijote.y);
        if(quijote.dir === -1) ctx.scale(-1, 1);
        if(imgQ.complete && imgQ.naturalWidth > 0) {
            let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
            ctx.drawImage(imgQ, fx, 0, 480, 440, -50, -45, 100, 92);
        } else {
            ctx.fillStyle = "white"; ctx.fillRect(-20, -20, 40, 40);
        }
        ctx.restore();

        // LANZAS
        lanzas.forEach((l, i) => {
            l.y -= 12;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 25);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    e.hp--; lanzas.splice(i, 1);
                    if(e.hp <= 0) {
                        enemigos.splice(ei, 1);
                        if(typeof Interfaz !== 'undefined') Interfaz.añadirPuntos(150);
                    }
                }
            });
        });

        // ROCAS
        proyectiles.forEach((p, i) => {
            p.y += 5;
            if(imgR.complete && imgR.naturalWidth > 0) ctx.drawImage(imgR, p.x-15, p.y-15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
            }
        });
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

spawnEnemigos();
loop();
