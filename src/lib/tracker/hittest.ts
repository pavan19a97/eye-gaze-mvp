export function elementAtPoint(x: number, y: number): Element | null {
  // Ensure coordinates are in viewport space
  return document.elementFromPoint(x, y)
}

export function rectFromElement(el: Element): DOMRect {
  return (el as HTMLElement).getBoundingClientRect()
}
