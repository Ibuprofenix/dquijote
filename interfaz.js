const Interfaz = {
    puntuacion: 0,

    añadirPuntos: function(pts) {
        this.puntuacion += pts;
    },

    mostrarMenuFinal: function(titulo, mensaje, victoria, siguienteNivel, stats) {
        const contenedor = document.getElementById('escenario');
        const bVidas = victoria ? stats.vidas * 500 : 0;
        const bTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = this.puntuacion + bVidas + bTiempo;

        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.innerHTML = `
            <h2 style="font-size: 3.5rem; color: ${victoria ? '#f1c40f' : '#e74c3c'}; margin-bottom: 10px;">${titulo}</h2>
            <p style="font-size: 1.5rem; margin-bottom: 20px;">${mensaje}</p>
            <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 15px; border: 2px solid #f1c40f; margin-bottom: 30px; min-width: 320px;">
                <p style="font-size: 1.2rem; margin: 5px 0;">Enemigos Derrotados: ${this.puntuacion}</p>
                <p style="font-size: 1.2rem; margin: 5px 0;">Bonus Vidas (x500): ${bVidas}</p>
                <p style="font-size: 1.2rem; margin: 5px 0;">Bonus Tiempo (x10): ${bTiempo}</p>
                <hr style="border: 0.5px solid #f1c40f; margin: 15px 0;">
                <h3 style="font-size: 2.2rem; color: #f1c40f; margin: 0;">TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion" style="background: ${victoria ? '#27ae60' : '#c0392b'};">
                ${victoria ? 'AVANZAR AL SIGUIENTE NIVEL' : 'REINTENTAR DESDE EL INICIO'}
            </button>
        `;
        contenedor.appendChild(overlay);

        document.getElementById('btn-accion').onclick = () => {
            if (victoria && siguienteNivel) {
                window.location.href = siguienteNivel + ".html";
            } else {
                location.reload();
            }
        };
    }
};
