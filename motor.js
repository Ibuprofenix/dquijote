const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const NIVEL = document.title.includes("Nivel 1") ? 1 : (document.title.includes("Nivel 2") ? 2 : 3);

// Aplicar fondo según nivel
canvas.className = "bg-nivel" + NIVEL;

// Variables de Juego
let activo = false;
let quijote = { x: 400, y: 530, vidas: 3, armaReforzada: false, timerArma: 0 };
let sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };
let boss = { x: 340, y: 15, vida: 100, vidaMax: 100, fase: 1, activo: (NIVEL === 3), dir: 1, frame: 2 };
let enemigos = [], proyectiles = [], lanzas = [], trizas = [], ayudas = [];
let hordaDir = 1, hordaY = (NIVEL === 3 ? 150 : 80), globalTimer = 0;

// Teclado
const teclas = {};
window.onkeydown = (e) => { 
    teclas[e.key] = true;
    if(e.key === " ") {
        if(!activo) iniciar();
        else disparar();
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

// Carga de Imágenes
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png'; // Quijote
const imgG = new Image(); imgG.src = 'sprites_gigantes.png'; // Gigante/Boss
const imgS = new Image(); imgS.src = 'sprites_sancho.png'; // Sancho
const imgR = new Image(); imgR.src = 'sprites_roca.png'; // Roca/Proyectil

function iniciar() {
    enemigos = []; proyectiles = []; lanzas = []; trizas = []; ayudas = [];
    quijote = { x: 400, y: 530, vidas: 3, armaReforzada: false, timerArma: 0 };
    sancho = { x: -150, activo: false, yaAparecio: false, estado: 'espera' };
    
    if (NIVEL < 3) {
        for(let f=0; f<3; f++) {
            for(let c=0; c<8; c++) {
                enemigos.push({ xRel: 100+(c*85), yRel: f*100, vida: (NIVEL === 2 ? 2 : 1), activo: true });
            }
        }
    } else {
        boss.vida = 100; boss.fase = 1;
        generarFilaHorda(0);
    }
    activo = true;
}

function generarFilaHorda(yRel) {
    for (let c = 0; c < 8; c++) {
        enemigos.push({ xRel: 100 + (c * 85), yRel: yRel, vida: 3, activo: true, timerAtaque: 0 });
    }
}

function disparar() {
    playSfx('lanza');
    if (quijote.armaReforzada) {
        lanzas.push({ x: quijote.x - 20, y: quijote.y }, { x: quijote.x + 20, y: quijote.y });
    } else {
        lanzas.push({ x: quijote.x, y: quijote.y });
    }
}

function loop() {
    ctx.clearRect(0, 0, 800, 600);
    globalTimer++;

    if (!activo) {
        Interfaz.mostrarMensaje(ctx, document.title.toUpperCase(), "Pulsa ESPACIO para comenzar");
    } else {
        actualizar();
        dibujar();
    }
    
    Interfaz.dibujarHUD(ctx, quijote.vidas, (NIVEL === 3 ? boss : null));
    requestAnimationFrame(loop);
}

function actualizar() {
    // Movimiento Quijote
    if (teclas['ArrowLeft'] || teclas['a']) quijote.x -= 7;
    if (teclas['ArrowRight'] || teclas['d']) quijote.x += 7;
    quijote.x = Math.max(50, Math.min(750, quijote.x));

    // Lógica Sancho (Nivel 2 y 3)
    if (NIVEL >= 2 && quijote.vidas === 1 && !sancho.yaAparecio) {
        sancho.activo = true; sancho.yaAparecio = true; sancho.estado = 'entrando';
    }
    if (sancho.activo) {
        if (sancho.estado === 'entrando') {
            sancho.x += 3; if (sancho.x >= 100) {
                sancho.estado = 'lanzando';
                ayudas.push({ x: 150, y: quijote.y, tipo: 'vida', t: 300 });
                setTimeout(() => sancho.estado = 'volviendo', 1000);
            }
        } else if (sancho.estado === 'volviendo') {
            sancho.x -= 3; if (sancho.x < -150) sancho.activo = false;
        }
    }

    // Boss (Solo Nivel 3)
    if (NIVEL === 3) {
        let vB = boss.fase === 2 ? 6 : 3.5;
        boss.x += vB * boss.dir;
        if (boss.x > 680 || boss.x < 20) boss.dir *= -1;
        if (Math.random() < (boss.fase === 2 ? 0.03 : 0.01)) {
            proyectiles.push({ x: boss.x + 55, y: boss.y + 100, v: 8, r: 40 });
        }
    }

    // Horda / Enemigos
    let bajar = false;
    enemigos.forEach(e => {
        if (!e.activo) return;
        let xReal = e.xRel + (globalTimer * 0.5 % 100) * hordaDir; // Simplificado para el ejemplo
        if (Math.random() < 0.005) proyectiles.push({ x: e.xRel, y: e.yRel + hordaY, v: 5, r: 20 });
    });

    // Lanzas y Colisiones
    lanzas.forEach((l, i) => {
        l.y -= 10;
        if (NIVEL === 3 && l.y < boss.y + 120 && l.x > boss.x && l.x < boss.x + 110) {
            boss.vida--; lanzas.splice(i, 1);
            if (boss.vida <= 0) { activo = false; Interfaz.mostrarMensaje(ctx, "¡VICTORIA!", "El Gigante ha caído"); }
        }
        if (l.y < 0) lanzas.splice(i, 1);
    });

    // Proyectiles enemigos
    proyectiles.forEach((p, i) => {
        p.y += p.v;
        if (Math.abs(p.x - quijote.x) < p.r && Math.abs(p.y - quijote.y) < p.r) {
            quijote.vidas--; proyectiles.splice(i, 1);
            if (quijote.vidas <= 0) location.reload();
        }
    });
}

function dibujar() {
    // Dibujar Sancho
    if (sancho.activo) {
        ctx.drawImage(imgS, sancho.x, quijote.y - 50, 100, 100);
    }

    // Dibujar Boss
    if (NIVEL === 3) {
        ctx.save();
        if (boss.fase === 2) ctx.filter = "hue-rotate(-50deg) brightness(1.2)";
        ctx.drawImage(imgG, boss.frame * 1024, 0, 1024, 1300, boss.x, boss.y, 110, 140);
        ctx.restore();
    }

    // Dibujar Quijote
    ctx.drawImage(imgQ, (teclas['a'] || teclas['d'] ? 0 : 480), 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

    // Dibujar Proyectiles
    proyectiles.forEach(p => ctx.drawImage(imgR, p.x - p.r/2, p.y - p.r/2, p.r, p.r));
    
    // Dibujar Lanzas
    ctx.fillStyle = quijote.armaReforzada ? "#f1c40f" : "#fff";
    lanzas.forEach(l => ctx.fillRect(l.x - 2, l.y, 4, 15));
}

loop();
