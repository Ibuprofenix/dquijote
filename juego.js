/** * QUIJOTE INVADERS - FIX INTEGRAL DE RENDER
 * Soluciona: Estelas/recortes en pantalla, aspas invisibles y coordinación.
 **/

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- ESTADO Y CONFIGURACIÓN ---
let nivelActual = 1;
let activo = false;
let juegoTerminado = false;
let tiempoRestante = 120;
let tickAnim = 0;
let anguloAspas = 0;

let quijote = { x: 400, y: 530, vidas: 3, dir: 1, powerUp: false };
let boss = { x: 340, y: 15, hp: 100, dir: 1, fase: 1 };
let horda = { x: 0, y: 100, dir: 1, vel: 1.0 };
let entidades = { enemigos: [], proyectiles: [], lanzas: [] };

// --- IMÁGENES ---
const Sprites = {};
const rutas = { 
    imgQ: 'sprites_quijote.png', imgG: 'sprites_gigantes.png', 
    imgR: 'sprites_roca.png', imgS: 'sprites_sancho.png',
    imgM: 'sprites_molino.png', imgA: 'sprites_aspas.png'
};

Object.entries(rutas).forEach(([key, src]) => {
    Sprites[key] = new Image();
    Sprites[key].src = src;
    Sprites[key].onload = () => Sprites[key].listo = true;
});

// --- INICIO ---
function iniciar() {
    const claseBody = document.body.className;
    nivelActual = claseBody.includes('nivel2') ? 2 : (claseBody.includes('nivel3') ? 3 : 1);
    
    activo = true;
    entidades.enemigos = [];
    let filas = (nivelActual === 3) ? 2 : 3;
    for(let f=0; f<filas; f++) {
        for(let c=0; c<8; c++) {
            entidades.enemigos.push({
                xRel: 100 + (c * 85), yRel: f * 100,
                hp: nivelActual, activo: true, fila: f, timerAtaque: Math.random() * 100
            });
        }
    }
}

// --- BUCLE PRINCIPAL (ELIMINA EL FALLO DE "RECORTES") ---
function loop() {
    // 1. LIMPIEZA ABSOLUTA: Esto evita las estelas y recortes estáticos
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. FONDO (Llamada a interfaz o color sólido)
    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarEscenario(ctx);
    } else {
        const colores = { 1: "#87CEEB", 2: "#ff8c00", 3: "#2c1654" };
        ctx.fillStyle = colores[nivelActual];
        ctx.fillRect(0, 0, 800, 600);
    }

    if(!activo) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.fillText("HAZ CLIC PARA COMENZAR", 400, 300);
        requestAnimationFrame(loop);
        return;
    }

    // 3. MOVIMIENTO HORDA
    horda.x += horda.vel * horda.dir;
    if(horda.x > 60 || horda.x < -60) { horda.dir *= -1; horda.y += 10; }

    // 4. DIBUJAR ENEMIGOS (CON ASPAS CORREGIDAS)
    anguloAspas += 0.05; // Velocidad constante de giro
    
    entidades.enemigos.forEach(e => {
        if(!e.activo) return;
        let gx = e.xRel + horda.x;
        let gy = e.yRel + horda.y;

        if(nivelActual === 1) {
            // Cuerpo Molino
            if(Sprites.imgM.listo) {
                ctx.drawImage(Sprites.imgM, gx - 40, gy - 20, 80, 80);
            }
            // Aspas (Render independiente)
            if(Sprites.imgA.listo) {
                ctx.save();
                ctx.translate(gx, gy - 10); // Punto de giro: centro de las aspas
                ctx.rotate(anguloAspas);
                ctx.drawImage(Sprites.imgA, -45, -45, 90, 90);
                ctx.restore();
            }
        } else {
            // Gigantes N2 y N3
            if(Sprites.imgG.listo) {
                ctx.save();
                if(e.hp < nivelActual) ctx.filter = "brightness(0.5) sepia(1)";
                ctx.drawImage(Sprites.imgG, (tickAnim*1024), 0, 1024, 1300, gx-35, gy-45, 70, 90);
                ctx.restore();
            }
        }
    });

    // 5. QUIJOTE
    if(teclas['ArrowLeft'] && quijote.x > 50) quijote.x -= 7;
    if(teclas['ArrowRight'] && quijote.x < 750) quijote.x += 7;

    ctx.save();
    ctx.translate(quijote.x, quijote.y);
    if(Sprites.imgQ.listo) {
        ctx.drawImage(Sprites.imgQ, 480, 0, 480, 440, -50, -45, 100, 92);
    }
    ctx.restore();

    // 6. PROYECTILES Y LANZAS
    entidades.lanzas.forEach((l, idx) => {
        l.y -= 10;
        ctx.fillStyle = "yellow"; ctx.fillRect(l.x-2, l.y, 4, 20);
        if(l.y < 0) entidades.lanzas.splice(idx, 1);
    });

    // HUD y Siguiente Frame
    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}

// --- TECLADO ---
const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " ") entidades.lanzas.push({ x: quijote.x, y: quijote.y, eliminar: false });
};
window.onkeyup = (e) => teclas[e.key] = false;

// Arrancar
canvas.addEventListener('click', () => { if(!activo) iniciar(); });
requestAnimationFrame(loop);
