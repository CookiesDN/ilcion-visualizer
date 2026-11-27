/**
 * The per-frame render loop (requestAnimationFrame): reads analysers, updates meters, draws every visible panel.
 */

function frame(ts) {
  requestAnimationFrame(frame);
  if (ts) {
    if (lastT) {
      const dt = ts - lastT;
      DT = Math.min(0.05, dt / 1e3);
      if (dt > 2 && dt < 120) rafAvg = rafAvg ? rafAvg * 0.97 + dt * 0.03 : dt;
      HZ = 1e3 / (rafAvg || 16.7);
    }
    lastT = ts;
  }
  col();
  const ready = !!(D && buf), p = ready && src ? pos() : 0, run = ready && ac.state === "running" && src;
  RUN = !!run;
  if (run) {
    an.getFloatFrequencyData(F);
    an.getFloatTimeDomainData(Td);
    anL.getFloatTimeDomainData(Tl);
    anR.getFloatTimeDomainData(Tr);
    let a = 0, b = 0, t = 1e-20, l = 0, hh = 0;
    for (let i = 2; i < F.length; i++) {
      const f = i * ac.sampleRate / an.fftSize, pw = Math.pow(10, F[i] / 10);
      t += pw;
      if (f < 250) l += pw;
      else if (f > 4e3) hh += pw;
    }
    for (let j = 0; j < 2048; j++) {
      a += Tl[j] * Tl[j];
      b += Tr[j] * Tr[j];
    }
    lr = a / (a + b + 1e-12);
    lo = l / t;
    hi = hh / t;
    let bp = 0;
    const hz0 = ac.sampleRate / an.fftSize;
    for (let i = 1; i * hz0 < 150; i++) bp += Math.pow(10, F[i] / 10);
    BASS += (Math.max(0, Math.min(1, (10 * Math.log10(bp + 1e-12) + 55) / 40)) - BASS) * 0.35;
  }
  if (!run) BASS *= 0.92;
  if (!ready) {
    emptyDraw();
    $("pl").disabled = true;
    $("pl").textContent = "▶ PLAY";
    return;
  }
  if (VIS.mn) dMn(p);
  if (VIS.st) dSt(p);
  if (VIS.dg) dDg(p);
  if (VIS.dt) dDt(p);
  if (VIS.mt) {
    dLb(p);
    dSc();
    dSp();
    dVc();
  }
  if (VIS.wf) dWf(p);
  if (VIS.cs) dCs(p);
  if (VIS.bk) dBk(p);
  if (VIS.sx) dSp("sx", 72);
  if (VIS.vu) dVu();
  if (VIS.br) dAr();
  if (VIS.sg) dSg();
  if (VIS.sm) dStereo("sm");
  if (rec && rec.state === "recording") {
    comp();
    $("ovt").textContent = "RENDERING " + Math.round(p / buf.duration * 100) + "% · KEEP THIS TAB VISIBLE";
    if (p >= buf.duration - 0.05) rec.stop();
  }
  if ($("im").disabled === false) {
    $("pl").disabled = false;
    $("pl").textContent = run ? "❚❚ PAUSE" : "▶ PLAY";
  }
  $("tm").textContent = fm(p / rate) + " / " + fm(buf.duration / rate);
  $("lr").textContent = Math.round(lr * 100) + " · " + Math.round((1 - lr) * 100);
  $("lw").textContent = Math.round(lo * 100) + " %";
  $("hg").textContent = Math.round(hi * 100) + " %";
}
