import type { Affine2D } from './tracker/smoothing'

const KEY = 'eye-gaze-affine-v1'

export function saveCalibration(a: Affine2D) {
  localStorage.setItem(KEY, JSON.stringify(a))
}

export function loadCalibration(): Affine2D | null {
  const s = localStorage.getItem(KEY)
  if (!s) return null
  try { return JSON.parse(s) as Affine2D } catch { return null }
}

export function applyAffine(p: {x:number,y:number}, a: Affine2D) {
  return {
    x: a.a11 * p.x + a.a12 * p.y + a.b1,
    y: a.a21 * p.x + a.a22 * p.y + a.b2
  }
}
