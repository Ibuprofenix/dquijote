/** * MOTOR DE JUEGO: NIVEL 3 - EL DUELO FINAL (VERSIÓN DEFINITIVA + TRIZAS) 
 * Boss, Horda, Sancho y Efectos de Impacto
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3, armaReforzada: false, timerArma: 0 };
let boss = { x: 340, y: 15, hp: 100, dir: 1, estado: 0, fase: 1 }; 
let gigantes = [], lanzas = [], proyectiles = [], trizas = [], ayudas = [];
let sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };

let hordaX = 0, hordaY = 150, hordaDir = 1, hordaVel = 0.8;
let tickAnim = 0, activo = false, juegoTerminado = false; 
let tiempoRestante = 120, gigantesDerrotados = 0;

const DIST_FILA = 115, LIMITE_FILAS = 4, Y_LIMITE_INVASION = 510;

// --- IMÁGENES ---
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgG = new Image(); imgG.src = 'sprites_gigantes.png';
const imgR = new Image(); imgR.src = 'sprites_roca.png';
const imgS = new Image(); imgS.src = 'sprites_sancho.png';

const teclas = {};
window.onkeydown = (e) => { 
    teclas[e.key] = true; 
    if(e.key === " " && activo && !juegoTerminado) dispararLanza(); 
};
window.onkeyup = (e) => teclas[e.key] = false;

// --- SISTEMA DE TRIZAS (NUEVO) ---
function crearTrizas(x, y, color = "#5d4037", cantidad = 8) {
    for (let i = 0; i < cantidad; i++) {
        trizas.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            v: 1.0,
            color: color
        });
    }
}

function obtenerPrimos(max) {
    let tam = max + 1, crib = Array(tam).fill(true);
    crib[0] = crib[1] = false;
    for (let p = 2; p * p <= tam; p++) if (crib[p]) for (let i = p * p; i <= tam; i += p) crib[i] = false;
    return crib.map((es, i) => es ? i : null).filter(n => n !== null);
}
const listaPrimos = obtenerPrimos(500);
const primosConAyuda = listaPrimos.filter((p, index) => index % 3 === 0 && p >= 3);

function iniciar() {
    if(activo) return;
    if(typeof Interfaz !== 'undefined') Interfaz.puntuacion = 0;
    gigantes = []; proyectiles = []; trizas = []; ayudas = [];
    gigantesDerrotados = 0;
    quijote = { x: 400, y: 530, vidas: 3, armaReforzada: false, timerArma: 0 };
    boss = { x: 340, y: 15, hp: 100, dir: 1, estado: 0, fase: 1 }; 
    sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };
    hordaY = 150; hordaX = 0; tiempoRestante = 120;
    juegoTerminado = false; activo = true;
    generarFila(0); generarFila(DIST_FILA);
    const btn = document.getElementById('btnAccion');
    if(btn) btn.style.display = "none";
    
    if(window.timerInt) clearInterval(window.timerInt);
    window.timerInt = setInterval(() => {
        if(!activo || juegoTerminado) return;
        tickAnim = (tickAnim + 1) % 2;
        tiempoRestante--;
        
        gigantes.forEach(g => {
            if(!g.activo) return;
            if (g.hp < 3) { g.timerRegen = (g.timerRegen || 0) + 1; if (g.timerRegen >= 8) { g.hp++; g.timerRegen = 0; } }
            if(g.estado === 1 && Math.random() < 0.1) { proyectiles.push({ x: g.xRel + hordaX + 35, y: g.yRel + hordaY + 40, tipo: 'roca', eliminar: false }); g.estado = 0; }
            else if(Math.random() < 0.15) g.estado = 1;
        });
        
        if(Math.random() < 0.35) { proyectiles.push({ x: boss.x + 55, y: boss.y + 100, tipo: 'roca_boss', eliminar: false }); boss.estado = 1; } else boss.estado = 0;
        if(Math.random() < 0.1) boss.dir = (quijote.x > boss.x + 55) ? 1 : -1;
        if(tiempoRestante <= 0) fin(false, "¡El tiempo se ha agotado!");
    }, 600);
}

function fin(victoria, msg) {
    if(!activo) return;
    activo = false; juegoTerminado = true;
    clearInterval(window.timerInt);
    if(typeof enviarDatos === 'function') enviarDatos(victoria ? "VICTORIA FINAL" : "DERROTA", quijote.vidas, 3);
    if(typeof Interfaz !== 'undefined') Interfaz.mostrarMenuFinal(victoria ? "¡HÉROE DE LEYENDA!" : "¡GESTA INTERRUMPIDA!", msg, victoria, null, { vidas: quijote.vidas, tiempo: tiempoRestante });
    
    const btn = document.getElementById('btnAccion');
    if(btn) {
        btn.style.display = "block";
        btn.innerText = "CONSULTAR CLASIFICACIÓN";
        btn.style.backgroundColor = "#8d6e63"; 
        btn.onclick = () => { window.location.href = "https://educastur.sharepoint.com/sites/lospasosdelcid/SitePages/La_Mancha_Invaders.aspx?csf=1&web=1&e=GZTQm7&CID=ebd86069-c26b-490f-a865-52c0a91a2adc"; };
    }
}

function generarFila(yRel) {
    let filasActivas = new Set(gigantes.filter(g => g.activo).map(g => g.yRel)).size;
    if (filasActivas >= LIMITE_FILAS) return;
    for (let c = 0; c < 8; c++) gigantes.push({ xRel: 100 + (c * 85), yRel: yRel, hp: 3, activo: true, estado: 0, fila: Math.floor(yRel/100), timerRegen: 0, eliminar: false });
}

function dispararLanza() {
    if (quijote.armaReforzada) { 
        lanzas.push({ x: quijote.x - 15, y: quijote.y, super: true, eliminar: false }); 
        lanzas.push({ x: quijote.x + 15, y: quijote.y, super: true, eliminar: false }); 
    }
    else lanzas.push({ x: quijote.x, y: quijote.y, super: false, eliminar: false });
}

function loop() {
    if(typeof Interfaz !== 'undefined') { Interfaz.dibujarEscenario(ctx); Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante); }
    else ctx.clearRect(0,0,800,600);

    if(activo && !juegoTerminado) {
        // Movimiento Quijote
        if(teclas['ArrowLeft']) { quijote.x -= 7; if(typeof SistemaGesta !== 'undefined') SistemaGesta.generarPolvo(quijote.x, quijote.y); }
        if(teclas['ArrowRight']) { quijote.x += 7; if(typeof SistemaGesta !== 'undefined') SistemaGesta.generarPolvo(quijote.x, quijote.y); }
        quijote.x = Math.max(50, Math.min(750, quijote.x));

        // Boss
        let velBoss = (boss.fase === 2 ? 7 : 4.5);
        boss.x += velBoss * boss.dir;
        if(boss.x < 20 || boss.x > 670) boss.dir *= -1;
        if(boss.hp < 50 && boss.fase === 1) boss.fase = 2;

        // Sancho
        if (quijote.vidas === 1 && !sancho.yaAparecio) { sancho.activo = true; sancho.yaAparecio = true; sancho.estado = 'entrando'; }
        if (sancho.activo) {
            if (sancho.estado === 'entrando') { sancho.x += 4; if (sancho.x >= 100) { sancho.estado = 'lanzando'; ayudas.push({ x: sancho.x + 50, y: 480, targetY: 530, tipo: 'vida', timer: 180, eliminar: false }); setTimeout(() => sancho.estado = 'volviendo', 500); } }
            else if (sancho.estado === 'volviendo') { sancho.x -= 4; if (sancho.x < -150) sancho.activo = false; }
        }

        // Horda
        hordaX += hordaVel * hordaDir;
        let bIzq = 1000, bDer = 0, maxY = 0;
        gigantes.forEach(g => {
            if(!g.activo) return;
            let xR = g.xRel + hordaX, yR = g.yRel + hordaY;
            if(xR < bIzq) bIzq = xR; if(xR + 70 > bDer) bDer = xR + 70;
            if(yR + 90 > maxY) maxY = yR + 90;
        });
        if(bDer > 780 || bIzq < 20) { hordaDir *= -1; hordaY += 20; }
        if(maxY > Y_LIMITE_INVASION) fin(false, "¡Los gigantes te han acorralado!");

        // COLISIONES LANZAS (CON TRIZAS)
        lanzas.forEach(l => {
            l.y -= 12;
            // Hit al Boss
            if(!l.eliminar && l.y < boss.y + 130 && l.x > boss.x && l.x < boss.x + 110) { 
                boss.hp -= l.super ? 2 : 1; 
                l.eliminar = true;
                crearTrizas(l.x, l.y, boss.fase === 2 ? "orange" : "red", 12);
                if(boss.hp <= 0) fin(true, "¡Has derrotado al Gigante Supremo!"); 
            }
            // Hit a Gigantes
            gigantes.forEach(g => {
                if(!g.activo || l.eliminar) return;
                let gx = g.xRel + hordaX, gy = g.yRel + hordaY;
                if(l.x > gx && l.x < gx+70 && l.y > gy && l.y < gy+90) { 
                    g.hp -= l.super ? 3 : 1; 
                    g.timerRegen = 0; 
                    if (!l.super) l.eliminar = true; 
                    crearTrizas(l.x, l.y, "#8d6e63", 6);
                    if(g.hp <= 0) { 
                        g.activo = false; 
                        gigantesDerrotados++; 
                        if (primosConAyuda.includes(gigantesDerrotados)) ayudas.push({ x: gx + 35, y: gy + 45, targetY: 530, tipo: 'rayo', timer: 180, eliminar: false }); 
                    } 
                }
            });
            if(l.y < -50) l.eliminar = true;
        });

        // Proyectiles
        proyectiles.forEach(p => {
            p.y += (p.tipo === 'roca_boss') ? 8.5 : 5.5;
            let hit = (p.tipo === 'roca_boss') ? 45 : 30;
            if(!p.eliminar && Math.abs(p.x - quijote.x) < hit && Math.abs(p.y - quijote.y) < 35) { 
                if(p.tipo === 'roca_boss') quijote.vidas = 0; else quijote.vidas--; 
                p.eliminar = true;
                if(quijote.vidas <= 0) fin(false, "¡Caíste ante el coloso!"); 
            }
            if(p.y > 600) p.eliminar = true;
        });

        // Ayudas
        ayudas.forEach(a => { 
            if (a.y < a.targetY) a.y += 5; 
            if(!a.eliminar && Math.abs(quijote.x - a.x) < 40 && Math.abs(quijote.y - a.y) < 40) { 
                if(a.tipo === 'vida') quijote.vidas = 3; 
                else { quijote.armaReforzada = true; quijote.timerArma = 400; } 
                a.eliminar = true; 
            } 
            a.timer--; 
            if(a.timer <= 0) a.eliminar = true; 
        });

        // LIMPIEZA SEGURA
        lanzas = lanzas.filter(l => !l.eliminar);
        proyectiles = proyectiles.filter(p => !p.eliminar);
        ayudas = ayudas.filter(a => !a.eliminar);

        if(quijote.timerArma > 0) quijote.timerArma--; else quijote.armaReforzada = false;
        dibujarEscena(maxY);
    } else if (!juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0, 0, 800, 600);
        ctx.textAlign = "center"; ctx.fillStyle = "white"; ctx.font = "bold 40px 'Cinzel', serif"; ctx.fillText("EL DUELO FINAL", 400, 280);
        ctx.font = "20px Arial"; ctx.fillText("HAZ CLIC PARA ENFRENTAR TU DESTINO", 400, 340);
    }
    requestAnimationFrame(loop);
}

function dibujarEscena(maxY) {
    ctx.save(); if(boss.fase === 2) ctx.filter = "hue-rotate(-50deg) drop-shadow(0 0 15px red)";
    let sxB = (boss.estado === 1 ? tickAnim : 2 + tickAnim) * 1024;
    if(imgG.complete) ctx.drawImage(imgG, sxB, 0, 1024, 1300, boss.x, boss.y, 110, 140);
    ctx.restore();

    gigantes.forEach(g => {
        if(!g.activo) return; ctx.save();
        if(g.hp === 2) ctx.filter = "brightness(0.4)"; if(g.hp === 1) ctx.filter = "sepia(1) saturate(8) hue-rotate(-50deg)";
        let frame = (g.fila % 2 === 0) ? tickAnim : (1 - tickAnim);
        let sx = (g.estado === 1 ? frame : 2 + frame) * 1024;
        if(imgG.complete) ctx.drawImage(imgG, sx, 0, 1024, 1300, g.xRel + hordaX, g.yRel + hordaY, 70, 90); ctx.restore();
    });

    if(sancho.activo && imgS.complete) ctx.drawImage(imgS, 0, 0, 1024, 1024, sancho.x, 480, 100, 100);
    if(imgQ.complete) ctx.drawImage(imgQ, (teclas['ArrowLeft'] || teclas['ArrowRight'] ? 0 : 480), 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);
    
    lanzas.forEach(l => { ctx.fillStyle = l.super ? "#FFD700" : "white"; ctx.fillRect(l.x-2, l.y, 4, 22); });
    proyectiles.forEach(p => { let s = p.tipo === 'roca_boss' ? 55 : 32; if(imgR.complete) ctx.drawImage(imgR, p.x - s/2, p.y - s/2, s, s); });
    ayudas.forEach(a => { ctx.font = "32px Arial"; ctx.textAlign = "center"; ctx.fillText(a.tipo === 'vida' ? "❤️" : "⚡", a.x, a.y); });

    // Dibujar Trizas
    trizas.forEach((t, i) => {
        t.x += t.vx; t.y += t.vy; t.v -= 0.03;
        ctx.fillStyle = t.color; ctx.globalAlpha = t.v;
        ctx.fillRect(t.x, t.y, 3, 3); ctx.globalAlpha = 1;
        if(t.v <= 0) trizas.splice(i, 1);
    });

    // Vida Boss
    ctx.fillStyle = "black"; ctx.fillRect(200, 575, 400, 10);
    ctx.fillStyle = boss.fase === 2 ? "orange" : "red"; ctx.fillRect(200, 575, Math.max(0, boss.hp * 4), 10);
}
loop();