/* =====================================================
   UN UNIVERSO PARA TI
   -----------------------------------------------------
   Para editar los mensajes: cambia el arreglo CARTAS.
   El número de flores se ajusta solo al número de cartas.
===================================================== */

const CARTAS = [
    "Con esta mano yo sostendre tus anhelos, tu copa nunca estara vacia por que yo sere tu vino, con esta vela alumnbrare tu camino en la obscuridad y con este anillo te pido que seas mi esposa. 💛",
    "Si pudiera guardar un momento para siempre, elegiría uno en el que estés tú. 🌻",
    "Enamorarme de ti ha sido lo mas facil q eh echo en mi vida. 💛",
    "Puedo ser gracioso, si queires, solemne, listo, supersticioso, valiente y podria ser bailarin.. Solo dime lo que quieres y lo sere por ti. 🌼",
    "Esto que tu sientes es lo que yo siento cada vez que estoy contigo. ✨💛",
    "Este es el Amor del cual mi abuelito me hablaba, Querer estar a tu lado hasta que el pelo este lleno de canas. 🌻",
    "No va a ser facil Va a ser muy dificil, vamos a tener que trabajar en esto todos los dias, pero quiero hacerlo por que te amo a ti.  Quiero todo de ti, para siempre tu y yo todos los dias. 💛",
    "A veces una persona se convierte en tu lugar favorito sin siquiera darse cuenta. 🌼",
    "Yo siempre estare para ti, cuando ni tu estes para ti. 💛",
    "Se que hay mil razones por las que no debemos estar juntos, pero estoy harto de ellas, estoy harto de todas esas razones, hay que hacer una eleccion y te elijo a ti. 🌻",
    "Ojalá cada vez que veas algo amarillo recuerdes que hay alguien que piensa en ti. 💛",
    "Y si llegaste hasta aquí... probablemente ya descubriste que eras tú la razón de todo este universo. 🌻💛"
];

/* Se desbloquea al abrir todas las flores */
const CARTA_FINAL =
    "Abriste todas las flores. Cada una era una forma distinta de decirte lo mismo: " +
    "Te amo muchisisimo y siempre estre infinitamente feliz del q hoy estemos juntos. 🌻💛";


const CONFIG = {
    vueloMs: 5600,      // duración de la intro
    brazos: 2,          // brazos de la espiral
    vuelta: 3.5,        // radianes que barre cada brazo (más = más enroscada)
    radioMin: 14,       // radio (% del campo) de la flor con carta más interna
    radioMax: 35,       // radio de la más externa
    velocidadTexto: 28  // ms por letra
};

const chico = window.matchMedia("(max-width: 700px)").matches;
const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CANTIDAD = {
    floresFondo: chico ? 72 : 120,
    warpEstrellas: chico ? 90 : 150,
    warpParticulas: chico ? 45 : 80,
    estrellasPorCapa: chico ? 55 : 85
};


/* =====================================================
   ELEMENTOS
===================================================== */

const $ = (id) => document.getElementById(id);

const intro = $("intro");
const universo = $("universo");

const warpEstrellas = $("warpEstrellas");
const warpParticulas = $("warpParticulas");

const cielo = $("cielo");
const galaxiaWrap = $("galaxiaWrap");
const floresFondo = $("floresFondo");
const floresCarta = $("floresCarta");
const nucleo = $("nucleo");
const progreso = $("progreso");

const carta = $("carta");
const cartaTexto = $("cartaTexto");
const cartaTextoAccesible = $("cartaTextoAccesible");
const cerrarBoton = $("cerrarCarta");

const musica = $("musica");
const botonMusica = $("botonMusica");


/* =====================================================
   UTILIDADES
===================================================== */

/* Aleatorio con semilla: la galaxia se ve igual en cada visita */
function crearAzar(semilla) {
    let a = semilla >>> 0;
    return function () {
        a += 0x6D2B79F5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const azar = crearAzar(20260920);

const entre = (min, max) => min + azar() * (max - min);

/* Punto sobre un brazo de la espiral. t va de 0 (centro) a 1 (borde). */
function puntoEspiral(t, brazo, radioMin, radioMax, dispersion) {
    const inicio = (brazo / CONFIG.brazos) * Math.PI * 2;

    /* el brazo se abre girando; cerca del centro va más apretado */
    const angulo = inicio + t * CONFIG.vuelta + entre(-.5, .5) * dispersion * (1 - .45 * t);
    const radio = radioMin + (radioMax - radioMin) * t + entre(-.5, .5) * dispersion * 9;

    return {
        x: 50 + radio * Math.cos(angulo),
        y: 50 + radio * Math.sin(angulo),
        radio
    };
}

/* Punto suelto fuera de los brazos: rompe la simetría */
function puntoHalo() {
    const angulo = azar() * Math.PI * 2;
    const radio = 10 + Math.pow(azar(), .6) * 36;

    return {
        x: 50 + radio * Math.cos(angulo),
        y: 50 + radio * Math.sin(angulo),
        radio
    };
}

function crearFlor(clase) {
    const flor = document.createElement(clase === "carta" ? "button" : "span");
    flor.className = clase === "carta" ? "flor flor--carta" : "flor flor--fondo";

    const cuerpo = document.createElement("span");
    cuerpo.className = "flor__cuerpo";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "flor__svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");

    const uso = document.createElementNS("http://www.w3.org/2000/svg", "use");
    uso.setAttribute("href", "#petalos");
    /* respaldo para Safari viejo */
    uso.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#petalos");

    svg.appendChild(uso);
    cuerpo.appendChild(svg);
    flor.appendChild(cuerpo);

    return flor;
}


/* =====================================================
   GALAXIA DE FLORES
===================================================== */

function construirFloresFondo() {
    const trozo = document.createDocumentFragment();
    const tonos = ["#ffd968", "#ffe9a8", "#ffc63d", "#fff3cd"];

    for (let i = 0; i < CANTIDAD.floresFondo; i++) {
        const t = Math.pow(azar(), .7);                 // más densidad cerca del centro
        const brazo = i % CONFIG.brazos;
        const punto = puntoEspiral(t, brazo, 7, 62, .45);

        const flor = crearFlor("fondo");
        const lejania = 1 - t;                          // las de adentro se ven más chicas y tenues

        flor.style.cssText = `
            --x:${punto.x.toFixed(2)};
            --y:${punto.y.toFixed(2)};
            --tam:${entre(1.4, 3.8).toFixed(2)};
            --giro:${Math.round(entre(0, 360))}deg;
            --opa:${(0.28 + (1 - lejania) * 0.45).toFixed(2)};
            --tono:${tonos[i % tonos.length]};
            --flote:${entre(4, 9).toFixed(1)}s;
            --floteRetraso:-${entre(0, 6).toFixed(1)}s;
        `;

        trozo.appendChild(flor);
    }

    floresFondo.appendChild(trozo);
}


function construirFloresCarta() {
    const trozo = document.createDocumentFragment();
    const vueltas = Math.ceil(CARTAS.length / CONFIG.brazos);

    CARTAS.forEach((mensaje, i) => {
        /* una flor por brazo en cada vuelta: quedan repartidas del centro hacia afuera */
        const vuelta = Math.floor(i / CONFIG.brazos);
        const t = (vuelta + 1) / (vueltas + .4) + .05;
        const punto = puntoEspiral(t, i % CONFIG.brazos, CONFIG.radioMin, CONFIG.radioMax, .16);

        const flor = crearFlor("carta");
        flor.type = "button";
        flor.dataset.indice = String(i);
        flor.setAttribute("aria-label", `Abrir la carta ${i + 1} de ${CARTAS.length}`);

        flor.style.cssText = `
            --x:${punto.x.toFixed(2)};
            --y:${punto.y.toFixed(2)};
            --giro:${Math.round(entre(0, 360))}deg;
            --flote:${entre(3.6, 6.4).toFixed(1)}s;
            --floteRetraso:-${entre(0, 4).toFixed(1)}s;
        `;

        flor.addEventListener("click", () => {
            marcarLeida(i, flor);
            abrirCarta(mensaje, flor);
        });

        trozo.appendChild(flor);
    });

    floresCarta.appendChild(trozo);
}


/* =====================================================
   CIELO (estrellas con box-shadow: 3 nodos, no 250)
===================================================== */

function pintarCielo() {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    cielo.querySelectorAll(".cielo__capa").forEach((capa, indice) => {
        const sombras = [];
        const brillo = [.9, .65, .45][indice];
        const radio = [0, .6, 1.3][indice];

        for (let i = 0; i < CANTIDAD.estrellasPorCapa; i++) {
            const x = Math.round(azar() * ancho);
            const y = Math.round(azar() * alto);
            sombras.push(`${x}px ${y}px 0 ${radio}px rgba(255,255,255,${brillo})`);
        }

        capa.style.boxShadow = sombras.join(",");
    });
}

let temporizadorCielo;
window.addEventListener("resize", () => {
    clearTimeout(temporizadorCielo);
    temporizadorCielo = setTimeout(pintarCielo, 250);
});


/* =====================================================
   INTRO
===================================================== */

function construirViaje() {
    if (menosMovimiento) return;

    const hazCapa = (contenedor, clase, cantidad, durMin, durMax) => {
        const trozo = document.createDocumentFragment();

        for (let i = 0; i < cantidad; i++) {
            const punto = document.createElement("div");
            punto.className = clase;
            punto.style.cssText = `
                --angulo:${Math.round(azar() * 360)}deg;
                --dur:${entre(durMin, durMax).toFixed(2)}s;
                --retraso:-${entre(0, 2).toFixed(2)}s;
            `;
            trozo.appendChild(punto);
        }

        contenedor.appendChild(trozo);
    };

    hazCapa(warpEstrellas, "warpEstrella", CANTIDAD.warpEstrellas, .5, 1.9);
    hazCapa(warpParticulas, "warpParticula", CANTIDAD.warpParticulas, .6, 2.1);
}


let temporizadores = [];
let introTerminada = false;

function mostrarUniverso() {
    universo.classList.add("visible");
    universo.removeAttribute("inert");
}

function terminarIntro() {
    if (introTerminada) return;
    introTerminada = true;

    temporizadores.forEach(clearTimeout);
    temporizadores = [];

    mostrarUniverso();
    intro.classList.add("terminado");

    /* al quitar la intro del DOM se liberan ~230 elementos animados */
    setTimeout(() => intro.remove(), 900);
}

function arrancarIntro() {
    document.documentElement.style.setProperty("--vuelo", `${CONFIG.vueloMs}ms`);

    if (menosMovimiento) {
        terminarIntro();
        return;
    }

    construirViaje();

    /* el universo aparece por debajo justo cuando el destello está en su punto alto */
    temporizadores.push(setTimeout(mostrarUniverso, CONFIG.vueloMs - 400));
    temporizadores.push(setTimeout(terminarIntro, CONFIG.vueloMs + 150));

    /* un toque en cualquier parte de la intro también la salta */
    intro.addEventListener("click", terminarIntro);
}


/* =====================================================
   CARTA
===================================================== */

let escribiendo = null;
let mensajeActual = "";
let florOrigen = null;

function escribir(mensaje) {
    clearInterval(escribiendo);

    /* Array.from respeta los emojis: message[i] los parte a la mitad */
    const letras = Array.from(mensaje);

    if (menosMovimiento) {
        cartaTexto.textContent = mensaje;
        return;
    }

    cartaTexto.textContent = "";
    carta.classList.add("escribiendo");

    let i = 0;
    escribiendo = setInterval(() => {
        cartaTexto.textContent += letras[i++];

        if (i >= letras.length) {
            clearInterval(escribiendo);
            escribiendo = null;
            carta.classList.remove("escribiendo");
        }
    }, CONFIG.velocidadTexto);
}

function completarTexto() {
    if (!escribiendo) return;
    clearInterval(escribiendo);
    escribiendo = null;
    cartaTexto.textContent = mensajeActual;
    carta.classList.remove("escribiendo");
}

function abrirCarta(mensaje, origen) {
    mensajeActual = mensaje;
    florOrigen = origen || null;

    cartaTextoAccesible.textContent = mensaje;

    carta.removeAttribute("inert");
    carta.classList.add("abierta");
    universo.setAttribute("inert", "");

    escribir(mensaje);
    cerrarBoton.focus({ preventScroll: true });

    iniciarMusica();
}

function cerrarCarta() {
    if (!carta.classList.contains("abierta")) return;

    clearInterval(escribiendo);
    escribiendo = null;

    carta.classList.remove("abierta", "escribiendo");
    universo.removeAttribute("inert");

    setTimeout(() => {
        if (!carta.classList.contains("abierta")) carta.setAttribute("inert", "");
    }, 400);

    if (florOrigen && florOrigen.isConnected) florOrigen.focus({ preventScroll: true });
    florOrigen = null;
}

cerrarBoton.addEventListener("click", cerrarCarta);

carta.addEventListener("click", (evento) => {
    if (evento.target === carta) cerrarCarta();       // clic fuera del papel
    else completarTexto();                            // clic dentro: muestra todo de golpe
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarCarta();
});


/* =====================================================
   PROGRESO
===================================================== */

const leidas = new Set();

function marcarLeida(indice, flor) {
    flor.classList.add("leida");
    leidas.add(indice);

    progreso.textContent = `${leidas.size} de ${CARTAS.length} cartas abiertas`;

    if (leidas.size === CARTAS.length && nucleo.disabled) {
        nucleo.disabled = false;
        nucleo.setAttribute("aria-label", "Abrir la carta final");
        progreso.textContent = "Toca el centro de la galaxia ✦";
    }
}

nucleo.addEventListener("click", () => {
    if (nucleo.disabled) return;
    abrirCarta(CARTA_FINAL, nucleo);
});


/* =====================================================
   MÚSICA
===================================================== */

let musicaLista = true;
let intentada = false;

function subirVolumen() {
    musica.volume = 0;
    const paso = setInterval(() => {
        musica.volume = Math.min(.55, musica.volume + .05);
        if (musica.volume >= .55) clearInterval(paso);
    }, 90);
}

async function iniciarMusica() {
    if (intentada || !musicaLista || !musica.paused) return;
    intentada = true;

    try {
        await musica.play();
        subirVolumen();
        botonMusica.setAttribute("aria-pressed", "true");
        botonMusica.innerHTML = '<span aria-hidden="true">🔊</span> Música';
    } catch (error) {
        /* el navegador bloqueó el audio: el botón sigue disponible */
        intentada = false;
    }
}

botonMusica.addEventListener("click", async () => {
    if (!musicaLista) return;

    if (musica.paused) {
        try {
            await musica.play();
            subirVolumen();
            botonMusica.setAttribute("aria-pressed", "true");
            botonMusica.innerHTML = '<span aria-hidden="true">🔊</span> Música';
        } catch (error) {
            musicaLista = false;
            botonMusica.disabled = true;
            botonMusica.textContent = "Falta musica.mp3";
        }
    } else {
        musica.pause();
        botonMusica.setAttribute("aria-pressed", "false");
        botonMusica.innerHTML = '<span aria-hidden="true">🎵</span> Música';
    }
});

musica.addEventListener("error", () => {
    musicaLista = false;
    botonMusica.hidden = true;
});


/* =====================================================
   PARALLAX (solo con mouse)
===================================================== */

function activarParallax() {
    if (menosMovimiento) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let objetivoX = 0;
    let objetivoY = 0;
    let pendiente = false;

    document.addEventListener("pointermove", (evento) => {
        objetivoX = (evento.clientX / window.innerWidth - .5) * 26;
        objetivoY = (evento.clientY / window.innerHeight - .5) * 26;

        if (pendiente) return;
        pendiente = true;

        requestAnimationFrame(() => {
            galaxiaWrap.style.transform =
                `translate(-50%, -50%) translate3d(${objetivoX.toFixed(1)}px, ${objetivoY.toFixed(1)}px, 0)`;
            pendiente = false;
        });
    });
}


/* =====================================================
   ARRANQUE
===================================================== */

pintarCielo();
construirFloresFondo();
construirFloresCarta();
activarParallax();
arrancarIntro();

progreso.textContent = `0 de ${CARTAS.length} cartas abiertas`;
