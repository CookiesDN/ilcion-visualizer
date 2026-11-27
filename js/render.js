/**
 * Render to video (MediaRecorder): options dialog, compositing the stage onto a canvas, recording, saving.
 */

let lastVid = null;
const RP = { res: "1080", cres: 1440, fps: "30", cfps: 48 };

try {
  Object.assign(RP, JSON.parse(localStorage.getItem("vizrender") || "{}"));
} catch (e) {
}

const pickMime = () => typeof MediaRecorder === "undefined" ? null : ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) || null;

const rOpts = () => {
  const [pw, ph] = AR[AR0], r = RP.res === "custom" ? +RP.cres : +RP.res, f = RP.fps === "custom" ? +RP.cfps : +RP.fps, res = r >= 256 ? Math.min(4096, Math.round(r / 2) * 2) : 0;
  return { res, h: res ? Math.max(2, Math.round(res * ph / pw / 2) * 2) : 0, fps: f >= 1 ? Math.min(240, Math.round(f)) : 0 };
};

const bitrate = (o) => Math.round(Math.max(6e6, Math.min(6e7, o.res * o.h * o.fps * 0.2)));

function rSum() {
  const o = rOpts(), mt = pickMime(), br = bitrate(o), d = buf ? buf.duration / rate : 0, warn = [];
  $("rcr").hidden = RP.res !== "custom";
  $("rcf").hidden = RP.fps !== "custom";
  if (o.fps > HZ * 1.15) warn.push(`Your display refreshes at about ${Math.round(HZ)} Hz, so frames above that are repeated.`);
  if (o.res >= 1920 && o.fps >= 60) warn.push("This size and frame rate is heavy; slower computers may drop frames.");
  if (!mt) warn.push("This browser cannot record video.");
  else if (!mt.includes("mp4")) warn.push("This browser cannot write MP4 directly, so the file will be saved as WebM.");
  $("rsum").innerHTML = `<div><i>RESOLUTION</i><b>${o.res ? o.res + " × " + o.h + " px · " + AR0 : "invalid"}</b></div><div><i>FRAME RATE</i><b>${o.fps ? o.fps + " fps" : "invalid"}</b></div><div><i>LENGTH</i><b>${fm(d)} · real time</b></div><div><i>EST. SIZE</i><b>≈ ${Math.round((br + 192e3) * d / 8e6)} MB</b></div>` + warn.map((w) => `<p>${w}</p>`).join("");
  $("rgo").disabled = !mt || !o.res || !o.fps;
  try {
    localStorage.setItem("vizrender", JSON.stringify(RP));
  } catch (e) {
  }
}

$("rres").onchange = () => {
  RP.res = $("rres").value;
  rSum();
};

$("rcr").oninput = () => {
  RP.cres = $("rcr").value;
  rSum();
};

$("rfps").onchange = () => {
  RP.fps = $("rfps").value;
  rSum();
};

$("rcf").oninput = () => {
  RP.cfps = $("rcf").value;
  rSum();
};

$("rno").onclick = () => $("rd").hidden = true;

$("rgo").onclick = () => {
  const o = rOpts();
  $("rd").hidden = true;
  render(o);
};

function openRender() {
  if (rec) {
    if (rec.state === "recording") rec.stop();
    return;
  }
  if (!buf) return;
  $("set").hidden = true;
  $("rres").value = RP.res;
  $("rcr").value = RP.cres;
  $("rfps").value = RP.fps;
  $("rcf").value = RP.cfps;
  rSum();
  $("rd").hidden = false;
}

function comp() {
  const sq = $("sq"), r0 = sq.getBoundingClientRect(), u = r0.width / 1e3, x = rcx, k = RW / 1e3, R = (e) => {
    const r = e.getBoundingClientRect();
    return [(r.left - r0.left) / u, (r.top - r0.top) / u, r.width / u, r.height / u];
  };
  x.setTransform(k, 0, 0, k, 0, 0);
  x.fillStyle = C.bg;
  x.fillRect(0, 0, 1e3, RH / k);
  [...sq.querySelectorAll(".p")].filter((e) => !e.classList.contains("off")).sort((a, b) => (+a.style.zIndex || 0) - (+b.style.zIndex || 0)).forEach((e) => {
    const [a, b, w, h] = R(e);
    rr(x, a + 3, b + 3, w - 6, h - 6, 19, C.pn);
    e.querySelectorAll("canvas").forEach((c) => {
      const [a2, b2, w2, h2] = R(c);
      if (c.parentElement.matches(".m2,.r3 .cv")) rr(x, a2, b2, w2, h2, 12, C.bg);
      x.drawImage(c, a2, b2, w2, h2);
    });
    x.textBaseline = "middle";
    e.querySelectorAll("h3,.hd b,.hd small,.k i,.k b").forEach((t) => {
      const [a3, b3, w3, h3] = R(t), cs = getComputedStyle(t);
      x.save();
      x.beginPath();
      x.rect(a3, b3, w3, h3);
      x.clip();
      x.font = cs.fontWeight + " " + cs.fontSize + " " + FF;
      x.fillStyle = cs.color;
      x.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      x.fillText(t.textContent, a3, b3 + h3 / 2);
      x.restore();
    });
  });
}

async function render(o) {
  if (rec || !buf) return;
  const mt = pickMime();
  if (!mt) {
    flash("NO VIDEO ENCODER AVAILABLE");
    return;
  }
  cancelRec = false;
  lastVid = null;
  $("ovs").textContent = "STOP & SAVE";
  $("ovc").textContent = "CANCEL";
  $("set").hidden = true;
  $("addm").hidden = true;
  document.body.classList.remove("edit");
  $("ed").textContent = "EDIT";
  RW = o.res;
  RH = o.h;
  rendering = true;
  document.body.classList.add("rendering");
  fit();
  rc = rc || document.createElement("canvas");
  rc.width = RW;
  rc.height = RH;
  rcx = rc.getContext("2d");
  const ms = new MediaStream([...rc.captureStream(o.fps).getVideoTracks(), ...rd.stream.getAudioTracks()]), parts = [];
  rec = new MediaRecorder(ms, { mimeType: mt, videoBitsPerSecond: bitrate(o), audioBitsPerSecond: 192e3 });
  rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
  rec.onstop = async () => {
    const ext = mt.includes("mp4") ? "mp4" : "webm", cancelled = cancelRec, blob = cancelled ? null : new Blob(parts, { type: mt.split(";")[0] }), name = ((titleStr || "visualizer").toLowerCase().replace(/[^a-z0-9]+/g, "_") || "visualizer") + "." + ext;
    parts.length = 0;
    rendering = false;
    document.body.classList.remove("rendering");
    rec = null;
    $("rn").textContent = "MP4";
    ac.suspend();
    fit();
    $("ov").hidden = true;
    if (cancelled) {
      flash("RENDER CANCELLED · NOTHING SAVED");
      return;
    }
    lastVid = { blob, name };
    const r = await saveFile(blob, name);
    if (r === "saved") {
      lastVid = null;
      flash(ext === "mp4" ? "SAVED AS MP4" : "SAVED AS WEBM · THIS BROWSER CANNOT WRITE MP4");
    } else {
      $("ovt").textContent = "VIDEO READY · NOT SAVED YET";
      $("ovs").textContent = "SAVE VIDEO";
      $("ovc").textContent = "DISMISS";
      $("ov").hidden = false;
    }
  };
  start(0);
  await ac.resume();
  rec.start(500);
  $("rn").textContent = "STOP";
  $("ov").hidden = false;
}

$("rn").onclick = openRender;

const endRec = (cancel) => {
  if (rec && rec.state === "recording") {
    cancelRec = cancel;
    rec.stop();
  }
};

$("ovs").onclick = async () => {
  if (lastVid && !rec) {
    const r = await saveFile(lastVid.blob, lastVid.name);
    if (r === "saved") {
      lastVid = null;
      $("ov").hidden = true;
      flash("SAVED");
    }
  } else endRec(false);
};

$("ovc").onclick = () => {
  if (lastVid && !rec) {
    lastVid = null;
    $("ov").hidden = true;
  } else endRec(true);
};
