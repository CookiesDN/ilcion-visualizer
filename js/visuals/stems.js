/**
 * Stem lanes and per-stem level pads.
 */

$("st").onclick = (e) => {
  if (!buf) return;
  const r = e.target.getBoundingClientRect(), n = WC[0].length * 3;
  start(Math.max(0, Math.min(1, ((e.clientX - r.left) / Z - LW) / n)) * buf.duration);
  ac.resume();
};

const LV = [];

function dSt(p) {
  const [x, w, h] = g("st"), n = ST.length, mh = 58, rh = (h - mh - 6) / n, pf = p / buf.duration, i = Math.min(D.env[ST[0]].length - 1, Math.floor(p * 20));
  ST.forEach((s, k) => {
    const y = k * rh, [c, a] = SC[k % 6], o = WC[k];
    rr(x, 0, y + 3, w, rh - 6, 12, C.mt);
    x.fillStyle = C.fg;
    x.globalAlpha = 0.8;
    x.font = "11px " + FF;
    x.fillText(s.toUpperCase().slice(0, 10), 14, y + rh / 2 + 4);
    for (let j = 0; j < o.length; j++) {
      const v = Math.max(0.04, o[j]) * (rh - 18) / 2;
      x.fillStyle = C[c];
      x.globalAlpha = (j / o.length < pf ? 1 : 0.3) * a;
      x.fillRect(LW + j * 3, y + rh / 2 - v, 2, v * 2);
    }
    x.globalAlpha = 1;
  });
  x.fillStyle = C.fg;
  x.fillRect(LW + pf * WC[0].length * 3, 0, 2, h - mh - 6);
  const y0 = h - mh, sd = Math.min(mh - 18, (w - (n - 1) * 8) / n), gp = n > 1 ? (w - sd * n) / (n - 1) : 0;
  x.textAlign = "center";
  ST.forEach((s, k) => {
    const [c, a] = SC[k % 6], X = k * (sd + gp);
    LV[k] = Math.max(D.env[s][i] / 99, (LV[k] || 0) * 0.9);
    rr(x, X, y0 + 2, sd, sd, 8, C.mt);
    x.save();
    x.beginPath();
    x.roundRect(X, y0 + 2, sd, sd, 8);
    x.clip();
    x.fillStyle = C[c];
    x.globalAlpha = a;
    x.fillRect(X, y0 + 2 + sd * (1 - LV[k]), sd, sd * LV[k]);
    x.restore();
    x.globalAlpha = 0.7;
    x.fillStyle = C.fg;
    x.font = "9px " + FF;
    x.fillText(s.toUpperCase().slice(0, 8), X + sd / 2, y0 + sd + 15);
    x.globalAlpha = 1;
  });
  x.textAlign = "left";
}
