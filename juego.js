/** * QUIJOTE INVADERS - MOTOR UNIFICADO DEFINITIVO
 * Integración total: Halo N1, Animación N2/N3, Daño Color y Boss Letal.
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- VARIABLES DE ESTADO Y ESTÉTICA ---
let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false, timerArma: 0 };
let boss = { x: 340, y: 15, hp: 100, dir: 1, estado: 0, fase: 1 }; 
let sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };
let horda = { x: 0, y: 100, dir: 1, vel: 0.8 };
let entidades = { enemigos: [], proyectiles: [], lanzas: [], trizas: [], ayudas: [] };

let activo = false, juegoTerminado = false;
let nivelActual = 1, tiempoRestante = 120;
let tickAnim = 0, frameTimer = 0, gigantesDerrotados = 0;
let anguloAspas = 0; // Rotación Nivel 1

// --- CONFIGURACIÓN DE NIVEL ---
const CONFIG = {
    1: { hp: 1, sprite: 'imgM', proyectil: 'imgF', color: '#87CEEB', fps: 15 },
    2: { hp: 2, sprite: 'imgG', proyectil: 'imgR', color: '#ff8c00', fps: 12 },
    3: { hp: 3, sprite: 'imgG', proyectil: 'imgR', color: '#2c1654', fps: 8 }
};

// --- PRECARGA DE ASSETS ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', imgS: 'sprites_sancho.png',
    imgM: 'sprites_molino.png', imgA: 'sprites_aspas.png', imgF: 'sprites_rafaga.png'
};

Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image(); Sprites[key].src = src;
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
    entidades.lanzas.push({ x: quijote.x, y: quijote.y - 20, super: quijote.powerUp, eliminar: false });
    if(quijote.powerUp && nivelActual === 3) {
        entidades.lanzas.push({ x: quijote.x + 20, y: quijote.y - 20, super: true, eliminar: false });
    }
}

// --- LÓGICA DE INICIO ---
function iniciar() {
    const claseBody = document.body.className;
    nivelActual = claseBody.includes('nivel2') ? 2 : (claseBody.includes('nivel3') ? 3 : 1);
    
    activo = true; juegoTerminado = false;
    quijote.vidas = 3; quijote.powerUp = false;
    tiempoRestante = (nivelActual === 3) ? 120 : 100;
    gigantesDerrotados = 0; horda.y = 100;
    
    entidades = { enemigos: [], proyectiles: [], lanzas: [], trizas: [], ayudas: [] };
    
    // Generar Horda
    let filas = (nivelActual === 3) ? 2 : 3;
    for(let f=0; f<filas; f++) {
        for(let c=0; c<8; c++) {
            entidades.enemigos.push({
                xRel: 100 + (c * 85), yRel: f * 100,
                hp: CONFIG[nivelActual].hp, activo: true, fila: f,
                estado: 0, // 0: Caminar, 1: Aviso/Alzar, 2: Lanzar
                timerAtaque: 0, haloTimer: 0
            });
        }
    }

    if(window.timerInt) clearInterval(window.timerInt);
    window.timerInt = setInterval(() => {
        if(!activo || juegoTerminado) return;
        tiempoRestante--;
        if(tiempoRestante <= 0) fin(false, "¡El sol se ha puesto!");
    }, 1000);
}

function fin(victoria, msg) {
    activo = false; juegoTerminado = true;
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

// --- BUCLE PRINCIPAL (RENDER Y LÓGICA DE FRECUENCIA) ---
function loop() {
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarEscenario(ctx);
    else { ctx.fillStyle = CONFIG[nivelActual].color; ctx.fillRect(0,0,800,600); }

    frameTimer++;
    if(frameTimer % CONFIG[nivelActual].fps === 0) tickAnim = 1 - tickAnim; // Velocidad de animación por nivel

    if(!activo && !juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 25px Almendra";
        ctx.fillText("HAZ CLIC PARA COMENZAR", 400, 300);
        requestAnimationFrame(loop);
        return;
    }

    // 1. QUIJOTE
    if(teclas['ArrowLeft'] && quijote.x > 50) { quijote.x -= 8; quijote.dir = -1; }
    if(teclas['ArrowRight'] && quijote.x < 750) { quijote.x += 8; quijote.dir = 1; }
    
    ctx.save();
    ctx.translate(quijote.x, quijote.y);
    if(quijote.dir === -1) ctx.scale(-1, 1);
    if(quijote.powerUp) ctx.filter = "drop-shadow(0 0 10px cyan) brightness(1.2)";
    if(Sprites.imgQ.listo) {
        ctx.drawImage(Sprites.imgQ, (teclas['ArrowLeft']||teclas['ArrowRight']?0:480), 0, 480, 440, -50, -45, 100, 92);
    }
    ctx.restore();

    // 2. HORDA Y BOSS
    horda.x += (nivelActual === 3 ? 0.6 : 1.2) * hDir;
    if(horda.x > 50 || horda.x < -50) { horda.dir *= -1; horda.y += 15; }

    if(nivelActual === 3) {
        // Boss Letal
        boss.x += (boss.fase === 2 ? 7 : 4.5) * boss.dir;
        if(boss.x < 20 || boss.x > 680) boss.dir *= -1;
        
        ctx.save();
        if(boss.fase === 2) ctx.filter = "hue-rotate(-50deg) drop-shadow(0 0 10px red)";
        if(Sprites.imgG.listo) ctx.drawImage(Sprites.imgG, (Math.random()<0.3?1024:2048), 0, 1024, 1300, boss.x, boss.y, 120, 150);
        ctx.restore();
        
        // Disparo Boss
        if(Math.random() < 0.03) {
            entidades.proyectiles.push({ x: boss.x + 60, y: boss.y + 120, s: 60, boss: true });
        }
    }

    // LÓGICA Y RENDER ENEMIGOS COORDINADOS
    entidades.enemigos.forEach(e => {
        if(!e.activo) return;
        let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
        e.timerAtaque++;

        // A. Lógica Nivel 1 (Halo)
        if(nivelActual === 1) {
            e.haloTimer = (e.timerAtaque > 180) ? (e.haloTimer + 1) % 10 : 0;
            if(Sprites.imgM.listo) {
                // Halo de aviso
                if(e.haloTimer > 5) {
                    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.beginPath(); ctx.arc(gx, gy-10, 50, 0, 7); ctx.fill();
                }
                ctx.drawImage(Sprites.imgM, gx-40, gy-20, 80, 80);
                // Aspas rotatorias
                if(Sprites.imgA.listo) {
                    ctx.save(); ctx.translate(gx, gy-10); anguloAspas += 0.01; ctx.rotate(anguloAspas);
                    ctx.drawImage(Sprites.imgA, -45, -45, 90, 90); ctx.restore();
                }
            }
            if(e.timerAtaque > 240) { // Disparo N1
                entidades.proyectiles.push({ x: gx, y: gy, s: 20 }); e.timerAtaque = 0;
            }
        }

        // B. Lógica Nivel 2 y 3 (Animación Coordinada)
        if(nivelActual > 1) {
            // Sincronización del ataque: alzan la mano juntos
            if(e.timerAtaque > 300) e.estado = 1; // Alzar mano
            if(e.timerAtaque > 360) e.estado = 2; // Lanzar
            if(e.timerAtaque > 400) { e.estado = 0; e.timerAtaque = 0; } // Caminar

            if(Sprites.imgG.listo) {
                let sx = 0;
                if(e.estado === 0) sx = (e.fila%2===tickAnim ? 3072 : 2048); // Frames 3 y 4 (Caminar)
                if(e.estado === 1) sx = 0; // Frame 1 (Alzar)
                if(e.estado === 2) { // Frame 2 (Lanzar)
                    sx = 1024; 
                    if(e.timerAtaque === 361) { // Spawn proyectil en el frame exacto
                        entidades.proyectiles.push({ x: gx, y: gy, s: 30 });
                    }
                }

                ctx.save();
                // Filtros de daño (Cambio de color)
                if(e.hp === 2) ctx.filter = "brightness(0.6)"; 
                if(e.hp === 1) ctx.filter = "hue-rotate(-50deg) brightness(0.4)";
                ctx.drawImage(Sprites.imgG, sx, 0, 1024, 1300, gx-35, gy-45, 70, 90);
                ctx.restore();
            }
        }
    });

    // 3. PROYECTILES Y COLISIONES
    entidades.proyectiles.forEach(p => {
        p.y += (p.boss ? 8 : 6);
        if(p.boss && Sprites.imgR.listo) {
            ctx.drawImage(Sprites.imgR, p.x-p.s/2, p.y-p.s/2, p.s, p.s);
        } else if(nivelActual === 1 && Sprites.imgF.listo) {
            ctx.drawImage(Sprites.imgF, p.x-p.s/2, p.y-p.s/2, p.s, p.s);
        } else if(Sprites.imgR.listo) {
            ctx.drawImage(Sprites.imgR, p.x-15, p.y-15, 30, 30);
        }

        if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
            if(p.boss) quijote.vidas = 0; else quijote.vidas--; // Boss letal
            p.eliminar = true;
            if(quijote.vidas <= 0) fin(false, p.boss ? "¡El Gigante te ha aplastado!" : "¡Has caído!");
        }
    });

    // 4. LANZAS Y POWER-UPS
    if(premio && premio.visible) { // Power-up Cian (Ayuda de disparo)
        premio.y += 4; ctx.fillStyle = "cyan"; ctx.beginPath(); ctx.moveTo(premio.x, premio.y-15); ctx.lineTo(premio.x-10, premio.y); ctx.lineTo(premio.x+10, premio.y); ctx.fill();
        if(Math.abs(quijote.x - premio.x) < 40 && Math.abs(quijote.y - premio.y) < 40) {
            premio.visible = false; quijote.powerUp = true;
            setTimeout(() => quijote.powerUp = false, 10000); // 10s de duración
        }
    }

    entidades.lanzas.forEach(l => {
        l.y -= 12; ctx.fillStyle = l.super ? "cyan" : "gold"; ctx.fillRect(l.x-2, l.y, 4, 25);
        // Colisión Boss
        if(nivelActual === 3 && l.x > boss.x && l.x < boss.x + 120 && l.y < boss.y + 130) {
            boss.hp -= l.super ? 2 : 1; l.eliminar = true;
            if(boss.hp <= 0) fin(true, "¡Has derrotado al coloso!");
        }
        // Colisión Horda
        entidades.enemigos.forEach(e => {
            if(!e.activo) return;
            let gx = e.xRel + horda.x, gy = e.yRel + horda.y;
            if(Math.abs(l.x - gx) < 40 && Math.abs(l.y - gy) < 40) {
                e.hp--; l.eliminar = true;
                if(e.hp <= 0) {
                    e.activo = false; gigantesDerrotados++;
                    if(nivelActual === 2 && gigantesDerrotados === 3) premio = { x: gx, y: gy, visible: true };
                }
            }
        });
    });

    // 5. SANCHO (Aparición 1 vida)
    if(nivelActual === 3 && quijote.vidas === 1 && !sancho.yaAparecio) {
        sancho.activo = true; sancho.yaAparecio = true; sancho.estado = 'entrando';
    }
    if(sancho.activo) {
        if(sancho.estado === 'entrando') { sancho.x += 4; if(sancho.x > 100) sancho.estado = 'espera'; }
        if(Sprites.imgS.listo) ctx.drawImage(Sprites.imgS, sancho.x, 480, 100, 100);
    }

    // LIMPIEZA
    entidades.lanzas = entidades.lanzas.filter(l => !l.eliminar && l.y > -50);
    entidades.proyectiles = entidades.proyectiles.filter(p => !p.eliminar && p.y < 650);

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    if(entidades.enemigos.every(e => !e.activo) && (nivelActual < 3 || boss.hp <= 0)) {
        fin(true, "¡Gesta completada con honor!");
    }
    requestAnimationFrame(loop);
}

// ARRANCAR EL MOTOR INMEDIATAMENTE
requestAnimationFrame(loop);
let premio = null; // Power-up
