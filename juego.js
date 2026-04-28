/** * QUIJOTE INVADERS - MOTOR UNIFICADO DEFINITIVO
 * Soporta Nivel 1, 2 y 3 en un solo archivo.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO GLOBAL ---
let nivelActual = 1;
let activo = false;
let juegoTerminado = false;
let tiempoRestante = 120;
let tickAnim = 0;
let hDir = 1;
let gigantesDerrotados = 0;

// Entidades
let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false, timerPower: 0 };
let boss = { x: 340, y: 15, hp: 100, dir: 1, estado: 0, fase: 1 };
let sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };
let horda = { x: 0, y: 100, dir: 1, vel: 0.8 };

let entidades = {
    enemigos: [],
    proyectiles: [],
    lanzas: [],
    trizas: [],
    ayudas: []
};

// --- CONFIGURACIÓN DE NIVELES ---
const CONFIG = {
    1: { vel: 1.0, hp: 1, proyectil: 'imgF', color: '#87CEEB' }, // Molinos
    2: { vel: 1.4, hp: 2, proyectil: 'imgR', color: '#ff8c00' }, // Gigantes
    3: { vel: 0.8, hp: 3, proyectil: 'imgR', color: '#2c1654' }  // Boss + Horda
};

// --- PRECARGA DE IMÁGENES ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', 
    imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', 
    imgS: 'sprites_sancho.png',
    imgM: 'sprites_molino.png',
    imgA: 'sprites_aspas.png'
};

Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image();
    Sprites[key].src = src;
    Sprites[key].onload = () => { Sprites[key].listo = true; };
    Sprites[key].onerror = () => { console.warn("No se pudo cargar:", src); };
});

// --- INPUTS ---
const teclas = {};
window.onkeydown = (e) => { 
    teclas[e.key] = true; 
    if(e.key === " " && activo && !juegoTerminado) dispararLanza();
};
window.onkeyup = (e) => teclas[e.key] = false;

function dispararLanza() {
    const sonido = quijote.powerUp;
    entidades.lanzas.push({ 
        x: quijote.x, 
        y: quijote.y - 30, 
        super: quijote.powerUp, 
        eliminar: false 
    });
    if(quijote.powerUp && nivelActual === 3) { // Doble lanza en Boss
        entidades.lanzas.push({ x: quijote.x + 20, y: quijote.y - 30, super: true, eliminar: false });
    }
}

// --- LÓGICA DE INICIO ---
function iniciar() {
    const claseBody = document.body.className;
    nivelActual = claseBody.includes('nivel2') ? 2 : (claseBody.includes('nivel3') ? 3 : 1);
    
    activo = true;
    juegoTerminado = false;
    quijote.vidas = 3;
    quijote.powerUp = false;
    tiempoRestante = (nivelActual === 3) ? 120 : 100;
    gigantesDerrotados = 0;
    
    entidades = { enemigos: [], proyectiles: [], lanzas: [], trizas: [], ayudas: [] };
    
    // Crear enemigos iniciales
    let filas = (nivelActual === 3) ? 2 : 3;
    let cols = 8;
    for(let f=0; f<filas; f++) {
        for(let c=0; c<cols; c++) {
            entidades.enemigos.push({
                xRel: 100 + (c * 85),
                yRel: 80 + (f * 100),
                hp: CONFIG[nivelActual].hp,
                fila: f,
                activo: true,
                estado: 0,
                timerRegen: 0
            });
        }
    }

    if(window.timerInt) clearInterval(window.timerInt);
    window.timerInt = setInterval(() => {
        if(!activo) return;
        tickAnim = (tickAnim + 1) % 2;
        tiempoRestante--;
        
        // IA disparos
        entidades.enemigos.forEach(e => {
            if(e.activo && Math.random() < 0.01) {
                entidades.proyectiles.push({ x: e.xRel + horda.x, y: e.yRel + horda.y, s: 30, tipo: CONFIG[nivelActual].proyectil });
            }
        });

        if(nivelActual === 3 && Math.random() < 0.2) {
            entidades.proyectiles.push({ x: boss.x + 50, y: boss.y + 100, s: 50, tipo: 'imgR', boss: true });
        }

        if(tiempoRestante <= 0) fin(false, "¡El tiempo ha expirado!");
    }, 600);
}

function fin(victoria, msg) {
    activo = false;
    juegoTerminado = true;
    clearInterval(window.timerInt);
    if(typeof Interfaz !== 'undefined') {
        Interfaz.mostrarMenuFinal(victoria ? "¡GESTA LOGRADA!" : "¡DERROTA!", msg, victoria, null, { vidas: quijote.vidas, tiempo: tiempoRestante });
    }
    const btn = document.getElementById('btnAccion');
    if(btn) {
        btn.style.display = "block";
        btn.innerText = victoria ? "AVANZAR" : "REINTENTAR";
        btn.onclick = () => {
            if(victoria && typeof avanzarNivel === 'function') avanzarNivel();
            else location.reload();
        };
    }
}

// --- BUCLE PRINCIPAL ---
function loop() {
    // 1. Fondo (seguridad ante negro)
    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarEscenario(ctx);
    } else {
        ctx.fillStyle = CONFIG[nivelActual]?.color || "#000";
        ctx.fillRect(0, 0, 800, 600);
    }

    if(!activo && !juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "25px 'Almendra'";
        ctx.fillText("HAZ CLIC PARA COMENZAR LA BATALLA", 400, 300);
        requestAnimationFrame(loop);
        return;
    }

    // 2. Movimiento Quijote
    if(teclas['ArrowLeft'] && quijote.x > 50) { quijote.x -= 8; quijote.dir = -1; }
    if(teclas['ArrowRight'] && quijote.x < 750) { quijote.x += 8; quijote.dir = 1; }

    // Dibujar Quijote
    ctx.save();
    ctx.translate(quijote.x, quijote.y);
    if(quijote.dir === -1) ctx.scale(-1, 1);
    if(Sprites.imgQ.listo) {
        ctx.drawImage(Sprites.imgQ, (teclas['ArrowLeft']||teclas['ArrowRight']?0:480), 0, 480, 440, -50, -45, 100, 92);
    } else {
        ctx.fillStyle = "white"; ctx.fillRect(-20, -40, 40, 80); // Reserva
    }
    ctx.restore();

    // 3. Enemigos (Horda / Boss)
    horda.x += CONFIG[nivelActual].vel * horda.dir;
    if(horda.x > 40 || horda.x < -40) { horda.dir *= -1; horda.y += 15; }

    if(nivelActual === 3) {
        // Boss
        boss.x += (boss.fase === 2 ? 6 : 4) * boss.dir;
        if(boss.x < 20 || boss.x > 680) boss.dir *= -1;
        if(Sprites.imgG.listo) {
            ctx.save();
            if(boss.fase === 2) ctx.filter = "hue-rotate(-50deg) drop-shadow(0 0 10px red)";
            ctx.drawImage(Sprites.imgG, tickAnim*1024, 0, 1024, 1300, boss.x, boss.y, 110, 140);
            ctx.restore();
        }
    }

    entidades.enemigos.forEach(e => {
        if(!e.activo) return;
        let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
        
        if(Sprites.imgG.listo || Sprites.imgM.listo) {
            if(nivelActual === 1) {
                ctx.drawImage(Sprites.imgM, gx-45, gy-45, 90, 90);
            } else {
                let sx = (e.fila % 2 === tickAnim ? 0 : 1024);
                ctx.drawImage(Sprites.imgG, sx, 0, 1024, 1300, gx-35, gy-45, 70, 90);
            }
        } else {
            ctx.fillStyle = "red"; ctx.fillRect(gx-20, gy-20, 40, 40);
        }
    });

    // 4. Lanzas y Colisiones
    entidades.lanzas.forEach(l => {
        l.y -= 12;
        ctx.fillStyle = l.super ? "cyan" : "yellow";
        ctx.fillRect(l.x-2, l.y, 4, 25);

        // Colisión Boss
        if(nivelActual === 3 && l.x > boss.x && l.x < boss.x + 110 && l.y < boss.y + 130) {
            boss.hp -= l.super ? 2 : 1; l.eliminar = true;
            if(boss.hp <= 0) fin(true, "¡Has derrotado al Gigante Supremo!");
        }

        // Colisión Horda
        entidades.enemigos.forEach(e => {
            if(!e.activo) return;
            let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
            if(Math.abs(l.x - gx) < 40 && Math.abs(l.y - gy) < 40) {
                e.hp -= l.super ? 3 : 1; l.eliminar = true;
                if(e.hp <= 0) { 
                    e.activo = false; 
                    gigantesDerrotados++;
                    if(nivelActual === 2 && gigantesDerrotados === 3) quijote.powerUp = true;
                }
            }
        });
    });

    // 5. Proyectiles
    entidades.proyectiles.forEach(p => {
        p.y += 6;
        if(Sprites.imgR.listo) ctx.drawImage(Sprites.imgR, p.x-p.s/2, p.y-p.s/2, p.s, p.s);
        else { ctx.fillStyle = "brown"; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 7); ctx.fill(); }

        if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
            quijote.vidas--; p.eliminar = true;
            if(quijote.vidas <= 0) fin(false, "¡Has caído!");
        }
    });

    // Limpieza
    entidades.lanzas = entidades.lanzas.filter(l => !l.eliminar && l.y > -50);
    entidades.proyectiles = entidades.proyectiles.filter(p => !p.eliminar && p.y < 650);

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    
    if(entidades.enemigos.every(e => !e.activo) && (nivelActual < 3 || boss.hp <= 0)) {
        fin(true, "¡Victoria absoluta!");
    }

    requestAnimationFrame(loop);
}

// Arrancar bucle
requestAnimationFrame(loop);
