/**
 * interfaz.js - Menús y envío de datos
 */

const Interfaz = {
    puntuacion: 0,
    añadirPuntos: (pts) => { Interfaz.puntuacion += pts; },
    
    mostrarMenuFinal: (titulo, mensaje, victoria) => {
        const menuExistente = document.getElementById('menu-final');
        if (menuExistente) menuExistente.remove();

        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.style = "position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;text-align:center;z-index:1000;font-family:Georgia;";
        
        overlay.innerHTML = `
            <h2 style="color:#f1c40f;font-size:3rem;margin-bottom:10px">${titulo}</h2>
            <p style="font-size:1.2rem">${mensaje}</p>
            <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;margin:20px">
                <p>PUNTUACIÓN FINAL: <strong style="font-size:1.5rem">${Interfaz.puntuacion}</strong></p>
            </div>
            <div id="contenedor-botones">
                <button onclick="window.location.href='index.html'" style="padding:15px 30px;background:#e74c3c;color:white;border:none;cursor:pointer;font-weight:bold;border-radius:5px">REINTENTAR</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
};

function registrarEnGoogle(nombre, puntos, urlApp) {
    // Técnica de imagen para evitar bloqueos de CORS del servidor
    const scriptURL = `${urlApp}?nombre=${encodeURIComponent(nombre)}&puntos=${puntos}`;
    const imgPing = new Image();
    imgPing.src = scriptURL;
    console.log("Datos enviados a Google:", nombre, puntos);
}
