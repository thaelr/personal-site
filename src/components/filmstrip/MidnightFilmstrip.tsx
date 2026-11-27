import { useEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { MidnightImageStack } from "../MidnightImageStack"
import { FilmStrip } from "./FilmStrip.js"
import "./MidnightFilmstrip.css"

const images = import.meta.glob<string>("../../assets/midnight-filmstrip/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
})
const sources = Object.keys(images).sort().map((path) => images[path])

// Timing from Codrops Filmstrip 04. Shader settings live in FilmStrip.js.
const settings = {
  speed: 50,
  spinUp: 4,
  openDuration: 1400,
  closeDuration: 500,
  reopenDuration: 500,
  hoverLeaveDelay: 100,
  fallbackRepeats: 4,
}

const progressAt = (elapsed: number, duration: number) => Math.min(1, Math.max(0, elapsed / duration))
const powerOut = (value: number) => 1 - (1 - value) ** 3
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress

export function MidnightFilmstrip({ before, children, enabled }: {
  before: ReactNode
  children: string
  enabled: boolean
}) {
  const lastWordStart = children.lastIndexOf(" ") + 1
  const trigger = useRef<HTMLParagraphElement>(null)
  const anchor = useRef<HTMLSpanElement>(null)
  const band = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLSpanElement>(null)
  const controller = useRef<((open: boolean) => void) | null>(null)
  const leaveTimer = useRef<number | undefined>(undefined)
  const touchPress = useRef(false)
  const [opened, setOpened] = useState(false)
  const [mounted, setMounted] = useState(false)
  const chapter = enabled && mounted ? trigger.current?.closest("#generative-media") : null

  const show = () => {
    window.clearTimeout(leaveTimer.current)
    if (!enabled) return
    setMounted(true)
    setOpened(true)
  }
  const hide = () => {
    window.clearTimeout(leaveTimer.current)
    setOpened(false)
  }

  useEffect(() => {
    if (!enabled) {
      window.clearTimeout(leaveTimer.current)
      setOpened(false)
      setMounted(false)
    }
    return () => window.clearTimeout(leaveTimer.current)
  }, [enabled])

  useEffect(() => {
    if (!opened || !enabled) return
    const dismissOutside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node)) hide()
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide()
    }
    document.addEventListener("pointerdown", dismissOutside)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", dismissOutside)
      document.removeEventListener("keydown", escape)
    }
  }, [opened, enabled])

  useEffect(() => {
    const term = trigger.current
    const phrase = anchor.current
    const strip = band.current
    const frames = track.current
    if (!chapter || !term || !phrase || !strip || !frames) return

    const film = new FilmStrip(strip, sources)
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const view = { reveal: 0, offset: 0 }
    let visible = false
    let open = false
    let speed = settings.spinUp
    let frame = 0
    let disposed = false
    let loop = 1

    const draw = () => {
      const webgl = film.works
      film.canvas.hidden = !webgl
      frames.hidden = webgl
      if (webgl) {
        film.render(view)
      } else {
        frames.style.transform = `translateX(${-view.offset}px)`
        const inset = (1 - view.reveal) * 50
        frames.style.clipPath = `inset(${inset}% 0)`
      }
    }

    const resize = () => {
      const word = phrase.getBoundingClientRect()
      const section = chapter.getBoundingClientRect()
      strip.style.left = `${-section.left}px`
      strip.style.width = `${document.documentElement.clientWidth}px`
      strip.style.top = `${word.top - section.top + (word.height - strip.offsetHeight) / 2}px`
      if (film.works) {
        film.resize()
        loop = film.loop
      } else {
        loop = (strip.getBoundingClientRect().height + 15) * sources.length
      }
      if (visible) draw()
    }

    const transition = (nextOpen: boolean, preferenceChanged = false) => {
      if (nextOpen === open && !preferenceChanged) return
      cancelAnimationFrame(frame)
      open = nextOpen
      const reopening = open && visible
      if (open && !visible) {
        visible = true
        strip.style.visibility = "visible"
        speed = settings.spinUp
        resize()
      }

      const finish = () => {
        visible = false
        strip.style.visibility = "hidden"
        view.reveal = view.offset = 0
        speed = settings.spinUp
      }

      if (reduced.matches) {
        if (open) {
          view.reveal = 1
          view.offset = 0
          draw()
        } else {
          finish()
        }
        return
      }
      if (!visible) return

      const revealAtStart = view.reveal
      const speedAtStart = speed
      const start = performance.now()
      let previous = start
      const duration = open
        ? reopening ? settings.reopenDuration : settings.openDuration
        : settings.closeDuration
      const animate = (time: number) => {
        const elapsed = time - start
        const progress = progressAt(elapsed, duration)
        const revealEase = reopening ? powerOut(progress) : progress === 1 ? 1 : 1 - 2 ** (-10 * progress)
        view.reveal = mix(revealAtStart, Number(open), open ? revealEase : progress ** 4)
        speed = mix(speedAtStart, open ? 1 : settings.spinUp, open ? powerOut(progress) : progress ** 3)
        view.offset = (view.offset + settings.speed * speed * Math.max(0, time - previous) / 1000) % loop
        previous = time
        if (!open && progress === 1) {
          finish()
          return
        }
        draw()
        frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
    }

    const syncPreference = () => transition(open, true)
    const observer = new ResizeObserver(resize)
    observer.observe(term)
    observer.observe(chapter)
    window.addEventListener("resize", resize)
    reduced.addEventListener("change", syncPreference)
    film.canvas.addEventListener("webglcontextlost", resize)
    film.ready?.then(() => { if (!disposed) resize() }).catch(() => { if (!disposed) resize() })
    controller.current = transition
    return () => {
      disposed = true
      controller.current = null
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", resize)
      reduced.removeEventListener("change", syncPreference)
      film.canvas.removeEventListener("webglcontextlost", resize)
      film.dispose()
    }
  }, [chapter])

  useEffect(() => { controller.current?.(opened) }, [opened, mounted, enabled])

  return (
    <p
      ref={trigger}
      className="midnight-filmstrip-trigger"
      role="button"
      tabIndex={0}
      aria-pressed={enabled && opened}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") show() }}
      onPointerDown={(event) => { touchPress.current = event.pointerType === "touch" }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch") {
          leaveTimer.current = window.setTimeout(hide, settings.hoverLeaveDelay)
        }
      }}
      onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) show() }}
      onBlur={hide}
      onClick={() => {
        if (touchPress.current && opened) hide()
        else show()
        touchPress.current = false
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        if (!event.repeat) show()
      }}
    >
      {before}
      <span ref={anchor}>
        {children.slice(0, lastWordStart)}
        <span className="midnight-image-stack-ending">
          {children.slice(lastWordStart)}
          <MidnightImageStack />
        </span>
      </span>
      {chapter && createPortal(
        <span className="midnight-filmstrip-band" ref={band} aria-hidden="true">
          <span className="midnight-filmstrip-track" ref={track}>
            {Array.from({ length: settings.fallbackRepeats }, (_, repeat) => sources.map((source) => (
              <img key={`${repeat}-${source}`} src={source} alt="" />
            )))}
          </span>
        </span>,
        chapter,
      )}
    </p>
  )
}
