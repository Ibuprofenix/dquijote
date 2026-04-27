/** MOTOR DE JUEGO **/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [], activo = false;
let hDir = 1, velHorda = 0.8, tiempoRestante = 120, timerInterval;

// Imágenes
const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgM = new Image(); imgM.src = 'sprites_molino.png';
const imgA = new Image(); imgA.src = 'sprites_aspas.png';
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';

function spawnEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), rot: 0 });
        }
    }
}

function iniciar() {
    Interfaz.puntuacion = 0;
    quijote.vidas = 3;
    tiempoRestante = 120;
    spawnEnemigos();
    activo = true;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "Se acabó el tiempo");
        }
    }, 1000);
}

function fin(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    Interfaz.mostrarMenuFinal(victoria?"VICTORIA":"DERROTA", msg, victoria, "Nivel2", {vidas: quijote.vidas, tiempo: tiempoRestante});
}

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " ") {
        if(!activo && quijote.vidas > 0) iniciar();
        else if(activo) lanzas.push({x: quijote.x, y: quijote.y - 20});
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

function loop() {
    ctx.clearRect(0, 0, 800, 600);
    
    // Dibujo de enemigos
    enemigos.forEach(e => {
        if(activo) e.rot += 0.04;
        ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save();
        ctx.translate(e.x, e.y - 10);
        ctx.rotate(e.rot);
        ctx.drawImage(imgA, -50, -50, 100, 100);
        ctx.restore();
    });

    if(activo) {
        // Horda
        let bajar = false;
        enemigos.forEach(e => {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
        });
        if(bajar) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

        // Quijote
        if(teclas['ArrowLeft']) quijote.x -= 7;
        if(teclas['ArrowRight']) quijote.x += 7;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        ctx.drawImage(imgQ, 480, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // Lanzas
        lanzas.forEach((l, i) => {
            l.y -= 10;
            ctx.fillStyle = "yellow"; ctx.fillRect(l.x, l.y, 4, 15);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    Interfaz.añadirPuntos(100);
                }
            });
        });

        if(enemigos.length === 0) fin(true, "¡Molinos derrotados!");
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "30px Arial";
        ctx.fillText("ESPACIO PARA COMENZAR", 400, 300);
    }

    // HUD
    ctx.fillStyle = "white"; ctx.textAlign = "left"; ctx.font = "20px Arial";
    ctx.fillText(`VIDAS: ${quijote.vidas} | TIEMPO: ${tiempoRestante}s`, 20, 30);

    requestAnimationFrame(loop);
}

spawnEnemigos();
loop();
