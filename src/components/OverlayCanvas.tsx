import React, { useMemo } from 'react'

export function OverlayCanvas({
  gaze,
  showGrid,
  targetRect
}: {
  gaze: {x:number,y:number} | null,
  showGrid: boolean,
  targetRect: DOMRect | null
}) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const grid = useMemo(() => {
    const thirdsX = [vw/3, 2*vw/3]
    const thirdsY = [vh/3, 2*vh/3]
    return {thirdsX, thirdsY}
  }, [vw, vh])

  return (
    <div className="overlay" aria-hidden>
      {showGrid && (
        <>
          {/* vertical lines */}
          <div className="grid-line" style={{left: grid.thirdsX[0], top:0, width:1, height:vh}} />
          <div className="grid-line" style={{left: grid.thirdsX[1], top:0, width:1, height:vh}} />
          {/* horizontal lines */}
          <div className="grid-line" style={{top: grid.thirdsY[0], left:0, height:1, width:vw}} />
          <div className="grid-line" style={{top: grid.thirdsY[1], left:0, height:1, width:vw}} />
        </>
      )}

      {targetRect && (
        <div className="highlight" style={{
          left: targetRect.left,
          top: targetRect.top,
          width: targetRect.width,
          height: targetRect.height
        }} />
      )}

      {gaze && (
        <div className="crosshair" style={{ left: gaze.x, top: gaze.y }} />
      )}
    </div>
  )
}
