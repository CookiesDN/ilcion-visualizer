/**
 * VU meters.
 */

let VUL = -24;
let VUR = -24;

function dVu() {
  const [x, w, h] = g("vu"), stack = h > w * 1.3, dw = stack ? w : w / 2, dh = stack ? h / 2 : h, vu = (a) => {
    let s = 0;
    for (let i = 0; i < 2048; i++) s += a[i] * a[i];
    return 20 * Math.log10(Math.sqrt(s / 2048) + 1e-6) + 18;
  }, RED = "#ff4d7d";
  VUL += ((RUN ? vu(Tl) : -24) - VUL) * 0.1;
  VUR += ((RUN ? vu(Tr) : -24) - VUR) * 0.1;
  [[VUL, "L"], [VUR, "R"]].forEach(([v, nm_], k) => {
    const ox = stack ? 0 : k * dw, oy = stack ? k * dh : 0, px = ox + dw / 2, py = oy + dh * 0.86, r = Math.min(dw * 0.44, dh * 0.74), A0 = -Math.PI / 2 - 0.87, A1 = -Math.PI / 2 + 0.87, ang = (q) => A0 + (Math.max(-20, Math.min(3, q)) + 20) / 23 * (A1 - A0);
    rr(x, ox + 4, oy + 4, dw - 8, dh - 8, 14, C.mt);
    x.lineWidth = 3;
    x.lineCap = "butt";
    x.strokeStyle = C.fg;
    x.globalAlpha = 0.7;
    x.beginPath();
    x.arc(px, py, r, ang(-20), ang(0));
    x.stroke();
    x.strokeStyle = RED;
    x.globalAlpha = 1;
    x.beginPath();
    x.arc(px, py, r, ang(0), ang(3));
    x.stroke();
    x.textAlign = "center";
    x.font = "9px " + FF;
    [-20, -10, -7, -5, -3, 0, 3].forEach((q) => {
      const a2 = ang(q), c = Math.cos(a2), s = Math.sin(a2);
      x.strokeStyle = x.fillStyle = q >= 0 ? RED : C.fg;
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(px + (r - 9) * c, py + (r - 9) * s);
      x.lineTo(px + r * c, py + r * s);
      x.stroke();
      if (r > 70 || [-20, -10, 0, 3].includes(q)) x.fillText(q, px + (r - 20) * c, py + (r - 20) * s + 3);
    });
    const a = ang(v);
    x.strokeStyle = C.fg;
    x.lineWidth = 2;
    x.lineCap = "round";
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + (r + 2) * Math.cos(a), py + (r + 2) * Math.sin(a));
    x.stroke();
    x.fillStyle = C.pu;
    x.beginPath();
    x.arc(px, py, 5, 0, 7);
    x.fill();
    x.fillStyle = C.fg;
    x.globalAlpha = 0.6;
    x.font = "10px " + FF;
    x.fillText("VU " + nm_, px, oy + dh - 12);
    x.globalAlpha = 1;
    x.textAlign = "left";
  });
}
