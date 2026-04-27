const Interfaz = {
    puntuacion: 0,
    añadirPuntos: function(pts) { this.puntuacion += pts; },
    mostrarMenuFinal: function(titulo, mensaje, victoria, siguienteNivel, stats) {
        const contenedor = document.getElementById('escenario');
        const bVidas = victoria ? stats.vidas * 500 : 0;
        const bTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = this.puntuacion + bVidas + bTiempo;

        const div = document.createElement('div');
        div.id = 'menu-final';
        div.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'}">${titulo}</h2>
            <p style="font-size: 1.5rem;">${mensaje}</p>
            <div style="border: 2px solid #f1c40f; padding: 20px; background: rgba(0,0,0,0.6); margin: 20px;">
                <p>Enemigos: ${this.puntuacion}</p>
                <p>Bonus Vidas (x500): ${bVidas}</p>
                <p>Bonus Tiempo (x10): ${bTiempo}</p>
                <hr style="border: 0.5px solid #f1c40f">
                <h3 style="color: #f1c40f; font-size: 2rem;">TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion">${victoria ? 'AVANZAR' : 'REINTENTAR'}</button>
        `;
        contenedor.appendChild(div);
        document.getElementById('btn-accion').onclick = () => {
            if(victoria && siguienteNivel) window.location.href = siguienteNivel + ".html";
            else location.reload();
        };
    }
};
