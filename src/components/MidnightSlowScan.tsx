import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import { MidnightImageStack } from "./MidnightImageStack"
import glassVideo from "../assets/midnight-slow-scan/glass.mp4"
import glassPoster from "../assets/midnight-slow-scan/glass-first.png"
import liquidVideo from "../assets/midnight-slow-scan/liquid.mp4"
import liquidPoster from "../assets/midnight-slow-scan/liquid-first.png"
import "./MidnightSlowScan.css"

const clips = {
  glass: { source: glassVideo, poster: glassPoster },
  liquid: { source: liquidVideo, poster: liquidPoster },
}

const settings = {
  rowHeight: 8,
  scanDuration: 1000,
  colourLag: 250,
  colourDuration: 300,
  wobble: 104,
  swing: 7,
  closeDuration: 350,
}
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const shift = (x: number) => `translateX(${x}px)`
const wobble = () => (Math.random() * 2 - 1) * settings.wobble

function buildRows(layer: HTMLElement) {
  const height = layer.clientHeight
  const count = Math.max(1, Math.round(height / settings.rowHeight))
  const rows = Array.from({ length: count }, (_, index) => {
    const row = document.createElement("div")
    const grey = document.createElement("div")
    const colour = document.createElement("div")
    row.className = "midnight-slow-scan__row"
    grey.className = "midnight-slow-scan__grey"
    colour.className = "midnight-slow-scan__colour"
    const top = Math.round(index * height / count)
    const size = Math.round((index + 1) * height / count) - top
    row.style.top = `${100 * top / height}%`
    row.style.height = `${100 * size / height}%`
    for (const image of [grey, colour]) {
      image.style.height = `${100 * height / size}%`
      image.style.top = `${-100 * top / size}%`
    }
    row.append(grey, colour)
    return { row, colour }
  })
  layer.replaceChildren(...rows.map(({ row }) => row))
  return rows
}

export function MidnightSlowScan({ children, enabled, clip }: {
  children: string
  enabled: boolean
  clip: keyof typeof clips
}) {
  const { source, poster } = clips[clip]
  const lastWordStart = children.lastIndexOf(" ") + 1
  const term = useRef<HTMLSpanElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const scan = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLVideoElement>(null)
  const finishing = useRef(false)
  const playbackFailed = useRef(false)
  const leaveTimer = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const show = () => {
    window.clearTimeout(leaveTimer.current)
    if (!enabled) return
    term.current?.dispatchEvent(new Event("midnight-slow-scan-open", { bubbles: true }))
    finishing.current = false
    if (media.current) media.current.loop = true
    setMounted(true)
    setOpen(true)
  }

  const hide = () => {
    window.clearTimeout(leaveTimer.current)
    finishing.current = false
    setOpen(false)
  }

  const finishPlayback = () => {
    const video = media.current
    if (!video || video.ended || playbackFailed.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hide()
      return
    }
    finishing.current = true
    video.loop = false
  }

  useEffect(() => {
    if (enabled) {
      const image = new Image()
      image.src = poster
    } else {
      setOpen(false)
      setMounted(false)
    }
    return () => window.clearTimeout(leaveTimer.current)
  }, [enabled, poster])

  useEffect(() => {
    if (!open || !enabled) return
    const chapter = term.current?.closest("#art-direction")
    const anotherScanOpened = (event: Event) => {
      if (event.target !== term.current) hide()
    }
    const outside = (event: PointerEvent) => {
      if (!term.current?.contains(event.target as Node)) hide()
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide()
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", escape)
    chapter?.addEventListener("midnight-slow-scan-open", anotherScanOpened)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", escape)
      chapter?.removeEventListener("midnight-slow-scan-open", anotherScanOpened)
    }
  }, [open, enabled])

  useEffect(() => {
    const trigger = term.current
    const preview = card.current
    const layer = scan.current
    const video = media.current
    if (!enabled || !mounted || !trigger || !preview || !layer || !video) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    let animations: Animation[] = []
    let run = 0
    let videoFrame: number | undefined

    const stop = () => {
      run += 1
      video.pause()
      if (videoFrame !== undefined) video.cancelVideoFrameCallback(videoFrame)
      videoFrame = undefined
      for (const animation of animations) {
        if (preview.isConnected && animation.currentTime !== null) {
          animation.commitStyles()
        }
        animation.cancel()
      }
      animations = []
    }

    const place = () => {
      const word = trigger.getBoundingClientRect()
      const paragraph = trigger.parentElement!.getBoundingClientRect()
      const { offsetWidth: width, offsetHeight: height } = preview
      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = window.innerHeight
      const margin = viewportWidth >= 768 ? 30 : 15
      const gap = 15
      const beside = paragraph.right + 60 + width <= viewportWidth - margin
      const above = word.top - gap * 2
      const below = viewportHeight - word.bottom - gap * 2
      const placeAbove = above >= height || (below < height && above >= below)
      const left = beside ? paragraph.right + 60 : word.left + (word.width - width) / 2
      const top = beside ? word.top + (word.height - height) / 2
        : placeAbove ? word.top - height - gap : word.bottom + gap
      preview.style.left = `${clamp(left, margin, viewportWidth - margin - width)}px`
      preview.style.top = `${clamp(top, gap, viewportHeight - gap - height)}px`
    }

    const startVideo = (currentRun: number) => {
      if (run !== currentRun) return
      video.currentTime = 0
      video.play().then(() => {
        if (run !== currentRun) return
        const reveal = () => {
          if (run === currentRun) video.hidden = false
        }
        if (typeof video.requestVideoFrameCallback === "function") {
          videoFrame = video.requestVideoFrameCallback(reveal)
        } else {
          reveal()
        }
      }).catch(() => {
        if (run !== currentRun) return
        playbackFailed.current = true
        if (finishing.current) hide()
      })
    }

    const start = () => {
      video.hidden = true
      video.loop = !finishing.current
      playbackFailed.current = false
      video.style.clipPath = "inset(0 0 100% 0)"
      layer.style.removeProperty("--slow-scan-frame")
      preview.style.visibility = "visible"
      place()
      const rows = buildRows(layer)
      if (reduced.matches) {
        if (finishing.current) hide()
        return
      }
      const currentRun = run
      const each = settings.scanDuration / rows.length
      rows.forEach(({ row, colour }, index) => {
        const initial = wobble()
        const delay = index * each
        const shiftDuration = 390
        animations.push(row.animate([
          { transform: shift(initial), offset: 0 },
          { transform: shift(initial), offset: 40 / shiftDuration, easing: "cubic-bezier(.25,.46,.45,.94)" },
          { transform: shift(-initial * settings.swing), offset: 140 / shiftDuration, easing: "cubic-bezier(.215,.61,.355,1)" },
          { transform: shift(0), offset: 1 },
        ], { delay, duration: shiftDuration, fill: "both" }))
        animations.push(row.animate([{ opacity: 0 }, { opacity: 1 }], {
          delay, duration: 40, fill: "both",
        }))
        animations.push(colour.animate([{ opacity: 0 }, { opacity: 1 }], {
          delay: delay + settings.colourLag,
          duration: settings.colourDuration,
          easing: "ease-in-out",
          fill: "both",
        }))
      })
      // Moving footage takes over each row once its colour and position have settled.
      const mask = rows.map(({ row }, index) => ({
        clipPath: `inset(0 0 ${Math.max(0, 100 - parseFloat(row.style.top) - parseFloat(row.style.height))}% 0)`,
        offset: (index + 1) / rows.length,
      }))
      const videoReveal = video.animate([{ clipPath: "inset(0 0 100% 0)", offset: 0 }, ...mask], {
        delay: settings.colourLag + settings.colourDuration - each,
        duration: settings.scanDuration,
        easing: `steps(${rows.length}, end)`,
        fill: "both",
      })
      animations.push(videoReveal)
      startVideo(currentRun)
    }

    const close = () => {
      if (!video.hidden && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const frozen = document.createElement("canvas")
        frozen.width = layer.clientWidth
        frozen.height = layer.clientHeight
        frozen.getContext("2d")?.drawImage(video, 0, 0, frozen.width, frozen.height)
        layer.style.setProperty("--slow-scan-frame", `url(${frozen.toDataURL()})`)
      }
      video.hidden = true
      const rows = Array.from(layer.children) as HTMLElement[]
      const shown = rows.filter(row => Number(getComputedStyle(row).opacity) > 0)
      if (reduced.matches || !shown.length) {
        preview.style.visibility = "hidden"
        return
      }
      const currentRun = run
      shown.reverse().forEach((row, index) => {
        const { opacity, transform } = getComputedStyle(row)
        animations.push(row.animate([{ opacity, transform }, { opacity: 0, transform: shift(wobble()) }], {
          delay: index * settings.closeDuration / rows.length,
          duration: 60,
          fill: "forwards",
        }))
      })
      Promise.all(animations.map(animation => animation.finished)).then(() => {
        if (run === currentRun) preview.style.visibility = "hidden"
      }, () => {})
    }

    const syncPreference = () => {
      stop()
      if (open) start()
      else close()
    }

    if (open) start()
    else close()
    window.addEventListener("scroll", place, { capture: true, passive: true })
    window.addEventListener("resize", place)
    reduced.addEventListener("change", syncPreference)
    return () => {
      stop()
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
      reduced.removeEventListener("change", syncPreference)
    }
  }, [open, mounted, enabled])

  return (
    <>
      <span
        ref={term}
        className="midnight-slow-scan-trigger"
        role="button"
        tabIndex={0}
        aria-pressed={open && enabled}
        onPointerEnter={(event) => { if (event.pointerType !== "touch") show() }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch") leaveTimer.current = window.setTimeout(finishPlayback, 100)
        }}
        onClick={show}
        onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) show() }}
        onBlur={hide}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          if (!event.repeat) show()
        }}
      >
        {children.slice(0, lastWordStart)}
        <span className="midnight-image-stack-ending">
          {children.slice(lastWordStart)}
          <MidnightImageStack />
        </span>
      </span>
      {enabled && mounted && createPortal(
        <div className="midnight-slow-scan" ref={card} aria-hidden="true">
          <div className="midnight-slow-scan__rows" ref={scan} style={{ "--slow-scan-poster": `url(${poster})` } as CSSProperties} />
          <video
            ref={media}
            src={source}
            preload="auto"
            muted
            playsInline
            hidden
            onEnded={() => { if (finishing.current) hide() }}
            onError={() => {
              playbackFailed.current = true
              if (finishing.current) hide()
            }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
