import React, { useEffect, useMemo, useRef, useState } from 'react'
import { fitAffine, Affine2D } from '../lib/tracker/smoothing'

type Sample = { raw: {x:number,y:number}, target: {x:number,y:number} }

export function Calibration({
  onClose,
  getRecent,
  onSave
}: {
  onClose: () => void,
  getRecent: (count: number) => {x:number,y:number,t:number}[],
  onSave: (affine: Affine2D) => void
}) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const spots = useMemo(() => {
    // 9 positions (3x3) in percentages
    const px = [0.15, 0.5, 0.85]
    const py = [0.2, 0.5, 0.8]
    const arr: {x:number,y:number,id:string}[] = []
    for (const yi of py) for (const xi of px) {
      arr.push({ x: Math.round(vw*xi), y: Math.round(vh*yi), id: `${xi}-${yi}` })
    }
    return arr
  }, [vw, vh])

  const [samples, setSamples] = useState<Sample[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const captureCount = 20

  const handleClick = (id: string, tx: number, ty: number) => {
    setActive(id)
    // take the most recent predictions (last N), average them
    const recents = getRecent(captureCount)
    if (!recents.length) return
    const avgx = recents.reduce((s,r)=>s+r.x, 0)/recents.length
    const avgy = recents.reduce((s,r)=>s+r.y, 0)/recents.length
    setSamples(prev => [...prev, { raw: {x: avgx, y: avgy}, target: {x: tx, y: ty} }])
    setActive(null)
  }

  useEffect(() => {
    if (samples.length >= 5) {
      // allow finishing after >=5 points (more improves stability)
      setDone(true)
    }
  }, [samples.length])

  const onFinish = () => {
    const affine = fitAffine(samples.map(s => ({x:s.raw.x, y:s.raw.y})), samples.map(s => ({x:s.target.x, y:s.target.y})))
    onSave(affine)
    onClose()
  }

  return (
    <div className="calib-container">
      <div className="calib-grid">
        {spots.map((s, idx) => (
          <button key={s.id}
            className="calib-dot"
            title="Click while staring here"
            style={{ left: s.x, top: s.y, opacity: samples.find(p=>p.target.x===s.x && p.target.y===s.y) ? 0.35 : 1 }}
            onClick={() => handleClick(s.id, s.x, s.y)}
          />
        ))}
        <div style={{position:'absolute', left:16, bottom:16, right:16, display:'flex', alignItems:'center', gap:12}}>
          <button onClick={onFinish} disabled={!done} className="button">{done ? 'Finish & Save' : 'Click at least 5 dots'}</button>
          <button onClick={onClose} className="button ghost">Cancel</button>
          <div className="small">Tip: Keep your head steady. Click each dot while looking at it to collect samples. More dots ⇒ better fit.</div>
        </div>
      </div>
    </div>
  )
}
