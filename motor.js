/** MOTOR DE JUEGO: NIVEL 1 (CON HALO BRILLANTE) **/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [], particulasPolvo = [], activo = false;
let hDir = 1, velHorda = 0.8, tiempoRestante = 120, timerInterval;

// Imágenes (Tus nombres originales)
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
            enemigos.push({ 
                x: 100 + (c * 85), 
                y: 80 + (f * 100), 
                rot: Math.random() * Math.PI,
                preparandoDisparo: false,
                timerBrillo: 0 
            });
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
    Interfaz.dibujarEscenario(ctx);
    
    // Polvareda
    if (particulasPolvo.length < 25) particulasPolvo.push({ x: Math.random()*800, y: 580, v: 0.4+Math.random()*0.6, op: 0.1+Math.random()*0.2 });
    particulasPolvo.forEach((p, i) => {
        p.y -= p.v; ctx.fillStyle = `rgba(255, 255, 255, ${p.op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
        if(p.y < 460) particulasPolvo.splice(i, 1);
    });

    // --- LÓGICA DE ENEMIGOS Y HALO ---
    let bajar = false;
    enemigos.forEach(e => {
        if(activo) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            e.rot += 0.04;
        }

        // Dibujo Molino y Aspas
        ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save(); ctx.translate(e.x, e.y - 10); ctx.rotate(e.rot);
        ctx.drawImage(imgA, -50, -50, 100, 100); ctx.restore();

        if(activo) {
            // HALO BRILLANTE ANTES DE DISPARAR
            if (e.preparandoDisparo) {
                e.timerBrillo++;
                ctx.save();
                let radioBrillo = 5 + (e.timerBrillo * 1.5);
                let gradiente = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radioBrillo);
                gradiente.addColorStop(0, "rgba(255, 255, 255, 0.9)");
                gradiente.addColorStop(0.4, "rgba(241, 196, 15, 0.6)");
                gradiente.addColorStop(1, "rgba(241, 196, 15, 0)");
                ctx.fillStyle = gradiente;
                ctx.beginPath(); ctx.arc(e.x, e.y, radioBrillo, 0, Math.PI * 2); ctx.fill();
                ctx.restore();

                if (e.timerBrillo > 20) { 
                    proyectiles.push({ x: e.x, y: e.y, size: 15 });
                    e.preparandoDisparo = false;
                    e.timerBrillo = 0;
                }
            } else if(Math.random() < 0.005) {
                e.preparandoDisparo = true;
                e.timerBrillo = 0;
            }
        }
    });
    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

    if(activo) {
        // Movimiento Quijote
        if(teclas['ArrowLeft']) quijote.x -= 7;
        if(teclas['ArrowRight']) quijote.x += 7;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
        ctx.drawImage(imgQ, fx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // Lanzas
        lanzas.forEach((l, i) => {
            l.y -= 12;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 25);
            ctx.fillStyle = "white"; ctx.fillRect(l.x - 1, l.y, 2, 8);
            enemigos.forEach((e, ei) => {
                if(Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    enemigos.splice(ei, 1); lanzas.splice(i, 1);
                    Interfaz.añadirPuntos(100);
                }
            });
            if(l.y < 0) lanzas.splice(i, 1);
        });

        // Ráfagas
        proyectiles.forEach((p, i) => {
            p.y += 4; p.size += 0.25;
            ctx.drawImage(imgF, p.x - p.size/2, p.y - p.size/2, p.size, p.size);
