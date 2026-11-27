/**
 * EDIT mode: drag, snap-to-grid ghost, corner resize and remove for each panel.
 */

$("sq").addEventListener("pointerdown", (e) => {
  if (!document.body.classList.contains("edit") || ptrs.size > 1) return;
  const p = e.target.closest(".p");
  if (!p) return;
  const id = p.id.slice(2), L = getLay();
  if (e.target.classList.contains("xx")) {
    if (id !== "hd") {
      delete L[id];
      saveLay();
      applyLayout();
    }
    return;
  }
  const rz = e.target.classList.contains("rz"), { cw, rh, N } = geo(), r = L[id].slice(), R0 = [p.offsetLeft, p.offsetTop, p.offsetWidth, p.offsetHeight], sx = e.clientX, sy = e.clientY, cur = R0.slice(), tgt = R0.slice();
  p.style.zIndex = ++ZI;
  p.classList.remove("snapping");
  p.classList.add("drag");
  p.setPointerCapture(e.pointerId);
  e.preventDefault();
  const gh = document.createElement("div");
  gh.className = "ghost";
  $("sq").appendChild(gh);
  const snap = () => {
    const n = r.slice();
    if (rz) {
      n[2] = Math.max(6, Math.min(48 - r[0], Math.round(tgt[2] / cw)));
      n[3] = Math.max(3, Math.min(N - r[1], Math.round(tgt[3] / rh)));
    } else {
      n[0] = Math.max(0, Math.min(48 - r[2], Math.round(tgt[0] / cw)));
      n[1] = Math.max(0, Math.min(N - r[3], Math.round(tgt[1] / rh)));
    }
    return n;
  }, ghost = () => {
    const n = snap();
    gh.style.cssText = `left:${n[0] * cw}px;top:${n[1] * rh}px;width:${n[2] * cw}px;height:${n[3] * rh}px`;
  };
  let raf = 0;
  const loop = () => {
    for (let i = 0; i < 4; i++) cur[i] += (tgt[i] - cur[i]) * 0.28;
    p.style.left = cur[0] + "px";
    p.style.top = cur[1] + "px";
    p.style.width = cur[2] + "px";
    p.style.height = cur[3] + "px";
    raf = requestAnimationFrame(loop);
  };
  ghost();
  loop();
  const mv = (ev) => {
    const dx = (ev.clientX - sx) / Z, dy = (ev.clientY - sy) / Z;
    if (rz) {
      tgt[2] = Math.max(6 * cw, R0[2] + dx);
      tgt[3] = Math.max(3 * rh, R0[3] + dy);
    } else {
      tgt[0] = Math.max(0, Math.min(1e3 - R0[2], R0[0] + dx));
      tgt[1] = Math.max(0, Math.min(N * rh - R0[3], R0[1] + dy));
    }
    ghost();
  }, up = () => {
    p.removeEventListener("pointermove", mv);
    p.removeEventListener("pointerup", up);
    cancelAnimationFrame(raf);
    L[id] = snap();
    gh.remove();
    p.classList.remove("drag");
    p.classList.add("snapping");
    place(id);
    saveLay();
    setTimeout(() => {
      p.classList.remove("snapping");
      fit();
    }, 280);
  };
  p.addEventListener("pointermove", mv);
  p.addEventListener("pointerup", up);
});
