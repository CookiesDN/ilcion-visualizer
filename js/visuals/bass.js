/**
 * Bass-reactive visual.
 */

let ARph = 0;
let ARrot = 0;

function dAr() {
  const [x, w, h] = g("br"), cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 * 0.92;
  ARph += DT * (0.3 + BASS * 9);
  ARrot += DT * (0.08 + BASS * 3.4);
  for (let i = 0; i < 5; i++) {
    const u = (ARph * 0.22 + i / 5) % 1;
    x.strokeStyle = i % 2 ? C.bl : C.pu;
    x.globalAlpha = (1 - u) * (0.2 + BASS * 0.8);
    x.lineWidth = 1.5 + BASS * 6 * (1 - u);
    x.beginPath();
    x.arc(cx, cy, R * (0.14 + u * 0.86) * (1 + BASS * 0.1), 0, 7);
    x.stroke();
  }
  x.lineCap = "round";
  const n = 54;
  for (let i = 0; i < n; i++) {
    const a = ARrot + i * 2 * Math.PI / n, len = R * (0.12 + 0.62 * BASS * (0.5 + 0.5 * Math.sin(ARph * 2.2 + i * 0.7))), r0 = R * 0.16;
    x.strokeStyle = i % 3 ? C.pu : C.fg;
    x.globalAlpha = 0.35 + 0.65 * BASS;
    x.lineWidth = 2.5;
    x.beginPath();
    x.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a));
    x.lineTo(cx + (r0 + len) * Math.cos(a), cy + (r0 + len) * Math.sin(a));
    x.stroke();
  }
  x.globalAlpha = 0.95;
  x.fillStyle = C.fg;
  x.beginPath();
  x.arc(cx, cy, R * 0.06 * (1 + BASS * 2.6), 0, 7);
  x.fill();
  x.globalAlpha = 0.55;
  x.font = "10px " + FF;
  x.fillText("BASS-REACTIVE · " + Math.round(BASS * 100) + "%", 10, 16);
}
