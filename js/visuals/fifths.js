/**
 * Circle of fifths + silent metronome.
 */

function dMn(p) {
  const [x, w, h] = g("mn"), cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 64, ph = (p - T0) / BAR, f = (ph % 1 + 1) % 1, bt = Math.floor(f * BEATS), ff = f * BEATS - bt, A = -Math.PI / 2, ci = cidx(p), ch = D.chords[ci], tn = D.key[0], nr = R * 0.12, N = D.notes || [], bs = T0 + Math.floor(ph) * BAR;
  const cp = ch && ch[2] >= 0 ? TI[ch[2]].map((v) => (ch[1] + v) % 12) : [], ri = (pc) => 7 * ((pc - tn + 12) % 12) % 12, at = (i, r) => [cx + r * Math.cos(A + i * Math.PI / 6), cy + r * Math.sin(A + i * Math.PI / 6)];
  const on = /* @__PURE__ */ new Map(), off = /* @__PURE__ */ new Map(), use = new Float64Array(12);
  for (const n of N) {
    if (n[0] > p) break;
    if (n[1] > bs) use[n[2] % 12] += (Math.min(n[1], p) - Math.max(n[0], bs)) / BL;
    if (p < n[1]) on.set(n[2], n);
    else if (p - n[1] < 0.5) off.set(n[2], n);
  }
  x.lineCap = "round";
  x.strokeStyle = C.mt;
  x.lineWidth = 1.5;
  x.beginPath();
  x.arc(cx, cy, R, 0, 7);
  x.stroke();
  x.strokeStyle = C.pu;
  x.lineWidth = 4;
  x.beginPath();
  x.arc(cx, cy, R + 18, A, A + Math.max(1e-3, f) * 2 * Math.PI);
  x.stroke();
  x.textAlign = "center";
  for (let i = 0; i < BEATS; i++) {
    const a = A + i * 2 * Math.PI / BEATS, c = Math.cos(a), s = Math.sin(a), act = i === bt;
    x.strokeStyle = act ? C.pu : C.mt;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(cx + (R + 10) * c, cy + (R + 10) * s);
    x.lineTo(cx + (R + 26) * c, cy + (R + 26) * s);
    x.stroke();
    x.fillStyle = act ? C.pu : C.fg;
    x.globalAlpha = act ? 1 : 0.5;
    const b0 = BEATS > 8 ? 11 : 14;
    x.font = "600 " + (act ? b0 + 2 + 8 * (1 - ff) * (1 - ff) : b0) + "px " + FF;
    x.fillText(i + 1, cx + (R + 44) * c, cy + (R + 44) * s + 5);
    x.globalAlpha = 1;
  }
  for (let i = 0; i < 12; i++) {
    const pc = (tn + 7 * i) % 12;
    if (use[pc] <= 0) continue;
    const [x0, y0] = at(i, R - nr - 5), [x1, y1] = at(i, R - nr - 5 - Math.min(1, use[pc] / 3) * R * 0.3);
    x.strokeStyle = C.pu;
    x.globalAlpha = 0.55;
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(x0, y0);
    x.lineTo(x1, y1);
    x.stroke();
  }
  x.globalAlpha = 1;
  const idx = cp.map(ri).sort((a, b) => a - b);
  if (idx.length > 2) {
    x.beginPath();
    idx.forEach((i, k) => {
      const [X, Y] = at(i, R);
      k ? x.lineTo(X, Y) : x.moveTo(X, Y);
    });
    x.closePath();
    x.fillStyle = C.pu;
    x.globalAlpha = 0.2;
    x.fill();
    x.globalAlpha = 1;
    x.strokeStyle = C.pu;
    x.lineWidth = 1.5;
    x.stroke();
  }
  x.font = "600 " + nr * 0.7 + "px " + FF;
  for (let i = 0; i < 12; i++) {
    const pc = (tn + 7 * i) % 12, d = 7 * i % 12, [X, Y] = at(i, R), inC = cp.includes(pc), root = ch && ch[2] >= 0 && pc === ch[1];
    x.beginPath();
    x.arc(X, Y, nr, 0, 7);
    x.fillStyle = root ? C.pu : C.pn;
    x.fill();
    if (inC && !root) {
      x.fillStyle = C.pu;
      x.globalAlpha = 0.3;
      x.fill();
      x.globalAlpha = 1;
    }
    x.lineWidth = 1.5;
    x.strokeStyle = inC ? C.pu : C.mt;
    x.stroke();
    if (root) {
      x.strokeStyle = C.bl;
      x.lineWidth = 3;
      x.beginPath();
      x.arc(X, Y, nr + 4, 0, 7);
      x.stroke();
    }
    x.fillStyle = C.fg;
    x.globalAlpha = inC ? 1 : 0.5;
    x.fillText(DEG[d], X, Y + nr * 0.25);
    x.globalAlpha = 1;
  }
  const rp = (pt) => R * (0.42 + 0.4 * Math.max(0, Math.min(1, (pt - PR[0]) / (PR[1] - PR[0]))));
  off.forEach((n, pt) => {
    if (on.has(pt)) return;
    const [X, Y] = at(ri(pt % 12), rp(pt));
    x.globalAlpha = 0.6 * (1 - (p - n[1]) / 0.5);
    x.fillStyle = C.bl;
    x.beginPath();
    x.arc(X, Y, 3, 0, 7);
    x.fill();
  });
  x.globalAlpha = 1;
  x.font = "600 9px " + FF;
  on.forEach((n, pt) => {
    const [X, Y] = at(ri(pt % 12), rp(pt));
    x.fillStyle = C.bl;
    x.strokeStyle = C.fg;
    x.lineWidth = 1.5;
    x.beginPath();
    x.arc(X, Y, 5, 0, 7);
    x.fill();
    x.stroke();
    x.fillStyle = C.fg;
    x.fillText(NN[pt % 12] + (Math.floor(pt / 12) - 1), X, Y - 9);
  });
  x.fillStyle = C.fg;
  x.font = "600 " + R * 0.3 + "px " + FF;
  x.fillText(lab(ch), cx, cy + R * 0.1);
  x.font = R * 0.1 + "px " + FF;
  x.globalAlpha = 0.6;
  x.fillText(nm(ch), cx, cy - R * 0.18);
  x.fillText("BAR " + Math.max(1, Math.floor(ph) + 1) + " OF " + TB + " · " + BEATS + "/" + DEN, cx, cy + R * 0.3);
  x.globalAlpha = 1;
  x.textAlign = "left";
}
