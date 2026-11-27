/**
 * MIDI import: Standard MIDI File parser plus chord/key analysis from the notes.
 */

function smf(u8) {
  let p = 0;
  const r32 = () => (u8[p++] << 24 | u8[p++] << 16 | u8[p++] << 8 | u8[p++]) >>> 0, r16 = () => u8[p++] << 8 | u8[p++], vl = () => {
    let v = 0, b;
    do {
      b = u8[p++];
      v = v << 7 | b & 127;
    } while (b & 128);
    return v;
  };
  if (r32() !== 1297377380) throw 0;
  r32();
  r16();
  const nt = r16(), div = r16(), raw = [], tempo = [], tn = [];
  let ts0 = null;
  for (let t = 0; t < nt; t++) {
    if (r32() !== 1297379947) throw 0;
    const ln = r32(), end = p + ln;
    let tick = 0, rs = 0;
    const on = {};
    while (p < end) {
      tick += vl();
      const s = u8[p];
      if (s === 255) {
        p++;
        const ty = u8[p++], l = vl();
        if (ty === 81) tempo.push([tick, u8[p] << 16 | u8[p + 1] << 8 | u8[p + 2]]);
        else if (ty === 3) tn[t] = String.fromCharCode(...u8.slice(p, p + l));
        else if (ty === 88 && !ts0) ts0 = [u8[p], 1 << u8[p + 1]];
        p += l;
      } else if (s === 240 || s === 247) {
        p++;
        const l = vl();
        p += l;
      } else {
        if (s & 128) {
          rs = s;
          p++;
        }
        const hi = rs >> 4, ch = rs & 15, a = u8[p++], b = hi === 12 || hi === 13 ? 0 : u8[p++];
        if (hi === 9 && b > 0) on[ch + ":" + a] = [tick, b];
        else if (hi === 8 || hi === 9 && b === 0) {
          const o = on[ch + ":" + a];
          if (o) {
            raw.push({ a: o[0], b: tick, p: a, v: o[1], ch, t });
            delete on[ch + ":" + a];
          }
        }
      }
    }
    p = end;
  }
  tempo.sort((x, y) => x[0] - y[0]);
  if (!tempo.length || tempo[0][0] > 0) tempo.unshift([0, 5e5]);
  const seg = [];
  let sec = 0;
  tempo.forEach((q, i) => {
    if (i) sec += (q[0] - tempo[i - 1][0]) / div * tempo[i - 1][1] / 1e6;
    seg.push([q[0], q[1], sec]);
  });
  const T = (k) => {
    let s = seg[0];
    for (const q of seg) if (q[0] <= k) s = q;
    return s[2] + (k - s[0]) / div * s[1] / 1e6;
  };
  return { ts: ts0, bpm: 6e7 / seg[0][1], notes: raw.map((n) => ({ t: T(n.a), e: T(n.b), p: n.p, v: n.v, ch: n.ch, nm: tn[n.t] || "" })) };
}

function analyseMidi(notes, bpm) {
  const bl = 60 / bpm, end = Math.max(...notes.map((n) => n.e)), ns = Math.ceil(end / bl), hasB = notes.some((n) => n.k === "b"), ev = [], tot = new Float64Array(12);
  const TQ = [[0, 4, 7], [0, 3, 7], [0, 4, 7, 10], [0, 4, 7, 11], [0, 3, 7, 10], [0, 2, 7], [0, 5, 7], [0, 3, 6]];
  for (let j = 0; j < ns; j++) {
    const a = j * bl, b = a + bl, c = new Float64Array(12), bw = new Float64Array(12);
    let low = 999;
    for (const n of notes) {
      if (n.e <= a || n.t >= b) continue;
      const o = Math.min(n.e, b) - Math.max(n.t, a);
      if (o < bl * 0.12) continue;
      const w = o * (0.4 + n.v / 127);
      if (n.k === "b") {
        bw[n.p % 12] += w;
        c[n.p % 12] += w * 0.5;
      } else {
        c[n.p % 12] += w;
        if (n.p < low) low = n.p;
      }
    }
    if (!hasB && low < 999) bw[low % 12] = 1;
    const sc = c.reduce((s, v) => s + v, 0), sb = bw.reduce((s, v) => s + v, 0) || 1;
    if (sc < bl * 0.15) {
      ev.push([a, 0, -1]);
      continue;
    }
    for (let k = 0; k < 12; k++) {
      c[k] /= sc;
      bw[k] /= sb;
      tot[k] += c[k];
    }
    let bs = -9, bq = [0, 0];
    for (let r = 0; r < 12; r++) TQ.forEach((q, qi) => {
      let inn = 0, miss = 0;
      q.forEach((v) => {
        const x = c[(r + v) % 12];
        inn += x;
        if (x < 0.04) miss++;
      });
      const s = inn - 1.3 * (1 - inn) - 0.07 * miss + 0.4 * bw[r] - (qi > 4 ? 0.03 : 0);
      if (s > bs) {
        bs = s;
        bq = [r, qi];
      }
    });
    ev.push([a, bq[0], bq[1]]);
  }
  const chords = [];
  ev.forEach((e) => {
    const l = chords[chords.length - 1];
    if (!l || l[1] !== e[1] || l[2] !== e[2]) chords.push([+e[0].toFixed(3), e[1], e[2]]);
  });
  let kb = [-9, 0, 0];
  [KMJ, KMN].forEach((q, m) => {
    for (let r = 0; r < 12; r++) {
      const s = pear(tot, Array.from({ length: 12 }, (_, k) => q[(k - r + 12) % 12]));
      if (s > kb[0]) kb = [s, r, m];
    }
  });
  return { chords, key: [kb[1], kb[2]] };
}

function shiftMidi() {
  const off = +$("mo").value || 0;
  D.chords = midi.chords.map((c) => [c[0] + off, c[1], c[2]]);
  D.notes = midi.notes.map((n) => [n[0] + off, n[1] + off, n[2], n[3]]);
}

function applyMidi() {
  if (!midi) return;
  if (!D.auto) D.auto = { chords: D.chords, key: D.key, notes: D.notes };
  shiftMidi();
  D.key = midi.key;
  if (midi.ts) setTS(midi.ts[0], midi.ts[1]);
  $("ky").textContent = NN[D.key[0]] + (D.key[1] ? "m" : "");
  setRange();
  setNt();
}

async function midiLoad(files) {
  files = [...files];
  if (!files.length) return;
  if (!D) {
    flash("IMPORT STEMS FIRST");
    return;
  }
  try {
    const notes = [];
    let bpm = 0, ts = null;
    for (const f of files) {
      const m = smf(new Uint8Array(await f.arrayBuffer()));
      if (!bpm) bpm = m.bpm;
      if (!ts && m.ts) ts = m.ts;
      m.notes.forEach((n) => {
        const s = n.nm + " " + f.name;
        if (n.ch === 9 || /drum|perc/i.test(s)) return;
        n.k = /lead|melod|vocal|vox/i.test(s) ? "l" : /bass|808|sub/i.test(s) ? "b" : "h";
        notes.push(n);
      });
    }
    if (!notes.length) throw 0;
    const cn = notes.filter((n) => n.k !== "l"), M = analyseMidi(cn.length ? cn : notes, bpm);
    M.notes = notes.map((n) => [+n.t.toFixed(3), +n.e.toFixed(3), n.p, n.k === "b" ? 2 : n.k === "l" ? 0 : 3]).sort((a, b) => a[0] - b[0]);
    M.ts = ts;
    midi = M;
    applyMidi();
    flash(`MIDI · ${notes.length} NOTES · ${M.chords.length} CHORDS`);
  } catch (e) {
    flash("COULD NOT READ MIDI FILE");
  }
}

$("mi").onclick = () => $("mf").click();
$("mf").onchange = (e) => midiLoad(e.target.files);

$("mo").onchange = () => {
  if (midi) shiftMidi();
};

$("mc").onclick = () => {
  midi = null;
  if (D.auto) {
    D.chords = D.auto.chords;
    D.key = D.auto.key;
    D.notes = D.auto.notes;
    D.auto = null;
    $("ky").textContent = NN[D.key[0]] + (D.key[1] ? "m" : "");
    setRange();
    setNt();
    flash("MIDI CLEARED");
  }
};
