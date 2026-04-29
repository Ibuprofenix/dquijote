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
        sanchoUsado: false, tiempoInicio: 0, potenciado: 0, bajas: 0,
        sancho: { activo: false, x: -100, y: 530, estado: 'espera' },
        entidades: { quijote: null, enemigos: [], proyectiles: [], lanzas: [], boss: null, nubes: [], items: [], trizas: [] },
        
        iniciarNivel(n) {
            this.nivel = n;
            this.activo = true; 
            this.frame = 0; 
            this.bajas = 0;
            this.tiempoInicio = Date.now();
            this.potenciado = 0;
            this.hDir = 1;
            this.sanchoUsado = false; 
            this.sancho = { activo: false, x: -100, y: 530, estado: 'espera' };
            
            this.entidades = {
                quijote: { x: 400, y: 530, vidas: 3, dir: 1, w: 90, h: 85 },
                enemigos: [], proyectiles: [], lanzas: [], items: [], trizas: [],
                boss: n === 3 ? { x: 340, y: 20, hp: 50, hpMax: 50, dir: 1, w: 115, h: 145, frameAtaque: 0 } : null,
                nubes: Array.from({length: 6}, () => ({ 
                    x: Math.random()*800, y: 40+Math.random()*120, 
                    w: 80+Math.random()*60, v: 0.15+Math.random()*0.3 
                }))
            };

            this.generarFilaEnemigos(n === 3 ? 180 : 50, n === 3 ? 2 : 3);
            
            document.getElementById('registro-caballero').style.setProperty('display', 'none', 'important');
            document.getElementById('resumenGesta').style.setProperty('display', 'none', 'important');
            document.getElementById('hud-superior').style.display = "flex";
            document.getElementById('hud-nombre').innerText = document.getElementById('nombreJugador').value || "Hidalgo";
            document.getElementById('boss-ui').style.display = (n === 3) ? "flex" : "none";
            
            canvas.style.display = "block";
            if(!this.corriendo) { this.corriendo = true; this.loop(); }
        },

        generarFilaEnemigos(yBase, filas) {
            for(let f=0; f<filas; f++) {
                for(let c=0; c<7; c++) {
                    this.entidades.enemigos.push({
                        x: 120+c*90, 
                        y: yBase + (f * 110),
                        hp: this.nivel===1?1:(this.nivel===2?2:3), 
                        hpMax: this.nivel===1?1:(this.nivel===2?2:3),
                        frameAtaque: 0, offsetOla: c * 0.5
                    });
                }
            }
        },

        explotarEnTrizas(x, y, color) {
            for(let i=0; i<12; i++) {
                this.entidades.trizas.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    r: 2 + Math.random() * 4,
                    vida: 1.0,
                    color: color
                });
            }
        },

        actualizarSancho() {
            const s = this.sancho;
            const q = this.entidades.quijote;
            if (this.nivel === 3 && !this.sanchoUsado && q?.vidas === 1 && s.estado === 'espera') {
                s.activo = true; s.estado = 'entrando'; this.sanchoUsado = true;
            }
            if (!s.activo) return;
            if (s.estado === 'entrando') {
                s.x += 2.5;
                if (s.x >= 120) {
                    this.crearItem(s.x, s.y, 'corazon', "❤️");
                    s.estado = 'saliendo';
                }
            } else if (s.estado === 'saliendo') {
                s.x -= 2.5;
                if (s.x < -100) s.activo = false;
            }
            if (Sprites.imgS.listo) ctx.drawImage(Sprites.imgS, 0, 0, 1024, 1024, s.x-45, s.y-85, 90, 90);
        },

        crearItem(x, y, tipo, icono) {
            this.entidades.items.push({ x, y, vy: 2, t: tipo, icono: icono, vida: 180 });
        },

        loop() {
            this.frame++; ctx.clearRect(0, 0, 800, 600);
            
            let cSky = (this.nivel === 2) ? ["#ff4500", "#ff8c00"] : 
                       (this.nivel === 3) ? ["#1a0b2e", "#483d8b"] : ["#1e90ff", "#87ceeb"];
            let g = ctx.createLinearGradient(0, 0, 0, 600);
            g.addColorStop(0, cSky[0]); g.addColorStop(0.8, cSky[1]);
            ctx.fillStyle = g; ctx.fillRect(0, 0, 800, 600);
            
            this.entidades.nubes.forEach(n => {
                n.x += n.v; if(n.x > 850) n.x = -n.w;
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.beginPath(); ctx.ellipse(n.x, n.y, n.w/2, n.w/4, 0, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = "#5d2e0a"; ctx.fillRect(0, 530, 800, 70); 

            if (!this.activo) { requestAnimationFrame(() => this.loop()); return; }

            this.entidades.trizas.forEach((t, i) => {
                t.x += t.vx; t.y += t.vy; t.vy += 0.2; t.vida -= 0.02;
                if(t.vida <= 0) this.entidades.trizas.splice(i, 1);
                ctx.fillStyle = t.color;
                ctx.globalAlpha = t.vida;
                ctx.fillRect(t.x, t.y, t.r, t.r);
                ctx.globalAlpha = 1.0;
            });

            let segRestantes = 120 - Math.floor((Date.now() - this.tiempoInicio) / 1000);
            const timerHUD = document.getElementById('hud-tiempo');
            if(timerHUD) timerHUD.innerText = `${Math.floor(segRestantes/60)}:${(segRestantes%60).toString().padStart(2,'0')}`;
            if (segRestantes <= 0) this.fin(false);

            const q = this.entidades.quijote;
            this.actualizarSancho();

            // Items
            for(let i = this.entidades.items.length - 1; i >= 0; i--) {
                let it = this.entidades.items[i];
                if (it.y < 510) it.y += it.vy;
                it.vida--;
                if (it.vida > 60 || this.frame % 10 < 5) {
                    ctx.font = "30px Arial"; ctx.fillText(it.icono, it.x, it.y);
                }
                if(Math.abs(it.x - q.x) < 40 && Math.abs(it.y - q.y) < 40) {
                    if(it.t === 'corazon') q.vidas = Math.min(3, q.vidas + 1);
                    if(it.t === 'lanza') this.potenciado = 400; 
                    this.entidades.items.splice(i, 1);
                } else if (it.vida <= 0) this.entidades.items.splice(i, 1);
            }

            // Proyectiles (Mejora: Ráfagas incrementan 20% al acercarse)
            for(let i = this.entidades.proyectiles.length - 1; i >= 0; i--) {
                let p = this.entidades.proyectiles[i];
                p.y += 3.2;
                
                // Incremento progresivo de tamaño basado en Y (hasta 20% extra al llegar abajo)
                let factorEscala = 1 + (p.y / 600) * 0.2;
                let tamFinal = p.s * factorEscala;

                if(Sprites[p.img]?.listo) {
                    ctx.drawImage(Sprites[p.img], p.x - tamFinal/2, p.y - tamFinal/2, tamFinal, tamFinal);
                }

                if(q && Math.abs(p.x - q.x) < tamFinal/1.8 && Math.abs(p.y - q.y) < 40) {
                    q.vidas -= p.boss ? 3 : 1; 
                    this.entidades.proyectiles.splice(i, 1);
                    if(q.vidas <= 0) this.fin(false);
                } else if(p.y > 600) this.entidades.proyectiles.splice(i, 1);
            }

            // Enemigos
            let cambioSentido = false;
            let yMasAlta = 600; 

            this.entidades.enemigos.forEach((e) => {
                e.x += 0.55 * this.hDir;
                let ola = Math.sin((this.frame * 0.1) + e.offsetOla) * 2;
                e.y += 0.08 + Math.abs(ola * 0.05);
                if(e.y < yMasAlta) yMasAlta = e.y;
                if(e.x > 760 || e.x < 40) cambioSentido = true;
                
                if(e.frameAtaque === 0 && Math.random() < 0.002) e.frameAtaque = 45;
                if(e.frameAtaque === 1) {
                    this.entidades.proyectiles.push({ 
                        x: e.x, y: e.y, s: 30, img: this.nivel === 1 ? 'imgF' : 'imgR' 
                    });
                }
                
                // MEJORA: Halo más perceptible (Muzzle Flash)
                if(e.frameAtaque > 0 && e.frameAtaque < 12) {
                    ctx.save();
                    let opacidad = e.frameAtaque / 12;
                    let radioHalo = 55 - e.frameAtaque * 2; // El halo se expande
                    let grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radioHalo);
                    grad.addColorStop(0, `rgba(255, 255, 200, ${opacidad})`);
                    grad.addColorStop(0.4, `rgba(255, 150, 0, ${opacidad * 0.6})`);
                    grad.addColorStop(1, "rgba(255, 50, 0, 0)");
                    ctx.fillStyle = grad;
                    ctx.globalCompositeOperation = 'lighter'; // Efecto brillo
                    ctx.beginPath(); ctx.arc(e.x, e.y, radioHalo, 0, Math.PI*2); ctx.fill();
                    ctx.restore();
                }
                if(e.frameAtaque > 0) e.frameAtaque--;

                if(this.nivel === 1) {
                    ctx.save(); e.rot = (e.rot || 0) + 0.03;
                    if(Sprites.imgM.listo) ctx.drawImage(Sprites.imgM, e.x-40, e.y-40, 80, 80);
                    ctx.translate(e.x, e.y-10); ctx.rotate(e.rot);
                    if(Sprites.imgA.listo) ctx.drawImage(Sprites.imgA, -45, -45, 90, 90);
                    ctx.restore();
                } else { 
                    this.dibujarGigante(e, e.x-40, e.y-50, 80, 100); 
                }
                if(e.y > 510) this.fin(false); 
            });
            if(cambioSentido) this.hDir *= -1;

            if(this.entidades.boss) {
                let b = this.entidades.boss; b.x += 1.8 * b.dir;
                if(b.x > 650 || b.x < 50) b.dir *= -1;
                this.dibujarGigante(b, b.x, b.y, b.w, b.h);
                if(b.hp > 0 && this.entidades.enemigos.length < 14 && yMasAlta > 290) {
                    this.generarFilaEnemigos(yMasAlta - 110, 1);
                }
                if(this.frame % 120 === 0) {
                    this.entidades.proyectiles.push({ x: b.x+b.w/2, y: b.y+b.h, s: 70, img: 'imgR', boss: true });
                }
                const barraBoss = document.getElementById('boss-vida-roja');
                if(barraBoss) barraBoss.style.width = (b.hp / b.hpMax * 100) + "%";
            }

            // Quijote y Lanzas
            if((teclas['ArrowLeft'] || teclas['a']) && q.x > 50) { q.x -= 7; q.dir = -1; }
            if((teclas['ArrowRight'] || teclas['d']) && q.x < 750) { q.x += 7; q.dir = 1; }
            if(teclas[' '] && Date.now() - this.ultimoDisparo > 150) {
                this.entidades.lanzas.push({ x: q.x, y: q.y - 20 });
                this.ultimoDisparo = Date.now();
            }

            this.entidades.lanzas.forEach((l, i) => {
                l.y -= 22;
                if (this.potenciado > 0) this.potenciado--;
                if(this.potenciado > 0) {
                    ctx.fillStyle = this.nivel === 3 ? "#FF00FF" : "#00FFFF";
                    ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle;
                } else { ctx.fillStyle = "#ffff00"; ctx.shadowBlur = 0; }
                ctx.fillRect(l.x-2, l.y, 4, 25);
                ctx.shadowBlur = 0;

                let b = this.entidades.boss;
                if(b && l.x > b.x && l.x < b.x+b.w && l.y < b.y+b.h) {
                    b.hp--; this.entidades.lanzas.splice(i, 1);
                    if(b.hp <= 0) { 
                        this.explotarEnTrizas(b.x + b.w/2, b.y + b.h/2, "#660000");
                        this.entidades.boss = null; document.getElementById('boss-ui').style.display = "none"; 
                    }
                }

                this.entidades.enemigos.forEach((e, j) => {
                    if(Math.abs(l.x - e.x) < 45 && Math.abs(l.y - e.y) < 45) {
                        e.hp -= (this.potenciado > 0 ? 2 : 1); 
                        this.entidades.lanzas.splice(i, 1);
                        if(e.hp <= 0) { 
                            this.bajas++;
                            this.explotarEnTrizas(e.x, e.y, this.nivel === 1 ? "#8b4513" : "#444");
                            this.entidades.enemigos.splice(j, 1); 
                            if(this.nivel > 1 && [3, 11, 17].includes(this.bajas)) this.crearItem(e.x, e.y, 'lanza', "⚡");
                        }
                    }
                });
                if(l.y < 0) this.entidades.lanzas.splice(i, 1);
            });

            if(Sprites.imgQ.listo) {
                ctx.save(); ctx.translate(q.x, q.y - 45);
                if(q.dir === -1) ctx.scale(-1, 1);
                let isWalking = (teclas['ArrowLeft'] || teclas['ArrowRight'] || teclas['a'] || teclas['d']);
                ctx.drawImage(Sprites.imgQ, isWalking ? 0 : 480, 0, 480, 440, -45, 0, 90, 85);
                ctx.restore();
            }

            document.getElementById('hud-corazones').innerText = "❤️".repeat(Math.max(0, q.vidas));
            if(this.entidades.enemigos.length === 0 && !this.entidades.boss) this.fin(true);
            requestAnimationFrame(() => this.loop());
        },

        dibujarGigante(e, x, y, w, h) {
            if(!Sprites.imgG.listo) return;
            ctx.save();
            if(this.nivel === 2) {
                if(e.hp === 2) ctx.filter = 'grayscale(1) brightness(1.2)';
                if(e.hp === 1) ctx.filter = 'grayscale(1) brightness(0.5)';
            } else if(this.nivel === 3) {
                if(e.hp === 3) ctx.filter = 'grayscale(1) brightness(1)';
                if(e.hp === 2) ctx.filter = 'grayscale(1) brightness(0.4)';
                if(e.hp === 1) ctx.filter = 'sepia(1) saturate(10) hue-rotate(-50deg)';
            }
            let cycle = Math.floor(this.frame / 25) % 2; 
            let frameIndex = (e.frameAtaque > 0) ? (cycle ? 1 : 0) : (cycle ? 3 : 2);
            ctx.drawImage(Sprites.imgG, frameIndex * 1024, 0, 1024, 1300, x, y, w, h);
            ctx.restore();
        },

        fin(v) { 
            this.activo = false; canvas.style.display = "none";
            document.getElementById('hud-superior').style.display = "none";
            const menuFinal = document.getElementById('resumenGesta');
            menuFinal.style.setProperty('display', 'flex', 'important');
            const titulo = menuFinal.querySelector('.gesta-titulo');
            if(titulo) titulo.innerText = v ? "¡VICTORIA!" : "¡GAME OVER!"; 
        }
    };

    document.querySelectorAll('.btn-nivel[data-nivel]').forEach(b => {
        b.onclick = () => Juego.iniciarNivel(parseInt(b.dataset.nivel));
    });
    
    const btnComenzar = document.getElementById('btn-comenzar');
    if(btnComenzar) {
        btnComenzar.onclick = () => {
            document.getElementById('registro-caballero').style.setProperty('display', 'none', 'important');
            document.getElementById('resumenGesta').style.setProperty('display', 'flex', 'important');
        };
    }
    Juego.loop();
});
