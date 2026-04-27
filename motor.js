/** MOTOR DE JUEGO COMPLETO: ESTÉTICA RESTAURADA **/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [], particulasPolvo = [], activo = false;
let hDir = 1, velHorda = 0.8, tiempoRestante = 120, timerInterval;

// Imágenes
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgM = new Image(); imgM.src = 'sprites_molino.png';
const imgA = new Image(); imgA.src = 'sprites_aspas.png';
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " ") {
        if(!activo && quijote.vidas > 0) iniciar();
        else if(activo) {
            // Disparo con estética de lanza
            lanzas.push({x: quijote.x, y: quijote.y - 30});
        }
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

function spawnEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), rot: Math.random() * Math.PI, cargando: false, t: 0 });
        }
    }
}

function iniciar() {
    Interfaz.puntuacion = 0;
    quijote.vidas = 3;
    tiempoRestante = 120;
    proyectiles = [];
    lanzas = [];
    spawnEnemigos();
    activo = true;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "¡Los gigantes han resistido tu asedio!");
        }
    }, 1000);
}

function fin(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    Interfaz.mostrarMenuFinal(
        victoria ? "¡VICTORIA!" : "¡DERROTA!", 
        msg, 
        victoria, 
        "Nivel2", 
        { vidas: quijote.vidas, tiempo: tiempoRestante }
    );
}

function dibujarPolvareda() {
    if (particulasPolvo.length < 25) {
        particulasPolvo.push({ 
            x: Math.random() * 800, y: 600, 
            v: 0.3 + Math.random() * 0.8, 
            op: 0.1 + Math.random() * 0.3, 
            size: 1 + Math.random() * 2 
        });
    }
    ctx.save();
    particulasPolvo.forEach((p, i) => {
        p.y -= p.v; p.x += Math.sin(p.y / 30) * 0.5;
        ctx.fillStyle = `rgba(210, 180, 140, ${p.op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.y < -10) particulasPolvo.splice(i, 1);
    });
    ctx.restore();
}

function dibujarHUD() {
    ctx.save();
    // Caja del HUD (Pergamino)
    ctx.fillStyle = "rgba(62, 39, 35, 0.85)";
    ctx.strokeStyle = "#f1c40f";
    ctx.lineWidth = 2;
    // Rectángulo redondeado manual
    const x=15, y=15, w=220, h=45, r=10;
    ctx.beginPath(); ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Texto Vidas con Corazones
    ctx.font = "bold 16px 'Almendra'";
    ctx.fillStyle = "#f1c40f";
    ctx.fillText("HIDALGO:", 30, 42);
    for(let i=0; i<3; i++) {
        ctx.font = "18px Arial";
        ctx.fillStyle = i < quijote.vidas ? "#e74c3c" : "#2c3e50";
        ctx.fillText(i < quijote.vidas ? "❤" : "💀", 115 + (i * 22), 43);
    }

    // Timer
    ctx.textAlign = "right";
    ctx.font = "bold 20px 'MedievalSharp'";
    ctx.fillStyle = tiempoRestante < 20 ? "#e74c3c" : "#f1c40f";
    let m = Math.floor(tiempoRestante/60), s = tiempoRestante%60;
    ctx.fillText(`TIEMPO: ${m}:${s<10?'0':''}${s}`, 770, 42);
    ctx.restore();
}

function loop() {
    ctx.clearRect(0, 0, 800, 600);
    dibujarPolvareda();

    // Enemigos
    enemigos.forEach(e => {
        if(activo) e.rot += 0.04;
        ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save();
        ctx.translate(e.x, e.y - 10); ctx.rotate(e.rot);
        ctx.drawImage(imgA, -50, -50, 100, 100);
        ctx.restore();
    });

    if(activo) {
        // Lógica de horda
        let bajar = false;
        enemigos.forEach(e => {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            if(Math.random() < 0.005 && !e.cargando) e.cargando = true;
            if(e.cargando && ++e.t > 40) {
                proyectiles.push({ x: e.x, y: e.y, s: 20 });
                e.cargando = false; e.t = 0;
            }
        });
        if(bajar) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

        // Movimiento Quijote con Sprite Correcto
        if(teclas['ArrowLeft']) quijote.x -= 7;
        if(teclas['ArrowRight']) quijote.x += 7;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        let frameX = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
        ctx.drawImage(imgQ, frameX, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // Lanzas (Proyectiles del Quijote con Sprite)
        lanzas.forEach((l, i) => {
            l.y -= 10;
            // Usamos una sección del sprite de Quijote para la lanza o un dibujo estilizado
            ctx.drawImage(imgQ, 480, 440, 480, 440, l.x - 15, l.y - 15, 30, 30);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    Interfaz.añadirPuntos(100);
                }
            });
        });

        // Ráfagas enemigas
        proyectiles.forEach((p, i) => {
            p.y += 4;
            ctx.drawImage(imgF, p.x - 12, p.y - 12, 24, 24);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Has mordido el polvo, caballero!");
            }
        });

        if(enemigos.length === 0) fin(true, "¡Has derrotado a los gigantes de viento!");
    } else {
        // Pantalla de Inicio
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; 
        ctx.font = "bold 35px 'Almendra'";
        ctx.fillText("PULSA ESPACIO PARA COMBATIR", 400, 300);
    }

    dibujarHUD();
    requestAnimationFrame(loop);
}

spawnEnemigos();
loop();
