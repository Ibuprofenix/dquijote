document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // --- ACTIVOS Y CONFIGURACIÓN ---
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

    // --- OBJETO PRINCIPAL DEL JUEGO ---
    const Juego = {
        nivel: 0, activo: false, corriendo: false,
        frame: 0, hDir: 1, ultimoDisparo: 0, sanchoUsado: false, 
        potenciado: 0, bajas: 0, metasBajas: [3, 11, 17],
        velEnemigoX: 0.75, velEnemigoY: 0.11,
        puntos: 0, tiempoRestante: 120, ultimoSegundo: 0,
        
        sancho: { activo: false, x: -150, y: 530, estado: 'espera', timer: 0 },
        entidades: { quijote: null, enemigos: [], proyectiles: [], lanzas: [], boss: null, items: [], trizas: [] },
        
        iniciarNivel(n) {
            if(window.AudioEngine) AudioEngine.reproducir('click');
            
            this.nivel = n;
            this.activo = true; 
            this.frame = 0; 
            this.bajas = 0;
            this.puntos = 0;
            this.potenciado = 0;
            this.hDir = 1;
            this.sanchoUsado = false;
            this.metasBajas = [3, 11, 17];
            this.tiempoRestante = 120;
            this.ultimoSegundo = Date.now();
            
            this.velEnemigoX = 0.6 + (n * 0.25); 
            this.velEnemigoY = 0.10 + (n * 0.04);
            
            // Reset de Sancho al iniciar nivel
            this.sancho = { activo: false, x: -150, y: 530, estado: 'espera', timer: 0 };

            this.entidades = {
                quijote: { x: 400, y: 530, vidas: 3, dir: 1, w: 90, h: 85, aturdido: 0 },
                enemigos: [], proyectiles: [], lanzas: [], items: [], trizas: [],
                boss: n === 3 ? { x: 340, y: 20, hp: 80, hpMax: 80, dir: 1, w: 115, h: 145, frameAtaque: 0 } : null
            };

            if(window.Interfaz) {
                Interfaz.configurarEntornoNivel(n);
                Interfaz.actualizarHUD(this.entidades.quijote.vidas);
                Interfaz.actualizarVidaBoss(0, 1);
            }
            
            this.generarFilaEnemigos(n === 3 ? 180 : 50, n === 3 ? 2 : 3);
            if(!this.corriendo) { this.corriendo = true; this.loop(); }
        },

        generarFilaEnemigos(yBase, filas) {
            for(let f=0; f<filas; f++) {
                for(let c=0; c<7; c++) {
                    this.entidades.enemigos.push({
                        x: 120+c*90, y: yBase + (f * 110),
                        hp: this.nivel === 1 ? 1 : (this.nivel === 2 ? 2 : 3), 
                        frameAtaque: 0, rot: 0
                    });
                }
            }
        },

        explotarEnTrizas(x, y, color) {
            for(let i=0; i<12; i++) {
                this.entidades.trizas.push({
                    x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                    r: 2 + Math.random() * 4, vida: 1.0, color
                });
            }
        },

        loop() {
            if (!this.activo) { 
                if (this.corriendo) requestAnimationFrame(() => this.loop()); 
                return; 
            }
            this.frame++;
            ctx.clearRect(0, 0, 800, 600); 

            const q = this.entidades.quijote;
            const s = this.sancho;

            if (Date.now() - this.ultimoSegundo > 1000) {
                this.tiempoRestante--;
                this.ultimoSegundo = Date.now();
                if (this.tiempoRestante <= 0) this.fin(false);
            }

            if(window.Interfaz) Interfaz.actualizarDatosDinámicos(this.puntos, this.tiempoRestante);

            let cambioSentido = false;
            let yMasAlta = 600;
            let numEnemigos = this.entidades.enemigos.length;

            // --- LÓGICA ENEMIGOS ---
            this.entidades.enemigos.forEach((e) => {
                e.x += this.velEnemigoX * this.hDir; 
                e.y += this.velEnemigoY;
                if(e.y < yMasAlta) yMasAlta = e.y;
                if(e.x > 760 || e.x < 40) cambioSentido = true;

                let probAtaque = 0.0025 + (this.nivel * 0.0015);
                if(e.frameAtaque === 0 && Math.random() < probAtaque) e.frameAtaque = 60;
                if(e.frameAtaque === 1) {
                    this.entidades.proyectiles.push({ 
                        x: e.x, y: e.y, vy: 3.5, ay: 0.15, s: (this.nivel === 1 ? 20 : 45), 
                        sMax: (this.nivel === 1 ? 60 : 45), img: this.nivel === 1 ? 'imgF' : 'imgR', frameVida: 0, boss: false 
                    });
                }
                
                if(this.nivel === 1) {
                    ctx.save();
                    if(e.frameAtaque > 0) { ctx.shadowBlur = 15; ctx.shadowColor = "white"; }
                    e.rot += 0.04;
                    if(Sprites.imgM.listo) ctx.drawImage(Sprites.imgM, e.x-40, e.y-40, 80, 80);
                    ctx.translate(e.x, e.y-10); ctx.rotate(e.rot);
                    if(Sprites.imgA.listo) ctx.drawImage(Sprites.imgA, -45, -45, 90, 90);
                    ctx.restore();
                } else { this.dibujarGigante(e, e.x-40, e.y-50, 80, 100); }
                
                if(e.frameAtaque > 0) e.frameAtaque--;
                if(e.y > 510) this.fin(false);
            });

            if(cambioSentido) {
                this.hDir *= -1;
                this.entidades.enemigos.forEach(e => e.y += 8);
            }

            // --- LÓGICA BOSS ---
            if(this.entidades.boss) {
                let b = this.entidades.boss;
                b.x += (2.2 + (this.nivel * 0.2)) * b.dir; 
                if(numEnemigos === 0) {
                    b.y += this.velEnemigoY * 1.5;
                    if(b.y > 420) this.fin(false); 
                }
                if(this.nivel === 3 && numEnemigos > 0 && numEnemigos < 10) {
                    let espacioLibre = yMasAlta - (b.y + b.h);
                    if(espacioLibre > 130) {
                        this.generarFilaEnemigos(b.y + b.h + 20, 1);
                        if(window.AudioEngine) AudioEngine.reproducir('invocar');
                    }
                }
                if(b.x > 650 || b.x < 50) b.dir *= -1;
                if(b.frameAtaque === 0 && Math.random() < 0.025) b.frameAtaque = 60;
                if(b.frameAtaque === 1) {
                    this.entidades.proyectiles.push({ 
                        x: b.x + b.w/2, y: b.y + b.h - 20, vy: 4.5, ay: 0.2, 
                        s: 75, sMax: 75, img: 'imgR', boss: true, frameVida: 0 
                    });
                }
                this.dibujarGigante(b, b.x, b.y, b.w, b.h);
                if(b.frameAtaque > 0) b.frameAtaque--;
                if(window.Interfaz) Interfaz.actualizarVidaBoss(b.hp, b.hpMax);
            }

            // --- MOVIMIENTO QUIJOTE ---
            if (q.aturdido <= 0) {
                let vQ = 8.5;
                if((teclas['ArrowLeft'] || teclas['a']) && q.x > 50) { q.x -= vQ; q.dir = -1; }
                if((teclas['ArrowRight'] || teclas['d']) && q.x < 750) { q.x += vQ; q.dir = 1; }
                if(teclas[' '] && Date.now() - this.ultimoDisparo > 140) {
                    this.entidades.lanzas.push({ x: q.x, y: q.y - 20 });
                    this.ultimoDisparo = Date.now();
                    if(window.AudioEngine) AudioEngine.reproducir('lanza');
                }
            } else { q.aturdido--; }

            // --- LÓGICA SANCHO PANZA (CORREGIDA) ---
            // Solo en nivel 3, solo una vez por nivel, y solo cuando queda 1 vida o menos
            if (this.nivel === 3 && !this.sanchoUsado && q.vidas <= 1) {
                s.activo = true; 
                s.estado = 'entrando'; 
                this.sanchoUsado = true;
                if(window.AudioEngine) AudioEngine.reproducir('sancho');
            }
            
            if (s.activo) {
                if (s.estado === 'entrando') { 
                    s.x += 4; 
                    if (s.x >= 120) { s.estado = 'ayudando'; s.timer = 80; } 
                }
                else if (s.estado === 'ayudando') {
                    s.timer--;
                    if (s.timer === 40) {
                        this.entidades.items.push({ x: s.x+40, y: s.y, destinoY: 530, t: 'corazon', icono: "❤️", vida: 240 });
                    }
                    if (s.timer <= 0) s.estado = 'saliendo';
                }
                else if (s.estado === 'saliendo') { 
                    s.x -= 4; 
                    if (s.x < -150) s.activo = false; 
                }
                
                if (Sprites.imgS.listo) {
                    ctx.drawImage(Sprites.imgS, 0, 0, 1024, 1024, s.x - 45, s.y - 85, 90, 90);
                }
            }

            // --- LÓGICA LANZAS ---
            this.entidades.lanzas.forEach((l, i) => {
                l.y -= 28;
                ctx.fillStyle = this.potenciado > 0 ? "#00FFFF" : "#ffff00";
                ctx.fillRect(l.x-2, l.y, 4, 30);
                
                if(this.entidades.boss && l.x > this.entidades.boss.x && l.x < this.entidades.boss.x+this.entidades.boss.w && l.y < this.entidades.boss.y+this.entidades.boss.h) {
                    this.entidades.boss.hp -= (this.potenciado > 0 ? 2 : 1);
                    this.entidades.lanzas.splice(i, 1);
                    if(window.AudioEngine) AudioEngine.reproducir('impacto');
                    if(this.entidades.boss.hp <= 0) { 
                        this.puntos += 1000;
                        this.entidades.boss = null; 
                        if(window.Interfaz) Interfaz.actualizarVidaBoss(0, 1); 
                    }
                }
                this.entidades.enemigos.forEach((e, j) => {
                    if(Math.abs(l.x - e.x) < 45 && Math.abs(l.y - e.y) < 45) {
                        e.hp -= (this.potenciado > 0 ? 2 : 1);
                        this.entidades.lanzas.splice(i, 1);
                        if(window.AudioEngine) AudioEngine.reproducir('impacto');
                        if(e.hp <= 0) {
                            this.bajas++;
                            this.puntos += 100;
                            if(this.nivel > 1 && this.metasBajas.includes(this.bajas)) {
                                this.entidades.items.push({ x: e.x, y: e.y, destinoY: 530, t: 'lanza', icono: "⚡", vida: 240 });
                                this.metasBajas = this.metasBajas.filter(m => m !== this.bajas);
                            }
                            this.explotarEnTrizas(e.x, e.y, this.nivel === 1 ? "#8b4513" : "#444");
                            this.entidades.enemigos.splice(j, 1);
                        }
                    }
                });
                if(l && l.y < 0) this.entidades.lanzas.splice(i, 1);
            });

            // --- LÓGICA ITEMS ---
            this.entidades.items.forEach((it, i) => {
                if(it.y < it.destinoY) it.y += 5; it.vida--;
                ctx.font = "30px Arial"; 
                ctx.fillText(it.icono, it.x, it.y);
                if(Math.abs(it.x - q.x) < 40 && Math.abs(it.y - q.y) < 40) {
                    this.puntos += 50;
                    if(window.AudioEngine) AudioEngine.reproducir('item');
                    if(it.t === 'corazon') {
                        q.vidas = Math.min(3, q.vidas + 1);
                        if(window.Interfaz) Interfaz.actualizarHUD(q.vidas);
                    }
                    if(it.t === 'lanza') this.potenciado = 300; 
                    this.entidades.items.splice(i, 1);
                } else if (it.vida <= 0) this.entidades.items.splice(i, 1);
            });

            // --- RENDERIZADO FINAL ---
            this.dibujarProyectiles(q);
            this.dibujarTrizas();
            this.dibujarQuijote(q);
            
            if(this.potenciado > 0) this.potenciado--;
            if(this.entidades.enemigos.length === 0 && !this.entidades.boss) this.fin(true);
            
            requestAnimationFrame(() => this.loop());
        },

        dibujarGigante(e, x, y, w, h) {
            if(!Sprites.imgG.listo) return;
            ctx.save();
            if(this.nivel === 2 && e.hp === 1) ctx.filter = 'grayscale(1) brightness(0.5)';
            if(this.nivel === 3 && e.hp === 1) ctx.filter = 'sepia(1) saturate(10) hue-rotate(-50deg)';
            let cycle = Math.floor(this.frame / 20) % 2;
            let frameIndex = (e.frameAtaque > 0) ? (cycle ? 1 : 0) : (cycle ? 3 : 2);
            ctx.drawImage(Sprites.imgG, frameIndex * 1024, 0, 1024, 1300, x, y, w, h);
            ctx.restore();
        },

        dibujarQuijote(q) {
            if(!Sprites.imgQ.listo) return;
            ctx.save();
            ctx.translate(q.x, q.y - 45);
            if(q.aturdido > 0) {
                ctx.rotate(Math.sin(this.frame * 0.2) * 0.3);
                ctx.scale(Math.sin(this.frame * 0.5), 1);
            } else if(q.dir === -1) {
                ctx.scale(-1, 1);
            }
            let walk = (teclas['ArrowLeft'] || teclas['ArrowRight'] || teclas['a'] || teclas['d']) && q.aturdido <= 0;
            ctx.drawImage(Sprites.imgQ, walk ? 0 : 480, 0, 480, 440, -45, 0, 90, 85);
            ctx.restore();
        },

        dibujarProyectiles(q) {
            this.entidades.proyectiles.forEach((p, i) => {
                if(p.img === 'imgR') { p.vy += p.ay; p.y += p.vy; }
                else { p.y += 4.5 + (this.nivel * 0.5); }
                
                p.frameVida++;
                if(this.nivel === 1) p.s = Math.min(p.sMax, 20 + p.frameVida * 0.5);
                
                let tam = p.s;
                if(Sprites[p.img]?.listo) ctx.drawImage(Sprites[p.img], p.x - tam/2, p.y - tam/2, tam, tam);
                
                if(Math.abs(p.x - q.x) < tam/2.5 && Math.abs(p.y - q.y) < 35) {
                    if(p.img === 'imgF') { 
                        q.aturdido = 100 + (this.nivel * 20);
                        if(window.AudioEngine) AudioEngine.reproducir('aturdido');
                    } else if(p.img === 'imgR') { this.explotarEnTrizas(p.x, p.y, "#8a8a8a"); }
                    
                    q.vidas -= p.boss ? 3 : 1;
                    this.entidades.proyectiles.splice(i, 1);
                    if(window.AudioEngine) AudioEngine.reproducir('impacto');
                    if(window.Interfaz) Interfaz.actualizarHUD(q.vidas);
                    if(q.vidas <= 0) this.fin(false);
                } 
                else if(p.y > 540) {
                    if(p.img === 'imgR' || p.boss) {
                        this.explotarEnTrizas(p.x, p.y, "#8a8a8a");
                        if(window.AudioEngine) AudioEngine.reproducir(p.boss ? 'impacto' : 'choque_suelo');
                    }
                    this.entidades.proyectiles.splice(i, 1);
                }
            });
        },

        dibujarTrizas() {
            this.entidades.trizas.forEach((t, i) => {
                t.x += t.vx; t.y += t.vy; t.vida -= 0.02;
                if (t.vida <= 0) this.entidades.trizas.splice(i, 1);
                ctx.globalAlpha = t.vida; ctx.fillStyle = t.color;
                ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1.0;
        },

        fin(victoria) { 
            this.activo = false;
            if(window.AudioEngine) AudioEngine.reproducir(victoria ? 'victoria' : 'muerte');
            if(window.Interfaz) Interfaz.mostrarPantallaFinal(victoria, this.puntos);
        }
    };

    window.Juego = Juego;

    document.querySelectorAll('.btn-nivel').forEach(b => {
        b.onclick = () => Juego.iniciarNivel(parseInt(b.dataset.nivel));
    });

    const btnComenzar = document.getElementById('btn-comenzar');
    if(btnComenzar) {
        btnComenzar.onclick = () => {
            if(window.AudioEngine) { AudioEngine.init(); AudioEngine.reproducir('click'); }
            if(window.GestionDatos) {
                const nombre = document.getElementById('nombreJugador').value;
                GestionDatos.setNombre(nombre);
            }
            document.getElementById('registro-caballero').classList.add('hidden');
            document.getElementById('resumenGesta').classList.remove('hidden');
            if(window.Interfaz) Interfaz.actualizarHUD(3);
        };
    }
});