/**
 * Log-frequency spectrum bars with peak note readout.
 */

function dSp(id, NB) {
  const [x, w, h] = g(id || "sp"), hz = ac.sampleRate / an.fftSize, N = NB || 36, f = (j) => 30 * Math.pow(16e3 / 30, j / N);
  for (let j = 0; j < N; j++) {
    let m = -200;
    for (let i = Math.max(1, Math.floor(f(j) / hz)); i <= Math.max(1, Math.ceil(f(j + 1) / hz)); i++) if (F[i] > m) m = F[i];
    const v = Math.max(0, Math.min(1, (m + 100) / 70)) * h * 0.85;
    rr(x, j * w / N + 1, h - v, w / N - 2, v, 3, C.pu);
  }
  tag(x, "SPECTRUM");
  if (id === "sx") {
    let mi = 2, mv = -200;
    for (let i = Math.floor(30 / hz); i < Math.floor(8e3 / hz); i++) if (F[i] > mv) {
      mv = F[i];
      mi = i;
    }
    if (mv > -90) {
      const a = F[mi - 1], b = F[mi], c = F[mi + 1], d = 0.5 * (a - c) / (a - 2 * b + c), f2 = (mi + (isFinite(d) ? d : 0)) * hz, m = 69 + 12 * Math.log2(f2 / 440), n = Math.round(m), ct = Math.round((m - n) * 100);
      x.fillStyle = C.fg;
      x.font = "600 11px " + FF;
      x.textAlign = "right";
      x.fillText(mv.toFixed(1) + "dB | " + f2.toFixed(2) + "Hz | " + NN[(n % 12 + 12) % 12] + (Math.floor(n / 12) - 1) + " " + (ct >= 0 ? "+" : "") + ct + " Cents", w - 10, 16);
      x.textAlign = "left";
    }
  }
}
