/**
 * Piano roll with chord strip, sounding notes and drum dots.
 */

function dDg(p) {
  const [x, w, h] = g("dg"), GL = 40, W = w - GL, rT = 26, rB = h - 50, dB = h - 28, win = BAR * 4 / NS, t1 = p - win * 0.3, t2 = t1 + win, X = (t) => GL + (t - t1) / win * W, N = D.notes || [], ci = cidx(p), ph = (rB - rT) / (PR[1] - PR[0] + 1), Y = (pt) => rB - (Math.min(PR[1], Math.max(PR[0], pt)) - PR[0] + 1) * ph, snd = /* @__PURE__ */ new Set();
  for (let i = Math.max(0, ci - 3); i < D.chords.length; i++) {
    const c = D.chords[i], a = c[0], e = D.chords[i + 1] ? D.chords[i + 1][0] : buf.duration;
    if (a > t2) break;
    if (e < t1) continue;
    const xa = Math.max(GL, X(a)), xb = Math.min(w, X(e));
    if (xb - xa < 3) continue;
    rr(x, xa + 1, 0, xb - xa - 2, 20, 8, i === ci ? C.pu : i === ci + 1 ? C.bl : C.mt);
    x.save();
    x.beginPath();
    x.rect(xa + 1, 0, xb - xa - 2, 20);
    x.clip();
    x.fillStyle = C.fg;
    x.globalAlpha = i < ci ? 0.5 : 1;
    x.font = "600 11px " + FF;
    x.fillText(lab(c) + (nm(c) ? "  " + nm(c) : ""), xa + 8, 14);
    x.restore();
  }
  x.globalAlpha = 1;
  for (let pt = PR[0]; pt <= PR[1]; pt++) {
    const bk = [1, 3, 6, 8, 10].includes(pt % 12);
    x.fillStyle = bk ? C.pn : C.mt;
    x.globalAlpha = bk ? 1 : 0.55;
    x.fillRect(0, Y(pt), GL - 3, Math.max(1, ph - 0.5));
    if (pt % 12 === 0) {
      x.globalAlpha = 0.7;
      x.fillStyle = C.fg;
      x.font = "8px " + FF;
      x.fillText("C" + (pt / 12 - 1), 3, Y(pt) + ph - 1);
    }
  }
  x.globalAlpha = 1;
  for (let b = Math.floor((t1 - T0) / UBL); T0 + b * UBL < t2; b++) {
    const xx = X(T0 + b * UBL);
    if (xx < GL) continue;
    const bar = (b % BEATS + BEATS) % BEATS === 0;
    x.fillStyle = C.mt;
    x.globalAlpha = bar ? 1 : 0.45;
    x.fillRect(xx, rT, 1, dB - rT);
    x.globalAlpha = 1;
    if (bar) {
      x.fillStyle = C.fg;
      x.globalAlpha = 0.5;
      x.font = "10px " + FF;
      x.fillText(Math.floor(b / BEATS) + 1, xx + 4, rT + 10);
      x.globalAlpha = 1;
    }
  }
  for (const n of N) {
    if (n[1] < t1 || n[0] > t2) continue;
    const on = n[0] <= p && p < n[1], xa = Math.max(GL, X(n[0])), xb = Math.min(w, X(n[1]));
    if (xb <= xa) continue;
    if (on) snd.add(n[2]);
    const [c, a] = SC[n[3] % 6];
    x.fillStyle = on ? C.fg : C[c];
    x.globalAlpha = on ? 1 : (n[1] <= p ? 0.85 : 0.35) * a;
    x.fillRect(xa, Y(n[2]), Math.max(1.5, xb - xa - 0.5), Math.max(1.5, ph - 0.6));
  }
  x.globalAlpha = 1;
  snd.forEach((pt) => {
    x.fillStyle = C.pu;
    x.fillRect(0, Y(pt), GL - 3, Math.max(2, ph));
  });
  const dn = ST.findIndex((s) => /drum|perc/i.test(s));
  x.fillStyle = C.fg;
  x.globalAlpha = 0.5;
  x.font = "8px " + FF;
  x.fillText("DRUMS", 3, dB - 6);
  if (dn >= 0) {
    const dd = D.dots[ST[dn]];
    for (let k = Math.max(0, Math.floor((t1 - T0) / STEP)); k < Math.ceil((t2 - T0) / STEP); k++) {
      const e = +(dd[k] || 0), t = T0 + k * STEP;
      if (e < 2) continue;
      x.globalAlpha = t <= p ? 1 : 0.4;
      x.fillStyle = e > 5 ? C.pu : C.fg;
      x.fillRect(X(t), dB - e * 1.4 - 2, 3, e * 1.4);
    }
  }
  x.globalAlpha = 1;
  x.fillStyle = C.fg;
  x.fillRect(X(p), rT - 4, 2, dB - rT + 4);
  const nz = [...snd].sort((a, b) => a - b).map((pt) => NN[pt % 12] + (Math.floor(pt / 12) - 1)), c0 = D.chords[ci], c1 = D.chords[ci + 1];
  x.globalAlpha = 0.55;
  x.font = "10px " + FF;
  x.fillText("SOUNDING", GL, h - 8);
  x.globalAlpha = 1;
  x.font = "600 13px " + FF;
  x.fillText(nz.slice(0, w > 760 ? 9 : 4).join("  ") || "–", GL + 72, h - 8);
  x.textAlign = "right";
  x.fillText("NOW " + lab(c0) + (nm(c0) ? " · " + nm(c0) : "") + (w > 760 ? "     NEXT " + lab(c1) + (c1 && nm(c1) ? " · " + nm(c1) : "") : ""), w, h - 8);
  x.textAlign = "left";
}
