/**
 * Settings panel: font, colour palette, presets, persistence in localStorage.
 */

let cfg = { f: 0, c: PRE.Original.slice(), uf: null };

const save = () => {
  try {
    localStorage.setItem("viz", JSON.stringify({ f: cfg.f, c: cfg.c }));
  } catch (e) {
  }
};

function paint() {
  KEYS.forEach((k, i) => document.documentElement.style.setProperty("--" + k, cfg.c[i]));
  $("cl").querySelectorAll("input").forEach((el, i) => el.value = cfg.c[i]);
}

function setFont() {
  FF = cfg.uf ? '"UserFont",sans-serif' : FONTS[cfg.f][1];
  document.documentElement.style.setProperty("--ff", FF);
  const gf = FONTS[cfg.f][2];
  if (!cfg.uf && gf && !document.getElementById("gf" + cfg.f)) {
    const l = document.createElement("link");
    l.id = "gf" + cfg.f;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + gf + ":wght@400;600&display=swap";
    document.head.appendChild(l);
  }
}

$("fs").innerHTML = FONTS.map((f, i) => `<option value="${i}">${f[0]}</option>`).join("");
$("cl").innerHTML = CN.map((n, i) => `<label><input type="color" data-i="${i}">${n}</label>`).join("");
$("pre").innerHTML = Object.keys(PRE).map((k) => `<button class="g" data-p="${k}">${k.toUpperCase()}</button>`).join("");

$("cl").oninput = (e) => {
  cfg.c[+e.target.dataset.i] = e.target.value;
  paint();
  save();
};

$("pre").onclick = (e) => {
  const k = e.target.dataset.p;
  if (k) {
    cfg.c = PRE[k].slice();
    paint();
    save();
  }
};

$("fs").onchange = () => {
  cfg.f = +$("fs").value;
  cfg.uf = null;
  setFont();
  save();
};

$("fu").onclick = () => $("ff").click();

$("ff").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const ff = new FontFace("UserFont", await f.arrayBuffer());
    await ff.load();
    document.fonts.add(ff);
    cfg.uf = f.name;
    setFont();
    flash("FONT · " + f.name.toUpperCase());
  } catch (x) {
    flash("COULD NOT LOAD FONT");
  }
};

$("rs").onclick = () => {
  NS = DS = 1;
  spdSync();
  cfg = { f: 0, c: PRE.Original.slice(), uf: null };
  $("fs").value = 0;
  paint();
  setFont();
  save();
};

$("gr").onclick = () => $("set").hidden = !$("set").hidden;
$("scl").onclick = () => $("set").hidden = true;

try {
  const s = JSON.parse(localStorage.getItem("viz") || "null");
  if (s) {
    cfg.f = s.f || 0;
    cfg.c = s.c || cfg.c;
  }
} catch (e) {
}

$("fs").value = cfg.f;
paint();
setFont();
