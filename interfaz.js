/**
 * interfaz.js - Menús y Ranking
 */
const Interfaz = {
    puntuacion: 0,
    añadirPuntos: (pts) => { Interfaz.puntuacion += pts; },
    mostrarMenuFinal: (titulo, mensaje, victoria) => {
        const overlay = document.createElement('div');
        overlay.id = 'menu-final';
        overlay.style = "position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;text-align:center;z-index:1000;font-family:Georgia;";
        overlay.innerHTML = `
            <h1 style="color:#f1c40f;font-size:3.5rem">${titulo}</h1>
            <p style="font-size:1.5rem">${mensaje}</p>
            <div style="background:rgba(255,255,255,0.1);padding:20px;border-radius:10px;margin:20px">
                <p>PUNTUACIÓN TOTAL: <strong style="font-size:2rem;color:#f1c40f">${Interfaz.puntuacion}</strong></p>
            </div>
            <div id="btns">
                <button onclick="location.reload()" style="padding:15px 30px;background:#e74c3c;color:white;border:none;cursor:pointer;font-weight:bold;border-radius:5px">REINTENTAR</button>
            </div>`;
        document.body.appendChild(overlay);
    }
};

function registrarEnGoogle(nombre, puntos, urlApp) {
    if(!urlApp || urlApp.includes("TU_URL")) return;
    const imgPing = new Image();
    imgPing.src = `${urlApp}?nombre=${encodeURIComponent(nombre)}&puntos=${puntos}`;
}
