const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO INICIAL ---
let nivelActual = 1;
let activo = false, juegoTerminado = false;
let tiempoRestante = 100, frameTimer = 0, tickAnim = 0;
let anguloAspas = 0, horda = { x: 0, y: 100, dir: 1, vel: 1.2 };
let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false };
let boss = { x: 340, y: 15, hp: 100, dir: 1 };
let entidades = { enemigos: [], proyectiles: [], lanzas: [] };

// --- CARGA DE IMÁGENES ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', imgM: 'sprites_molino.png', 
    imgA: 'sprites_aspas.png', imgF: 'sprites_rafaga.png'
};

Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image(); Sprites[key].src = src;
    Sprites[key].onload = () => Sprites[key].listo = true;
});

// --- ENTRADA ---
const teclas = {};
window.onkeydown = (e) => { teclas[e.key] = true; if(e.key === " " && activo) disparar(); };
window.onkeyup = (e) => teclas[e.key] = false;

function disparar() {
    entidades.lanzas.push({ x: quijote.x, y: quijote.y - 30, activo: true });
}

function iniciar() {
    nivelActual = document.body.className.includes('nivel2') ? 2 : (document.body.className.includes('nivel3') ? 3 : 1);
    activo = true; juegoTerminado = false; tiempoRestante = 100;
    entidades = { enemigos: [], proyectiles: [], lanzas: [] };
    
    let filas = (nivelActual === 3) ? 2 : 3;
    for(let f=0; f<filas; f++) {
        for(let c=0; c<8; c++) {
            entidades.enemigos.push({ 
                xRel: 100+(c*85), yRel: f*90, hp: 1, activo: true, 
                tAtaque: Math.floor(Math.random() * 200) 
            });
        }
    }
}

// --- BUCLE PRINCIPAL ---
function loop() {
    // 1. LIMPIEZA Y CIELO
    ctx.clearRect(0, 0, 800, 600);
    const coloresCielo = { 1: "#87CEEB", 2: "#ff8c00", 3: "#2c1654" };
    ctx.fillStyle = coloresCielo[nivelActual];
    ctx.fillRect(0, 0, 800, 600);

    // 2. ESCENARIO (Interfaz)
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);

    if(!activo) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "24px Almendra";
        ctx.fillText("HAZ CLIC PARA COMENZAR", 400, 300);
        requestAnimationFrame(loop); return;
    }

    // 3. RELOJ Y ANIMACIÓN (Aquí el tiempo corre por frames)
    frameTimer++;
    if(frameTimer % 60 === 0) { // Cada segundo (aprox 60fps)
        tiempoRestante--;
        tickAnim = 1 - tickAnim;
        if(tiempoRestante <= 0) activo = false;
    }

    // 4. MOVIMIENTO HORDA
    horda.x += horda.vel * horda.dir;
    if(horda.x > 60 || horda.x < -60) { horda.dir *= -1; horda.y += 10; }

    // 5. ENEMIGOS (Molinos y Gigantes)
    anguloAspas += 0.05;
    entidades.enemigos.forEach(e => {
        if(!e.activo) return;
        let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
        e.tAtaque++;

        // Render Molinos N1
        if(nivelActual === 1) {
            if(Sprites.imgM.listo) ctx.drawImage(Sprites.imgM, gx-40, gy-20, 80, 80);
            if(Sprites.imgA.listo) {
                ctx.save(); ctx.translate(gx, gy-10); ctx.rotate(anguloAspas);
                ctx.drawImage(Sprites.imgA, -45, -45, 90, 90); ctx.restore();
            }
            // Disparo Molino
            if(e.tAtaque > 250) {
                entidades.proyectiles.push({ x: gx, y: gy, vy: 5, s: 20, img: 'imgF' });
                e.tAtaque = 0;
            }
        } else {
            // Render Gigantes N2/N3
            let sx = (tickAnim === 0 ? 2048 : 3072);
            if(e.tAtaque > 150) sx = 0; // Alzar
            if(e.tAtaque > 180) {
                sx = 1024; // Lanzar
                if(e.tAtaque === 181) entidades.proyectiles.push({ x: gx, y: gy, vy: 6, s: 25, img: 'imgR' });
            }
            if(e.tAtaque > 200) e.tAtaque = 0;
            if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, sx, 0, 1024, 1300, gx-35, gy-45, 70, 90);
        }
    });

    // 6. QUIJOTE
    if(teclas['ArrowLeft'] && quijote.x > 50) { quijote.x -= 7; quijote.dir = -1; }
    if(teclas['ArrowRight'] && quijote.x < 750) { quijote.x += 7; quijote.dir = 1; }
    ctx.save(); ctx.translate(quijote.x, quijote.y);
    if(quijote.dir === -1) ctx.scale(-1, 1);
    if(Sprites.imgQ.listo) ctx.drawImage(Sprites.imgQ, (teclas['ArrowLeft']||teclas['ArrowRight']?0:480), 0, 480, 440, -50, -45, 100, 92);
    ctx.restore();

    // 7. BALÍSTICA Y COLISIONES (CORREGIDO)
    // Lanzas del Quijote
    entidades.lanzas.forEach((l, lIdx) => {
        l.y -= 10;
        ctx.fillStyle = "gold"; ctx.fillRect(l.x-2, l.y, 4, 20);
        
        // Colisión con enemigos
        entidades.enemigos.forEach(e => {
            if(!e.activo) return;
            let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
            // Caja de colisión generosa
            if(l.x > gx-35 && l.x < gx+35 && l.y > gy-40 && l.y < gy+40) {
                e.activo = false;
                entidades.lanzas.splice(lIdx, 1);
            }
        });
        if(l.y < 0) entidades.lanzas.splice(lIdx, 1);
    });

    // Proyectiles Enemigos
    entidades.proyectiles.forEach((p, pIdx) => {
        p.y += p.vy;
        if(Sprites[p.img] && Sprites[p.img].listo) ctx.drawImage(Sprites[p.img], p.x-p.s/2, p.y-p.s/2, p.s, p.s);
        
        // Colisión con Quijote
        if(p.x > quijote.x-30 && p.x < quijote.x+30 && p.y > quijote.y-30 && p.y < quijote.y+30) {
            quijote.vidas--;
            entidades.proyectiles.splice(pIdx, 1);
            if(quijote.vidas <= 0) activo = false;
        }
        if(p.y > 600) entidades.proyectiles.splice(pIdx, 1);
    });

    // 8. HUD
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    
    // Condición de Victoria
    if(entidades.enemigos.every(e => !e.activo)) {
        activo = false;
        if(typeof Interfaz !== 'undefined') Interfaz.mostrarMenuFinal("VICTORIA", "¡Gesta lograda!", true, null, {vidas: quijote.vidas, tiempo: tiempoRestante});
    }

    requestAnimationFrame(loop);
}

canvas.addEventListener('click', () => { if(!activo) iniciar(); });
requestAnimationFrame(loop);
