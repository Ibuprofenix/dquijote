/** * MOTOR DE JUEGO: NIVEL 2 (LA HORDA) - VERSIÓN ANTI-PANTALLAZO AZUL
 * Asegúrate de que este archivo se llame: motor2.js
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables de estado
let quijote = { x: 400, y: 530, vidas: 3 };
let sancho = { x: -100, y: 530, activo: false, yaAparecio: false, entregado: false };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 1.2, tiempoRestante = 100, timerInterval;

// --- SISTEMA DE PRECARGA CRÍTICA ---
let imagenesCargadas = 0;
const totalImagenes = 5;
const nombresImagenes = [
    'sprites_quijote.png',
    'sprites_gigantes.png',
    'sprites_sancho.png',
    'sprites_roca.png',
    'sprites_vida.png'
];

const imgQ = new Image();
const imgG = new Image();
const imgS = new Image();
const imgR = new Image();
const imgV = new Image();

function verificarCarga() {
    imagenesCargadas++;
    console.log(`Cargando imagen ${imagenesCargadas}/${totalImagenes}...`);
    if (imagenesCargadas === totalImagenes) {
        console.log("Éxito: Todas las imágenes cargadas. Iniciando Nivel 2.");
        spawnEnemigos();
        requestAnimationFrame(loop);
    }
}

// Configuración de rutas y eventos de carga
imgQ.onload = verificarCarga; imgQ.src = nombresImagenes[0];
imgG.onload = verificarCarga; imgG.src = nombresImagenes[1];
imgS.onload = verificarCarga; imgS.src = nombresImagenes[2];
imgR.onload = verificarCarga; imgR.src = nombresImagenes[3];
imgV.onload = verificarCarga; imgV.src = nombresImagenes[4];

// Manejo de errores (si una imagen falla, te avisará en la consola F12)
imgQ.onerror = () => console.error("Error cargando Quijote. Revisa el nombre del archivo.");
imgG.onerror = () => console.error("Error cargando Gigantes. Revisa el nombre del archivo.");

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
    // Solo dibujamos si Interfaz está cargado
    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarEscenario(ctx);
    } else {
        // Fondo de emergencia si falla interfaz.js
        ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,800,600);
    }
    
    // Lógica Sancho Panza (Ayuda al hidalgo)
    if (quijote.vidas === 1 && !sancho.yaAparecio) {
        sancho.activo = true;
        sancho.yaAparecio = true;
    }

    if (sancho.activo) {
        if (!sancho.entregado) {
            sancho.x += 3;
            if (sancho.x > 150) sancho.entregado = true;
        } else {
            sancho.x -= 3;
            if (sancho.x < -100) sancho.activo = false;
        }
        ctx.drawImage(imgS, 0, 0, 1024, 1024, sancho.x, 480, 100, 100);
        if (sancho.entregado && sancho.x > 0) {
            ctx.drawImage(imgV, 150, 530, 40, 40);
            if (Math.abs(quijote.x - 150) < 40) { 
                quijote.vidas = 3;
                sancho.entregado = false;
            }
        }
    }

    // Lógica de la Horda de Gigantes
    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            if(Math.random() < 0.003) proyectiles.push({ x: e.x, y: e.y });
        }
        // Renderizado del Gigante
        ctx.drawImage(imgG, 2048, 0, 1024, 1300, e.x - 40, e.y - 50, 80, 100);
    });

    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 25); }

    if(activo) {
        if(teclas['ArrowLeft']) quijote.x -= 8;
        if(teclas['ArrowRight']) quijote.x += 8;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
        ctx.drawImage(imgQ, fx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // Lanzas del Quijote
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

        // Proyectiles de los Gigantes (Rocas)
        proyectiles.forEach((p, i) => {
            p.y += 5;
            ctx.drawImage(imgR, p.x - 15, p.y - 15, 30, 30);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Los gigantes te han derrotado!");
            }
            if(p.y > 600) proyectiles.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Camino despejado para el caballero!");
    } else {
        // Pantalla de pausa inicial
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "bold 30px 'Almendra'";
        ctx.fillText("PULSA ESPACIO PARA ENFRENTAR LA HORDA", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    }
    
    requestAnimationFrame(loop);
}

// Control de teclas global
const teclas = {};
window.addEventListener('keydown', (e) => teclas[e.key] = true);
window.addEventListener('keyup', (e) => teclas[e.key] = false);
