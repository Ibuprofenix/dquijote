/** * MOTOR DE JUEGO: NIVEL 3 - EL DUELO FINAL (UNIFICADO)
 * Boss, Sancho, Power-ups Primos y Estética DQ
 **/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ESTADO DEL JUEGO
let quijote = { x: 400, y: 530, vidas: 3, armaReforzada: false, timerArma: 0, dir: 1 };
let boss = { x: 340, y: 15, hp: 100, dir: 1, estado: 0, fase: 1 };
let entidades = { gigantes: [], lanzas: [], proyectiles: [], trizas: [], ayudas: [] };
let sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };

let horda = { x: 0, y: 150, dir: 1, vel: 0.8 };
let activo = false, juegoTerminado = false, tiempoRestante = 120;
let tickAnim = 0, frameTimer = 0, gigantesDerrotados = 0;

// --- PRECARGA DE IMÁGENES ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', imgS: 'sprites_sancho.png' 
};
Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image(); Sprites[key].src = src;
    Sprites[key].onload = () => Sprites[key].listo = true;
});

// --- LÓGICA MATEMÁTICA (AYUDAS) ---
const listaPrimos = (max => {
    let tam = max + 1, crib = Array(tam).fill(true);
    crib[0] = crib[1] = false;
    for (let p = 2; p * p <= tam; p++) if (crib[p]) for (let i = p * p; i <= tam; i += p) crib[i] = false;
    return crib.map((es, i) => es ? i : null).filter(n => n !== null);
})(500).filter((p, i) => i % 3 === 0 && p >= 3);

// --- INPUTS ---
const teclas = {};
window.onkeydown = (e) => { 
    teclas[e.key] = true;
    if(e.key === " " && activo && !juegoTerminado) dispararLanza();
};
window.onkeyup = (e) => teclas[e.key] = false;

function dispararLanza() {
    if (quijote.armaReforzada) {
        entidades.lanzas.push({ x: quijote.x - 15, y: quijote.y, super: true, eliminar: false });
        entidades.lanzas.push({ x: quijote.x + 15, y: quijote.y, super: true, eliminar: false });
    } else {
        entidades.lanzas.push({ x: quijote.x, y: quijote.y, super: false, eliminar: false });
    }
}

function iniciar() {
    activo = true; juegoTerminado = false; quijote.vidas = 3;
    entidades = { gigantes: [], lanzas: [], proyectiles: [], trizas: [], ayudas: [] };
    for (let f = 0; f < 2; f++) { // Generar dos filas iniciales
        for (let c = 0; c < 8; c++) {
            entidades.gigantes.push({ xRel: 100 + (c * 85), yRel: f * 115, hp: 3, activo: true, estado: 0, fila: f, timerRegen: 0 });
        }
    }
    
    if(window.timerInt) clearInterval(window.timerInt);
    window.timerInt = setInterval(() => {
        if(!activo) return;
        tickAnim = (tickAnim + 1) % 2;
        tiempoRestante--;
        
        // IA de la Horda y Boss
        entidades.gigantes.forEach(g => {
            if(!g.activo) return;
            if (g.hp < 3) { g.timerRegen++; if (g.timerRegen >= 8) { g.hp++; g.timerRegen = 0; } }
            if(Math.random() < 0.1) {
                entidades.proyectiles.push({ x: g.xRel + horda.x + 35, y: g.yRel + horda.y + 40, tipo: 'roca' });
            }
        });
        if(Math.random() < 0.3) entidades.proyectiles.push({ x: boss.x + 55, y: boss.y + 100, tipo: 'roca_boss' });
        if(tiempoRestante <= 0) fin(false, "¡El tiempo se ha agotado!");
    }, 600);
}

function fin(victoria, msg) {
    activo = false; juegoTerminado = true;
    clearInterval(window.timerInt);
    if(typeof Interfaz !== 'undefined') Interfaz.mostrarMenuFinal(victoria ? "¡HÉROE DE LEYENDA!" : "¡DERROTA!", msg, victoria, null, { vidas: quijote.vidas, tiempo: tiempoRestante });
    const btn = document.getElementById('btnAccion');
    btn.style.display = "block";
    btn.innerText = "VER CLASIFICACIÓN FINAL";
    btn.onclick = () => window.location.href = "https://educastur.sharepoint.com/...";
}

function loop() {
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);
    
    if(!activo && !juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "30px 'Cinzel'";
        ctx.fillText("HAZ CLIC PARA EL DUELO FINAL", 400, 300);
        canvas.onclick = () => iniciar();
        return;
    }

    // 1. MOVIMIENTO
    if(teclas['ArrowLeft'] && quijote.x > 50) { quijote.x -= 7; quijote.dir = -1; }
    if(teclas['ArrowRight'] && quijote.x < 750) { quijote.x += 7; quijote.dir = 1; }
    
    // Boss IA
    boss.x += (boss.fase === 2 ? 6 : 4) * boss.dir;
    if(boss.x < 20 || boss.x > 670) boss.dir *= -1;
    if(boss.hp < 50) boss.fase = 2;

    // Sancho
    if (quijote.vidas === 1 && !sancho.yaAparecio) { sancho.activo = true; sancho.yaAparecio = true; sancho.estado = 'entrando'; }
    if (sancho.activo) {
        if (sancho.estado === 'entrando') { sancho.x += 4; if (sancho.x >= 100) sancho.estado = 'lanzando'; }
        if (sancho.estado === 'lanzando') { entidades.ayudas.push({ x: 150, y: 480, targetY: 530, tipo: 'vida', timer: 180 }); sancho.estado = 'volviendo'; }
        if (sancho.estado === 'volviendo') sancho.x -= 4;
    }

    // 2. COLISIONES Y LÓGICA
    horda.x += horda.vel * horda.dir;
    if(horda.x > 50 || horda.x < -50) { horda.dir *= -1; horda.y += 10; }

    entidades.lanzas.forEach(l => {
        l.y -= 12;
        // Colisión Boss
        if(l.y < boss.y + 130 && l.x > boss.x && l.x < boss.x + 110) {
            boss.hp -= l.super ? 2 : 1; l.eliminar = true;
            for(let i=0; i<10; i++) entidades.trizas.push({x: l.x, y: l.y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, v: 1, c: boss.fase==2?"#ff4500":"#8d6e63"});
            if(boss.hp <= 0) fin(true, "¡El Gigante Supremo ha caído!");
        }
        // Colisión Gigantes
        entidades.gigantes.forEach(g => {
            let gx = g.xRel + horda.x, gy = g.yRel + horda.y;
            if(g.activo && l.x > gx && l.x < gx+70 && l.y > gy && l.y < gy+90) {
                g.hp -= l.super ? 3 : 1; if(!l.super) l.eliminar = true;
                if(g.hp <= 0) { g.activo = false; gigantesDerrotados++; if(listaPrimos.includes(gigantesDerrotados)) entidades.ayudas.push({x:gx, y:gy, targetY:530, tipo:'rayo', timer:180}); }
            }
        });
    });

    // 3. RENDERIZADO
    // Boss
    ctx.save();
    if(boss.fase === 2) ctx.filter = "hue-rotate(-50deg) drop-shadow(0 0 15px red)";
    if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, tickAnim*1024, 0, 1024, 1300, boss.x, boss.y, 110, 140);
    ctx.restore();

    // Horda
    entidades.gigantes.forEach(g => {
        if(!g.activo) return;
        ctx.save();
        if(g.hp === 2) ctx.filter = "brightness(0.5)";
        if(g.hp === 1) ctx.filter = "sepia(1) hue-rotate(-50deg)";
        if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, (g.fila%2===tickAnim?0:1024), 0, 1024, 1300, g.xRel+horda.x, g.yRel+horda.y, 70, 90);
        ctx.restore();
    });

    // Sancho y Quijote
    if(sancho.activo && Sprites.imgS.listo) ctx.drawImage(Sprites.imgS, sancho.x, 480, 100, 100);
    ctx.save();
    ctx.translate(quijote.x, quijote.y);
    if(quijote.dir === -1) ctx.scale(-1, 1);
    if(quijote.armaReforzada) ctx.filter = "drop-shadow(0 0 8px gold)";
    if(Sprites.imgQ.listo) ctx.drawImage(Sprites.imgQ, (teclas['ArrowLeft']||teclas['ArrowRight']?0:480), 0, 480, 440, -50, -45, 100, 92);
    ctx.restore();

    // Proyectiles y HUD
    entidades.proyectiles.forEach(p => {
        p.y += (p.tipo==='roca_boss'?8:5);
        if(Sprites.imgR.listo) ctx.drawImage(Sprites.imgR, p.x-20, p.y-20, p.tipo==='roca_boss'?50:30, p.tipo==='roca_boss'?50:30);
        if(Math.abs(p.x-quijote.x)<30 && Math.abs(p.y-quijote.y)<30) { quijote.vidas -= (p.tipo==='roca_boss'?3:1); p.eliminar=true; if(quijote.vidas<=0) fin(false, "¡Caíste ante el coloso!"); }
    });

    // Barra de Vida Boss
    ctx.fillStyle = "black"; ctx.fillRect(200, 580, 400, 8);
    ctx.fillStyle = boss.fase === 2 ? "orange" : "red";
    ctx.fillRect(200, 580, boss.hp*4, 8);

    // Limpieza
    entidades.lanzas = entidades.lanzas.filter(l => !l.eliminar && l.y > -50);
    entidades.proyectiles = entidades.proyectiles.filter(p => !p.eliminar && p.y < 650);
    if(quijote.timerArma > 0) quijote.timerArma--; else quijote.armaReforzada = false;

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}