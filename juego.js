/** * QUIJOTE INVADERS - MOTOR UNIFICADO DEFINITIVO (NIVEL 1, 2 Y 3)
 * Incluye: Boss N3, Sancho, Power-ups, Trizas y Sistema Anti-Fallo.
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- VARIABLES DE ESTADO ---
let nivelActual = 1;
let activo = false;
let juegoTerminado = false;
let tiempoRestante = 100;
let tickAnim = 0;
let hDir = 1;

// Entidades
let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false, timerPower: 0 };
let boss = { x: 340, y: 15, hp: 100, dir: 1, estado: 0, fase: 1 };
let sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };
let horda = { x: 0, y: 100, dir: 1, vel: 1.0 };

let entidades = {
    enemigos: [],
    proyectiles: [],
    lanzas: [],
    trizas: [],
    ayudas: []
};

// --- CONFIGURACIÓN DE NIVEL ---
const CONFIG = {
    1: { vel: 1.0, hp: 1, color: "#87CEEB", msg: "MOLINOS DE CRIPTANA" },
    2: { vel: 1.5, hp: 2, color: "#ff8c00", msg: "LA HORDA DE GIGANTES" },
    3: { vel: 0.8, hp: 3, color: "#2c1654", msg: "EL DUELO FINAL" }
};

// --- CARGA DE ASSETS ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', 
    imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', 
    imgS: 'sprites_sancho.png',
    imgM: 'sprites_molino.png'
};

Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image();
    Sprites[key].src = src;
    Sprites[key].onload = () => { Sprites[key].listo = true; };
});

// --- ENTRADA DE USUARIO ---
const teclas = {};
window.onkeydown = (e) => { 
    teclas[e.key] = true; 
    if(e.key === " " && activo && !juegoTerminado) dispararLanza();
};
window.onkeyup = (e) => teclas[e.key] = false;

function dispararLanza() {
    entidades.lanzas.push({ 
        x: quijote.x, y: quijote.y - 20, 
        super: quijote.powerUp, eliminar: false 
    });
    // Si tiene powerUp en nivel 3, lanza doble
    if(quijote.powerUp && nivelActual === 3) {
        entidades.lanzas.push({ x: quijote.x + 20, y: quijote.y - 20, super: true, eliminar: false });
    }
}

// --- MECÁNICAS DE JUEGO ---
function iniciar() {
    const claseBody = document.body.className;
    nivelActual = claseBody.includes('nivel2') ? 2 : (claseBody.includes('nivel3') ? 3 : 1);
    
    activo = true;
    juegoTerminado = false;
    quijote.vidas = 3;
    tiempoRestante = (nivelActual === 3) ? 120 : 100;
    
    entidades = { enemigos: [], proyectiles: [], lanzas: [], trizas: [], ayudas: [] };
    
    // Generar Horda
    let filas = (nivelActual === 3) ? 2 : 3;
    for(let f=0; f<filas; f++) {
        for(let c=0; c<8; c++) {
            entidades.enemigos.push({
                xRel: 100 + (c * 85), yRel: 50 + (f * 100),
                hp: CONFIG[nivelActual].hp, activo: true, fila: f
            });
        }
    }

    if(window.timerInt) clearInterval(window.timerInt);
    window.timerInt = setInterval(() => {
        if(!activo || juegoTerminado) return;
        tickAnim = (tickAnim + 1) % 2;
        tiempoRestante--;

        // Ataques enemigos
        entidades.enemigos.forEach(e => {
            if(e.activo && Math.random() < 0.02) {
                entidades.proyectiles.push({ x: e.xRel + horda.x, y: e.yRel + horda.y, s: 25 });
            }
        });

        if(nivelActual === 3 && Math.random() < 0.3) {
            entidades.proyectiles.push({ x: boss.x + 50, y: boss.y + 100, s: 50, boss: true });
        }

        if(tiempoRestante <= 0) fin(false, "¡El sol se ha puesto!");
    }, 600);
}

function fin(victoria, msg) {
    activo = false;
    juegoTerminado = true;
    clearInterval(window.timerInt);
    if(typeof Interfaz !== 'undefined') {
        Interfaz.mostrarMenuFinal(victoria ? "¡VICTORIA!" : "¡DERROTA!", msg, victoria, null, { vidas: quijote.vidas, tiempo: tiempoRestante });
    }
    const btn = document.getElementById('btnAccion');
    if(btn) {
        btn.style.display = "block";
        btn.innerText = victoria ? "SIGUIENTE GESTA" : "REINTENTAR";
        btn.onclick = () => {
            if(victoria && typeof avanzarNivel === 'function') avanzarNivel();
            else location.reload();
        };
    }
}

// --- BUCLE DE RENDERIZADO ---
function loop() {
    // Dibujar Fondo
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);
    else { ctx.fillStyle = CONFIG[nivelActual].color; ctx.fillRect(0,0,800,600); }

    if(!activo && !juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 25px Almendra";
        ctx.fillText("HAZ CLIC PARA COMENZAR", 400, 300);
        requestAnimationFrame(loop);
        return;
    }

    // Movimiento Quijote
    if(teclas['ArrowLeft'] && quijote.x > 50) { quijote.x -= 8; quijote.dir = -1; }
    if(teclas['ArrowRight'] && quijote.x < 750) { quijote.x += 8; quijote.dir = 1; }

    // Render Quijote
    ctx.save();
    ctx.translate(quijote.x, quijote.y);
    if(quijote.dir === -1) ctx.scale(-1, 1);
    if(Sprites.imgQ.listo) {
        ctx.drawImage(Sprites.imgQ, (teclas['ArrowLeft']||teclas['ArrowRight']?0:480), 0, 480, 440, -50, -45, 100, 92);
    } else {
        ctx.fillStyle = "white"; ctx.fillRect(-20, -40, 40, 80); // Rectángulo de emergencia
    }
    ctx.restore();

    // Horda y Boss
    horda.x += horda.vel * horda.dir;
    if(horda.x > 50 || horda.x < -50) { horda.dir *= -1; horda.y += 10; }

    if(nivelActual === 3) {
        boss.x += (boss.fase === 2 ? 6 : 4) * boss.dir;
        if(boss.x < 20 || boss.x > 680) boss.dir *= -1;
        if(boss.hp < 50) boss.fase = 2;
        
        ctx.save();
        if(boss.fase === 2) ctx.filter = "hue-rotate(-50deg) drop-shadow(0 0 10px red)";
        if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, tickAnim*1024, 0, 1024, 1300, boss.x, boss.y, 120, 150);
        ctx.restore();
    }

    entidades.enemigos.forEach(e => {
        if(!e.activo) return;
        let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
        if(nivelActual === 1 && Sprites.imgM.listo) {
            ctx.drawImage(Sprites.imgM, gx-45, gy-45, 90, 90);
        } else if(Sprites.imgG.listo) {
            ctx.drawImage(Sprites.imgG, (e.fila%2===tickAnim?0:1024), 0, 1024, 1300, gx-35, gy-45, 70, 90);
        } else {
            ctx.fillStyle = "red"; ctx.fillRect(gx-25, gy-25, 50, 50);
        }
    });

    // Lanzas y Colisiones
    entidades.lanzas.forEach(l => {
        l.y -= 12;
        ctx.fillStyle = l.super ? "cyan" : "gold";
        ctx.fillRect(l.x-2, l.y, 4, 25);

        if(nivelActual === 3 && l.y < boss.y + 130 && l.x > boss.x && l.x < boss.x + 120) {
            boss.hp -= l.super ? 2 : 1; l.eliminar = true;
            if(boss.hp <= 0) fin(true, "¡El Gigante Supremo ha caído!");
        }

        entidades.enemigos.forEach(e => {
            if(!e.activo) return;
            let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
            if(Math.abs(l.x - gx) < 40 && Math.abs(l.y - gy) < 40) {
                e.hp--; l.eliminar = true;
                if(e.hp <= 0) { e.activo = false; if(nivelActual===2) quijote.powerUp = true; }
            }
        });
    });

    // Proyectiles
    entidades.proyectiles.forEach(p => {
        p.y += 6;
        if(Sprites.imgR.listo) ctx.drawImage(Sprites.imgR, p.x-p.s/2, p.y-p.s/2, p.s, p.s);
        else { ctx.fillStyle = "brown"; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 7); ctx.fill(); }

        if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
            quijote.vidas--; p.eliminar = true;
            if(quijote.vidas <= 0) fin(false, "¡Has sido derrotado!");
        }
    });

    // Sancho (Nivel 3)
    if(nivelActual === 3 && quijote.vidas === 1 && !sancho.yaAparecio) {
        sancho.activo = true; sancho.yaAparecio = true; sancho.estado = 'entrando';
    }
    if(sancho.activo) {
        if(sancho.estado === 'entrando') { sancho.x += 4; if(sancho.x > 100) sancho.estado = 'espera'; }
        if(Sprites.imgS.listo) ctx.drawImage(Sprites.imgS, sancho.x, 480, 100, 100);
    }

    // HUD y Limpieza
    entidades.lanzas = entidades.lanzas.filter(l => !l.eliminar && l.y > -50);
    entidades.proyectiles = entidades.proyectiles.filter(p => !p.eliminar && p.y < 650);

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    
    if(entidades.enemigos.every(e => !e.activo) && (nivelActual < 3 || boss.hp <= 0)) {
        fin(true, "¡Gesta completada!");
    }

    requestAnimationFrame(loop);
}

// Iniciar el ciclo de dibujo inmediatamente
requestAnimationFrame(loop);
