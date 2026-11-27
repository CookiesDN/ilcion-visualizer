/**
 * Playback: loading analysed data into the player, play/pause, keyboard + drag-and-drop input.
 */

function apply(d, b, title) {
  D = d;
  buf = b;
  ST = d.names;
  BEATS = 4;
  DEN = 4;
  regrid();
  rate = 1;
  tempoUI();
  $("ky").textContent = NN[d.key[0]] + (d.key[1] ? "m" : "");
  titleStr = userTitle || title;
  $("ttl").textContent = titleStr;
  setRange();
  {
    const ch = b.getChannelData(0), NP = 600, sz = Math.max(1, Math.floor(ch.length / NP));
    PK = new Float32Array(NP);
    for (let i = 0; i < NP; i++) {
      let m = 0;
      for (let j = i * sz; j < (i + 1) * sz && j < ch.length; j += 8) {
        const v = Math.abs(ch[j]);
        if (v > m) m = v;
      }
      PK[i] = m;
    }
  }
  setNt();
  if (midi) applyMidi();
  if (src) {
    try {
      src.stop();
    } catch (e) {
    }
  }
  src = null;
  t0 = 0;
  ac.suspend();
  $("pl").disabled = false;
  $("im").disabled = false;
  fit();
  unload();
}

function start(off) {
  if (src) {
    try {
      src.stop();
    } catch (e) {
    }
  }
  src = ac.createBufferSource();
  src.buffer = buf;
  src.connect(gain);
  src.playbackRate.value = rate;
  src.start(0, off);
  t0 = ac.currentTime - off / rate;
}

const toggle = () => {
  if (!buf) return;
  if (!src || pos() >= buf.duration - 0.05) {
    start(0);
    ac.resume();
  } else if (ac.state === "running") ac.suspend();
  else ac.resume();
};

$("pl").onclick = toggle;
$("im").onclick = () => $("fi").click();
$("fi").onchange = (e) => imp(e.target.files);

onkeydown = (e) => {
  if (e.code === "Space" && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName) && !e.target.isContentEditable) {
    e.preventDefault();
    toggle();
  }
};

ondragover = (e) => e.preventDefault();

ondrop = (e) => {
  e.preventDefault();
  const fs = [...e.dataTransfer.files], isM = (f) => /\.midi?$/i.test(f.name), au = fs.filter((f) => !isM(f)), md = fs.filter(isM);
  (au.length ? imp(au) : Promise.resolve()).then(() => md.length && midiLoad(md));
};
