const Interfaz = {
    puntuacion: 0,

    mostrarMenuFinal: (titulo, mensaje, victoria, siguienteNivel = null, stats = { vidas: 3, tiempo: 0 }) => {
        const contenedor = document.getElementById('contenedor-juego');
        
        const bVidas = victoria ? stats.vidas * 500 : 0;
        const bTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = Interfaz.puntuacion + bVidas + bTiempo;

        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'}">${titulo}</h2>
            <p style="font-size: 1.5rem;">${mensaje}</p>
            <div style="margin: 20px; padding: 20px; border: 1px solid #f1c40f; background: rgba(255,255,255,0.1);">
                <p>Enemigos: ${Interfaz.puntuacion}</p>
                <p>Bonus Vidas: ${bVidas}</p>
                <p>Bonus Tiempo: ${bTiempo}</p>
                <hr>
                <h3 style="font-size: 2rem; color: #f1c40f;">TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion">${victoria ? 'SIGUIENTE NIVEL' : 'REINTENTAR'}</button>
        `;
        contenedor.appendChild(overlay);

        document.getElementById('btn-accion').onclick = () => {
            if (victoria && siguienteNivel) {
                window.location.href = siguienteNivel + ".html";
            } else {
                location.reload();
            }
        };
    },

    añadirPuntos: (pts) => {
        Interfaz.puntuacion += pts;
    }
};
