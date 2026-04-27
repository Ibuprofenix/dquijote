/** * MOTOR DE JUEGO: NIVEL 2 - LA HORDA (SISTEMA DE RAYO Y POWER-UP) **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.3, tiempoRestante = 100, timerInterval;

// Mecánica de Premio
let gigantesDerrotados = 0;
let premio = null; // {x, y, visible, timer}
let powerUpTimer = null;

// Estados de animación
let faseAtaque = 0; 
let frameCaminar = 0;

const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgG = new Image(); imgG.src = 'sprites_gigantes.png';
const imgR = new Image(); imgR.src = 'sprites_roca.png';

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " " && !activo) iniciar();
    if(e.key === " " && activo) {
        // DISPARO: Normal o Power-up (Doble velocidad y color especial)
        lanzas.push({
            x: quijote.x, 
            y: quijote.y - 30, 
            super: quijote.powerUp 
        });
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

function spawnEnemigos() {
    enemigos = [];
    gigantesDerrotados = 0;
    premio = null;
    quijote.powerUp = false;
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
            if (faseAtaque === 0) {
                frameCaminar = (frameCaminar + 1) % 2;
                if(Math.random() < 0.2) faseAtaque = 1; 
            } else if (faseAtaque === 1) {
                lanzarRocasHorda();
                faseAtaque = 2; 
            } else {
                faseAtaque = 0;
            }
            if(faseAtaque === 0) tiempoRestante--;
        }
    }, 600);
}

function lanzarRocasHorda() {
    enemigos.forEach(e => {
        if(Math.random() < 0.25) proyectiles.push({ x: e.x, y: e.y });
    });
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
    else { ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,800,600); }

    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 760 || e.x < 40) bajar = true;
            if(e.y > quijote.y - 40) fin(false, "¡Invasión de gigantes!");
        }

        ctx.save();
        if(e.hp === 1) ctx.filter = "brightness(40%)";
        if(imgG.complete) {
            let sx = (faseAtaque === 1) ? ((frameCaminar === 0) ? 2048 : 3072) : ((frameCaminar === 0) ? 0 : 1024);
            if(faseAtaque === 1) { // HALO
                ctx.beginPath();
                let grad = ctx.createRadialGradient(e.x, e.y - 40, 5, e.x, e.y - 40, 60);
                grad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
                grad.addColorStop(1, 'rgba(255, 150, 0, 0)');
                ctx.fillStyle = grad; ctx.arc(e.x, e.y - 40, 60, 0, Math.PI * 2); ctx.fill();
            }
            ctx.drawImage(imgG, sx, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
        }
        ctx.restore();
    });

    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 30); }

    // LÓGICA DEL PREMIO (RAYO)
    if(premio && premio.visible) {
        if(premio.y < 530) premio.y += 4; // Cae hasta el suelo
        
        // Dibujo del Rayo
        ctx.fillStyle = "#00ffff";
        ctx.shadowBlur = 15; ctx.shadowColor = "white";
        ctx.beginPath();
        ctx.moveTo(premio.x, premio.y - 20); ctx.lineTo(premio.x - 10, premio.y);
        ctx.lineTo(premio.x + 5, premio.y); ctx.lineTo(premio.x - 5, premio.y + 20);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Recogida
        if(Math.abs(quijote.x - premio.x) < 40 && Math.abs(quijote.y - premio.y) < 40) {
            premio.visible = false;
            quijote.powerUp = true;
            if(powerUpTimer) clearTimeout(powerUpTimer);
            powerUpTimer = setTimeout(() => { quijote.powerUp = false; }, 7000); // 7 seg de gloria
        }
    }

    // QUIJOTE
    if(activo) {
        if(teclas['ArrowLeft']) { quijote.x -= 9; quijote.dir = -1; }
        if(teclas['ArrowRight']) { quijote.x += 9; quijote.dir = 1; }
        quijote.x = Math.max(50, Math.min(750, quijote.x));

        ctx.save();
        ctx.translate(quijote.x, quijote.y);
        if(quijote.dir === -1) ctx.scale(-1, 1);
        // Si tiene el Power-up, el Quijote brilla
        if(quijote.powerUp) ctx.filter = "drop-shadow(0 0 10px cyan) brightness(1.2)";
        if(imgQ.complete) {
            let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
            ctx.drawImage(imgQ, fx, 0, 480, 440, -50, -45, 100, 92);
        }
        ctx.restore();

        // LANZAS
        lanzas.forEach((l, i) => {
            l.y -= l.super ? 22 : 12; // Velocidad normal 12, Powerup 22
            ctx.fillStyle = l.super ? "#00ffff" : "#f1c40f";
            ctx.fillRect(l.x - 2, l.y, 4, 30);
            
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    e.hp -= l.super ? 2 : 1; // El powerup quita 2 de golpe
                    lanzas.splice(i, 1);
                    if(e.hp <= 0) {
                        enemigos.splice(ei, 1);
                        gigantesDerrotados++;
                        if(typeof Interfaz !== 'undefined') Interfaz.añadirPuntos(150);
                        
                        // SOLTAR PREMIO EN EL TERCER GIGANTE
                        if(gigantesDerrotados === 3) {
                            premio = { x: e.x, y: e.y, visible: true };
                            setTimeout(() => { if(premio) premio.visible = false; }, 4500); // 1.5s cayendo + 3s suelo
                        }
                    }
                }
            });
            if(l.y < 0) lanzas.splice(i, 1);
        });

        // ROCAS
        proyectiles.forEach((p, i) => {
            p.y += 6;
            if(imgR.complete) ctx.drawImage(imgR, p.x-15, p.y-15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Honor perdido!");
            }
            if(p.y > 600) proyectiles.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Victoria!");
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "bold 30px 'Almendra'";
        ctx.fillText("ESPACIO PARA LUCHAR", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

spawnEnemigos();
loop();
