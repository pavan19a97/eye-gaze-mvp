Eye Gaze MVP (Web, Browser-only)

A privacy-preserving eye-tracking demo that runs entirely in the browser. It detects gaze from your webcam, maps it to the page, and highlights large colored tiles with a smooth gradient when you look at them. Includes a 9-point calibration UI and DOM hit-testing.

✨ Features

Browser-only: all video stays on device

Live crosshair + optional 3×3 grid

DOM hit-testing (elementFromPoint) to know what you’re looking at

9-point calibration (affine correction, persisted locally)

Gaze-activated tiles: the tile under gaze animates to a gradient

🧰 Stack

Vite + React + TypeScript

WebGazer.js (CDN)

Plain CSS (no framework)

🚀 Quick Start
# install deps
npm i

# run dev server (http://localhost:5173)
npm run dev


Windows PowerShell note: if npm is blocked by execution policy, either use:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# or call the CMD shim:
npm.cmd i
npm.cmd run dev

🕹️ How to Use

Open the dev URL printed by Vite (e.g., http://localhost:5173).

Click Start tracking and allow camera access.

(Optional) Click Calibrate, stare at each dot, and click it—then Finish & Save.

Look at different tiles—the focused one animates to a gradient.

🔧 Scripts
npm run dev       # Start dev server
npm run build     # Type check + production build
npm run preview   # Preview built files

📁 Project Structure
src/
  App.tsx
  styles.css
  components/
    OverlayCanvas.tsx   # crosshair, grid, optional highlight
    Calibration.tsx     # 9-point calibration flow
    TileGrid.tsx        # large colored tiles (gaze-activated)
  lib/
    storage.ts          # save/load calibration (localStorage)
    tracker/
      webgazer.ts       # WebGazer wrapper (CDN loader)
      smoothing.ts      # EMA + affine fit utilities
      hittest.ts        # elementFromPoint + rect helpers

🔒 Privacy

All processing is local. The app never uploads video frames. Calibration parameters are stored in your browser (localStorage).

🧪 Tips for Better Results

Good, even lighting; avoid strong backlight.

Top-bezel webcam preferred; keep head relatively steady.

Re-calibrate after big window/monitor changes.

🩹 Common Issues

Blank page / opening file:///… → Use the dev server URL (http://localhost:5173).

npm.ps1 cannot be loaded → Use npm.cmd or Set-ExecutionPolicy -Scope Process Bypass.

@vitejs/plugin-react missing → npm i -D @vitejs/plugin-react.

Syntax error “lambda” → Ensure getRecent={(count) => ...} (arrow function), not lambda.

Store Node build (no npm) → Install LTS: winget install OpenJS.NodeJS.LTS.
