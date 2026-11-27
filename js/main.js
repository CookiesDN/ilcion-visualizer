/**
 * App boot: audio engine + startup sequence.
 */

async function init() {
  load("PREPARING AUDIO ENGINE…", 0.15);
  await sleep();
  ac = new AudioContext();
  an = ac.createAnalyser();
  an.fftSize = 8192;
  an.smoothingTimeConstant = 0.55;
  anL = ac.createAnalyser();
  anR = ac.createAnalyser();
  anL.fftSize = anR.fftSize = 2048;
  const sp = ac.createChannelSplitter(2);
  gain = ac.createGain();
  rd = ac.createMediaStreamDestination();
  gain.connect(rd);
  gain.connect(an);
  gain.connect(sp);
  gain.connect(ac.destination);
  sp.connect(anL, 0);
  sp.connect(anR, 1);
  load("LOADING FONTS…", 0.5);
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
  load("BUILDING LAYOUT…", 0.8);
  await sleep();
  col();
  applyLayout();
  frame();
  load("READY", 1);
  await new Promise((r) => setTimeout(r, 600));
  unload();
  setTimeout(showMenu, 350);
}

init().catch((e) => {
  load("COULD NOT START · " + (e && e.message || ""));
});
