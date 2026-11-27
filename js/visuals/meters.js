/**
 * Loudness bars (momentary / integrated / peak) and the oscilloscope.
 */

const LB = [-90, -90, -90];

function dLb(p) {
  const [x, w, h] = g("lb"), f = p * 10, i = Math.min(D.lufs.length - 1, Math.floor(f)), j = Math.min(D.lufs.length - 1, i + 1), fr = f - i, ip = (a) => Math.max(-90, a[i] + (a[j] - a[i]) * fr);
  [ip(D.lufs), ip(D.ilufs), ip(D.pk)].forEach((v, k) => {
    LB[k] += (v - LB[k]) * (Math.abs(v - LB[k]) > 25 ? 1 : 0.14);
  });
  const rows = [["MOMENTARY", LB[0], "LUFS", C.pu], ["INTEGRATED", LB[1], "LUFS", C.bl], ["PEAK", LB[2], "dBFS", C.fg]], rh = h / 3;
  rows.forEach(([n, v, u, c], k) => {
    const y = k * rh + 4, bh = rh - 8;
    rr(x, 4, y, w - 8, bh, 10, C.mt);
    rr(x, 4, y, Math.max(bh, (w - 8) * Math.max(0, Math.min(1, (v + 50) / 50))), bh, 10, c);
    x.font = "11px " + FF;
    x.fillStyle = c === C.fg ? C.pn : C.fg;
    x.fillText(w < 300 ? n.slice(0, 3) : n, 16, y + bh / 2 + 4);
    x.textAlign = "right";
    x.fillText((v > -89 ? v.toFixed(1) : "–") + (w < 300 ? "" : " " + u), w - 16, y + bh / 2 + 4);
    x.textAlign = "left";
  });
}

const tag = (x, t) => {
  x.fillStyle = C.fg;
  x.globalAlpha = 0.5;
  x.font = "10px " + FF;
  x.fillText(t, 10, 16);
  x.globalAlpha = 1;
};

function dSc() {
  const [x, w, h] = g("sc");
  let s = 0;
  while (s < 2e3 && !(Td[s] < 0 && Td[s + 1] >= 0)) s++;
  x.strokeStyle = C.pu;
  x.lineWidth = 2;
  x.beginPath();
  for (let i = 0; i < 1024; i++) {
    const X = i / 1023 * w, Y = h / 2 - Td[s + i] * h * 0.9;
    i ? x.lineTo(X, Y) : x.moveTo(X, Y);
  }
  x.stroke();
  tag(x, "SCOPE");
}
