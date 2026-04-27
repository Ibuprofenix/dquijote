/** * MOTOR DE JUEGO: NIVEL 2 (LA HORDA) - COORDINACIÓN TOTAL
 * Lógica de 4 frames, disparo sincronizado y Quijote reversible.
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3, dir: 1 };
let sancho = { x: -100, y: 530, activo: false, yaAparecio: false, entregado: false };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.2, tiempoRestante = 100, timerInterval;

// Animación: 0: Mano1 Abajo, 1: Mano1 Arriba, 2: Mano2 Abajo, 3: Mano2 Arriba
let frameGigante = 0; 

// --- CARGA DE IMÁGENES ---
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgG = new Image(); imgG.src = 'sprites_gigantes.png';
const imgS = new Image(); imgS.src = 'sprites_sancho.png';
const imgR = new Image(); imgR.src = 'sprites_roca.png';
const imgV = new Image(); imgV.src = 'sprites_vida.png';

const teclas = {};
window.addEventListener('keydown', (e) => {
    teclas[e.key] = true;
    if(e.key === " " && !activo && quijote.vidas > 0) iniciar();
    if(e.key === " " && activo) lanzas.push({x: quijote.x, y: quijote.y - 30});
});
window.addEventListener('keyup', (e) => teclas[e.key] = false);

function spawnEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), hp: 2 });
        }
    }
}

function iniciar() {
    if(typeof Interfaz !== 'undefined') Interfaz.puntuacion = 0;
    quijote.vidas = 3;
    tiempoRestante = 100;
    proyectiles = []; lanzas = [];
    sancho.yaAparecio = false; sancho.activo = false;
    spawnEnemigos();
    activo = true;
    if(timerInterval) clearInterval(timerInterval);
    
    // El intervalo controla la velocidad de la animación coordinada (cada 500ms cambia de pose)
    timerInterval = setInterval(() => {
        if(activo) {
            frameGigante = (frameGigante + 1) % 4;
            // Reducimos el tiempo real cada 2 cambios de frame (1 seg)
            if(frameGigante % 2 === 0) tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "¡El tiempo se ha agotado!");
        }
    }, 500);
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

    // LÓGICA SANCHO (Solo aparece con 1 vida)
    if (quijote.vidas === 1 && !sancho.yaAparecio) { sancho.activo = true; sancho.yaAparecio = true; }
    if (sancho.activo) {
        if (!sancho.entregado) { sancho.x += 3; if (sancho.x > 150) sancho.entregado = true; }
        else { sancho.x -= 3; if (sancho.x < -100) sancho.activo = false; }
        if(imgS.complete) ctx.drawImage(imgS, 0, 0, 1024, 1024, sancho.x, 480, 100, 100);
        if (sancho.entregado && sancho.x > 0) {
            if(imgV.complete) ctx.drawImage(imgV, 150, 530, 40, 40);
            if (Math.abs(quijote.x - 150) < 40) { quijote.vidas = 3; sancho.entregado = false; }
        }
    }

    // LÓGICA COORDINADA DE GIGANTES
    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            
            // DISPARO COORDINADO: Solo disparan si tienen la mano arriba (frames 1 o 3)
            if((frameGigante === 1 || frameGigante === 3) && Math.random() < 0.005) {
                proyectiles.push({ x: e.x, y: e.y });
            }
        }

        if(imgG.complete && imgG.naturalWidth !== 0) {
            ctx.save();
            if(e.hp === 1) ctx.filter = "brightness(40%) contrast(120%)"; // Más oscuro al recibir daño
            
            // Cálculo del sprite según el frame de 4 pasos
            // Asumiendo que en el spritesheet los gigantes están a partir de x=1024
            let sx = 1024 * (frameGigante); 
            ctx.drawImage(imgG, sx, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
            ctx.restore();
        } else {
            // Backup visual si no cargan imágenes
            ctx.fillStyle = (e.hp === 2) ? "#e67e22" : "#2c3e50";
            ctx.fillRect(e.x - 20, e.y - 25, 40, 50);
        }
    });
    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 25); }

    // LÓGICA QUIJOTE (Con efecto espejo)
    if(activo) {
        if(teclas['ArrowLeft']) { quijote.x -= 8; quijote.dir = -1; }
        if(teclas['ArrowRight']) { quijote.x += 8; quijote.dir = 1; }
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        ctx.save();
        ctx.translate(quijote.x, quijote.y);
        if(quijote.dir === -1) ctx.scale(-1, 1);
        
        if(imgQ.complete && imgQ.naturalWidth !== 0) {
            let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
            ctx.drawImage(imgQ, fx, 0, 480, 440, -50, -45, 100, 92);
        }
        ctx.restore();

        // LANZAS (Colisión de 2 toques)
        lanzas.forEach((l, i) => {
            l.y -= 12;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 25);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    e.hp--; 
                    lanzas.splice(i, 1);
                    if(e.hp <= 0) {
                        enemigos.splice(ei, 1);
                        if(typeof Interfaz !== 'undefined') Interfaz.añadirPuntos(150);
                    }
                }
            });
            if(l.y < 0) lanzas.splice(i, 1);
        });

        // ROCAS
        proyectiles.forEach((p, i) => {
            p.y += 5;
            if(imgR.complete) ctx.drawImage(imgR, p.x - 15, p.y - 15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Derrotado por la horda!");
            }
            if(p.y > 600) proyectiles.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Has vencido a la horda!");
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "
