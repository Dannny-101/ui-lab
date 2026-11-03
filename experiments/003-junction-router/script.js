const SVGNS = "http://www.w3.org/2000/svg";

const PORTS = [
  { label: ":3000", name: "api",      y: 90  },
  { label: ":5432", name: "postgres", y: 190 },
  { label: ":6379", name: "redis",    y: 290 },
];

const SOURCE = { x: 70, y: 190 };
const TRACK_START = { x: SOURCE.x + 26, y: SOURCE.y };   // right edge of source node
const J = { x: 260, y: 190 };                            // junction point
const PORT_X = 565;                                      // port rect left edge
const PORT_W = 120;

const live = document.getElementById("live");
const ghosts = document.getElementById("ghosts");
const portsG = document.getElementById("ports");
const lever = document.getElementById("lever");
const pulse = document.getElementById("pulse");
const routeName = document.getElementById("route-name");

let active = 1;          // start routed to postgres
let cur = null;          // live curve params currently drawn
let morph = null;        // in-flight path morph
let pulseStart = performance.now();

function curveFor(i) {
  const py = PORTS[i].y;
  return {
    c1x: J.x + 120, c1y: J.y,
    c2x: PORT_X - 95, c2y: py,
    px: PORT_X, py,
  };
}

function dFor(c) {
  return `M ${TRACK_START.x} ${TRACK_START.y} ` +
         `L ${J.x} ${J.y} ` +
         `C ${c.c1x} ${c.c1y}, ${c.c2x} ${c.c2y}, ${c.px} ${c.py}`;
}

function lerpCurve(a, b, t) {
  const c = {};
  for (const k in a) c[k] = a[k] + (b[k] - a[k]) * t;
  return c;
}

function renderGhosts() {
  ghosts.innerHTML = "";
  PORTS.forEach((_, i) => {
    if (i === active) return;
    const p = document.createElementNS(SVGNS, "path");
    p.setAttribute("d", dFor(curveFor(i)));
    p.setAttribute("class", "ghost-track");
    p.setAttribute("fill", "none");
    ghosts.appendChild(p);
  });
}

// --- port nodes ---
const portEls = PORTS.map((p, i) => {
  const g = document.createElementNS(SVGNS, "g");
  g.setAttribute("class", "port");
  g.innerHTML =
    `<rect x="${PORT_X}" y="${p.y - 22}" width="${PORT_W}" height="44" rx="10"/>` +
    `<text x="${PORT_X + PORT_W / 2}" y="${p.y - 1}" class="port-label">${p.label}</text>` +
    `<text x="${PORT_X + PORT_W / 2}" y="${p.y + 15}" class="port-sub">${p.name}</text>`;
  g.addEventListener("click", () => select(i));
  portsG.appendChild(g);
  return g;
});

function leverAngle(i) {
  const py = PORTS[i].y;
  return Math.atan2(py - J.y, PORT_X - J.x) * 180 / Math.PI;
}

function select(i) {
  if (i === active && morph === null) return;
  active = i;
  morph = { from: cur, to: curveFor(i), t0: performance.now() };
  pulseStart = performance.now();          // restart the signal pulse
  lever.style.transform = `rotate(${leverAngle(i)}deg)`;
  portEls.forEach((el, j) => el.classList.toggle("active", j === i));
  routeName.textContent = `account → ${PORTS[i].label} ${PORTS[i].name}`;
  renderGhosts();
}

// --- main loop: path morph + signal pulse ---
function tick(now) {
  if (morph) {
    const t = Math.min(1, (now - morph.t0) / 450);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    cur = lerpCurve(morph.from, morph.to, e);
    live.setAttribute("d", dFor(cur));
    if (t >= 1) morph = null;
  }

  if (cur) {
    const len = live.getTotalLength();
    const phase = ((now - pulseStart) % 2600) / 1400;   // 1.4s travel, then 1.2s gap
    if (phase <= 1) {
      const pt = live.getPointAtLength(phase * len);
      pulse.setAttribute("cx", pt.x);
      pulse.setAttribute("cy", pt.y);
      pulse.setAttribute("opacity", 0.95);
    } else {
      pulse.setAttribute("opacity", 0);
    }
  }

  requestAnimationFrame(tick);
}

// --- keyboard ---
addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowRight") select((active + 1) % PORTS.length);
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") select((active - 1 + PORTS.length) % PORTS.length);
});

// init — select() early-returns when target === active, so set state directly
cur = curveFor(active);
live.setAttribute("d", dFor(cur));
lever.style.transform = `rotate(${leverAngle(active)}deg)`;
portEls.forEach((el, j) => el.classList.toggle("active", j === active));
routeName.textContent = `account → ${PORTS[active].label} ${PORTS[active].name}`;
renderGhosts();
requestAnimationFrame(tick);
