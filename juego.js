const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO ---
let nivelActual = 1;
let activo = false, juegoTerminado = false;
let tiempoRestante = 100, tickAnim = 0, frameTimer = 0;
let anguloAspas = 0, horda = { x: 0, y: 100, dir: 1, vel: 1.2 };
let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false };
let boss = { x: 340, y: 15, hp: 100, dir: 1, fase: 1 };
let sancho = { x: -150, activo: false, yaAparecio: false };
let entidades = { enemigos: [], proyectiles: [], lanzas: [] };

// --- ASSETS ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', imgS: 'sprites_sancho.png',
    imgM: 'sprites_molino.png', imgA: 'sprites_aspas.png', imgF: 'sprites_rafaga.png'
};

Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image(); Sprites[key].src = src;
    Sprites[key].onload = () => Sprites[key].listo = true;
});

const teclas = {};
window.onkeydown = (e) => { teclas[e.key] = true; if(e.key === " " && activo) disparar(); };
window.onkeyup = (e) => teclas[e.key] = false;

function disparar() {
    entidades.lanzas.push({ x: quijote.x, y: quijote.y - 20, super: quijote.powerUp });
    if(quijote.powerUp && nivelActual === 3) entidades.lanzas.push({ x: quijote.x + 20, y: quijote.y - 20, super: true });
}

function iniciar() {
    nivelActual = document.body.className.includes('nivel2') ? 2 : (document.body.className.includes('nivel3') ? 3 : 1);
    activo = true; juegoTerminado = false; quijote.vidas = 3;
    entidades = { enemigos: [], proyectiles: [], lanzas: [] };
    let filas = (nivelActual === 3) ? 2 : 3;
    for(let f=0; f<filas; f++) {
        for(let c=0; c<8; c++) {
            entidades.enemigos.push({ xRel: 100+(c*85), yRel: f*90, hp: nivelActual, activo: true, fila: f, tAtaque: Math.random()*200 });
        }
    }
    setInterval(() => { if(activo) { tiempoRestante--; tickAnim = 1 - tickAnim; } }, 800);
}

function loop() {
    // 1. LIMPIEZA Y CIELO (Imprescindible para quitar el negro)
    ctx.clearRect(0, 0, 800, 600);
    const coloresCielo = { 1: "#87CEEB", 2: "#ff8c00", 3: "#2c1654" };
    ctx.fillStyle = coloresCielo[nivelActual] || "#87CEEB";
    ctx.fillRect(0, 0, 800, 600);

    // 2. DIBUJAR ESCENARIO (Tu Interfaz: Suelo y Nubes)
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);

    if(!activo && !juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "24px Almendra";
        ctx.fillText("HAZ CLIC PARA COMENZAR LA GESTA", 400, 300);
        requestAnimationFrame(loop); return;
    }

    // 3. MOVIMIENTO HORDA
    horda.x += horda.vel * horda.dir;
    if(horda.x > 60 || horda.x < -60) { horda.dir *= -1; horda.y += 10; }

    // 4. ENEMIGOS (Aspas N1, Frames N2/N3)
    anguloAspas += 0.04;
    entidades.enemigos.forEach(e => {
        if(!e.activo) return;
        let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
        e.tAtaque++;

        if(nivelActual === 1) {
            if(e.tAtaque > 250 && (e.tAtaque % 10 < 5)) { // Halo de aviso
                ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(gx, gy-10, 45, 0, 7); ctx.fill();
            }
            if(Sprites.imgM.listo) ctx.drawImage(Sprites.imgM, gx-40, gy-20, 80, 80);
            if(Sprites.imgA.listo) {
                ctx.save(); ctx.translate(gx, gy-10); ctx.rotate(anguloAspas);
                ctx.drawImage(Sprites.imgA, -45, -45, 90, 90); ctx.restore();
            }
            if(e.tAtaque > 300) { 
                entidades.proyectiles.push({x: gx, y: gy, s: 20, img: 'imgF'}); e.tAtaque = 0; 
            }
        } else {
            // Animación N2/N3: Frames 3-4 caminar (2048/3072), Frame 1 alzar (0), Frame 2 lanzar (1024)
            let sx = (tickAnim === 0 ? 2048 : 3072);
            if(e.tAtaque > 180) sx = 0;
            if(e.tAtaque > 220) { 
                sx = 1024; 
                if(e.tAtaque === 221) entidades.proyectiles.push({x: gx, y: gy, s: 30, img: 'imgR'});
            }
            if(e.tAtaque > 240) e.tAtaque = 0;

            ctx.save();
            if(e.hp < nivelActual) ctx.filter = "hue-rotate(-40deg) brightness(0.7)";
            if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, sx, 0, 1024, 1300, gx-35, gy-45, 70, 90);
            ctx.restore();
        }
    });

    // 5. BOSS (Nivel 3)
    if(nivelActual === 3) {
        boss.x += (boss.hp < 50 ? 6 : 4) * boss.dir;
        if(boss.x < 50 || boss.x > 650) boss.dir *= -1;
        if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, (Math.random()<0.1?0:1024), 0, 1024, 1300, boss.x, boss.y, 120, 150);
        if(Math.random() < 0.02) entidades.proyectiles.push({x: boss.x+60, y: boss.y+100, s: 60, img: 'imgR', boss: true});
    }

    // 6. QUIJOTE
    if(teclas['ArrowLeft'] && quijote.x > 50) { quijote.x -= 7; quijote.dir = -1; }
    if(teclas['ArrowRight'] && quijote.x < 750) { quijote.x += 7; quijote.dir = 1; }
    ctx.save(); ctx.translate(quijote.x, quijote.y);
    if(quijote.dir === -1) ctx.scale(-1, 1);
    if(Sprites.imgQ.listo) ctx.drawImage(Sprites.imgQ, (teclas['ArrowLeft']||teclas['ArrowRight']?0:480), 0, 480, 440, -50, -45, 100, 92);
    ctx.restore();

    // 7. PROYECTILES Y LANZAS
    entidades.proyectiles.forEach((p, idx) => {
        p.y += (p.boss ? 8 : 6);
        if(Sprites[p.img] && Sprites[p.img].listo) ctx.drawImage(Sprites[p.img], p.x-p.s/2, p.y-p.s/2, p.s, p.s);
        if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
            quijote.vidas -= (p.boss ? 3 : 1); entidades.proyectiles.splice(idx, 1);
            if(quijote.vidas <= 0) { activo = false; Interfaz.mostrarMenuFinal("DERROTA", "Habéis mordido el polvo", false, null, {vidas:0, tiempo:tiempoRestante}); }
        }
    });

    entidades.lanzas.forEach((l, idx) => {
        l.y -= 12; ctx.fillStyle = l.super ? "cyan" : "gold"; ctx.fillRect(l.x-2, l.y, 4, 25);
        if(nivelActual === 3 && l.x > boss.x && l.x < boss.x+120 && l.y < boss.y+150) {
            boss.hp -= (l.super?2:1); entidades.lanzas.splice(idx, 1);
            if(boss.hp <= 0) { activo = false; Interfaz.mostrarMenuFinal("VICTORIA", "¡El Gigante Supremo ha caído!", true, null, {vidas:quijote.vidas, tiempo:tiempoRestante}); }
        }
        entidades.enemigos.forEach(e => {
            if(e.activo && Math.abs(l.x - (e.xRel+horda.x)) < 35 && Math.abs(l.y - (e.yRel+horda.y)) < 40) {
                e.hp--; entidades.lanzas.splice(idx, 1);
                if(e.hp <= 0) { e.activo = false; if(nivelActual === 2) quijote.powerUp = true; }
            }
        });
    });

    // 8. HUD
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

canvas.addEventListener('click', () => { if(!activo && !juegoTerminado) iniciar(); });
requestAnimationFrame(loop);

// Arrancar
canvas.addEventListener('click', () => { if(!activo) iniciar(); });
requestAnimationFrame(loop);
