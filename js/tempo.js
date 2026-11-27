/**
 * TEMPO panel: BPM correction, grid nudging, time signature, playback speed and scroll speed.
 */

function tempoUI() {
  if (!D) return;
  D.bpm0 = D.bpm0 || D.bpm;
  if (D.T00 == null) D.T00 = D.T0;
  const b = D.bpm * rate, st = 12 * Math.log2(rate);
  $("bp").textContent = b.toFixed(1);
  $("bp").style.color = Math.abs(rate - 1) < 1e-3 ? "" : "var(--pu)";
  $("bgd").textContent = D.bpm.toFixed(1);
  $("bgo").textContent = D.bpm0.toFixed(1);
  $("bg0").textContent = D.T0.toFixed(2);
  $("tpb").textContent = b.toFixed(1);
  $("tpr").textContent = rate.toFixed(2) + "×";
  $("tps").textContent = (st >= 0 ? "+" : "") + st.toFixed(1) + " ST";
  {
    const k = BEATS + "/" + DEN, sl = $("tsel");
    sl.value = [...sl.options].some((o) => o.value === k) ? k : "custom";
    $("tsn").value = BEATS;
    $("tsd").value = DEN;
    $("tsc").hidden = sl.value !== "custom";
  }
  $("tn").textContent = "GRID " + D.bpm.toFixed(1) + " BPM · SPEED RANGE " + Math.round(D.bpm / 4) + "–" + Math.round(D.bpm * 4) + " BPM";
}

function regrid() {
  BL = 60 / D.bpm;
  UBL = BL * 4 / DEN;
  BAR = UBL * BEATS;
  STEP = BL / 4;
  D.T0 = (D.T0 % BAR + BAR) % BAR;
  T0 = D.T0;
  TB = Math.max(1, Math.ceil((D.dur - T0) / BAR - 0.02));
}

function setTS(n, d) {
  if (!D) return;
  BEATS = Math.max(1, Math.min(16, n | 0 || 4));
  DEN = [2, 4, 8, 16].includes(d | 0) ? d | 0 : 4;
  regrid();
  redots();
  tempoUI();
}

function redots() {
  if (D.mono) D.names.forEach((n, i) => {
    D.dots[n] = stepDots(D.mono[i], D.s2, D.T0, STEP, D.dur);
  });
}

function setBpm(b) {
  if (!D) {
    flash("IMPORT STEMS FIRST");
    return;
  }
  D.bpm0 = D.bpm0 || D.bpm;
  D.bpm = +Math.max(20, Math.min(400, b)).toFixed(2);
  regrid();
  redots();
  tempoUI();
}

function shiftGrid(s) {
  if (!D) return;
  D.T0 = ((D.T0 + s) % BAR + BAR) % BAR;
  regrid();
  redots();
  tempoUI();
}

function setRate(r) {
  if (!D) {
    flash("IMPORT STEMS FIRST");
    return;
  }
  const p = src ? pos() : 0;
  r = Math.max(0.25, Math.min(4, r));
  rate = r;
  if (src) {
    src.playbackRate.value = r;
    t0 = ac.currentTime - p / r;
  }
  tempoUI();
}

const goTempo = () => {
  const v = parseFloat($("tc").value);
  if (!D) {
    flash("IMPORT STEMS FIRST");
    return;
  }
  if (!(v > 0)) return;
  if (v / D.bpm < 0.25 || v / D.bpm > 4) flash("TEMPO RANGE IS ¼× TO 4× THE ORIGINAL");
  setRate(v / D.bpm);
  $("tc").value = "";
};

$("th").onclick = () => setRate(rate / 2);
$("tx").onclick = () => setRate(rate * 2);
$("tz").onclick = () => setRate(1);
$("tg").onclick = goTempo;

$("tc").onkeydown = (e) => {
  if (e.key === "Enter") goTempo();
};

const toggleTempo = () => {
  $("set").hidden = true;
  $("tp").hidden = !$("tp").hidden;
  tempoUI();
};

$("tbt").onclick = toggleTempo;
$("bp").parentElement.style.cursor = "pointer";
$("bp").parentElement.onclick = toggleTempo;
$("tcl").onclick = () => $("tp").hidden = true;
$("bh").onclick = () => D && setBpm(D.bpm / 2);
$("bx").onclick = () => D && setBpm(D.bpm * 2);

$("bz").onclick = () => {
  if (D) {
    D.T0 = D.T00 == null ? D.T0 : D.T00;
    setBpm(D.bpm0 || D.bpm);
  }
};

const goBpm = () => {
  const v = parseFloat($("bc").value);
  if (!D) {
    flash("IMPORT STEMS FIRST");
    return;
  }
  if (!(v > 0)) return;
  setBpm(v);
  $("bc").value = "";
};

$("bg").onclick = goBpm;

$("bc").onkeydown = (e) => {
  if (e.key === "Enter") goBpm();
};

$("g1").onclick = () => shiftGrid(-UBL);
$("g2").onclick = () => shiftGrid(-STEP);
$("g3").onclick = () => shiftGrid(STEP);
$("g4").onclick = () => shiftGrid(UBL);

$("tsel").onchange = () => {
  const v = $("tsel").value;
  if (v === "custom") {
    $("tsc").hidden = false;
    return;
  }
  const [a, b] = v.split("/");
  setTS(+a, +b);
};

$("tsn").onchange = $("tsd").onchange = () => setTS(+$("tsn").value, +$("tsd").value);

try {
  const s = JSON.parse(localStorage.getItem("vizspd") || "null");
  if (s) {
    NS = s.n || 1;
    DS = s.d || 1;
  }
} catch (e) {
}

function spdSync() {
  $("sn").value = Math.log2(NS);
  $("sd").value = Math.log2(DS);
  $("snv").textContent = NS.toFixed(2) + "×";
  $("sdv").textContent = DS.toFixed(2) + "×";
  try {
    localStorage.setItem("vizspd", JSON.stringify({ n: NS, d: DS }));
  } catch (e) {
  }
}

$("sn").oninput = () => {
  NS = Math.pow(2, +$("sn").value);
  spdSync();
};

$("sd").oninput = () => {
  DS = Math.pow(2, +$("sd").value);
  spdSync();
};

$("sn").ondblclick = () => {
  NS = 1;
  spdSync();
};

$("sd").ondblclick = () => {
  DS = 1;
  spdSync();
};

spdSync();
