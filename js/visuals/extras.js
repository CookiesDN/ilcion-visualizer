/**
 * Waveform, chord strip, BPM/KEY/BAR readout, and the empty-state placeholder drawing.
 */

function dWf(p) {
  const [x, w, h] = g("wf"), n = PK.length, f = p / buf.duration;
  for (let i = 0; i < n; i++) {
    const a = Math.max(1.5, PK[i] * h / 2 * 0.95);
    x.fillStyle = i / n < f ? C.pu : C.mt;
    x.fillRect(i / n * w, h / 2 - a, Math.max(1, w / n - 1), a * 2);
  }
  x.fillStyle = C.fg;
  x.fillRect(f * w, 0, 2, h);
}

function dCs(p) {
  const [x, w, h] = g("cs"), ci = cidx(p), n = 7, gp = 10, bw = (w - gp * (n - 1)) / n, by = h * 0.1, bh = h * 0.8;
  x.textAlign = "center";
  for (let k = 0; k < n; k++) {
    const i = ci - 2 + k, c = D.chords[i], X = k * (bw + gp);
    rr(x, X, by, bw, bh, 14, i === ci ? C.pu : i === ci + 1 ? C.bl : i > ci ? C.mt : C.pn);
    if (!c) continue;
    x.globalAlpha = i < ci ? 0.45 : 1;
    x.fillStyle = C.fg;
    x.font = "600 " + Math.min(22, bh * 0.34) + "px " + FF;
    x.fillText(lab(c), X + bw / 2, by + bh / 2);
    x.font = Math.min(12, bh * 0.2) + "px " + FF;
    x.globalAlpha *= 0.7;
    x.fillText(nm(c), X + bw / 2, by + bh / 2 + bh * 0.26);
    x.globalAlpha = 1;
  }
  x.textAlign = "left";
}

function dBk(p) {
  const [x, w, h] = g("bk"), it = [["BPM", (D.bpm * rate).toFixed(1)], ["KEY", NN[D.key[0]] + (D.key[1] ? "m" : "")], ["BAR", Math.max(1, Math.floor((p - T0) / BAR) + 1) + " / " + TB], ["TIME", fm(p / rate)]], cols = w > h * 1.6 ? 4 : 2, rows = Math.ceil(4 / cols), cw = w / cols, rh = h / rows;
  x.textAlign = "center";
  it.forEach(([l, v], i) => {
    const cx = (i % cols + 0.5) * cw, cy = (Math.floor(i / cols) + 0.5) * rh;
    x.fillStyle = C.fg;
    x.globalAlpha = 0.5;
    x.font = "10px " + FF;
    x.fillText(l, cx, cy - rh * 0.22);
    x.globalAlpha = 1;
    x.font = "600 " + Math.min(cw * 0.2, rh * 0.4, 34) + "px " + FF;
    x.fillText(v, cx, cy + rh * 0.14);
  });
  x.textAlign = "left";
}

$("wf").onclick = (e) => {
  if (!buf) return;
  const r = e.target.getBoundingClientRect();
  start((e.clientX - r.left) / r.width * buf.duration);
  ac.resume();
};

function emptyDraw() {
  Object.keys(HINT).forEach((id) => {
    const c = $(id);
    if (!c || !c.offsetParent) return;
    const [x, w, h] = g(id);
    x.fillStyle = C.fg;
    x.globalAlpha = 0.35;
    x.font = "11px " + FF;
    x.textAlign = "center";
    x.fillText(HINT[id], w / 2, h / 2);
    x.globalAlpha = 1;
    x.textAlign = "left";
  });
}
