/** MOTOR DE JUEGO: NIVEL 1 (ATMÓSFERA DQ + TRIZAS) **/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let quijote = { x: 400, y: 530, vidas: 3 };
let enemigos = [], proyectiles = [], lanzas = [], particulasPolvo = [], trizas = [], activo = false;
let hDir = 1, velHorda = 0.8, tiempoRestante = 120, timerInterval;
let juegoTerminado = false;

// --- SISTEMA DE PRECARGA ---
let imagenesCargadas = 0;
const totalImagenes = 4;

function comprobarCarga() {
    imagenesCargadas++;
    if (imagenesCargadas >= totalImagenes) {
        spawnEnemigos();
        requestAnimationFrame(loop);
    }
}

const imgQ = new Image(); imgQ.src = 'sprites_quijote.png'; imgQ.onload = comprobarCarga;
const imgM = new Image(); imgM.src = 'sprites_molino.png'; imgM.onload = comprobarCarga;
const imgA = new Image(); imgA.src = 'sprites_aspas.png';   imgA.onload = comprobarCarga;
const imgF = new Image(); imgF.src = 'sprites_rafaga.png';  imgF.onload = comprobarCarga;

imgQ.onerror = imgM.onerror = imgA.onerror = imgF.onerror = () => {
    console.warn("Aviso: Alguna imagen falta, el motor continúa.");
    comprobarCarga();
};

const teclas = {};
window.onkeydown = (e) => {
    teclas[e.key] = true;
    if(e.key === " " && activo && !juegoTerminado) {
        lanzas.push({x: quijote.x, y: quijote.y - 30, eliminar: false});
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
                timerBrillo: 0,
                eliminar: false
            });
        }
    }
}

function iniciar() {
    if(activo) return; 
    if(typeof Interfaz !== 'undefined') Interfaz.puntuacion = 0;
    
    quijote.vidas = 3;
    tiempoRestante = 120;
    proyectiles = []; lanzas = []; trizas = [];
    spawnEnemigos();
    
    activo = true;
    juegoTerminado = false;

    const btn = document.getElementById('btnAccion');
    if(btn) btn.style.display = "none";

    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if(activo && !juegoTerminado) {
            tiempoRestante--;
            if(tiempoRestante <= 0) fin(false, "El tiempo ha expirado.");
        }
    }, 1000);
}

function fin(victoria, msg) {
    if(!activo && juegoTerminado) return;
    activo = false;
    juegoTerminado = true;
    clearInterval(timerInterval);
    
    if(typeof enviarDatos === 'function') {
        enviarDatos(victoria ? "VICTORIA N1" : "DERROTA N1", quijote.vidas, 1);
    }

    if(typeof Interfaz !== 'undefined') {
        Interfaz.mostrarMenuFinal(
            victoria ? "¡GESTA LOGRADA!" : "¡DERROTA!", 
            msg, 
            victoria, 
            null, 
            { vidas: quijote.vidas, tiempo: tiempoRestante }
        );
    }

    const btn = document.getElementById('btnAccion');
    if(btn) {
        btn.style.display = "block";
        if(victoria) {
            btn.innerText = "AVANZAR A LA SIGUIENTE AVENTURA";
            btn.style.backgroundColor = "#4CAF50";
            btn.onclick = () => window.location.href = "nivel2.html";
        } else {
            btn.innerText = "VER CLASIFICACIÓN";
            btn.style.backgroundColor = "#8d6e63";
            btn.onclick = () => window.location.href = "https://educastur.sharepoint.com/sites/lospasosdelcid/SitePages/La_Mancha_Invaders.aspx?csf=1&web=1&e=GZTQm7&CID=c144ab21-57f7-4f02-a507-0e15c77abb06";
        }
    }
}

function loop() {
    if(typeof Interfaz !== 'undefined') {
        Interfaz.dibujarEscenario(ctx);
    } else {
        ctx.fillStyle = "#87ceeb"; ctx.fillRect(0,0,800,600);
    }
    
    // Partículas de polvo
    if (particulasPolvo.length < 25) particulasPolvo.push({ x: Math.random()*800, y: 580, v: 0.4+Math.random()*0.6, op: 0.1+Math.random()*0.2 });
    particulasPolvo.forEach((p, i) => {
        p.y -= p.v; ctx.fillStyle = `rgba(255, 255, 255, ${p.op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI*2); ctx.fill();
        if(p.y < 460) particulasPolvo.splice(i, 1);
    });

    let bajar = false;
    enemigos.forEach(e => {
        if(activo && !juegoTerminado) {
            e.x += velHorda * hDir;
            if(e.x > 750 || e.x < 50) bajar = true;
            e.rot += 0.04;
        }
        
        if(imgM.complete) ctx.drawImage(imgM, e.x - 45, e.y - 45, 90, 90);
        ctx.save(); 
        ctx.translate(e.x, e.y - 10); 
        ctx.rotate(e.rot);
        if(imgA.complete) ctx.drawImage(imgA, -50, -50, 100, 100); 
        ctx.restore();

        if(activo && !juegoTerminado) {
            if (e.preparandoDisparo) {
                e.timerBrillo++;
                let radioBrillo = 5 + (e.timerBrillo * 1.5);
                ctx.beginPath();
                ctx.arc(e.x, e.y, radioBrillo, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.fill();
                if (e.timerBrillo > 20) { 
                    proyectiles.push({ x: e.x, y: e.y, size: 15, eliminar: false });
                    e.preparandoDisparo = false;
                    e.timerBrillo = 0;
                }
            } else if(Math.random() < 0.005) {
                e.preparandoDisparo = true;
            }
        }
    });

    if(bajar && activo) { hDir *= -1; enemigos.forEach(e => e.y += 20); }

    if(activo && !juegoTerminado) {
        if(teclas['ArrowLeft']) quijote.x -= 7;
        if(teclas['ArrowRight']) quijote.x += 7;
        quijote.x = Math.max(50, Math.min(750, quijote.x));
        
        let fx = (teclas['ArrowLeft'] || teclas['ArrowRight']) ? 0 : 480;
        if(imgQ.complete) ctx.drawImage(imgQ, fx, 0, 480, 440, quijote.x - 50, quijote.y - 45, 100, 92);

        // Lanzas y Colisiones
        lanzas.forEach((l, i) => {
            l.y -= 12;
            ctx.fillStyle = "#f1c40f"; ctx.fillRect(l.x - 2, l.y, 4, 25);
            enemigos.forEach((e, ei) => {
                if(!e.eliminar && Math.abs(l.x - e.x) < 40 && Math.abs(l.y - e.y) < 40) {
                    e.eliminar = true;
                    l.eliminar = true;
                    // Generar Trizas
                    for(let k=0; k<10; k++) {
                        trizas.push({
                            x: e.x, y: e.y, 
                            vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, 
                            v: 1.0
                        });
                    }
                }
            });
            if(l.y < 0) l.eliminar = true;
        });

        proyectiles.forEach((p, i) => {
            p.y += 4; p.size += 0.25;
            if(imgF.complete) ctx.drawImage(imgF, p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            if(Math.abs(p.x - quijote.x) < 30 && Math.abs(p.y - quijote.y) < 30) {
                quijote.vidas--; 
                p.eliminar = true;
                if(quijote.vidas <= 0) fin(false, "¡Has caído!");
            }
            if(p.y > 600) p.eliminar = true;
        });

        // Limpieza segura (evita congelación)
        enemigos = enemigos.filter(e => !e.eliminar);
        lanzas = lanzas.filter(l => !l.eliminar);
        proyectiles = proyectiles.filter(p => !p.eliminar);

        // Dibujar Trizas
        trizas.forEach((t, i) => {
            t.x += t.vx; t.y += t.vy; t.v -= 0.02;
            ctx.fillStyle = `rgba(141, 110, 99, ${t.v})`; // Color madera
            ctx.fillRect(t.x, t.y, 4, 4);
            if(t.v <= 0) trizas.splice(i, 1);
        });

        if(enemigos.length === 0) fin(true, "¡Has derrotado a los gigantes de viento!");
    } else if (!juegoTerminado) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0,0,800,600);
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 25px 'Almendra'";
        ctx.fillText("HAZ CLIC PARA EMPEZAR LA AVENTURA", 400, 300);
    }

    if(typeof Interfaz !== 'undefined') Interfaz.dibujarHUD(ctx, quijote.vidas, tiempoRestante);
    requestAnimationFrame(loop);
}
