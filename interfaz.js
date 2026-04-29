/**
 * SISTEMA ESTÉTICO Y DE INTERFAZ (interfaz.js)
 * Centraliza el renderizado de UI en Canvas y la lógica de menús DOM.
 */

// --- 1. GESTIÓN DE DATOS (Persistencia) ---
window.GestionDatos = {
    setNombre: (n) => localStorage.setItem('nombreCaballero', n || "Hidalgo"),
    getNombre: () => localStorage.getItem('nombreCaballero') || "Hidalgo"
};

// --- 2. VISUALIZADOR (Funciones de dibujo para el Canvas) ---
window.Visualizador = {
    dibujarHUD(ctx, datos) {
        ctx.save();
        // Fondo del HUD con transparencia
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(10, 10, 260, datos.potenciado ? 90 : 70);
        
        // Borde dorado
        ctx.strokeStyle = "#fbbf24"; 
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 260, datos.potenciado ? 90 : 70);

        // Textos del HUD
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Arial"; 
        ctx.fillText(`CABALLERO: ${datos.nombre.toUpperCase()}`, 25, 35);
        ctx.fillText(`VIDAS: ${"❤️".repeat(Math.max(0, datos.vidas))}`, 25, 55);
        ctx.fillText(`TIEMPO: ${datos.tiempo}s`, 25, 75);

        if (datos.potenciado) {
            ctx.fillStyle = "#00ffff";
            ctx.font = "italic bold 14px Arial";
            ctx.fillText("⚡ POTENCIA DE SANCHO", 25, 95);
        }
        ctx.restore();
    },

    dibujarNubes(ctx, nubes) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        nubes.forEach(n => {
            n.x += n.v; 
            if(n.x > 850) n.x = -n.w;
            ctx.beginPath();
            ctx.ellipse(n.x, n.y, n.w/2, n.w/4, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    dibujarGigante(ctx, Sprites, e, x, y, w, h, frame, nivel) {
        if(!Sprites.imgG.listo) return;
        ctx.save();
        
        let cycle = Math.floor(frame / 25) % 2;
        let frameIndex = (e.frameAtaque > 0) ? (cycle ? 1 : 0) : (cycle ? 3 : 2);
        
        // Filtros según daño
        if (nivel === 2 && e.hp === 1) ctx.filter = "grayscale(1) brightness(0.4)";
        if (nivel === 3) {
            if (e.hp === 2) ctx.filter = "grayscale(1) brightness(0.4)";
            else if (e.hp === 1) ctx.filter = "sepia(1) saturate(5) hue-rotate(-50deg) brightness(0.6)";
        }
        
        ctx.drawImage(
            Sprites.imgG, 
            frameIndex * 1024, 0, 1024, 1300, 
            Math.floor(x), Math.floor(y), w, h
        );
        ctx.restore();
    }
};

// --- 3. LÓGICA DE CONTROL DE MENÚS (Antiguo Main integrado) ---
document.addEventListener('DOMContentLoaded', () => {
    const btnComenzar = document.getElementById('btn-comenzar');
    const inputNombre = document.getElementById('nombreJugador');
    const registro = document.getElementById('registro-caballero');
    const resumen = document.getElementById('resumenGesta');
    const tituloGesta = document.getElementById('titulo-gesta');
    
    // Estos elementos son opcionales, los protegemos con una comprobación
    const progresoFill = document.getElementById('progreso-fill');
    const charCount = document.getElementById('char-count');

    // Validación del nombre
    inputNombre.addEventListener('input', () => {
        const valor = inputNombre.value.trim();
        
        // Actualizar barra de progreso estética si existe
        if (progresoFill) {
            const progreso = Math.min((valor.length / 3) * 100, 100);
            progresoFill.style.width = progreso + "%";
        }

        if (valor.length >= 3) {
            btnComenzar.disabled = false;
            if (charCount) {
                charCount.innerText = "¡Nombre listo!";
                charCount.style.color = "#4ade80";
            }
        } else {
            btnComenzar.disabled = true;
            if (charCount) {
                charCount.innerText = "Mínimo 3 letras...";
                charCount.style.color = "#94a3b8";
            }
        }
    });

    // De Registro a Selección de Nivel
    btnComenzar.addEventListener('click', () => {
        window.GestionDatos.setNombre(inputNombre.value);
        
        registro.style.display = 'none';
        resumen.classList.remove('hidden');
        resumen.style.display = 'flex'; 
        if (tituloGesta) tituloGesta.innerText = "SELECCIONAR NIVEL";
    });

    // Selección de Nivel: Conexión directa con el Motor
    const botonesNivel = document.querySelectorAll('.btn-nivel[data-nivel]');
    botonesNivel.forEach(boton => {
        boton.addEventListener('click', () => {
            const nivelSeleccionado = parseInt(boton.getAttribute('data-nivel'));
            
            if (window.Juego) {
                // Ocultamos la interfaz de selección para empezar el juego
                resumen.style.display = 'none';
                resumen.classList.add('hidden');
                
                // Iniciamos el motor
                window.Juego.iniciarNivel(nivelSeleccionado);
            } else {
                console.error("El motor de juego no se ha detectado (juego.js no cargado).");
            }
        });
    });
});

/**
 * Función puente para que el motor de juego (juego.js) regrese a la interfaz
 */
window.finalizarPartidaUI = function(victoria) {
    const resumen = document.getElementById('resumenGesta');
    const tituloGesta = document.getElementById('titulo-gesta');
    
    resumen.classList.remove('hidden');
    resumen.style.display = 'flex';
    
    if (tituloGesta) {
        tituloGesta.innerText = victoria ? "¡VICTORIA HEROICA!" : "¡DERROTA DIGNA!";
    }
};
