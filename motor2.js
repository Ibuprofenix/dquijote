/** * MOTOR DE JUEGO: NIVEL 2 - LA HORDA (VERSIÓN FLUIDA + TRIZAS)  
 * Atmósfera: Atardecer Castellano (Naranja)
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false };
let enemigos = [], proyectiles = [], lanzas = [], trizas = [], activo = false;
let hDir = 1, velHorda = 1.3, tiempoRestante = 100, timerInterval;
let juegoTerminado = false; 

let gigantesDerrotados = 0;
let premio = null; 
let powerUpTimer = null;
let tickHorda = 0; 

// --- CARGA DE IMÁGENES ---
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgG = new Image(); imgG.src = 'sprites_gigantes.png';
const imgR = new Image(); imgR.src = 'sprites_roca.png';

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " " && activo && !juegoTerminado) {
        // Añadimos propiedad 'eliminar' para evitar congelación
        lanzas.push({ x: quijote.x, y: quijote.y - 30, super: quijote.powerUp, eliminar: false });
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

function spawnEnemigos() {
    enemigos = []; gigantesDerrotados = 0; premio = null; quijote.powerUp = false;
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), hp: 2, fila: f, estado: 0, eliminar: false });
        }
    }
}

function iniciar() {
    if(activo) return;
    if(typeof Interfaz !== 'undefined') Interfaz.puntuacion = 0;
    
    quijote.vidas = 3; 
    tiempoRestante = 100; 
    trizas = [];
    spawnEnemigos(); 
    activo = true;
    juegoTerminado = false;

    const btn = document.getElementById('btnAccion');
    if(btn) btn.style.display = "none";
    
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo && !juegoTerminado) {
            tickHorda = (tickHorda + 1) % 2;
            enemigos.forEach(e => {
                if (e.estado === 1) {
                    proyectiles.push({ x: e.x, y: e.y, eliminar: false });
                    e.estado = 0;
                } else if (Math.random() < 0.2) {
                    e.estado = 1;
                }
            });
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "¡El sol se ha puesto y has fracasado!");
        }
    }, 600);
}

function fin(victoria, msg) {
    if(!activo && juegoTerminado) return;
    activo = false; 
    juegoTerminado = true;
    clearInterval(timerInterval);
    
    if(typeof enviarDatos === 'function') enviarDatos(victoria ? "VICTORIA N2" : "DERROTA N2", quijote.vidas, 2);

    if(typeof Interfaz !== 'undefined') {
        Interfaz.mostrarMenuFinal(victoria ? "¡BRUTAL VICTORIA!" : "¡GESTA INTERRUMPIDA!", msg, victoria, null, { vidas: quijote.vidas, tiempo: tiempoRestante });
    }

    const btn = document.getElementById('btnAccion');
    if(btn) {
        btn.style.display = "block";
        btn.innerText = victoria ? "AVANZAR AL DUELO FINAL" : "VER CLASIFICACIÓN";
        btn.style.backgroundColor = victoria ? "#4CAF50" : "#8d6e63";
        btn.onclick = () => { window.location.href = victoria ? "nivel3.html" : "ranking.html"; };
    }
}

function loop() {
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);
    else { ctx.fillStyle = "#ff8c00"; ctx.fillRect(0,0,800,600); }

    let bajar = false;
    enemigos.forEach(e => {
        if(activo && !juegoTerminado) {
            e.x += velHorda * hDir;
            if(e.x > 760 || e.x < 40) bajar = true;
            if(e.y >= 490) { fin(false, "¡Los gigantes han invadido Castilla!"); return; }
        }

        ctx.save();
        if(e.hp === 1) ctx.filter = "brightness(40%)";
        if(imgG.complete) {
            let sx = (e.estado === 1) ? ((e.fila % 2 === 0 ? tickHorda : 1 - tickHorda) * 1024) : (2048 + (e.fila % 2 === 0 ? tickHorda : 1 - tickHorda) * 1024);
            ctx.drawImage(imgG, sx, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
        }
        ctx.restore();
    });

    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 35); }

    if(premio && premio.visible) {
        if(premio.y < 530) premio.y += 5;
        ctx.fillStyle = "cyan"; ctx.beginPath();
        ctx.moveTo(premio.x, premio.y-20); ctx.lineTo(premio.x-10, premio.y); ctx.lineTo(premio.x+5, premio.y); ctx.lineTo(premio.x-5, premio.y+20);
        ctx.fill();
        if(Math.abs(quijote.x - premio.x) < 40 && Math.abs(quijote.y - premio.y) < 40) {
            premio.visible = false; quijote.powerUp = true;
            if(powerUpTimer) clearTimeout(powerUpTimer);
            powerUpTimer = setTimeout(() => { quijote.powerUp = false; }, 8000);
        }
    }

    if(activo && !juegoTerminado) {
        if(teclas['ArrowLeft']) { quijote.x -= 9; quijote.dir = -1; }
        if(teclas['ArrowRight']) { quijote.x += 9; quijote.dir = 1; }
        quijote.x = Math.max(50, Math.min(750, quijote.x));

        ctx.save();
        ctx.translate(quijote.x, quijote.y);
        if(quijote.dir === -1) ctx.scale(-1, 1);
        if(quijote.powerUp) ctx.filter = "drop-shadow(0 0 10px cyan) brightness(1.3)";
        if(imgQ.complete) ctx.drawImage(imgQ, (teclas['ArrowLeft'] || teclas['ArrowRight'] ? 0 : 480), 0, 480, 440, -50, -45, 100, 92);
        ctx.restore();

        // COLISIONES BLINDADAS (Sin splice interno)
        lanzas.forEach(l => {
            l.y -= l.super ? 22 : 12; 
            ctx.fillStyle = l.super ? "cyan" : "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 30);
            enemigos.forEach(e => {
                if(!e.eliminar && Math.abs(l.x - e.x) < 45 && Math.abs(l.y - e.y) < 45) {
                    e.hp -= l.super ? 2 : 1; 
                    l.eliminar = true;
                    // Trizas
                    for(let k=0; k<6; k++) trizas.push({x: e.x, y: e.y, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, v: 1, c: l.super ? "cyan" : "#8d6e63"});
                    if(e.hp <= 0) {
                        e.eliminar = true; gigantesDerrotados++;
                        if(gigantesDerrotados === 3) premio = { x: e.x, y: e.y, visible: true };
                    }
                }
            });
            if(l.y < -50) l.eliminar = true;
        });

        proyectiles.forEach(p => {
            p.y += 6;
            if(imgR.complete) ctx.drawImage(imgR, p.x-15, p.y-15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; p.eliminar = true;
                if(quijote.vidas <= 0) fin(false, "¡Has caído ante la horda!");
            }
            if(p.y > 600) p.eliminar = true;
        });

        // LIMPIEZA POST-PROCESADO (Evita la congelación)
        enemigos = enemigos.filter(e => !e.eliminar);
        lanzas = lanzas.filter(l => !l.eliminar);
        proyectiles = proyectiles.filter(p => !p.eliminar);

        // Dibujar Trizas
        trizas.forEach((t, i) => {
            t.x += t.vx; t.y += t.vy; t.v -= 0.03;
            ctx.fillStyle = t.c; ctx.globalAlpha = t.v; ctx.fillRect(t.x, t.y, 3, 3); ctx.globalAlpha = 1;
            if(t.v <= 0) trizas.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Has despejado el camino!");
    } else if (!juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 25px 'Almendra'";
        ctx.fillText("HAZ CLIC PARA COMENZAR LA BATALLA", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);