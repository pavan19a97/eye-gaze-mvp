import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OverlayCanvas } from './components/OverlayCanvas'
import { Calibration } from './components/Calibration'
import { TileGrid } from './components/TileGrid'
import { initWebGazer, WebGazerController } from './lib/tracker/webgazer'
import { EMA2D } from './lib/tracker/smoothing'
import { elementAtPoint, rectFromElement } from './lib/tracker/hittest'
import { loadCalibration, saveCalibration, applyAffine } from './lib/storage'


type Status = 'idle' | 'on' | 'off'

export default function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [showOverlay, setShowOverlay] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showCalib, setShowCalib] = useState(false)
  const [debugOpen, setDebugOpen] = useState(false)

  const [vw, setVw] = useState(window.innerWidth)
  const [vh, setVh] = useState(window.innerHeight)
  const [dpr, setDpr] = useState(window.devicePixelRatio || 1)

  const controllerRef = useRef<WebGazerController | null>(null)
  const ema = useMemo(() => new EMA2D(0.3), [])
  const [raw, setRaw] = useState<{x: number, y: number} | null>(null)
  const [gaze, setGaze] = useState<{x: number, y: number} | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [activeTile, setActiveTile] = useState<string | null>(null)   // <-- add this

  const calib = useRef(loadCalibration())

  // ring buffer of recent raw points for calibration sampling
  const recent = useRef<{x:number,y:number,t:number}[]>([])

  const onStart = useCallback(async () => {
    setStatus('idle')
    const ctrl = await initWebGazer()
    controllerRef.current = ctrl
    ctrl.setListener((pt) => {
      if (!pt) return
      setRaw({x: pt.x, y: pt.y})
      recent.current.push({x: pt.x, y: pt.y, t: performance.now()})
      // keep last 200
      if (recent.current.length > 200) recent.current.shift()

      const mapped = calib.current ? applyAffine(pt, calib.current) : pt
      const smooth = ema.next(mapped.x, mapped.y)
      setGaze(smooth)
    })
    await ctrl.start()
    setStatus('on')
  }, [ema])

  const onStop = useCallback(async () => {
    setStatus('idle')
    await controllerRef.current?.stop()
    controllerRef.current = null
    setStatus('off')
  }, [])

  // viewport changes
  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
      setDpr(window.devicePixelRatio || 1)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('fullscreenchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('fullscreenchange', onResize)
    }
  }, [])

  // hit testing
  useEffect(() => {
  if (!gaze) return
  const el = elementAtPoint(gaze.x, gaze.y)
  const rect = el ? rectFromElement(el) : null
  setTargetRect(rect)

  // climb ancestors to find a tile
  let cur: Element | null = el
  let found: string | null = null
  while (cur) {
    const d = (cur as HTMLElement).dataset
    if (d && d.tile) { found = d.tile; break }
    cur = cur.parentElement
  }
  setActiveTile(found)
}, [gaze])


  // Debug metrics: fps estimate
  const [fps, setFps] = useState(0)
  useEffect(() => {
    let last = performance.now()
    let frames = 0
    let raf = 0
    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last > 1000) {
        setFps(frames)
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="app">
      <div className="topbar">
        <span className={'status-dot status ' + (status === 'on' ? 'on' : status === 'off' ? 'off' : 'idle')} />
        <strong>Eye Gaze MVP</strong>
        <div style={{flex:1}} />
        {status !== 'on' ? (
          <button className="button" onClick={() => onStart()}>Start tracking</button>
        ) : (
          <button className="button secondary" onClick={() => onStop()}>Stop</button>
        )}
        <button className="button ghost" onClick={() => setShowCalib(true)}>Calibrate</button>
        <label className="small" style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={showOverlay} onChange={e=>setShowOverlay(e.target.checked)} />
          Overlay
        </label>
        <label className="small" style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)} />
          3×3 grid
        </label>
        <button className="button ghost" onClick={() => setDebugOpen(v=>!v)}>{debugOpen ? 'Hide' : 'Show'} debug</button>
      </div>

      <div className="content">
        <div>
          <TileGrid activeId={activeTile} />
        </div>
        <div className="sidebar">
          <div><strong>Status:</strong> {status}</div>
          <div><strong>Viewport:</strong> {vw}×{vh} @ DPR {dpr}</div>
          <div><strong>Gaze:</strong> {gaze ? `${gaze.x.toFixed(0)}, ${gaze.y.toFixed(0)}` : '—'}</div>
          <div className="small">Tip: Look at a tile—when it’s targeted by gaze, it animates to a gradient.</div>
          <div className="small">Use Calibrate for better alignment.</div>
        </div>
      </div>

      {showOverlay && (
        <OverlayCanvas gaze={gaze} showGrid={showGrid} targetRect={targetRect} />
      )}

      {showCalib && (
        <Calibration
          onClose={() => setShowCalib(false)}
          getRecent={(count) => recent.current.slice(-count)}
          onSave={(affine) => { calib.current = affine; saveCalibration(affine); }}
        />
      )}

      {debugOpen && (
        <div style={{position:'fixed', right:16, bottom:16, maxWidth:500}} className="debug">
{`Debug
------
- Start/Stop tracking, then open Calibrate.
- During calibration, click each dot while staring at it.
- This fits an affine correction (2×2 + bias) on top of WebGazer's predictions.
- Toggle 3×3 grid to evaluate coarse targeting.
`}
        </div>
      )}
    </div>
  )
}
