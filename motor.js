const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [], particulasPolvo = [], activo = false;
let hDir = 1, velHorda = 0.8, tiempoRestante = 120, timerInterval;

const imgQ = new Image(); imgQ.src = 'sprites_quijote.png';
const imgM = new Image(); imgM.src = 'sprites_molino.png';
const imgA = new Image(); imgA.src = 'sprites_aspas.png';
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " ") {
        if(!activo && quijote.vidas > 0) iniciar();
        else if(activo) lanzas.push({x: quijote.x, y: quijote.y - 30});
    }
};
window.onkeyup = (e) => teclas[e.key] = false;

function spawnEnemigos() {
    enemigos = [];
    for(let f=0; f<3; f++) {
        for(let c=0; c<8; c++) {
            enemigos.push({ x: 100 + (c * 85), y: 80 + (f * 100), rot: Math.random() * Math.PI, t: 0 });
        }
    }
}

function iniciar() {
    Interfaz.puntuacion = 0;
    quijote.vidas = 3;
    tiempoRestante = 120;
    proyectiles = []; lanzas = [];
    spawnEnemigos();
    activo = true;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo) {
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "El tiempo ha expirado.");
        }
    }, 1000);
}

function fin(victoria, msg) {
    activo = false;
    clearInterval(timerInterval);
    Interfaz.mostrarMenuFinal(victoria ? "¡VICTORIA!" : "¡DERROTA!", msg, victoria, "nivel2", { vidas: quijote.vidas, tiempo: tiempoRestante });
}

function loop() {
    // 1. Dibujar Escenario Genérico (Cielo y Césped)
    Interfaz.dibujarEscenario(ctx);
    
    // 2. Polvareda (solo sobre el césped)
    if (particulasPolvo.length < 20) particulasPolvo.push({ x: Math.random()*800, y: 580, v: 0.5+Math.random(), op: 0.1+Math.random()*0.3 });
    particulasPolvo.forEach((p, i) => {
        p.y -= p.v; ctx.fillStyle = `rgba(255, 255, 255, ${p.op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
        if(p.y < 450) particulasPolvo.splice(i, 1);
    });

    // 3. Enemigos
    enemigos.forEach(e => {
        if(activo) e.rot += 0.04;
        ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save(); ctx.translate(e.x, e.y - 10); ctx.rotate(e.rot);
        ctx.drawImage(imgA, -50, -50, 100, 100); ctx.restore();
    });

    if(activo) {
        let bajar = false;
        enemigos.forEach(e => {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            if(Math.random() < 0.005) proyectiles.push({ x: e.x, y: e.y, size: 15 });
        });
        if(bajar) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

        if(teclas['ArrowLeft']) quijote.x -= 7;
        if(teclas['ArrowRight']) quijote.x += 7;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
        ctx.drawImage(imgQ, fx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // 4. Lanzas (Estilizadas)
        lanzas.forEach((l, i) => {
            l.y -= 12;
            // Dibujo de lanza con brillo
            ctx.fillStyle = "#f1c40f";
            ctx.fillRect(l.x - 2, l.y, 4, 25);
            ctx.fillStyle = "white";
            ctx.fillRect(l.x - 1, l.y, 2, 10);

            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    Interfaz.añadirPuntos(100);
                }
            });
            if(l.y < 0) lanzas.splice(i, 1);
        });

        // 5. Ráfagas
        proyectiles.forEach((p, i) => {
            p.y += 4;
            p.size += 0.25;
            ctx.drawImage(imgF, p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; proyectiles.splice(i, 1);
                if(quijote.vidas <= 0) fin(false, "¡Has caído!");
            }
        });

        if(enemigos.length === 0) fin(true, "¡Victorioso!");
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#f1c40f"; ctx.textAlign = "center"; ctx.font = "bold 30px 'Almendra'";
        ctx.fillText("PULSA ESPACIO PARA LUCHAR", 400, 300);
    }

    Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}
spawnEnemigos();
loop();
