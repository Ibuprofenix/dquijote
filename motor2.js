/** * MOTOR DE JUEGO: NIVEL 2 - LA HORDA COORDINADA (CON HALO) **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3, dir: 1 };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.2, tiempoRestante = 100, timerInterval;

// Estados de animación
let frameAnimacion = 0; // Alterna 0 y 1 para reposo
let estadoAtaque = 0;   // 0: Reposo, 1: Cargando (Mano arriba + Halo), 2: Lanzando

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
            // Ciclo de animación de movimiento
            frameAnimacion = (frameAnimacion + 1) % 2; 
            
            // Lógica de ataque coordinado (como los molinos)
            if(estadoAtaque === 0 && Math.random() < 0.15) {
                estadoAtaque = 1; // ¡A cargar manos! (Halo)
                setTimeout(() => {
                    if(activo) {
                        estadoAtaque = 2; // Lanzar
                        lanzarRocasHorda();
                        setTimeout(() => estadoAtaque = 0, 500); // Volver a reposo
                    }
                }, 1000); // 1 segundo de aviso con el halo
            }
            
            if(frameAnimacion === 0) tiempoRestante--;
        }
    }, 600);
}

function lanzarRocasHorda() {
    // Solo disparan algunos para no saturar, pero coordinados
    enemigos.forEach(e => {
        if(Math.random() < 0.3) proyectiles.push({ x: e.x, y: e.y });
    });
}

function loop() {
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);
    else { ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,800,600); }

    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
        }

        ctx.save();
        if(e.hp === 1) ctx.filter = "brightness(40%)";
        
        if(imgG.complete && imgG.naturalWidth > 0) {
            let sx = 0;
            if(estadoAtaque === 1 || estadoAtaque === 2) {
                // FASE DE CARGA: Mano arriba (Sprite 3 o 4)
                sx = (frameAnimacion === 0) ? 2048 : 3072;
                
                // DIBUJAR HALO (como en los molinos)
                if(estadoAtaque === 1) {
                    ctx.beginPath();
                    let grad = ctx.createRadialGradient(e.x, e.y - 30, 5, e.x, e.y - 30, 50);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                    grad.addColorStop(1, 'rgba(255, 255, 0, 0)');
                    ctx.fillStyle = grad;
                    ctx.arc(e.x, e.y - 30, 50, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // REPOSO: Mano abajo (Sprite 1 o 2)
                sx = (frameAnimacion === 0) ? 0 : 1024;
            }
            ctx.drawImage(imgG, sx, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
        }
        ctx.restore();
    });

    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 25); }

    // QUIJOTE
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
            if(imgR.complete) ctx.drawImage(imgR, p.x-15, p.y-15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
            }
            if(p.y > 600) proyectiles.splice(i, 1);
        });
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "bold 30px 'Almendra'";
        ctx.fillText("PULSA ESPACIO PARA LUCHAR", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

spawnEnemigos();
loop();
