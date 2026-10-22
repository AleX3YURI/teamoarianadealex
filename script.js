
const escena = document.querySelector(".escena");
const canvas = document.getElementById("lluvia");
const ctx = canvas.getContext("2d");

const gotas = [];
const salpicaduras = [];

let lluviaActiva = true;
let ultimoTiempo = 0;

function ajustarCanvas() {
  const rect = escena.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

function crearGota() {
  const rect = escena.getBoundingClientRect();

  gotas.push({
    x: Math.random() * rect.width,
    y: -20,
    largo: 10 + Math.random() * 15,
    velocidad: 450 + Math.random() * 500,
    viento: 50 + Math.random() * 100,
    grosor: 0.7 + Math.random() * 0.8
  });
}

function salpicar(x, y) {
  // Pequeñas partículas que saltan en el impacto
  const cantidad = 4 + Math.floor(Math.random() * 4);

  for (let i = 0; i < cantidad; i++) {
    const angulo = Math.random() * Math.PI;
    const velocidad = 30 + Math.random() * 100;

    salpicaduras.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidad,
      vy: -Math.sin(angulo) * velocidad - 15,
      vida: 0.25 + Math.random() * 0.25,
      maxVida: 0.5,
      radio: 1 + Math.random() * 1.5
    });
  }

  // Anillo de agua en el punto de impacto
  salpicaduras.push({
    x,
    y,
    vx: 0,
    vy: 0,
    vida: 0.2,
    maxVida: 0.2,
    radio: 2,
    anillo: true
  });
}

function animar(tiempo) {
  requestAnimationFrame(animar);

  const rect = escena.getBoundingClientRect();
  const ancho = rect.width;
  const alto = rect.height;

  const dt = Math.min((tiempo - (ultimoTiempo || tiempo)) / 1000, 0.04);
  ultimoTiempo = tiempo;

  ctx.clearRect(0, 0, ancho, alto);

  if (lluviaActiva) {
    // Crear gotas a intervalos aleatorios
    if (Math.random() < 0.85) crearGota();
    if (Math.random() < 0.35) crearGota();
  }

  // Actualizar y dibujar gotas
  ctx.strokeStyle = "rgba(205, 230, 255, 0.55)";
  ctx.lineCap = "round";

  for (let i = gotas.length - 1; i >= 0; i--) {
    const g = gotas[i];

    g.x += g.viento * dt;
    g.y += g.velocidad * dt;

    ctx.lineWidth = g.grosor;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(
      g.x - g.viento * 0.025,
      g.y - g.largo
    );
    ctx.stroke();

    if (g.y >= alto) {
      salpicar(Math.min(g.x, ancho), alto - 2);
      gotas.splice(i, 1);
    } else if (g.x > ancho + 30) {
      gotas.splice(i, 1);
    }
  }

  // Dibujar salpicaduras y eliminar las que desaparecen
  for (let i = salpicaduras.length - 1; i >= 0; i--) {
    const p = salpicaduras[i];

    p.vida -= dt;

    if (p.vida <= 0) {
      salpicaduras.splice(i, 1);
      continue;
    }

    const progreso = 1 - p.vida / p.maxVida;
    const alpha = Math.max(0, p.vida / p.maxVida);

    ctx.strokeStyle = `rgba(210, 235, 255, ${alpha})`;
    ctx.fillStyle = `rgba(210, 235, 255, ${alpha})`;

    if (p.anillo) {
      ctx.beginPath();
      ctx.ellipse(
        p.x,
        p.y,
        2 + progreso * 9,
        1 + progreso * 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio * (1 - progreso * 0.5), 0,
        Math.PI * 2);
      ctx.fill();
    }
  }
}

requestAnimationFrame(animar);

// Botón para pausar y reanudar la lluvia
const botonLluvia = document.getElementById("botonLluvia");

botonLluvia.addEventListener("click", () => {
  lluviaActiva = !lluviaActiva;
  botonLluvia.textContent = lluviaActiva
    ? "Pausar lluvia"
    : "Reanudar lluvia";
});

(() => {
  const canvas = document.getElementById("cristal");
  const escena = document.querySelector(".escena");
  const ctx = canvas.getContext("2d");
  const boton = document.getElementById("botonGotas");

  let gotas = [];
  let activas = true;
  let ancho = 0;
  let alto = 0;
  let ultimoTiempo = 0;

  function ajustarCristal() {
    const rect = escena.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    ancho = rect.width;
    alto = rect.height;

    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Gotas de diferentes tamaños y velocidades
    gotas = Array.from({ length: 85 }, () => ({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      rx: 1.5 + Math.random() * 4,
      ry: 3 + Math.random() * 9,
      velocidad: 5 + Math.random() * 22,
      deriva: (Math.random() - 0.5) * 5,
      fase: Math.random() * Math.PI * 2
    }));
  }

  function dibujarGota(g, tiempo) {
    const pulso = Math.sin(tiempo * 0.001 + g.fase) * 0.15;
    const rx = g.rx * (1 + pulso);
    const ry = g.ry;

    ctx.save();

    // Sombra sutil para dar volumen al agua
    ctx.shadowColor = "rgba(5, 20, 40, 0.22)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    const gradiente = ctx.createRadialGradient(
      g.x - rx * 0.35,
      g.y - ry * 0.3,
      0.5,
      g.x,
      g.y,
      ry * 1.3
    );

    gradiente.addColorStop(0, "rgba(255,255,255,0.08)");
    gradiente.addColorStop(0.55, "rgba(180,220,255,0.12)");
    gradiente.addColorStop(0.82, "rgba(100,160,210,0.20)");
    gradiente.addColorStop(1, "rgba(255,255,255,0.04)");

    ctx.fillStyle = gradiente;
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, rx, ry, -0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "transparent";

    // Reflejo brillante en el borde de la gota
    ctx.strokeStyle = "rgba(235,248,255,0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, rx, ry, -0.08, -2.3, -0.65);
    ctx.stroke();

    // Pequeño brillo
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.ellipse(
      g.x - rx * 0.3,
      g.y - ry * 0.45,
      Math.max(0.5, rx * 0.18),
      Math.max(0.8, ry * 0.12),
      -0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function animarCristal(tiempo) {
    requestAnimationFrame(animarCristal);

    const dt = Math.min((tiempo - (ultimoTiempo || tiempo)) / 1000, 0.05);
    ultimoTiempo = tiempo;

    ctx.clearRect(0, 0, ancho, alto);

    if (!activas) return;

    for (const g of gotas) {
      // Algunas gotas se deslizan lentamente
      g.y += g.velocidad * dt;
      g.x += g.deriva * dt;

      if (g.y - g.ry > alto) {
        g.y = -g.ry;
        g.x = Math.random() * ancho;
      }

      if (g.x < -20) g.x = ancho + 5;
      if (g.x > ancho + 20) g.x = -5;

      dibujarGota(g, tiempo);
    }
  }

  boton.addEventListener("click", () => {
    activas = !activas;

    boton.textContent = activas
      ? "Gotas en el cristal: sí"
      : "Gotas en el cristal: no";

    if (!activas) {
      ctx.clearRect(0, 0, ancho, alto);
    }
  });

  window.addEventListener("resize", ajustarCristal);

  ajustarCristal();
  requestAnimationFrame(animarCristal);
})();
