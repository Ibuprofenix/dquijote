const Interfaz = {
    puntuacion: 0,

    mostrarMenuFinal: (titulo, mensaje, victoria, siguienteNivel = null) => {
        const menuExistente = document.getElementById('menu-final');
        if (menuExistente) menuExistente.remove();

        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.style = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85); display: flex; flex-direction: column;
            align-items: center; justify-content: center; z-index: 1000;
            color: white; font-family: 'MedievalSharp', cursive, Arial; text-align: center;
        `;

        overlay.innerHTML = `
            <h2 style="font-size: 3rem; color: ${victoria ? '#f1c40f' : '#e74c3c'}; margin-bottom: 10px;">${titulo}</h2>
            <p style="font-size: 1.5rem; margin-bottom: 20px;">${mensaje}</p>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px; min-width: 250px;">
                <p style="font-size: 1.2rem;">Puntuación: <strong>${Interfaz.puntuacion}</strong></p>
            </div>
            <button id="btn-accion" style="
                padding: 15px 40px; font-size: 1.2rem; cursor: pointer;
                background: ${victoria ? '#27ae60' : '#c0392b'}; color: white;
                border: none; border-radius: 5px; font-weight: bold;
            ">${victoria ? 'AVANZAR AL SIGUIENTE NIVEL' : 'REINTENTAR DESDE EL INICIO'}</button>
        `;

        document.body.appendChild(overlay);

        document.getElementById('btn-accion').onclick = () => {
            if (victoria && siguienteNivel) {
                window.location.href = siguienteNivel + ".html";
            } else {
                // Cambiado para que apunte siempre al index principal
                window.location.href = "index.html"; 
            }
        };
    },

    añadirPuntos: (puntos) => {
        Interfaz.puntuacion += puntos;
    }
};
