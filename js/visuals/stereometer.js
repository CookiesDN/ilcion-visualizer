/**
 * Stereometer / Lissajous / correlation (click to cycle modes).
 */

function dStereo(id) {
  const [x, w, h] = g(id), uni = SMODE === 0 || SMODE === 2, sc = SMODE < 2, liss = SMODE === 4, full = liss || !uni, cx = w / 2, cy = full ? h / 2 : h * 0.9, R = full ? Math.min(w, h) * 0.42 : Math.min(w / 2 - 6, h * 0.78);
  x.strokeStyle = C.mt;
  x.lineWidth = 1.5;
  x.beginPath();
  if (uni) {
    x.arc(cx, cy, R, Math.PI, 2 * Math.PI);
    x.moveTo(cx - R, cy);
    x.lineTo(cx + R, cy);
    [0.25, 0.5, 0.75].forEach((a) => {
      x.moveTo(cx, cy);
      x.lineTo(cx + R * Math.cos(Math.PI * (1 + a)), cy + R * Math.sin(Math.PI * (1 + a)));
    });
  } else {
    x.arc(cx, cy, R, 0, 7);
    x.moveTo(cx - R * 0.707, cy - R * 0.707);
    x.lineTo(cx + R * 0.707, cy + R * 0.707);
    x.moveTo(cx + R * 0.707, cy - R * 0.707);
    x.lineTo(cx - R * 0.707, cy + R * 0.707);
    if (!liss) {
      x.moveTo(cx - R, cy);
      x.lineTo(cx + R, cy);
      x.moveTo(cx, cy - R);
      x.lineTo(cx, cy + R);
    }
  }
  if (sc && !liss) {
    x.moveTo(cx + R * 0.5, cy);
    if (uni) x.arc(cx, cy, R * 0.5, 0, -Math.PI, true);
    else x.arc(cx, cy, R * 0.5, 0, 7);
  }
  x.stroke();
  x.fillStyle = C.fg;
  x.globalAlpha = 0.55;
  let sLR = 0, sL = 0, sR = 0;
  for (let i = 0; i < 1024; i += 2) {
    const l = Tl[i], r = Tr[i];
    sLR += l * r;
    sL += l * l;
    sR += r * r;
    let px = (r - l) * 0.7071, py = (l + r) * 0.7071, X, Y;
    if (liss) {
      X = cx + px * R * 1.15;
      Y = cy - py * R * 1.15;
    } else {
      const rad = Math.hypot(px, py) / 1.4142;
      if (rad < 1e-5) continue;
      const f = sc ? Math.max(0, Math.min(1, (20 * Math.log10(rad) + 60) / 60)) : Math.min(1, rad);
      if (uni && py < 0) {
        px = -px;
        py = -py;
      }
      const k = f * R / (Math.hypot(px, py) || 1);
      X = cx + px * k;
      Y = cy - py * k;
    }
    x.fillRect(X - 1, Y - 1, 2, 2);
  }
  x.globalAlpha = 1;
  CORR += (sLR / Math.sqrt(sL * sR + 1e-12) - CORR) * 0.15;
  if (h > 100) {
    const bw = Math.min(w * 0.6, 160), bx = cx - bw / 2, by = h - 12;
    rr(x, bx, by, bw, 5, 3, C.mt);
    x.fillStyle = C.pu;
    x.fillRect(bx + bw / 2 + (CORR < 0 ? CORR * bw / 2 : 0), by, Math.abs(CORR) * bw / 2, 5);
    x.fillStyle = C.fg;
    x.fillRect(bx + bw / 2 + CORR * bw / 2 - 1, by - 2, 3, 9);
    x.font = "8px " + FF;
    x.globalAlpha = 0.6;
    x.fillText("-1", bx - 14, by + 6);
    x.fillText("+1", bx + bw + 4, by + 6);
    x.globalAlpha = 1;
  }
  x.fillStyle = C.fg;
  x.globalAlpha = 0.55;
  x.font = "10px " + FF;
  x.fillText(w < 150 ? SMS[SMODE] : SMN[SMODE].toUpperCase(), 10, 16);
  x.globalAlpha = 1;
}

const dVc = () => dStereo("vc");

const setSM = (i) => {
  SMODE = i;
  $("smsel").value = i;
  $("sms").value = i;
  try {
    localStorage.setItem("vizsm", i);
  } catch (e) {
  }
};

try {
  const s = localStorage.getItem("vizsm");
  if (s !== null) SMODE = +s || 0;
} catch (e) {
}

setSM(SMODE);
$("smsel").onchange = () => setSM(+$("smsel").value);
$("sms").onchange = () => setSM(+$("sms").value);

$("vc").onclick = () => {
  if (!document.body.classList.contains("edit")) setSM((SMODE + 1) % 5);
};
