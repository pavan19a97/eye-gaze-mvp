export class EMA2D {
  private alpha: number
  private sx: number | null = null
  private sy: number | null = null

  constructor(alpha = 0.3) {
    this.alpha = alpha
  }

  next(x: number, y: number) {
    if (this.sx == null || this.sy == null) {
      this.sx = x; this.sy = y
    } else {
      this.sx = this.alpha * x + (1 - this.alpha) * this.sx
      this.sy = this.alpha * y + (1 - this.alpha) * this.sy
    }
    return { x: this.sx, y: this.sy }
  }

  reset() { this.sx = this.sy = null }
}

// ------- Affine fitting (2D) and application -------

export type Affine2D = {
  // x' = a11*x + a12*y + b1
  // y' = a21*x + a22*y + b2
  a11: number, a12: number, b1: number,
  a21: number, a22: number, b2: number
}

type Pt = {x:number,y:number}

export function fitAffine(src: Pt[], dst: Pt[]): Affine2D {
  if (src.length !== dst.length || src.length < 3) {
    // Not enough data; return identity
    return { a11:1, a12:0, b1:0, a21:0, a22:1, b2:0 }
  }

  // Solve for [a11, a12, b1] in X * A = x' and similarly for y'
  // X is N x 3 with columns [x, y, 1]
  let s_xx=0, s_xy=0, s_x1=0, s_yy=0, s_y1=0, s_11=0
  let s_xp=0, s_yp=0, s_xq=0, s_yq=0 // for right-hand side
  for (let i=0;i<src.length;i++){
    const x = src[i].x, y = src[i].y, xp = dst[i].x, yp = dst[i].y
    s_xx += x*x; s_xy += x*y; s_x1 += x
    s_yy += y*y; s_y1 += y
    s_11 += 1
    s_xp += x*xp; s_yp += y*xp; s_xq += x*yp; s_yq += y*yp
  }

  // Build normal matrix M and RHS vectors vx (for x') and vy (for y')
  // M = [[s_xx, s_xy, s_x1],
  //      [s_xy, s_yy, s_y1],
  //      [s_x1, s_y1, s_11]]
  const M = [
    [s_xx, s_xy, s_x1],
    [s_xy, s_yy, s_y1],
    [s_x1, s_y1, s_11]
  ]
  const vx = [s_xp, s_yp, dst.reduce((s,p)=>s+p.x,0)]
  const vy = [s_xq, s_yq, dst.reduce((s,p)=>s+p.y,0)]

  function solve3x3(A:number[][], b:number[]) {
    // Gaussian elimination (no pivoting for brevity)
    const m = A.map(row => row.slice()); const v = b.slice()
    for (let i=0;i<3;i++){
      let pivot = m[i][i]
      if (Math.abs(pivot) < 1e-8) return null
      for (let j=i;j<3;j++) m[i][j] /= pivot
      v[i] /= pivot
      for (let k=0;k<3;k++){
        if (k===i) continue
        const f = m[k][i]
        for (let j=i;j<3;j++) m[k][j] -= f * m[i][j]
        v[k] -= f * v[i]
      }
    }
    return v // solution
  }

  const solx = solve3x3(M, vx)
  const soly = solve3x3(M, vy)

  if (!solx || !soly) {
    return { a11:1, a12:0, b1:0, a21:0, a22:1, b2:0 }
  }

  return {
    a11: solx[0], a12: solx[1], b1: solx[2],
    a21: soly[0], a22: soly[1], b2: soly[2]
  }
}
