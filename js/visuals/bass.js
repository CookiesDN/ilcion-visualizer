/**
 * Bass-reactive visual with 6 selectable styles (click the panel or use the dropdown to cycle).
 */

let ARph = 0;
let ARrot = 0;
let BRS = 0;
let STARS = [];
let LOWB = new Float32Array(48);

function dAr() {
  const [x, w, h] = g("br"), cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 * 0.92, B = BASS;
  ARph += DT * (0.3 + B * 9);
  ARrot += DT * (0.08 + B * 3.4);
  x.lineCap = "round";
  if (BRS === 1) {
    const n = 96;
    x.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = i / n * 2 * Math.PI, wob = Math.sin(a * 3 + ARph * 1.7) * 0.5 + Math.sin(a * 5 - ARph * 2.3) * 0.3 + Math.sin(a * 8 + ARph * 3.1) * 0.2, r = R * (0.36 + 0.2 * B + 0.15 * B * wob), X = cx + r * Math.cos(a), Y = cy + r * Math.sin(a);
      i ? x.lineTo(X, Y) : x.moveTo(X, Y);
    }
    x.closePath();
    const gr = x.createRadialGradient(cx, cy, R * 0.04, cx, cy, R * 0.7);
    gr.addColorStop(0, C.fg);
    gr.addColorStop(0.5, C.pu);
    gr.addColorStop(1, C.bl);
    x.globalAlpha = 0.55 + 0.45 * B;
    x.fillStyle = gr;
    x.fill();
    x.strokeStyle = C.fg;
    x.lineWidth = 2;
    x.globalAlpha = 0.8;
    x.stroke();
    for (let i = 0; i < 3; i++) {
      const u = (ARph * 0.2 + i / 3) % 1;
      x.globalAlpha = (1 - u) * 0.4 * (0.3 + B);
      x.strokeStyle = C.pu;
      x.lineWidth = 2;
      x.beginPath();
      x.arc(cx, cy, R * (0.45 + u * 0.5), 0, 7);
      x.stroke();
    }
  } else if (BRS === 2) {
    for (let i = 0; i < 14; i++) {
      const u = (i / 14 + ARph * 0.06) % 1, s = Math.pow(u, 2.2) * R * 1.25, rot = ARrot * 0.4 + i * 0.05;
      x.strokeStyle = i % 2 ? C.pu : C.bl;
      x.globalAlpha = Math.min(1, u * 1.6) * (0.3 + 0.7 * B);
      x.lineWidth = 1 + u * 4 * (1 + B);
      x.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = rot + k * Math.PI / 3, X = cx + s * Math.cos(a), Y = cy + s * Math.sin(a);
        k ? x.lineTo(X, Y) : x.moveTo(X, Y);
      }
      x.stroke();
    }
  } else if (BRS === 3) {
    const hz = ac.sampleRate / an.fftSize;
    for (let j = 0; j < 48; j++) {
      const f0 = 20 * Math.pow(12.5, j / 48), f1 = 20 * Math.pow(12.5, (j + 1) / 48);
      let m = -120;
      for (let i = Math.max(1, Math.floor(f0 / hz)); i <= Math.max(1, Math.ceil(f1 / hz)); i++) m = Math.max(m, F[i]);
      LOWB[j] += (Math.max(0, Math.min(1, (m + 90) / 55)) - LOWB[j]) * 0.4;
      const a = ARrot * 0.3 + j * 2 * Math.PI / 48, l = R * (0.1 + 0.72 * LOWB[j]), r0 = R * 0.2;
      x.strokeStyle = j % 2 ? C.pu : C.fg;
      x.lineWidth = Math.max(2, R * 0.045);
      x.globalAlpha = 0.45 + 0.55 * LOWB[j];
      x.beginPath();
      x.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a));
      x.lineTo(cx + (r0 + l) * Math.cos(a), cy + (r0 + l) * Math.sin(a));
      x.stroke();
    }
  } else if (BRS === 4) {
    while (STARS.length < 110) STARS.push({ a: Math.random() * 6.283, r: Math.random(), s: 0.2 + Math.random() * 0.8 });
    const sp = DT * (0.12 + B * 2.6);
    STARS.forEach((s) => {
      const v = sp * s.s * (0.3 + s.r * 1.6);
      s.r += v;
      if (s.r > 1) {
        s.r = 0.02 + Math.random() * 0.05;
        s.a = Math.random() * 6.283;
        s.s = 0.2 + Math.random() * 0.8;
      }
      const tl = Math.min(0.3, v * 5 + 0.01), c = Math.cos(s.a), sn = Math.sin(s.a), r1 = s.r * R * 1.15, r0 = Math.max(0, s.r - tl) * R * 1.15;
      x.strokeStyle = s.s > 0.6 ? C.fg : C.pu;
      x.globalAlpha = Math.min(1, s.r * 1.8);
      x.lineWidth = 1 + s.r * 2.5;
      x.beginPath();
      x.moveTo(cx + c * r0, cy + sn * r0);
      x.lineTo(cx + c * r1, cy + sn * r1);
      x.stroke();
    });
  } else if (BRS === 5) {
    for (let k = 0; k < 4; k++) {
      x.strokeStyle = k === 3 ? C.fg : k % 2 ? C.pu : C.bl;
      x.globalAlpha = 0.5 + 0.1 * k;
      x.lineWidth = 2 + B * 3;
      x.beginPath();
      for (let i = 0; i <= 60; i++) {
        const u = i / 60, X = u * w, Y = cy + Math.sin(u * (4 + k * 1.5) * Math.PI + ARph * (1 + k * 0.4)) * h * 0.28 * (0.12 + B * 0.9) * (1 - k * 0.12) + Math.sin(u * 9 + ARph * 2.1) * h * 0.05 * B;
        i ? x.lineTo(X, Y) : x.moveTo(X, Y);
      }
      x.stroke();
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const u = (ARph * 0.22 + i / 5) % 1;
      x.strokeStyle = i % 2 ? C.bl : C.pu;
      x.globalAlpha = (1 - u) * (0.2 + B * 0.8);
      x.lineWidth = 1.5 + B * 6 * (1 - u);
      x.beginPath();
      x.arc(cx, cy, R * (0.14 + u * 0.86) * (1 + B * 0.1), 0, 7);
      x.stroke();
    }
    const n = 54;
    for (let i = 0; i < n; i++) {
      const a = ARrot + i * 2 * Math.PI / n, len = R * (0.12 + 0.62 * B * (0.5 + 0.5 * Math.sin(ARph * 2.2 + i * 0.7))), r0 = R * 0.16;
      x.strokeStyle = i % 3 ? C.pu : C.fg;
      x.globalAlpha = 0.35 + 0.65 * B;
      x.lineWidth = 2.5;
      x.beginPath();
      x.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a));
      x.lineTo(cx + (r0 + len) * Math.cos(a), cy + (r0 + len) * Math.sin(a));
      x.stroke();
    }
    x.globalAlpha = 0.95;
    x.fillStyle = C.fg;
    x.beginPath();
    x.arc(cx, cy, R * 0.06 * (1 + B * 2.6), 0, 7);
    x.fill();
  }
  x.globalAlpha = 0.55;
  x.fillStyle = C.fg;
  x.font = "10px " + FF;
  x.fillText(BRN[BRS].toUpperCase() + " · " + Math.round(B * 100) + "%", 10, 16);
}

const setBR = (i) => {
  BRS = i;
  $("brsel").value = i;
  $("brs").value = i;
  try {
    localStorage.setItem("vizbr", i);
  } catch (e) {
  }
};

try {
  const s = localStorage.getItem("vizbr");
  if (s !== null) BRS = +s || 0;
} catch (e) {
}

setBR(BRS);
$("brsel").onchange = () => setBR(+$("brsel").value);
$("brs").onchange = () => setBR(+$("brs").value);

$("br").onclick = () => {
  if (!document.body.classList.contains("edit")) setBR((BRS + 1) % 6);
};
