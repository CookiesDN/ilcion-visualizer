/**
 * Loading overlay, toast messages (flash), note range, Escape key handling.
 */

function flash(m) {
  $("ttl").textContent = m;
  clearTimeout(ft);
  ft = setTimeout(() => $("ttl").textContent = titleStr, 3500);
}

function load(msg, f) {
  $("ld").classList.remove("off");
  $("lt").textContent = msg;
  if (f != null) $("lf").style.width = Math.round(f * 100) + "%";
}

function unload() {
  $("lf").style.width = "100%";
  setTimeout(() => $("ld").classList.add("off"), 250);
}

function setNt() {
  $("nt").textContent = "NOTES · " + (midi && D.auto ? "FROM MIDI" : "ESTIMATED FROM AUDIO");
}

function setRange() {
  const ps = (D.notes || []).map((n) => n[2]).sort((a, b) => a - b);
  PR = ps.length ? [Math.max(0, ps[Math.floor(ps.length * 0.03)] - 1), Math.min(127, ps[Math.floor(ps.length * 0.97)] + 1)] : [36, 84];
  if (PR[1] - PR[0] < 24) PR[1] = PR[0] + 24;
}

addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!$("rd").hidden) $("rd").hidden = true;
    else if (!$("set").hidden) $("set").hidden = true;
    else if (!$("tp").hidden) $("tp").hidden = true;
    else endRec(true);
  }
});
