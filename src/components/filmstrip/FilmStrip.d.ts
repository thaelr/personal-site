export class FilmStrip {
  constructor(strip: HTMLElement, sources: readonly string[])
  readonly canvas: HTMLCanvasElement
  readonly ready?: Promise<void>
  readonly works: boolean
  readonly loop: number
  resize(): void
  render(view: { reveal: number; offset: number }): void
  dispose(): void
}
