const ITEMS = [
  "Dashboard", "Projects", "Messages", "Analytics",
  "Team", "Billing", "Settings", "Profile",
];

const R = 140;              // item orbit radius (px)
const N = ITEMS.length;
const STEP = 360 / N;

const dial = document.getElementById("dial");
const wheel = document.getElementById("wheel");
const nameEl = document.getElementById("selected-name");

let rotation = 0;
let selected = -1;

// Build items: each orbits the center; its chip counter-rotates to stay upright.
const els = ITEMS.map((label, i) => {
  const item = document.createElement("div");
  item.className = "item";
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = label;
  chip.addEventListener("click", () => goTo(i));
  item.appendChild(chip);
  wheel.appendChild(item);
  return { item, chip, angle: i * STEP };
});

function render() {
  for (const { item, chip, angle } of els) {
    const a = angle + rotation;
    item.style.transform = `rotate(${a}deg) translateY(-${R}px)`;
    chip.style.transform = `rotate(${-a}deg)`;
  }
  const idx = ((Math.round(-rotation / STEP) % N) + N) % N;
  if (idx !== selected) {
    selected = idx;
    els.forEach((e, i) => e.item.classList.toggle("active", i === idx));
    nameEl.textContent = ITEMS[idx];
  }
}

let animTimer;
function animate() {
  wheel.classList.add("anim");
  render();
  clearTimeout(animTimer);
  animTimer = setTimeout(() => wheel.classList.remove("anim"), 400);
}

function snap() {
  rotation = Math.round(rotation / STEP) * STEP;
  animate();
}

function goTo(i) {
  const target = -i * STEP;
  // shortest-path delta, normalized to [-180, 180)
  rotation += ((target - rotation) % 360 + 540) % 360 - 180;
  animate();
}

// --- drag to rotate ---
let dragging = false;
let startPointer = 0;
let startRot = 0;

function pointerAngle(e) {
  const r = dial.getBoundingClientRect();
  const x = e.clientX - (r.left + r.width / 2);
  const y = e.clientY - (r.top + r.height / 2);
  return Math.atan2(y, x) * 180 / Math.PI;
}

dial.addEventListener("pointerdown", (e) => {
  const r = dial.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < 50) return;   // ignore grabs on the hub — jittery angles
  dragging = true;
  dial.classList.add("dragging");
  dial.setPointerCapture(e.pointerId);
  wheel.classList.remove("anim");
  startPointer = pointerAngle(e);
  startRot = rotation;
});

dial.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  rotation = startRot + pointerAngle(e) - startPointer;
  render();
});

const endDrag = () => {
  if (!dragging) return;
  dragging = false;
  dial.classList.remove("dragging");
  snap();
};
dial.addEventListener("pointerup", endDrag);
dial.addEventListener("pointercancel", endDrag);

// --- scroll to rotate ---
let wheelTimer;
dial.addEventListener("wheel", (e) => {
  e.preventDefault();
  wheel.classList.remove("anim");
  rotation += (e.deltaY + e.deltaX) * 0.15;
  render();
  clearTimeout(wheelTimer);
  wheelTimer = setTimeout(snap, 140);
}, { passive: false });

// --- keyboard ---
addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo((selected + 1) % N);
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo((selected - 1 + N) % N);
});

render();
