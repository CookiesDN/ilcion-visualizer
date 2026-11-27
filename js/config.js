/**
 * Static configuration: music-theory names, grid sizes, default layouts, palettes and fonts.
 * No logic lives here - tweak the values and reload.
 */

// Musical note names, Roman-numeral degrees and chord qualities
const NN = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
const DEG = ["I", "♭II", "II", "♭III", "III", "IV", "♯IV", "V", "♭VI", "VI", "♭VII", "VII"];
const QS = ["", "m", "7", "maj7", "m7", "sus2", "sus4", "dim"];

// Chord templates (semitone offsets) and key-profile weights
const TI = [[0, 4, 7], [0, 3, 7], [0, 4, 7, 10], [0, 4, 7, 11], [0, 3, 7, 10], [0, 2, 7], [0, 5, 7], [0, 3, 6]];
const KMJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KMN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

// Stage geometry and track colours (colour slots from the palette)
const LW = 84;
const SC = [["fg", 1], ["bl", 1], ["pu", 1], ["fg", 0.55], ["pu", 0.6], ["bl", 0.6]];

// Aspect ratios and default 48-column layouts: [col, row, width, height]
const AR = { "16:9": [16, 9], "9:16": [9, 16], "1:1": [1, 1], "4:3": [4, 3], "3:4": [3, 4] };

const DEF = {
  "1:1": { hd: [0, 0, 48, 3], mn: [0, 3, 19, 18], st: [19, 3, 29, 18], dg: [0, 21, 48, 11], mt: [0, 32, 24, 16], dt: [24, 32, 24, 16] },
  "16:9": { hd: [0, 0, 48, 3], mn: [0, 3, 13, 13], st: [13, 3, 21, 13], mt: [34, 3, 14, 13], dg: [0, 16, 34, 11], dt: [34, 16, 14, 11] },
  "4:3": { hd: [0, 0, 48, 3], mn: [0, 3, 18, 14], st: [18, 3, 30, 14], dg: [0, 17, 48, 9], mt: [0, 26, 24, 10], dt: [24, 26, 24, 10] },
  "3:4": { hd: [0, 0, 48, 3], mn: [0, 3, 26, 20], st: [26, 3, 22, 20], dg: [0, 23, 48, 14], mt: [0, 37, 48, 14], dt: [0, 51, 48, 13] },
  "9:16": { hd: [0, 0, 48, 3], mn: [0, 3, 48, 22], st: [0, 25, 48, 20], dg: [0, 45, 48, 16], mt: [0, 61, 48, 14], dt: [0, 75, 48, 10] }
};

const NEWSZ = { sm: [16, 14], vu: [20, 10], br: [18, 18], sg: [30, 10], wf: [24, 6], cs: [48, 6], bk: [16, 8], sx: [18, 10], dt: [24, 12], mn: [16, 14], st: [24, 14], dg: [32, 10], mt: [20, 12] };

// Colour presets and font choices
const PRE = { Original: ["#212121", "#171717", "#313131", "#eeeeee", "#7a5dc3", "#1b00ff"], Pink: ["#f6e3ec", "#fbeef3", "#ecd3df", "#2a1a24", "#ff3d9a", "#1fbfa8"], Mono: ["#0b0b0b", "#000000", "#1c1c1c", "#f2f2f2", "#8a8a8a", "#ffffff"], Neon: ["#0d0221", "#1a0b2e", "#2a1647", "#f0e6ff", "#ff2a6d", "#05d9e8"] };
const KEYS = ["bg", "pn", "mt", "fg", "pu", "bl"];
const FONTS = [["System mono", "ui-monospace,Menlo,Consolas,monospace"], ["System sans", "system-ui,Arial,sans-serif"], ["System serif", "Georgia,serif"], ["JetBrains Mono", '"JetBrains Mono",monospace', "JetBrains+Mono"], ["Space Mono", '"Space Mono",monospace', "Space+Mono"], ["IBM Plex Mono", '"IBM Plex Mono",monospace', "IBM+Plex+Mono"], ["Inter", "Inter,sans-serif", "Inter"], ["Space Grotesk", '"Space Grotesk",sans-serif', "Space+Grotesk"], ["Orbitron", "Orbitron,sans-serif", "Orbitron"], ["Rajdhani", "Rajdhani,sans-serif", "Rajdhani"], ["Playfair Display", '"Playfair Display",serif', "Playfair+Display"]];
