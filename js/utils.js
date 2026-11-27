/**
 * Small helpers shared by everything: DOM lookup, canvas setup, formatting, file saving.
 */

// DOM + canvas helpers
const $ = (id) => document.getElementById(id);

const col = () => {
  const s = getComputedStyle(document.documentElement);
  ["bg", "pn", "mt", "fg", "pu", "bl"].forEach((k) => C[k] = s.getPropertyValue("--" + k).trim());
};

const rr = (x, a, b, w, h, r, f) => {
  x.beginPath();
  x.roundRect(a, b, Math.max(w, 0), Math.max(h, 0), r);
  x.fillStyle = f;
  x.fill();
};

const g = (id) => {
  const c = $(id), x = c.getContext("2d"), cw = c.clientWidth || 1, ch = c.clientHeight || 1;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, c.width, c.height);
  x.setTransform(c.width / cw, 0, 0, c.height / ch, 0, 0);
  x.globalAlpha = 1;
  x.textAlign = "left";
  return [x, cw, ch];
};

const pos = () => Math.min(buf.duration, Math.max(0, (ac.currentTime - t0) * rate));
const fm = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
const lab = (c) => !c || c[2] < 0 ? "–" : DEG[(c[1] - D.key[0] + 12) % 12] + QS[c[2]];
const nm = (c) => !c || c[2] < 0 ? "" : NN[c[1]] + QS[c[2]];

const cidx = (p) => {
  let i = -1;
  for (let k = 0; k < D.chords.length; k++) if (D.chords[k][0] <= p) i = k;
  return i;
};

// Async + misc helpers
const sleep = () => new Promise((r) => setTimeout(r, 0));

const pear = (a, b) => {
  const m = (x) => x.reduce((s, v) => s + v, 0) / 12, ma = m(a), mb = m(b);
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < 12; i++) {
    n += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return n / Math.sqrt(da * db || 1);
};

const dpr = () => rendering ? RW / 1e3 : Math.min(3, Math.max(1, (devicePixelRatio || 1) * Z));

async function saveFile(blob, name) {
  if (window.claude && claude.use) {
    try {
      const d = await claude.use("downloads");
      if (!d) return "unavailable";
      await d.save({ filename: name, data: blob });
      return "saved";
    } catch (e) {
      return e && e.code === "declined" ? "declined" : "failed";
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return "saved";
}
