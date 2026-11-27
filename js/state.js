/**
 * Shared application state. Every module reads and writes these globals.
 */

// Audio engine
let ac;
let buf;
let src;
let t0 = 0;
let rate = 1;
let gain;
let an;
let anL;
let anR;

// Analysis result for the loaded track
let D = null;
let ST;
let WC;
let PK = new Float32Array(1);

// Beat grid / time signature
let BEATS = 4;
let DEN = 4;
let UBL = 0.4;
let DT = 0.016;
let BL;
let BAR;
let STEP;
let T0;
let TB;

// Live analyser data (refreshed every frame)
let F = new Float32Array(4096).fill(-120);
let Td = new Float32Array(8192);
let Tl = new Float32Array(2048);
let Tr = new Float32Array(2048);
let lr = 0.5;
let lo = 0;
let hi = 0;
let BASS = 0;
let RUN = false;
let CORR = 0;
let SMODE = 4;

// Video render
let rec = null;
let cancelRec = false;
let PR = [36, 84];
let RW = 1080;
let RH = 1080;
let rendering = false;
let HZ = 60;
let rafAvg = 0;
let lastT = 0;
let rc;
let rcx;
let rd;

// Misc
let midi = null;
let titleStr = "";
let ft;
let FF = "ui-monospace,Menlo,Consolas,monospace";
let NS = 1;
let DS = 1;
let S = 1;
let HO = null;
const C = {};

// Stage layout + viewport
let AR0 = "1:1";
let LAY = {};
let ZI = 10;
let zm = 1;
let px = 0;
let py = 0;
let Z = 1;
let zt;
let fz;
let VIS = {};
