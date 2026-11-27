/**
 * 48-column grid layout engine: per-aspect-ratio layouts, add/remove visuals, animated aspect-ratio morph.
 */

try {
  const s = JSON.parse(localStorage.getItem("vizlay") || "null");
  if (s) {
    AR0 = AR[s.ar] ? s.ar : "1:1";
    LAY = s.LAY || {};
  }
} catch (e) {
}

const saveLay = () => {
  try {
    localStorage.setItem("vizlay", JSON.stringify({ ar: AR0, LAY }));
  } catch (e) {
  }
};

const getLay = () => {
  const L = LAY[AR0] || (LAY[AR0] = JSON.parse(JSON.stringify(DEF[AR0])));
  if (!L.hd) L.hd = DEF[AR0].hd.slice();
  return L;
};

const geo = () => {
  const [pw, ph] = AR[AR0], H0 = 1e3 * ph / pw, N = Math.round(48 * ph / pw);
  return { H0, N, cw: 1e3 / 48, rh: H0 / N };
};

function place(id) {
  const { cw, rh } = geo(), r = getLay()[id], e = $("w_" + id);
  if (!r) return;
  e.style.left = r[0] * cw + "px";
  e.style.top = r[1] * rh + "px";
  e.style.width = r[2] * cw + "px";
  e.style.height = r[3] * rh + "px";
}

function applyLayout() {
  const { H0 } = geo(), L = getLay();
  $("sq").style.height = H0 + "px";
  $("ar").value = AR0;
  Object.keys(WT).forEach((id) => {
    VIS[id] = !!L[id];
    $("w_" + id).classList.toggle("off", !L[id]);
    place(id);
  });
  stageFit();
  fit();
}

const fitSoon = () => {
  cancelAnimationFrame(fz);
  fz = requestAnimationFrame(fit);
};

$("ar").onchange = () => morphTo($("ar").value);

$("rl").onclick = () => {
  delete LAY[AR0];
  saveLay();
  applyLayout();
};

$("ed").onclick = () => {
  const on = document.body.classList.toggle("edit");
  $("ed").textContent = on ? "DONE" : "EDIT";
  $("addm").hidden = true;
};

$("adb").onclick = () => {
  const L = getLay(), m = $("addm"), hid = Object.keys(WT).filter((id) => !L[id]);
  m.innerHTML = hid.length ? hid.map((id) => `<button class="g" data-a="${id}">+ ${WT[id]}</button>`).join("") : '<span style="opacity:.6;padding:6px">ALL VISUALS ARE ON</span>';
  m.hidden = !m.hidden;
};

$("addm").onclick = (e) => {
  const id = e.target.dataset.a;
  if (!id) return;
  const { N } = geo(), [w, h] = NEWSZ[id] || [16, 10], L = getLay();
  L[id] = [Math.max(0, 48 - w >> 1), Math.max(0, N - h >> 1), Math.min(48, w), Math.min(N, h)];
  $("w_" + id).style.zIndex = ++ZI;
  saveLay();
  applyLayout();
  $("addm").hidden = true;
  document.body.classList.add("edit");
  $("ed").textContent = "DONE";
};

let mq = 0;

function morphTo(nar) {
  if (nar === AR0) return;
  cancelAnimationFrame(mq);
  if (HO != null) {
    HO = null;
    applyLayout();
  }
  const oG = geo(), oL = JSON.parse(JSON.stringify(getLay()));
  AR0 = nar;
  saveLay();
  const nG = geo(), nL = getLay(), ids = Object.keys(WT), px = (L, G, id) => L[id] ? [L[id][0] * G.cw, L[id][1] * G.rh, L[id][2] * G.cw, L[id][3] * G.rh] : null, tm = performance.now(), DUR = 560;
  $("ar").value = AR0;
  ids.forEach((id) => {
    const e = $("w_" + id);
    e.classList.remove("snapping");
    e.classList.toggle("off", !(oL[id] || nL[id]));
    VIS[id] = !!(oL[id] || nL[id]);
  });
  const step = (now) => {
    const u = Math.min(1, (now - tm) / DUR), k = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    HO = oG.H0 + (nG.H0 - oG.H0) * k;
    $("sq").style.height = HO + "px";
    ids.forEach((id) => {
      const e = $("w_" + id), a = px(oL, oG, id), b = px(nL, nG, id);
      let r, o = 1;
      if (a && b) r = a.map((v, i) => v + (b[i] - v) * k);
      else if (b) {
        const s = 0.6 + 0.4 * k;
        r = [b[0] + b[2] * (1 - s) / 2, b[1] + b[3] * (1 - s) / 2, b[2] * s, b[3] * s];
        o = k;
      } else if (a) {
        const s = 1 - 0.4 * k;
        r = [a[0] + a[2] * (1 - s) / 2, a[1] + a[3] * (1 - s) / 2, a[2] * s, a[3] * s];
        o = 1 - k;
      } else return;
      e.style.left = r[0] + "px";
      e.style.top = r[1] + "px";
      e.style.width = r[2] + "px";
      e.style.height = r[3] + "px";
      e.style.opacity = o;
    });
    stageFit();
    if (u < 1) mq = requestAnimationFrame(step);
    else {
      HO = null;
      ids.forEach((id) => $("w_" + id).style.opacity = "");
      applyLayout();
    }
  };
  mq = requestAnimationFrame(step);
}
