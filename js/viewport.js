/**
 * Canvas resolution fitting, stage zoom and pan (wheel, pinch, drag, keyboard).
 */

function fit() {
  S = $("sq").clientWidth / 1e3;
  document.querySelectorAll("canvas").forEach((c) => {
    const d = dpr(), W = Math.max(1, Math.round(c.clientWidth * d)), H = Math.max(1, Math.round(c.clientHeight * d));
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
  });
  if (!D) return;
  const n = Math.max(8, Math.floor(($("st").clientWidth / S - LW - 16) / 3));
  WC = ST.map((s) => {
    const e = D.env[s], o = new Float32Array(n), k = e.length / n;
    for (let i = 0; i < n; i++) {
      let m = 0;
      for (let j = Math.floor(i * k); j < Math.floor((i + 1) * k); j++) m = Math.max(m, e[j]);
      o[i] = m / 99;
    }
    return o;
  });
}

onresize = () => stageFit();
const vp = $("vp");
const ptrs = /* @__PURE__ */ new Map();
let pan = null;
let pinchL = 0;

const gv = () => {
  const H0 = HO ?? geo().H0, vw = innerWidth, vh = Math.max(200, innerHeight - 68);
  return { H0, vw, vh, z0: Math.min((vw - 24) / 1e3, (vh - 12) / H0) };
};

function stageFit() {
  const { H0, vw, vh, z0 } = gv();
  Z = z0 * zm;
  $("stw").style.transform = `translate(${(vw - 1e3 * Z) / 2 + px}px,${(vh - H0 * Z) / 2 + py + 4}px) scale(${Z})`;
  $("zl").textContent = Math.round(Z * 100) + "%";
  clearTimeout(zt);
  zt = setTimeout(fit, 140);
}

function zoomAt(mx, my, f) {
  const { H0, vw, vh, z0 } = gv(), o = z0 * zm, tx = (vw - 1e3 * o) / 2 + px, ty = (vh - H0 * o) / 2 + py + 4, sx = (mx - tx) / o, sy = (my - ty) / o;
  zm = Math.max(0.2, Math.min(8, zm * f));
  const n = z0 * zm;
  px = mx - sx * n - (vw - 1e3 * n) / 2;
  py = my - sy * n - (vh - H0 * n) / 2 - 4;
  stageFit();
}

const zc = (f) => zoomAt(innerWidth / 2, (innerHeight - 68) / 2, f);

const zfit = () => {
  zm = 1;
  px = py = 0;
  stageFit();
};

$("zi").onclick = () => zc(1.2);
$("zo").onclick = () => zc(1 / 1.2);
$("zf").onclick = zfit;

vp.addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
  else {
    px -= e.deltaX;
    py -= e.deltaY;
    stageFit();
  }
}, { passive: false });

vp.addEventListener("pointerdown", (e) => {
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinchL = Math.hypot(a[0] - b[0], a[1] - b[1]);
    pan = null;
  } else if (!e.target.closest(".p")) pan = { x: e.clientX, y: e.clientY, px, py };
});

vp.addEventListener("pointermove", (e) => {
  if (!ptrs.has(e.pointerId)) return;
  const o = ptrs.get(e.pointerId);
  ptrs.set(e.pointerId, [e.clientX, e.clientY]);
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (pinchL) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinchL);
    pinchL = d;
    px += (e.clientX - o[0]) / 2;
    py += (e.clientY - o[1]) / 2;
    stageFit();
  } else if (pan) {
    px = pan.px + e.clientX - pan.x;
    py = pan.py + e.clientY - pan.y;
    stageFit();
  }
});

const pUp = (e) => {
  ptrs.delete(e.pointerId);
  pan = null;
  pinchL = 0;
};

vp.addEventListener("pointerup", pUp);
vp.addEventListener("pointercancel", pUp);

addEventListener("keydown", (e) => {
  if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable || e.ctrlKey || e.metaKey) return;
  if (e.key === "+" || e.key === "=") zc(1.2);
  else if (e.key === "-") zc(1 / 1.2);
  else if (e.key === "0") zfit();
});
