const GestionDatos = {
    guardarNombre(nombre) {
        localStorage.setItem('quijote_nombre', nombre.trim() || "Hidalgo Anónimo");
    },
    getNombre() {
        return localStorage.getItem('quijote_nombre') || "Hidalgo Anónimo";
    },
    enviarAlScript(estado, vidas, nivel, puntos) {
        const URL_WEBAPP = "TU_URL_AQUI"; 
        const datos = {
            nombre: this.getNombre(),
            estado: estado,
            vidas: vidas,
            nivel: nivel,
            puntos: puntos,
            fecha: new Date().toLocaleString('es-ES')
        };
        fetch(URL_WEBAPP, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        }).then(() => console.log("Gesta enviada."));
    }
};
