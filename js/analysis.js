/**
 * In-browser stem analysis: tempo, downbeat, chords, key, note estimation, and the stem import pipeline.
 */

async function analyse(mono, nm, mL, mR, sr, len) {
  const s2 = sr / 2, dur = len / sr, rl = (n) => /drum|perc|kick|snare|hat/i.test(n) ? "d" : /bass|sub/i.test(n) ? "b" : /vo[cx]|sing/i.test(n) ? "v" : "h", R = nm.map(rl), pick = (r) => mono.filter((_, i) => R[i] === r), st = async (t, f) => {
    load(t, f);
    await sleep();
  };
  const all = sum(mono), dr = pick("d").length ? sum(pick("d")) : all, bsx = pick("b").length ? sum(pick("b")) : null;
  let hs = pick("h");
  if (!hs.length) hs = mono.filter((_, i) => R[i] !== "d");
  const hm = sum(hs.length ? hs : [all]);
  await st("FINDING TEMPO…", 0.4);
  const hop = 256, fl = [];
  let pv = null;
  spec(dr, 512, hop, (re, im) => {
    const m = new Float32Array(257);
    let s = 0;
    for (let i = 0; i < 257; i++) {
      m[i] = Math.log1p(10 * Math.hypot(re[i], im[i]));
      if (pv) s += Math.max(0, m[i] - pv[i]);
    }
    if (pv) fl.push(s);
    pv = m;
  });
  const ht = hop / s2, sc = (b, o) => {
    const bl2 = 60 / b;
    let s = 0, c = 0;
    for (let t = o; t < dur - 1; t += bl2 / 4) {
      s += fl[Math.min(fl.length - 1, Math.round(t / ht))];
      c++;
    }
    return s / c;
  };
  let be = [-1, 120, 0];
  for (let b = 90; b <= 180; b += 0.1) for (let o = 0, bl2 = 60 / b; o < bl2 / 4; o += 0.01) {
    const s = sc(b, o);
    if (s > be[0]) be = [s, b, o];
  }
  for (let b = be[1] - 0.1; b <= be[1] + 0.1; b += 0.01) for (let o = Math.max(0, be[2] - 0.01); o <= be[2] + 0.01; o += 2e-3) {
    const s = sc(b, o);
    if (s > be[0]) be = [s, b, o];
  }
  const bpm = be[1], bl = 60 / bpm, stp = bl / 4, off = be[2], bar = bl * 4;
  let sm = 0;
  const lw = new Float64Array(dr.length + 1), a = 2 * Math.PI * 150 / s2, d30 = Math.round(0.03 * s2);
  let y = 0;
  const e = new Float32Array(dr.length);
  for (let i = 0; i < dr.length; i++) {
    y += a * (dr[i] - y);
    sm += 0.05 * (Math.abs(y) - sm);
    e[i] = sm;
  }
  for (let i = 0; i < dr.length; i++) lw[i + 1] = lw[i] + (i >= d30 ? Math.max(e[i] - e[i - d30], 0) : 0);
  const g16 = new Float64Array(16);
  for (let k = 0, t = off; t < dur - 1; k++, t += stp) g16[k % 16] += lw[Math.min(dr.length, Math.round((t + 0.05) * s2))] - lw[Math.round(t * s2)];
  let k0 = 0;
  for (let k = 1; k < 16; k++) if (g16[k] > g16[k0]) k0 = k;
  const T = (off + k0 * stp) % bar;
  await st("READING CHORDS…", 0.55);
  const chrom = (x, n, h, f0, f1) => {
    const pc = [];
    for (let i = 0; i < n / 2; i++) {
      const f = i * s2 / n;
      pc.push(f >= f0 && f <= f1 ? ((Math.round(12 * Math.log2(f / 440)) + 9) % 12 + 12) % 12 : -1);
    }
    const o = [], ts = [];
    spec(x, n, h, (re, im, s) => {
      const c = new Float32Array(12);
      for (let i = 1; i < n / 2; i++) if (pc[i] >= 0) c[pc[i]] += Math.sqrt(Math.hypot(re[i], im[i]));
      o.push(c);
      ts.push((s + n / 2) / s2);
    });
    return [o, ts];
  };
  const [Ch, tc] = chrom(hm, 4096, 2048, 80, 2e3), [Cb, tb] = bsx ? chrom(bsx, 8192, 4096, 35, 250) : [[], []];
  const TQ = [[0, 4, 7], [0, 3, 7], [0, 4, 7, 10], [0, 4, 7, 11], [0, 3, 7, 10], [0, 2, 7], [0, 5, 7]], hbl = bl * 2, ns = Math.floor((dur - T) / hbl), tot = new Float64Array(12), segs = [], rms = [];
  for (let j = 0; j < ns; j++) {
    const a0 = T + j * hbl, b0 = a0 + hbl, mean = (C_, ts) => {
      const o = new Float64Array(12);
      let n = 0;
      for (let i = 0; i < ts.length; i++) if (ts[i] >= a0 && ts[i] < b0) {
        for (let k = 0; k < 12; k++) o[k] += C_[i][k];
        n++;
      }
      return o.map((v) => v / (n || 1));
    };
    let s = 0;
    const i0 = Math.floor(a0 * s2), i1 = Math.min(hm.length, Math.floor(b0 * s2));
    for (let i = i0; i < i1; i++) s += hm[i] * hm[i];
    rms.push(Math.sqrt(s / Math.max(1, i1 - i0)));
    segs.push([a0, mean(Ch, tc), mean(Cb, tb)]);
  }
  const thr = 0.08 * pct(rms, 0.95), ev = [];
  segs.forEach(([a0, c, bb], j) => {
    const nc = Math.hypot(...c);
    if (rms[j] < thr || !nc) {
      ev.push([a0, 0, -1]);
      return;
    }
    const mb = Math.max(...bb) + 1e-9;
    for (let k = 0; k < 12; k++) tot[k] += c[k] / nc + 0.5 * bb[k] / mb;
    let bs = -9, bq = [0, 0];
    for (let r = 0; r < 12; r++) TQ.forEach((q, qi) => {
      const t = new Float64Array(12);
      q.forEach((v) => t[(r + v) % 12] = 1);
      let s = 0;
      for (let k = 0; k < 12; k++) s += t[k] * c[k] / nc;
      s = s / Math.sqrt(q.length) + 0.3 * bb[r] / mb;
      if (s > bs) {
        bs = s;
        bq = [r, qi];
      }
    });
    ev.push([a0, bq[0], bq[1]]);
  });
  const chords = [];
  ev.forEach((e2) => {
    const l = chords[chords.length - 1];
    if (!l || l[1] !== e2[1] || l[2] !== e2[2]) chords.push([+e2[0].toFixed(3), e2[1], e2[2]]);
  });
  const MJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], MN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  let kb = [-9, 0, 0];
  [MJ, MN].forEach((p, m) => {
    for (let r = 0; r < 12; r++) {
      const s = pear(tot, Array.from({ length: 12 }, (_, k) => p[(k - r + 12) % 12]));
      if (s > kb[0]) kb = [s, r, m];
    }
  });
  await st("BUILDING STEMS…", 0.68);
  const env = {}, dots = {}, nE = Math.ceil(dur * 20), w20 = Math.round(s2 / 20), K = Math.floor((dur - T) / stp);
  mono.forEach((x, i) => {
    const e2 = Array.from({ length: nE }, (_, k) => {
      let m = 0;
      for (let j = k * w20; j < Math.min(x.length, (k + 1) * w20); j++) m = Math.max(m, Math.abs(x[j]));
      return m;
    }), q = pct(e2, 0.995) + 1e-9;
    env[nm[i]] = e2.map((v) => Math.round(Math.min(1, v / q) * 99));
    dots[nm[i]] = stepDots(x, s2, T, stp, dur);
  });
  await st("ESTIMATING NOTES…", 0.76);
  const notes = await estNotes(mono, nm, s2, dur, T, stp);
  await st("MEASURING LOUDNESS…", 0.94);
  return { bpm: +bpm.toFixed(2), T0: +T.toFixed(3), dur, key: [kb[1], kb[2]], names: nm, chords, env, dots, notes, ...loud(mL, mR, sr) };
}

async function imp(files) {
  files = [...files];
  if (!files.length || !ac) return;
  $("pl").disabled = $("im").disabled = true;
  load("PREPARING IMPORT…", 0.02);
  if (src) {
    try {
      src.stop();
    } catch (e) {
    }
    src = null;
  }
  ac.suspend();
  const raw = files.map((f) => f.name.replace(/\.[^.]+$/, ""));
  let p = 0;
  while (raw.length > 1 && raw[0][p] && raw.every((n) => n[p] === raw[0][p])) p++;
  const rk = (n) => /drum|perc/i.test(n) ? 1 : /bass|sub/i.test(n) ? 2 : /vo[cx]|sing/i.test(n) ? 0 : 3, items = files.map((f, i) => ({ f, n: (raw.length > 1 ? raw[i].slice(p).replace(/^[\s_\-.]+/, "") : raw[i]) || raw[i] })).sort((a, b) => rk(a.n) - rk(b.n) || a.n.localeCompare(b.n));
  try {
    const sr = ac.sampleRate, mono = [];
    let mL, mR, len = 0;
    for (let i = 0; i < items.length; i++) {
      load(`DECODING STEM ${i + 1}/${items.length}…`, 0.05 + 0.3 * i / items.length);
      await sleep();
      const b = await ac.decodeAudioData(await items[i].f.arrayBuffer()), c0 = b.getChannelData(0), c1 = b.numberOfChannels > 1 ? b.getChannelData(1) : c0;
      if (!mL) {
        len = b.length;
        mL = new Float32Array(len);
        mR = new Float32Array(len);
      }
      const n = Math.min(len, b.length), m = new Float32Array(len >> 1);
      for (let j = 0; j < n; j++) {
        mL[j] += c0[j];
        mR[j] += c1[j];
      }
      for (let j = 0; j < n >> 1; j++) m[j] = (c0[2 * j] + c0[2 * j + 1] + c1[2 * j] + c1[2 * j + 1]) / 4;
      mono.push(m);
    }
    let pk = 0;
    for (let j = 0; j < len; j++) pk = Math.max(pk, Math.abs(mL[j]), Math.abs(mR[j]));
    if (pk > 1) for (let j = 0; j < len; j++) {
      mL[j] /= pk;
      mR[j] /= pk;
    }
    const nb = ac.createBuffer(2, len, sr);
    nb.copyToChannel(mL, 0);
    nb.copyToChannel(mR, 1);
    const d = await analyse(mono, items.map((i) => i.n), mL, mR, sr, len);
    d.mono = mono;
    d.s2 = sr / 2;
    apply(d, nb, (raw.length > 1 ? raw[0].slice(0, p) : raw[0]).replace(/[_\-.\s]+$/, "").replace(/[_\-.]+/g, " ").trim().toUpperCase() || "UNTITLED TRACK");
  } catch (e) {
    unload();
    flash("IMPORT FAILED · TRY MP3 / WAV STEMS");
    $("im").disabled = false;
    if (buf) $("pl").disabled = false;
  }
}

async function estNotes(mono, nm, s2, dur, T, stp) {
  const out = [], n = 4096, fr = s2 / n, K = Math.floor((dur - T) / stp), w = Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n)), re = new Float64Array(n), im = new Float64Array(n);
  for (let si = 0; si < mono.length; si++) {
    if (/drum|perc|kick|snare|hat/i.test(nm[si])) continue;
    const x = mono[si], isB = /bass|sub/i.test(nm[si]), fl = isB ? 35 : 70, fh = isB ? 260 : 2e3, fs = [];
    let gm = 0;
    load("ESTIMATING NOTES · " + nm[si].toUpperCase() + "…", 0.76 + 0.17 * si / mono.length);
    await sleep();
    for (let k = 0; k < K; k++) {
      const s = Math.round((T + k * stp) * s2) - n / 2;
      if (s < 0 || s + n > x.length) {
        fs.push([0, []]);
        continue;
      }
      for (let i = 0; i < n; i++) {
        re[i] = x[s + i] * w[i];
        im[i] = 0;
      }
      fft(re, im);
      const m = new Float64Array(n / 2);
      let mx = 0;
      for (let i = 1; i < n / 2; i++) {
        m[i] = Math.hypot(re[i], im[i]);
        if (m[i] > mx) mx = m[i];
      }
      gm = Math.max(gm, mx);
      const pk = [];
      for (let i = Math.floor(fl / fr) + 1; i < Math.floor(fh / fr); i++) if (m[i] > m[i - 1] && m[i] >= m[i + 1] && m[i] > 0.2 * mx) {
        const a = Math.log(m[i - 1] + 1e-9), b = Math.log(m[i] + 1e-9), c = Math.log(m[i + 1] + 1e-9), d = 0.5 * (a - c) / (a - 2 * b + c);
        pk.push([Math.round(69 + 12 * Math.log2((i + d) * fr / 440)), m[i]]);
      }
      pk.sort((a, b) => b[1] - a[1]);
      let sel = [];
      if (isB) {
        if (pk.length) {
          const l = pk.filter((q) => q[1] >= 0.4 * pk[0][1]).sort((a, b) => a[0] - b[0])[0];
          sel = [l];
        }
      } else for (const q of pk) {
        if (sel.length >= 3) break;
        if (sel.some((z) => q[0] === z[0] || [12, 19, 24].includes(q[0] - z[0]))) continue;
        sel.push(q);
      }
      fs.push([mx, sel]);
    }
    const op = /* @__PURE__ */ new Map(), cl = (pt) => {
      const o = op.get(pt);
      op.delete(pt);
      if (o[1] > o[0]) out.push([+(T + o[0] * stp).toFixed(2), +(T + (o[1] + 1) * stp).toFixed(2), pt, si]);
    };
    fs.forEach(([mx, sel], k) => {
      const on = new Set(mx > 0.05 * gm ? sel.map((q) => q[0]) : []);
      on.forEach((pt) => {
        if (op.has(pt)) op.get(pt)[1] = k;
        else op.set(pt, [k, k]);
      });
      [...op.keys()].forEach((pt) => {
        if (k - op.get(pt)[1] > 1) cl(pt);
      });
    });
    [...op.keys()].forEach(cl);
  }
  return out.sort((a, b) => a[0] - b[0]);
}
