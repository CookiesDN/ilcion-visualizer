# ILCION VISUALIZER

**Stems · MIDI · chords · video.** A browser-based music visualizer. Drop in your stems (and optionally a MIDI file), and it detects the tempo, key and chords, then draws live, customizable visuals you can arrange, restyle and render to video.

> I made this because I wanted other producers who want to post their own track to have a great visual. Something that looks polished, shows off what is actually in the music, and doesn't require a video editor or a pile of plugins to put together.

Everything runs locally in your browser. Your audio never leaves your device.

**Made by ilcion** · [Support me ♥](https://cookiesdn.mystrikingly.com/)

---

## Quick start

1. Open `index.html` in a modern browser (Chrome, Edge, Safari or Firefox).
2. Press **PLAY** on the main menu, then choose your stem files (or drag and drop them onto the page).
3. *(Optional)* Press **MIDI** to import a `.mid` file with your chords, bass or other parts for exact notes and chords.
4. Arrange the visuals, pick your colors and font, then press **MP4** to render the video.

No build step and no install. It is a static page, so it also works on any static host (see [Deploying](#deploying-it-as-a-website)).

---

## Features

### Import and analysis
- **Stems:** import any number of audio stems (MP3, WAV, FLAC, OGG, M4A). Stem names are read from the file names and used as the track title.
- **Automatic detection:** tempo (BPM), downbeat, key, chords, loudness (LUFS) and an estimate of the notes played in each stem.
- **MIDI import:** drop in one or more `.mid` files (chords, bass, melody) for exact notes and chords. The key is re-detected from the MIDI, and the time signature is read from the file when it has one. A chord offset control lines the MIDI up with the audio.
- **Drag and drop** for both audio and MIDI files.

### Tempo and time signature
- **BPM correction (audio unchanged):** fix a misread tempo with ÷2, ×2 or a custom BPM (for example 160 → 80). Only the grid changes, not the sound. Nudge bar 1 by a beat or a 1/16 step if the bars feel off.
- **Time signature:** 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8 or a custom signature. The metronome, bar counter and note grid all follow it.
- **Playback speed and pitch:** a separate control that intentionally changes the speed of the track, and its pitch with it (÷2, ×2 or a custom target BPM). The pitch shift is shown in semitones.

### Visual modules
| Module | What it shows |
|---|---|
| **Fifths + silent metronome** | Circle of fifths with the current chord shape, the notes sounding right now, notes used in the bar, and a silent beat counter |
| **Stems** | A waveform per stem plus square level meters |
| **Notes** | Piano roll with a chord ribbon, bar numbers, a drum row and a live "sounding" readout |
| **Dots** | A 1/16-note grid per stem, with stereo balance and low/high share |
| **Meters** | Momentary, integrated and peak loudness, oscilloscope, spectrum and stereometer |
| **Waveform** | Whole-track waveform, click to seek |
| **Chord strip** | Previous, current and upcoming chords as roman-numeral degrees |
| **BPM · Key · Bar** | Large readout of the key numbers |
| **Big spectrum** | Spectrum analyzer with a peak readout (level, frequency, note and cents) |
| **Stereometer** | Five modes: Scaled/Linear × Unipolar/Bipolar, and Lissajous, plus a correlation meter |
| **VU meter** | Left and right analog-style needles with ballistics |
| **Spectrogram** | Scrolling frequency-over-time view |
| **Bass-reactive visual** | Reacts only to the low end, and the lower and louder the bass, the faster it moves. Six styles: Rings & Spokes, Pulse Orb, Tunnel, Low-End Bars, Starfield Warp, Ribbons |

### Layout
- **Your page, your layout:** drag modules to move them, drag the corner to resize, remove the ones you don't want, and add more from **+ VISUAL**. Dragging is smooth, with a snap preview.
- **Aspect ratios:** 16:9, 9:16, 1:1, 4:3 and 3:4, with a morphing animation when you switch. The layout is remembered separately for each ratio.
- **Zoom and pan like a PDF:** Ctrl/Cmd + scroll or pinch to zoom, scroll or drag to pan, **FIT** to reset.
- **Scroll speed:** independent sliders for how fast the notes and the dots scroll.

### Look and feel
- **Fonts:** system fonts, a selection of Google fonts, or upload your own font file.
- **Color palettes:** six editable colors with presets. Save your own palettes, import them from a file or by pasting hex codes, and export them to share.
- **Editable title:** double-click the title in the top-left to rename it.

### Render to video
- Output **MP4** (or WebM where the browser can't write MP4) with your audio.
- **Resolution:** 1080, 1920 or a custom width. The height follows the aspect ratio you chose.
- **Frame rate:** 24, 30, 60, 120 or custom.
- A **confirmation window** shows the resolution, frame rate, length and estimated size before anything starts, and warns about heavy settings.
- **Stop & Save** ends early and keeps what was recorded. **Cancel** throws it away so you can keep editing.

---

## Controls

| Action | How |
|---|---|
| Play / pause | `Space` or the PLAY button |
| Seek | Click the stems or waveform |
| Zoom in / out / reset | `+` / `-` / `0`, or Ctrl/Cmd + scroll |
| Rename the track | Double-click the title |
| Cycle stereometer or bass-reactive style | Click the visual (outside edit mode) |
| Reset a scroll-speed slider | Double-click it |
| Close a panel or dialog | `Esc` |

---

## Tips

- Use stems named like `drums`, `bass`, `vocals`, `piano` so each one is recognised and labelled.
- If the bar counter feels off, correct the BPM first, then nudge bar 1 with the grid buttons.
- For the cleanest chords and notes, import a MIDI file as well. Audio-only note detection is an estimate.
- Rendering runs in real time, so a 3-minute track takes about 3 minutes. Keep the tab visible while it records.

## Browser support and limitations

- Tested in Chromium-based browsers. MP4 recording needs a browser that supports it (Chrome and Edge 126+, Safari). Others save a WebM file instead.
- Frame rates above your screen's refresh rate (for example 120 fps on a 60 Hz screen) repeat frames.
- Estimated notes from audio are a rough guide and can be off by an octave or pick up stray notes. MIDI is exact.
- The time signature is read automatically only from MIDI. Otherwise set it by hand.
- Changing playback speed also changes pitch (like a record), and the notes shown stay at the original pitch.
- Settings (colors, font, layout, scroll speed, render options) are saved in your browser's local storage.

## Deploying it as a website

The visualizer is a static page, so any static host works:

- **Netlify Drop:** drag the folder onto app.netlify.com/drop.
- **GitHub Pages:** push the files to a repo, then Settings → Pages → deploy from branch.
- **Cloudflare Pages / Vercel:** connect the repo or upload the folder.

Serve it over HTTPS (all of the above do).

## Support

If this helped your release look better, you can [support me ♥](https://cookiesdn.mystrikingly.com/).

---

## Project layout

```
index.html            page markup (panels, toolbar, dialogs) + script/stylesheet includes
css/
  base.css            colour tokens, reset, buttons
  stage.css           viewport, 1000px stage, panels, edit-mode handles
  widgets.css         header bar, meters grid, readouts
  toolbar.css         bottom toolbar, "+ VISUAL" picker
  settings.css        settings panel
  dialogs.css         render-to-video dialog + recording overlay
  screens.css         loading screen, main menu
  tempo.css           tempo panel
js/
  config.js           constants: note names, grid sizes, default layouts, palettes, fonts
  texts.js            user-facing labels and hints
  state.js            shared global state
  utils.js            DOM / canvas / formatting / file-saving helpers
  dsp.js              FFT, loudness (LUFS), step dots
  analysis.js         stem analysis (tempo, downbeat, chords, key, notes) + stem import
  midi.js             MIDI parser + chord analysis
  player.js           playback, keyboard + drag-and-drop
  settings.js         font + colour settings
  palettes.js         saved / imported / exported palettes
  ui.js               loading overlay, toasts, Escape handling
  title.js            editable track title
  menu.js             main menu
  viewport.js         canvas sizing, zoom and pan
  layout.js           48-column layout engine + aspect-ratio morph
  edit-mode.js        drag / resize / remove panels
  tempo.js            BPM correction, time signature, playback + scroll speed
  visuals/            one file per visual (fifths, stems, notes, dots, meters, spectrum,
                      stereometer, vu, bass, spectrogram, extras)
  frame.js            per-frame render loop
  render.js           render to MP4/WebM
  main.js             startup
```

## Notes for contributors

- The scripts are plain classic `<script>` tags that **share one global scope**, so the order in `index.html` matters (config → state → utils → … → main). To add a visual: create `js/visuals/yours.js` with a `dYours(p)` draw function, add a panel `<div class="p off" id="w_yours">` in `index.html`, register it in `WT` (`texts.js`), `NEWSZ` (`config.js`) and call it from `frame.js`.
- Colours come from the CSS variables in `base.css`; the settings panel overrides them at runtime.
- Labels and empty-state hints live in `js/texts.js`; layouts, palettes and fonts in `js/config.js`.