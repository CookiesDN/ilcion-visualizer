/**
 * Scrolling spectrogram.
 */

let SGC = null;
const rgb = (hx) => [1, 3, 5].map((i) => parseInt(hx.slice(i, i + 2), 16) || 0);

function dSg() {
  const [x, w, h] = g("sg"), c = $("sg"), pw = c.width, ph = c.height;
  if (!SGC || SGC.width !== pw || SGC.height !== ph) {
    SGC = document.createElement("canvas");
    SGC.width = pw;
    SGC.height = ph;
  }
  if (RUN) {
    const sx = SGC.getContext("2d"), sp = Math.max(1, Math.round(pw / 320)), hz = ac.sampleRate / an.fftSize, c0 = rgb(C.pn), c1 = rgb(C.pu), c2 = rgb(C.fg);
    sx.globalCompositeOperation = "copy";
    sx.drawImage(SGC, -sp, 0);
    sx.globalCompositeOperation = "source-over";
    for (let y = 0; y < ph; y++) {
      const f = 20 * Math.pow(800, 1 - y / ph), v = Math.max(0, Math.min(1, (F[Math.min(F.length - 1, Math.round(f / hz))] + 95) / 62)), k = v < 0.5 ? v * 2 : v * 2 - 1, a = v < 0.5 ? c0 : c1, b = v < 0.5 ? c1 : c2;
      sx.fillStyle = "rgb(" + a.map((q, i) => Math.round(q + (b[i] - q) * k)).join(",") + ")";
      sx.fillRect(pw - sp, y, sp, 1);
    }
  }
  x.drawImage(SGC, 0, 0, w, h);
  x.fillStyle = C.fg;
  x.globalAlpha = 0.55;
  x.font = "10px " + FF;
  x.fillText("SPECTROGRAM", 10, 16);
  x.globalAlpha = 1;
}
