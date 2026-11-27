/**
 * 1/16-note dot grid per stem.
 */

function dDt(p) {
  const [x, w, h] = g("dt"), n = ST.length, rh = h / n, L = 64, V = Math.max(6, Math.round(32 / DS)), P = Math.round(V * 12 / 32), cw = (w - L) / V, k = Math.floor((p - T0) / STEP);
  rr(x, L + P * cw, 0, cw, h, cw / 2, "rgba(238,238,238,.1)");
  for (let r = 0; r < n; r++) {
    x.fillStyle = C.fg;
    x.globalAlpha = 0.7;
    x.font = "10px " + FF;
    x.fillText(ST[r].toUpperCase().slice(0, 8), 2, r * rh + rh / 2 + 3);
    const [c, a] = SC[r % 6];
    for (let j = 0; j < V; j++) {
      const kk = k - P + j;
      if (kk < 0) continue;
      const e = +(D.dots[ST[r]][kk] || 0);
      x.beginPath();
      x.arc(L + j * cw + cw / 2, r * rh + rh / 2, Math.min(cw / 2 - 0.5, rh / 2 - 1, 1.2 + e * 0.55), 0, 7);
      x.fillStyle = kk <= k ? C[c] : C.mt;
      x.globalAlpha = kk <= k ? a : 1;
      x.fill();
    }
  }
}
