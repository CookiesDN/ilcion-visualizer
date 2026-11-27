/**
 * Saved / imported / exported colour palettes.
 */

let pals = [];

try {
  pals = JSON.parse(localStorage.getItem("vizpal") || "[]");
} catch (e) {
}

const savePals = () => {
  try {
    localStorage.setItem("vizpal", JSON.stringify(pals));
  } catch (e) {
  }
};

const hx = (s) => /^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : null;
const clean = (s) => String(s).replace(/[<>&"']/g, "").slice(0, 24);

function parsePal(txt, name) {
  const out = [], ok = (c, n) => {
    c = (c || []).map((s) => {
      s = String(s).trim();
      return hx(s[0] === "#" ? s : "#" + s);
    }).filter(Boolean);
    if (c.length >= 6) out.push({ n: clean(n || "IMPORTED"), c: c.slice(0, 6) });
  };
  try {
    const j = JSON.parse(txt);
    if (Array.isArray(j) && typeof j[0] === "string") ok(j, name);
    else (Array.isArray(j) ? j : [j]).forEach((q) => ok(Array.isArray(q) ? q : q.c || q.colors || q.palette, q.n || q.name || name));
  } catch (e) {
  }
  if (!out.length) ok(txt.match(/#?[0-9a-fA-F]{6}\b/g), name);
  return out;
}

function drawPals() {
  $("mp").innerHTML = pals.length ? pals.map((p, i) => `<div class="pl"><span class="sw">${p.c.map((c) => `<i style="background:${c}"></i>`).join("")}</span><span class="pnm">${clean(p.n)}</span><button class="g" data-u="${i}">USE</button><button class="g" data-x="${i}">✕</button></div>`).join("") : '<div class="pl" style="opacity:.5">NO SAVED PALETTES YET</div>';
}

$("ps").onclick = () => {
  const n = clean($("pnm").value.trim()) || "PALETTE " + (pals.length + 1);
  pals.push({ n, c: cfg.c.slice() });
  savePals();
  drawPals();
  $("pnm").value = "";
  flash("PALETTE SAVED · " + n.toUpperCase());
};

$("mp").onclick = (e) => {
  const u = e.target.dataset.u, x = e.target.dataset.x;
  if (u != null && pals[u]) {
    cfg.c = pals[u].c.slice();
    paint();
    save();
  } else if (x != null) {
    pals.splice(+x, 1);
    savePals();
    drawPals();
  }
};

$("pi").onclick = () => $("pf").click();

$("pf").onchange = async (e) => {
  let n = 0, last;
  for (const f of e.target.files) parsePal(await f.text(), f.name.replace(/\.[^.]+$/, "")).forEach((p) => {
    pals.push(p);
    last = p;
    n++;
  });
  if (n) {
    savePals();
    drawPals();
    cfg.c = last.c.slice();
    paint();
    save();
    flash(`IMPORTED ${n} PALETTE${n > 1 ? "S" : ""}`);
  } else flash("NO 6-COLOR PALETTE FOUND");
  e.target.value = "";
};

$("pt").onchange = () => {
  const r = parsePal($("pt").value, "PASTED");
  if (r.length) {
    cfg.c = r[0].c.slice();
    paint();
    save();
    flash("PALETTE APPLIED · SAVE IT TO KEEP");
  } else flash("NEED 6 HEX COLORS");
  $("pt").value = "";
};

$("pe").onclick = async () => {
  const r = await saveFile(new Blob([JSON.stringify({ name: "palette", colors: cfg.c }, null, 1)], { type: "application/json" }), "palette.json");
  flash(r === "saved" ? "PALETTE EXPORTED" : r === "declined" ? "EXPORT CANCELLED" : "COULD NOT SAVE THE FILE HERE");
};

drawPals();
