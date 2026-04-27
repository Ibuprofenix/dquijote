const Interfaz = {
    puntuacion: 0,

    mostrarMenuFinal: (titulo, mensaje, victoria, siguienteNivel = null, stats = { vidas: 3, tiempo: 0 }) => {
        const menuExistente = document.getElementById('menu-final');
        if (menuExistente) menuExistente.remove();

        // Cálculo de Bonus
        const bonusVidas = victoria ? stats.vidas * 500 : 0;
        const bonusTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = Interfaz.puntuacion + bonusVidas + bonusTiempo;

        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'};">${titulo}</h2>
            <p style="font-size: 1.5rem;">${mensaje}</p>
            <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px; min-width: 280px;">
                <p>Enemigos: ${Interfaz.puntuacion}</p>
                <p>Bonus Vidas: ${bonusVidas}</p>
                <p>Bonus Tiempo: ${bonusTiempo}</p>
                <hr style="border: 0.5px solid #555;">
                <h3 style="color: #f1c40f;">TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion" style="background: ${victoria ? '#27ae60' : '#c0392b'};">
                ${victoria ? 'CONTINUAR' : 'REINTENTAR'}
            </button>
        `;

        // Se añade al contenedor del canvas para respetar el centrado
        document.getElementById('wrapper').appendChild(overlay);

        document.getElementById('btn-accion').onclick = () => {
            window.location.href = (victoria && siguienteNivel) ? siguienteNivel + ".html" : "index.html";
        };
    },

    añadirPuntos: (puntos) => {
        Interfaz.puntuacion += puntos;
    }
};
