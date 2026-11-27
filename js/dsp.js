/**
 * Signal-processing primitives used by the stem analysis: FFT, STFT, loudness (LUFS) and the 1/16 step "dots".
 */

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let l = 2; l <= n; l <<= 1) {
    const a = -2 * Math.PI / l, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += l) {
      let cr = 1, ci = 0;
      for (let k = 0; k < l / 2; k++) {
        const u = i + k, v = u + l / 2, tr = re[v] * cr - im[v] * ci, ti = re[v] * ci + im[v] * cr;
        re[v] = re[u] - tr;
        im[v] = im[u] - ti;
        re[u] += tr;
        im[u] += ti;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

function spec(x, n, h, cb) {
  const re = new Float64Array(n), im = new Float64Array(n), w = Float64Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n));
  for (let s = 0; s + n <= x.length; s += h) {
    for (let i = 0; i < n; i++) {
      re[i] = x[s + i] * w[i];
      im[i] = 0;
    }
    fft(re, im);
    cb(re, im, s);
  }
}

const sum = (a) => {
  const L = Math.min(...a.map((s) => s.length)), o = new Float32Array(L);
  a.forEach((s) => {
    for (let i = 0; i < L; i++) o[i] += s[i];
  });
  return o;
};

const pct = (a, q) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(q * (s.length - 1))];
};

function loud(mL, mR, fs) {
  const blk = Math.round(fs / 10), nb = Math.floor(mL.length / blk);
  const sh = (fc, G, Q) => {
    const A = 10 ** (G / 40), w = 2 * Math.PI * fc / fs, al = Math.sin(w) / (2 * Q), c = Math.cos(w), sa = 2 * Math.sqrt(A) * al;
    return [[A * (A + 1 + (A - 1) * c + sa), -2 * A * (A - 1 + (A + 1) * c), A * (A + 1 + (A - 1) * c - sa)], [A + 1 - (A - 1) * c + sa, 2 * (A - 1 - (A + 1) * c), A + 1 - (A - 1) * c - sa]];
  };
  const hp = (fc, Q) => {
    const w = 2 * Math.PI * fc / fs, al = Math.sin(w) / (2 * Q), c = Math.cos(w);
    return [[(1 + c) / 2, -(1 + c), (1 + c) / 2], [1 + al, -2 * c, 1 - al]];
  }, nz = ([b, a]) => [b.map((v) => v / a[0]), a.map((v) => v / a[0])];
  const [[b1, a1], [b2, a2]] = [nz(sh(1681.974450955532, 3.999843853973347, 0.7071752369554196)), nz(hp(38.13547087613982, 0.5003270373253953))], E = [new Float64Array(nb), new Float64Array(nb)], pb = new Float64Array(nb);
  [mL, mR].forEach((x, c) => {
    let u1 = 0, u2 = 0, v1 = 0, v2 = 0;
    for (let k = 0; k < nb; k++) {
      let s = 0, m = 0;
      for (let i = k * blk; i < (k + 1) * blk; i++) {
        const v = x[i], y = b1[0] * v + u1;
        u1 = b1[1] * v - a1[1] * y + u2;
        u2 = b1[2] * v - a1[2] * y;
        const z = b2[0] * y + v1;
        v1 = b2[1] * y - a2[1] * z + v2;
        v2 = b2[2] * y - a2[2] * z;
        s += z * z;
        m = Math.max(m, Math.abs(v));
      }
      E[c][k] = s;
      pb[k] = Math.max(pb[k], m);
    }
  });
  const Lm = [], Li = [], Pk = [], pw = [];
  let mp = 0;
  for (let k = 0; k < nb; k++) {
    let s = 0;
    for (let j = Math.max(0, k - 4); j < k; j++) s += E[0][j] + E[1][j];
    const l = k ? -0.691 + 10 * Math.log10(s / (Math.min(k, 4) * blk) + 1e-12) : -90;
    Lm.push(l);
    pw.push(10 ** ((l + 0.691) / 10));
    let a = 0, n = 0;
    for (let j = 0; j <= k; j++) if (Lm[j] > -70) {
      a += pw[j];
      n++;
    }
    let li = -90;
    if (n) {
      const gt = -0.691 + 10 * Math.log10(a / n) - 10;
      let a22 = 0, n2 = 0;
      for (let j = 0; j <= k; j++) if (Lm[j] > -70 && Lm[j] > gt) {
        a22 += pw[j];
        n2++;
      }
      if (n2) li = -0.691 + 10 * Math.log10(a22 / n2);
    }
    Li.push(li);
    mp = Math.max(mp, pb[k]);
    Pk.push(20 * Math.log10(mp + 1e-9));
  }
  const r = (a) => a.map((v) => +v.toFixed(1));
  return { lufs: r(Lm), ilufs: r(Li), pk: r(Pk) };
}

function stepDots(x, s2, T, stp, dur) {
  const K = Math.floor((dur - T) / stp), r = Array.from({ length: K }, (_, k) => {
    let s = 0;
    const i0 = Math.floor((T + k * stp) * s2), i1 = Math.floor((T + (k + 1) * stp) * s2);
    for (let j = i0; j < i1 && j < x.length; j++) s += x[j] * x[j];
    return Math.sqrt(s / Math.max(1, i1 - i0));
  }), q = pct(r, 0.98) + 1e-9;
  return r.map((v) => Math.floor(Math.min(1, v / q) * 9)).join("");
}
