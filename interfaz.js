const Interfaz = {
    puntuacion: 0,

    mostrarMenuFinal: (titulo, mensaje, victoria, siguienteNivel = null, stats = { vidas: 3, tiempo: 0 }) => {
        const contenedor = document.getElementById('escenario');
        const menuExistente = document.getElementById('menu-final');
        if (menuExistente) menuExistente.remove();

        const bonusVidas = victoria ? stats.vidas * 500 : 0;
        const bonusTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = Interfaz.puntuacion + bonusVidas + bonusTiempo;

        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'};">${titulo}</h2>
            <p style="font-size: 1.5rem;">${mensaje}</p>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px;">
                <p>Puntos: ${Interfaz.puntuacion} | Bonus Vidas: ${bonusVidas} | Bonus Tiempo: ${bonusTiempo}</p>
                <h3 style="color: #f1c40f; font-size: 2rem;">TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion">${victoria ? 'CONTINUAR' : 'REINTENTAR'}</button>
        `;

        contenedor.appendChild(overlay);

        document.getElementById('btn-accion').onclick = () => {
            if (victoria && siguienteNivel) {
                window.location.href = siguienteNivel + ".html";
            } else {
                location.reload(); // Recarga el nivel actual
            }
        };
    },

    añadirPuntos: (pts) => { Interfaz.puntuacion += pts; }
};
