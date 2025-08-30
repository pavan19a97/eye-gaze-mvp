import React from 'react'

function lighten(hex: string, amt: number) {
  // hex like #RRGGBB, amt in [-1,1]
  const n = hex.startsWith('#') ? hex.slice(1) : hex
  const num = parseInt(n, 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255*amt)))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255*amt)))
  const b = Math.min(255, Math.max(0, ((num) & 0xff) + Math.round(255*amt)))
  return `rgb(${r}, ${g}, ${b})`
}

export type TileSpec = { id: string, color: string, label?: string }

export function TileGrid({ activeId }: { activeId: string | null }) {
  const tiles: TileSpec[] = [
    { id: 't1', color: '#FCA5A5', label: 'Red' },
    { id: 't2', color: '#FDE68A', label: 'Yellow' },
    { id: 't3', color: '#86EFAC', label: 'Green' },
    { id: 't4', color: '#93C5FD', label: 'Blue' },
    { id: 't5', color: '#C4B5FD', label: 'Indigo' },
    { id: 't6', color: '#F9A8D4', label: 'Pink' },
    { id: 't7', color: '#FDBA74', label: 'Orange' },
    { id: 't8', color: '#A7F3D0', label: 'Teal' },
    { id: 't9', color: '#BFDBFE', label: 'Sky' },
    { id: 't10', color: '#DDD6FE', label: 'Violet' },
    { id: 't11', color: '#FBCFE8', label: 'Rose' },
    { id: 't12', color: '#BBF7D0', label: 'Lime' },
  ]

  return (
    <div className="tile-grid">
      {tiles.map(t => {
        const c1 = t.color
        const c2 = lighten(t.color, 0.15)
        return (
          <div
            key={t.id}
            data-tile={t.id}
            className={'tile ' + (activeId === t.id ? 'active' : '')}
            style={{ ['--c1' as any]: c1, ['--c2' as any]: c2 }}
          >
            <div className="label">{t.label ?? t.id}</div>
          </div>
        )
      })}
    </div>
  )
}
