const Interfaz = {
    puntuacion: 0,
    añadirPuntos: function(pts) { this.puntuacion += pts; },
    mostrarMenuFinal: function(titulo, mensaje, victoria, siguienteNivel, stats) {
        const contenedor = document.getElementById('escenario');
        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        
        const bVidas = victoria ? stats.vidas * 500 : 0;
        const bTiempo = victoria ? stats.tiempo * 10 : 0;
        const total = this.puntuacion + bVidas + bTiempo;

        overlay.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'}">${titulo}</h2>
            <p>${mensaje}</p>
            <div style="border: 1px solid gold; padding: 20px; margin: 20px; background: rgba(0,0,0,0.5)">
                <p>Enemigos: ${this.puntuacion}</p>
                <p>Bonus Vidas: ${bVidas}</p>
                <p>Bonus Tiempo: ${bTiempo}</p>
                <hr>
                <h3>TOTAL: ${total}</h3>
            </div>
            <button id="btn-accion">${victoria ? 'AVANZAR' : 'REINTENTAR'}</button>
        `;
        contenedor.appendChild(overlay);
        document.getElementById('btn-accion').onclick = () => {
            if(victoria && siguienteNivel) window.location.href = siguienteNivel + ".html";
            else location.reload();
        };
    }
};
