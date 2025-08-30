// Lightweight wrapper around WebGazer global script loaded from CDN.
export type GazePoint = { x: number, y: number, timestamp?: number }
export type Listener = (pt: GazePoint | null) => void

export type WebGazerController = {
  start: () => Promise<void>,
  stop: () => Promise<void>,
  setListener: (cb: Listener) => void
}

declare global {
  interface Window { webgazer: any }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = (e) => reject(e)
    document.head.appendChild(s)
  })
}

export async function initWebGazer(): Promise<WebGazerController> {
  if (!window.webgazer) {
    // Lock a specific version to reduce surprises
    await loadScript('https://cdn.jsdelivr.net/npm/webgazer@2.1.0/dist/webgazer.js')
  }
  const wg = window.webgazer

  let listener: Listener = () => {}
  wg.setGazeListener((data: any, timestamp: number) => {
    if (!data) { listener(null); return }
    listener({ x: data.x, y: data.y, timestamp })
  })

  // hide built-in debug UIs
  try {
    wg.showVideoPreview(false).showFaceOverlay(false).showFaceFeedbackBox(false)
  } catch {}

  return {
    async start() {
      await wg.begin()
      // improve FPS/accuracy tradeoff if available
      try { wg.params.showVideo = false } catch {}
    },
    async stop() {
      await wg.end() // fully stop
    },
    setListener(cb: Listener) { listener = cb }
  }
}
