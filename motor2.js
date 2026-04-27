/** * MOTOR DE JUEGO: NIVEL 2 (LA HORDA) - VERSIÓN DE ARRANQUE FORZADO
 * Este motor arranca incluso si GitHub tarda en entregar las imágenes.
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables de estado
let quijote = { x: 400, y: 530, vidas: 3 };
let sancho = { x: -100, y: 530, activo: false, yaAparecio: false, entregado: false };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.2, tiempoRestante = 100, timerInterval;

// --- CARGA DE IMÁGENES ---
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgG = new Image(); imgG.src = 'sprites_gigantes.png';
const imgS = new Image(); imgS.src = 'sprites_sancho.png';
const imgR = new Image(); imgR.src = 'sprites_roca.png';
const imgV = new Image(); imgV.src = 'sprites_vida.png';

// Teclas
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
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100) });
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
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "¡El tiempo se ha agotado!");
        }
    }, 1000);
}

function fin(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    if(typeof Interfaz !== 'undefined') {
        Interfaz.mostrarMenuFinal(victoria ? "¡VICTORIA!" : "¡DERROTA!", msg, victoria, "nivel3", { vidas: quijote.vidas, tiempo: tiempoRestante });
    }
}

function loop() {
    // 1. DIBUJAR FONDO (Esto evita que se quede en azul)
    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarEscenario(ctx);
    } else {
        ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,800,600);
    }

    // 2. LÓGICA DE SANCHO
    if (quijote.vidas === 1 && !sancho.yaAparecio) { sancho.activo = true; sancho.yaAparecio = true; }
    if (sancho.activo) {
        if (!sancho.entregado) { sancho.x += 3; if (sancho.x > 150) sancho.entregado = true; }
        else { sancho.x -= 3; if (sancho.x < -100) sancho.activo = false; }
        
        if(imgS.complete && imgS.naturalWidth !== 0) {
            ctx.drawImage(imgS, 0, 0, 1024, 1024, sancho.x, 480, 100, 100);
        }
        if (sancho.entregado && sancho.x > 0) {
            if(imgV.complete) ctx.drawImage(imgV, 150, 530, 40, 40);
            if (Math.abs(quijote.x - 150) < 40) { quijote.vidas = 3; sancho.entregado = false; }
        }
    }

    // 3. LÓGICA DE GIGANTES
    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            if(Math.random() < 0.003) proyectiles.push({ x: e.x, y: e.y });
        }
        // Si la imagen no está lista, dibuja un círculo naranja (gigante provisional)
        if(imgG.complete && imgG.naturalWidth !== 0) {
            ctx.drawImage(imgG, 2048, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
        } else {
            ctx.fillStyle = "orange"; ctx.beginPath(); ctx.arc(e.x, e.y, 25, 0, Math.PI*2); ctx.fill();
        }
    });
    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 25); }

    // 4. QUIJOTE Y COMBATE
    if(activo) {
        if(teclas['ArrowLeft']) quijote.x -= 8;
        if(teclas['ArrowRight']) quijote.x += 8;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        if(imgQ.complete && imgQ.naturalWidth !== 0) {
            let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
            ctx.drawImage(imgQ, fx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);
        } else {
            ctx.fillStyle = "white"; ctx.fillRect(quijote.x-20, quijote.y-20, 40, 40);
        }

        lanzas.forEach((l, i) => {
            l.y -= 12;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 25);
            ctx.fillStyle = "white"; ctx.fillRect(l.x - 1, l.y, 2, 8);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    if(typeof Interfaz !== 'undefined') Interfaz.añadirPuntos(150);
                }
            });
            if(l.y < 0) lanzas.splice(i, 1);
        });

        proyectiles.forEach((p, i) => {
            p.y += 5;
            if(imgR.complete && imgR.naturalWidth !== 0) {
                ctx.drawImage(imgR, p.x - 15, p.y - 15, 30, 30);
            } else {
                ctx.fillStyle = "grey"; ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
            }
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Los gigantes te han derrotado!");
            }
            if(p.y > 600) proyectiles.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Camino despejado!");
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "bold 30px 'Almendra'";
        ctx.fillText("PULSA ESPACIO PARA LUCHAR", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

// Arrancamos el bucle inmediatamente
spawnEnemigos();
requestAnimationFrame(loop);
