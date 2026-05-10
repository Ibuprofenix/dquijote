/**
 * INTRO.JS - Motor de lógica de introducción
 */

document.addEventListener('DOMContentLoaded', () => {
    const registroPantalla = document.getElementById('registro-caballero');
    
    // Ocultar registro inicialmente
    if (registroPantalla) {
        registroPantalla.style.display = 'none';
        registroPantalla.style.opacity = '0';
    }

    // 1. Crear elementos de la Intro
    const introOverlay = document.createElement('div');
    introOverlay.id = 'intro-overlay';
    introOverlay.className = 'pantalla-overlay';

    const video = document.createElement('video');
    video.id = 'intro-video';
    video.src = 'intro.mp4';
    // Opcional: precargar video
    video.preload = 'auto';

    const actionBtn = document.createElement('button');
    actionBtn.className = 'btn-cartoon btn-intro-central';
    actionBtn.textContent = '¡COMENZAR GESTA!';

    introOverlay.appendChild(video);
    introOverlay.appendChild(actionBtn);
    document.body.appendChild(introOverlay);

    // 2. Función de transición al juego
    const finalizarIntro = () => {
        video.pause();
        introOverlay.style.transition = 'opacity 0.8s ease';
        introOverlay.style.opacity = '0';
        
        setTimeout(() => {
            introOverlay.remove();
            if (registroPantalla) {
                registroPantalla.style.display = 'flex';
                // Pequeño delay para que la transición de CSS de registro-caballero funcione
                setTimeout(() => registroPantalla.style.opacity = '1', 50);
            }
        }, 800);
    };

    // 3. Control del botón (Play / Saltar)
    actionBtn.onclick = (e) => {
        e.stopPropagation();
        
        if (video.paused) {
            // Iniciar reproducción
            video.play().catch(err => {
                console.log("Error al reproducir video:", err);
                finalizarIntro(); // Si falla el video, saltamos al juego
            });
            
            actionBtn.textContent = 'SALTAR';
            actionBtn.classList.add('modo-saltar');
        } else {
            // Saltar directamente si ya está reproduciendo
            finalizarIntro();
        }
    };

    // Eventos automáticos
    video.onended = finalizarIntro;

    // Tecla Escape para saltar
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('intro-overlay')) {
                finalizarIntro();
            }
        }
    });
});