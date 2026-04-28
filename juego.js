document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const Sprites = {};
    const rutas = {
        imgQ: 'sprites_quijote.png', imgM: 'sprites_molino.png', 
        imgA: 'sprites_aspas.png', imgF: 'sprites_rafaga.png', 
        imgG: 'sprites_gigantes.png', imgR: 'sprites_roca.png',
        imgS: 'sprites_sancho.png'
    };

    Object.entries(rutas).forEach(([key, src]) => {
        Sprites[key] = new Image();
        Sprites[key].src = src;
        Sprites[key].onload = () => Sprites[key].listo = true;
    });

    const teclas = {};
    window.onkeydown = (e) => teclas[e.key] = true;
    window.onkeyup = (e) => teclas[e.key] = false;

    const Juego = {
        nivel: 0, activo: false, frame: 0, hDir: 1, ultimoDisparo: 0, 
        sanchoUsado: false, tiempoInicio: 0, potenciado: 0,
        sancho: { activo: false, x: -100, y: 480, estado: 'espera' },
        entidades: { quijote: null, enemigos: [], proyectiles: [], lanzas: [], boss: null, nubes: [], items: [], particulas: [] },
        
        iniciarNivel(n) {
            this.nivel = n;
            this.activo = true; this.frame = 0; this.tiempoInicio = Date.now();
            this.potenciado = 0;
            if (n === 1) this.sanchoUsado = false; 
            this.sancho = { activo: false, x: -100, y: 480, estado: 'espera' };
            this.entidades = {
                quijote: { x: 400, y: 530, vidas: 3 },
                enemigos: [], proyectiles: [], lanzas: [], items: [], particulas: [],
                boss: n === 3 ? { x: 340, y: 20, hp: 100, hpMax: 100, dir: 1, w: 115, h: 145, frameAtaque: 0, fila: 0 } : null,
                nubes: Array.from({length: 6}, () => ({ 
                    x: Math.random()*800, y: 40+Math.random()*120, 
                    w: 80+Math.random()*60, v: 0.15+Math.random()*0.3 
                }))
            };

            let filas = n === 3 ? 2 : 3;
            for(let f=0; f<filas; f++) {
                for(let c=0; c<7; c++) {
                    this.entidades.enemigos.push({
                        x: 120+c*90, y: (n===3?180:50)+f*110,
                        hp: n===1?1:(n===2?2:3), frameAtaque: 0, fila: f 
                    });
                }
            }
            document.getElementById('resumenGesta').style.display = "none";
            if(!this.corriendo) { this.corriendo = true; this.loop(); }
        },

        crearTrizas(x, y, color) {
            for(let i=0; i<10; i++) {
                this.entidades.particulas.push({
                    x: x, y: y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                    vida: 20, color: color
                });
            }
        },

        actualizarSancho() {
            const s = this.sancho;
            const q = this.entidades.quijote;
            if (this.nivel === 3 && !this.sanchoUsado && q.vidas === 1 && s.estado === 'espera') {
                s.activo = true; s.estado = 'entrando'; this.sanchoUsado = true;
            }
            if (!s.activo) return;
            if (s.estado === 'entrando') {
                s.x += 2.5;
                if (s.x >= 120) {
                    this.entidades.items.push({ 
                        x: s.x, y: s.y, tX: 300+Math.random()*200, 
                        yB: 515, arc: 0, fV: 180, t: 'corazon', icono: "❤️" 
                    });
                    s.estado = 'saliendo';
                }
            } else if (s.estado === 'saliendo') {
                s.x -= 2.5;
                if (s.x < -100) s.activo = false;
            }
            if (Sprites.imgS.listo) {
                let fS = Math.floor(this.frame / 10) % 2;
                ctx.drawImage(Sprites.imgS, fS * 480, 0, 480, 440, s.x-25, s.y-25, 50, 50);
            }
        },

        dibujarNubes() {
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            this.entidades.nubes.forEach(n => {
                n.x += n.v; if(n.x > 850) n.x = -n.w;
                ctx.beginPath();
                ctx.ellipse(n.x, n.y, n.w/2, n.w/4, 0, 0, Math.PI * 2);
                ctx.ellipse(n.x - n.w/4, n.y - n.w/6, n.w/3, n.w/4, 0, 0, Math.PI * 2);
                ctx.ellipse(n.x + n.w/5, n.y - n.w/5, n.w/3.5, n.w/4.5, 0, 0, Math.PI * 2);
                ctx.fill();
            });
        },

        loop() {
            if(!this.activo) { requestAnimationFrame(() => this.loop()); return; }
            this.frame++; ctx.clearRect(0, 0, 800, 600);
            if(this.potenciado > 0) this.potenciado--;
            
            let cSky = this.nivel === 2 ? ["#ff4500", "#ff8c00"] : (this.nivel === 3 ? ["#1a0b2e", "#483d8b"] : ["#1e90ff", "#87ceeb"]);
            let g = ctx.createLinearGradient(0, 0, 0, 600);
            g.addColorStop(0, cSky[0]); g.addColorStop(0.8, cSky[1]);
            ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 600);
            
            this.dibujarNubes();
            ctx.fillStyle = "#5d2e0a"; ctx.fillRect(0, 530, 800, 70);

            const q = this.entidades.quijote;
            this.actualizarSancho();

            this.entidades.particulas.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vida--;
                ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3);
                if(p.vida <= 0) this.entidades.particulas.splice(i, 1);
            });

            if ((this.nivel === 2 || this.nivel === 3) && this.frame % 700 === 0) {
                this.entidades.items.push({ x: 100+Math.random()*600, y:-50, t:'rayo', icono:"⚡", vy:7, fV:180, enSuelo:false });
            }

            this.entidades.items.forEach((it, i) => {
                if (it.t === 'rayo') {
                    if (!it.enSuelo) { it.y += it.vy; if (it.y >= 505) it.enSuelo = true; }
                    else { it.fV--; if (it.fV <= 0) this.entidades.items.splice(i, 1); }
                } else {
                    it.arc += 0.02; it.x += (it.tX - it.x) * 0.04;
                    it.y = it.yB - Math.sin(it.arc * Math.PI) * 80;
                    if(it.arc >= 1) { it.fV--; if(it.fV <= 0) this.entidades.items.splice(i, 1); }
                }
                ctx.font = "35px Arial"; ctx.fillText(it.icono, it.x-17, it.y);
                if (Math.abs(q.x - it.x) < 40 && Math.abs(q.y - it.y) < 40) {
                    if (it.t === 'corazon') q.vidas = 3;
                    if (it.t === 'rayo') this.potenciado = 600; // 10 segundos a 60fps
                    this.entidades.items.splice(i, 1);
                }
            });

            for(let i = this.entidades.proyectiles.length - 1; i >= 0; i--) {
                let p = this.entidades.proyectiles[i];
                p.y += 3.5;
                if(p.img === 'imgF') {
                    let progreso = Math.min(1, (p.y - p.yIni) / 450);
                    p.s = p.sIni * (1 + (progreso * 0.20));
                }
                let rayoEnEscena = this.entidades.items.find(it => it.t === 'rayo' && it.enSuelo && Math.abs(it.x - p.x) < 70);
                if (rayoEnEscena) { this.entidades.proyectiles.splice(i, 1); continue; }
                if(Sprites[p.img]?.listo) ctx.drawImage(Sprites[p.img], p.x-p.s/2, p.y-p.s/2, p.s, p.s);
                if(Math.abs(p.x - q.x) < p.s/1.5 && Math.abs(p.y - q.y) < 40) {
                    q.vidas -= p.boss ? 3 : 1; this.entidades.proyectiles.splice(i, 1);
                    if(q.vidas <= 0) this.fin(false);
                } else if(p.y > 600) this.entidades.proyectiles.splice(i, 1);
            }

            this.entidades.enemigos.forEach(e => {
                e.x += 0.6 * this.hDir; e.y += 0.12; 
                if(e.frameAtaque === 0 && Math.random() < 0.0035) e.frameAtaque = 45;
                if(e.frameAtaque === 1) {
                    this.entidades.proyectiles.push({ x: e.x, y: e.y, yIni: e.y, s: 30, sIni: 30, img: this.nivel === 1 ? 'imgF' : 'imgR' });
                }
                if(e.frameAtaque > 0) e.frameAtaque--;
                if(this.nivel === 1) {
                    ctx.save(); e.rot = (e.rot || 0) + 0.03;
                    if(e.frameAtaque > 0) { ctx.shadowBlur = 15; ctx.shadowColor = "cyan"; }
                    if(Sprites.imgM.listo) ctx.drawImage(Sprites.imgM, e.x-40, e.y-40, 80, 80);
                    ctx.translate(e.x, e.y-10); ctx.rotate(e.rot);
                    if(Sprites.imgA.listo) ctx.drawImage(Sprites.imgA, -45, -45, 90, 90);
                    ctx.restore();
                } else { this.dibujarGigante(e, e.x-40, e.y-50, 80, 100); }
                if(e.y > 510) this.fin(false); 
            });
            if(this.entidades.enemigos.some(e => e.x > 760 || e.x < 40)) this.hDir *= -1;

            if(this.entidades.boss) {
                let b = this.entidades.boss; b.x += 1.5 * b.dir; 
                if(b.x > 650 || b.x < 50) b.dir *= -1;
                this.dibujarGigante(b, b.x, b.y, b.w, b.h);
                if(this.frame % 100 === 0) this.entidades.proyectiles.push({ x: b.x+b.w/2, y: b.y+b.h, yIni: b.y+b.h, s: 60, sIni: 60, img: 'imgR', boss: true });
                
                // BARRA VIDA BOSS
                ctx.fillStyle = "#333"; ctx.fillRect(250, 20, 300, 15);
                ctx.fillStyle = "red"; ctx.fillRect(250, 20, (b.hp/b.hpMax)*300, 15);
                ctx.strokeStyle = "white"; ctx.strokeRect(250, 20, 300, 15);
            }

            this.entidades.lanzas.forEach((l, i) => {
                l.y -= 22;
                ctx.fillStyle = this.potenciado > 0 ? "#00ffff" : "#ffff00";
                ctx.fillRect(l.x-2, l.y, 4, 25);
                let daño = this.potenciado > 0 ? 2 : 1;

                this.entidades.enemigos.forEach((e, j) => {
                    if(Math.abs(l.x - e.x) < 45 && Math.abs(l.y - e.y) < 45) {
                        e.hp -= daño; this.entidades.lanzas.splice(i, 1);
                        if(e.hp <= 0) { 
                            this.crearTrizas(e.x, e.y, this.nivel===1?"#8b4513":"#696969");
                            this.entidades.enemigos.splice(j, 1);
                        }
                    }
                });
                if(this.entidades.boss && l.x > this.entidades.boss.x && l.x < this.entidades.boss.x+this.entidades.boss.w && l.y < this.entidades.boss.y+this.entidades.boss.h) {
                    this.entidades.boss.hp -= daño; this.entidades.lanzas.splice(i, 1);
                    if(this.entidades.boss.hp <= 0) { this.crearTrizas(l.x, l.y, "red"); this.entidades.boss = null; }
                }
                if(l.y < 0) this.entidades.lanzas.splice(i, 1);
            });

            if(teclas['ArrowLeft'] && q.x > 50) q.x -= 7;
            if(teclas['ArrowRight'] && q.x < 750) q.x += 7;
            if(teclas[' '] && Date.now() - this.ultimoDisparo > 140) {
                this.entidades.lanzas.push({ x: q.x, y: q.y - 20 });
                this.ultimoDisparo = Date.now();
            }
            if(Sprites.imgQ.listo) ctx.drawImage(Sprites.imgQ, 480, 0, 480, 440, q.x-45, q.y-45, 90, 85);
            
            // INTERFAZ
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            let hUI = this.potenciado > 0 ? 85 : 65;
            ctx.fillRect(10, 10, 210, hUI);
            ctx.fillStyle = "white"; ctx.font = "bold 18px Arial"; 
            ctx.fillText("VIDAS: " + "❤️".repeat(q.vidas), 20, 35);
            let segs = Math.floor((Date.now() - this.tiempoInicio)/1000);
            ctx.fillText("TIEMPO: " + segs + "s", 20, 58);
            if(this.potenciado > 0) {
                ctx.fillStyle = "#00ffff"; ctx.fillText("⚡ POTENCIA ACTIVA", 20, 81);
            }

            if(this.entidades.enemigos.length === 0 && !this.entidades.boss) this.fin(true);
            requestAnimationFrame(() => this.loop());
        },

        dibujarGigante(e, x, y, w, h) {
            if(!Sprites.imgG.listo) return;
            ctx.save();
            let cycle = Math.floor(this.frame / 25) % 2, frameIndex = (e.frameAtaque > 0) ? (cycle ? 1 : 0) : (cycle ? 3 : 2);
            if (this.nivel === 2 && e.hp === 1) ctx.filter = "grayscale(1) brightness(0.4)";
            if (this.nivel === 3) {
                if (e.hp === 2) ctx.filter = "grayscale(1) brightness(0.4)";
                else if (e.hp === 1) ctx.filter = "sepia(1) saturate(5) hue-rotate(-50deg) brightness(0.6)";
            }
            ctx.drawImage(Sprites.imgG, frameIndex * 1024, 0, 1024, 1300, Math.floor(x), Math.floor(y), w, h);
            ctx.restore();
        },

        fin(v) { this.activo = false; document.getElementById('resumenGesta').style.display = "block"; document.getElementById('gesta-titulo').innerText = v ? "¡VICTORIA!" : "¡GAME OVER!"; }
    };

    document.querySelectorAll('.btn-nivel').forEach(b => b.onclick = () => Juego.iniciarNivel(parseInt(b.dataset.nivel)));
    Juego.loop();
});