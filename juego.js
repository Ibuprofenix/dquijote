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
        nivel: 0, activo: false, corriendo: false,
        frame: 0, hDir: 1, ultimoDisparo: 0, sanchoUsado: false, 
        potenciado: 0, bajas: 0, metasBajas: [3, 11, 17],
        sancho: { activo: false, x: -150, y: 530, estado: 'espera', timer: 0 },
        entidades: { quijote: null, enemigos: [], proyectiles: [], lanzas: [], boss: null, items: [], trizas: [] },
        
        iniciarNivel(n) {
            AudioEngine.reproducir('click');
            this.nivel = n;
            this.activo = true; 
            this.frame = 0; 
            this.bajas = 0;
            this.potenciado = 0; 
            this.hDir = 1; 
            this.sanchoUsado = false; 
            this.metasBajas = [3, 11, 17];
            this.sancho = { activo: false, x: -150, y: 530, estado: 'espera', timer: 0 };
            
            this.entidades = {
                quijote: { x: 400, y: 530, vidas: 3, dir: 1, w: 90, h: 85 },
                enemigos: [], proyectiles: [], lanzas: [], items: [], trizas: [],
                boss: n === 3 ? { x: 340, y: 20, hp: 60, hpMax: 60, dir: 1, w: 115, h: 145, frameAtaque: 0 } : null
            };

            const container = document.getElementById('game-container');
            container.className = `nivel-${n}`;
            this.generarFilaEnemigos(n === 3 ? 180 : 50, n === 3 ? 2 : 3);
            
            document.getElementById('registro-caballero').classList.add('hidden');
            document.getElementById('resumenGesta').classList.add('hidden');
            document.getElementById('hud-superior').style.display = "flex";
            document.getElementById('hud-nombre').innerText = document.getElementById('nombreJugador').value || "Hidalgo";
            
            canvas.style.display = "block";
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

        crearItem(x, y, tipo, icono) {
            this.entidades.items.push({ x, y: y, destinoY: 530, t: tipo, icono: icono, vida: 240 });
        },

        actualizarSancho(q) {
            const s = this.sancho;
            if (this.nivel === 3 && !this.sanchoUsado && q.vidas === 1 && s.estado === 'espera') {
                s.activo = true; s.estado = 'entrando'; this.sanchoUsado = true;
                AudioEngine.reproducir('sancho');
            }
            if (!s.activo) return;

            if (s.estado === 'entrando') {
                s.x += 4; if (s.x >= 120) { s.estado = 'ayudando'; s.timer = 80; }
            } else if (s.estado === 'ayudando') {
                s.timer--;
                if (s.timer === 40) this.crearItem(s.x + 40, s.y, 'corazon', "❤️");
                if (s.timer <= 0) s.estado = 'saliendo';
            } else if (s.estado === 'saliendo') {
                s.x -= 4; if (s.x < -150) s.activo = false;
            }

            if (Sprites.imgS.listo) {
                ctx.drawImage(Sprites.imgS, 0, 0, 1024, 1024, s.x - 45, s.y - 85, 90, 90);
            }
        },

        roundRect(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        },

        loop() {
            this.frame++;
            ctx.clearRect(0, 0, 800, 600); 
            if (!this.activo) { requestAnimationFrame(() => this.loop()); return; }

            const q = this.entidades.quijote;
            this.actualizarSancho(q);

            for (let i = this.entidades.trizas.length - 1; i >= 0; i--) {
                let t = this.entidades.trizas[i];
                t.x += t.vx; t.y += t.vy; t.vida -= 0.02;
                if (t.vida <= 0) { this.entidades.trizas.splice(i, 1); continue; }
                ctx.globalAlpha = t.vida;
                ctx.fillStyle = t.color;
                ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            let cambioSentido = false;
            let yMasAlta = 600;

            this.entidades.enemigos.forEach((e) => {
                e.x += 0.75 * this.hDir;
                e.y += 0.11;
                if(e.y < yMasAlta) yMasAlta = e.y;
                if(e.x > 760 || e.x < 40) cambioSentido = true;
                
                if(e.frameAtaque === 0 && Math.random() < 0.003) e.frameAtaque = 60;
                if(e.frameAtaque === 1) {
                    this.entidades.proyectiles.push({ 
                        x: e.x, y: e.y, s: (this.nivel === 1 ? 20 : 45), sMax: (this.nivel === 1 ? 60 : 45), 
                        img: this.nivel === 1 ? 'imgF' : 'imgR', frameVida: 0 
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
                } else {
                    this.dibujarGigante(e, e.x-40, e.y-50, 80, 100);
                }
                if(e.frameAtaque > 0) e.frameAtaque--;
                if(e.y > 510) this.fin(false);
            });
            if(cambioSentido) this.hDir *= -1;

            if(this.entidades.boss) {
                let b = this.entidades.boss;
                b.x += 2.3 * b.dir; 
                if(b.x > 650 || b.x < 50) b.dir *= -1;
                this.dibujarGigante(b, b.x, b.y, b.w, b.h);
                
                if(this.nivel === 3 && this.entidades.enemigos.length > 0 && this.entidades.enemigos.length < 14 && yMasAlta > 290) {
                    this.generarFilaEnemigos(yMasAlta - 110, 1);
                }
                
                if(this.frame % 90 === 0) {
                    this.entidades.proyectiles.push({ x: b.x+b.w/2, y: b.y+b.h, s: 75, sMax: 75, img: 'imgR', boss: true, frameVida: 0 });
                }

                ctx.fillStyle = "rgba(0,0,0,0.7)";
                this.roundRect(150, 570, 500, 15, 8);
                ctx.fill();
                ctx.fillStyle = "#ff0000";
                this.roundRect(150, 570, (b.hp / b.hpMax) * 500, 15, 8);
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                this.roundRect(150, 570, 500, 15, 8);
                ctx.stroke();
                ctx.lineWidth = 1;
            }

            if((teclas['ArrowLeft'] || teclas['a']) && q.x > 50) { q.x -= 8.5; q.dir = -1; }
            if((teclas['ArrowRight'] || teclas['d']) && q.x < 750) { q.x += 8.5; q.dir = 1; }
            if(teclas[' '] && Date.now() - this.ultimoDisparo > 140) {
                this.entidades.lanzas.push({ x: q.x, y: q.y - 20 });
                this.ultimoDisparo = Date.now();
                AudioEngine.reproducir('lanza');
            }

            for(let i = this.entidades.lanzas.length - 1; i >= 0; i--) {
                let l = this.entidades.lanzas[i];
                l.y -= 28;
                ctx.fillStyle = this.potenciado > 0 ? "#00FFFF" : "#ffff00";
                ctx.fillRect(l.x-2, l.y, 4, 30);
                
                let b = this.entidades.boss;
                if(b && l.x > b.x && l.x < b.x+b.w && l.y < b.y+b.h) {
                    b.hp -= (this.potenciado > 0 ? 2 : 1);
                    this.entidades.lanzas.splice(i, 1);
                    AudioEngine.reproducir('impacto');
                    if(b.hp <= 0) this.entidades.boss = null; 
                    continue;
                }

                this.entidades.enemigos.forEach((e, j) => {
                    if(Math.abs(l.x - e.x) < 45 && Math.abs(l.y - e.y) < 45) {
                        e.hp -= (this.potenciado > 0 ? 2 : 1);
                        this.entidades.lanzas.splice(i, 1);
                        AudioEngine.reproducir('impacto');
                        if(e.hp <= 0) {
                            this.bajas++;
                            if(this.nivel > 1 && this.metasBajas.includes(this.bajas)) {
                                this.crearItem(e.x, e.y, 'lanza', "⚡");
                                this.metasBajas = this.metasBajas.filter(m => m !== this.bajas);
                            }
                            this.explotarEnTrizas(e.x, e.y, this.nivel === 1 ? "#8b4513" : "#444");
                            this.entidades.enemigos.splice(j, 1);
                        }
                    }
                });
                if(l.y < 0) this.entidades.lanzas.splice(i, 1);
            }

            for(let i = this.entidades.items.length - 1; i >= 0; i--) {
                let it = this.entidades.items[i];
                if(it.y < it.destinoY) it.y += 5; 
                it.vida--;
                ctx.font = "30px Arial"; ctx.fillText(it.icono, it.x, it.y);
                if(Math.abs(it.x - q.x) < 40 && Math.abs(it.y - q.y) < 40) {
                    AudioEngine.reproducir('item');
                    if(it.t === 'corazon') q.vidas = Math.min(3, q.vidas + 1);
                    if(it.t === 'lanza') this.potenciado = 300; 
                    this.entidades.items.splice(i, 1);
                } else if (it.vida <= 0) this.entidades.items.splice(i, 1);
            }

            this.dibujarProyectiles(q);
            this.dibujarQuijote(q);

            if(this.potenciado > 0) this.potenciado--;
            document.getElementById('hud-corazones').innerText = "❤️".repeat(Math.max(0, q.vidas));
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
            ctx.save(); ctx.translate(q.x, q.y - 45);
            if(q.dir === -1) ctx.scale(-1, 1);
            let walk = (teclas['ArrowLeft'] || teclas['ArrowRight'] || teclas['a'] || teclas['d']);
            ctx.drawImage(Sprites.imgQ, walk ? 0 : 480, 0, 480, 440, -45, 0, 90, 85);
            ctx.restore();
        },

        dibujarProyectiles(q) {
            for(let i = this.entidades.proyectiles.length - 1; i >= 0; i--) {
                let p = this.entidades.proyectiles[i];
                p.y += 4.5; 
                p.frameVida++;
                if(this.nivel === 1) p.s = Math.min(p.sMax, 20 + p.frameVida * 0.5);
                let tam = p.s;
                if(Sprites[p.img]?.listo) ctx.drawImage(Sprites[p.img], p.x - tam/2, p.y - tam/2, tam, tam);
                if(Math.abs(p.x - q.x) < tam/2 && Math.abs(p.y - q.y) < 40) {
                    q.vidas -= p.boss ? 3 : 1;
                    this.entidades.proyectiles.splice(i, 1);
                    AudioEngine.reproducir('impacto');
                    if(q.vidas <= 0) this.fin(false);
                } else if(p.y > 600) this.entidades.proyectiles.splice(i, 1);
            }
        },

        fin(v) { 
            this.activo = false;
            AudioEngine.reproducir(v ? 'victoria' : 'muerte');
            document.getElementById('hud-superior').style.display = "none";
            const menuFinal = document.getElementById('resumenGesta');
            menuFinal.classList.remove('hidden');
            menuFinal.querySelector('.gesta-titulo').innerText = v ? "¡VICTORIA!" : "¡GAME OVER!";
        }
    };

    document.querySelectorAll('.btn-nivel').forEach(b => {
        b.onclick = () => Juego.iniciarNivel(parseInt(b.dataset.nivel));
    });
    
    document.getElementById('btn-comenzar').onclick = () => {
        // ACTIVACIÓN DE AUDIO POR INTERACCIÓN HUMANA
        AudioEngine.init(); 
        AudioEngine.reproducir('click');
        
        document.getElementById('registro-caballero').classList.add('hidden');
        document.getElementById('resumenGesta').classList.remove('hidden');
    };
});