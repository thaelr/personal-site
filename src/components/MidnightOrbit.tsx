import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import first from "../assets/midnight-orbit/01.webp"
import second from "../assets/midnight-orbit/00663.webp"
import third from "../assets/midnight-orbit/00685.webp"
import fourth from "../assets/midnight-orbit/00687.webp"
import fifth from "../assets/midnight-orbit/00693.webp"
import sixth from "../assets/midnight-orbit/00700.webp"
import fluxFirst from "../assets/midnight-orbit/flux/00082.webp"
import fluxSecond from "../assets/midnight-orbit/flux/00155.webp"
import fluxThird from "../assets/midnight-orbit/flux/00189.webp"
import fluxFourth from "../assets/midnight-orbit/flux/00205.webp"
import fluxFifth from "../assets/midnight-orbit/flux/00259.webp"
import fluxSixth from "../assets/midnight-orbit/flux/00439.webp"
import { MidnightImageStack } from "./MidnightImageStack"
import "./MidnightOrbit.css"

const orbitPictures = {
  pony: [first, second, third, fourth, fifth, sixth],
  flux: [fluxFirst, fluxSecond, fluxThird, fluxFourth, fluxFifth, fluxSixth],
}
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const easeOut = (progress: number, power: number) => 1 - (1 - progress) ** power
const interpolate = (from: number, to: number, progress: number) => from + (to - from) * progress

export function MidnightOrbit({ children, gallery }: {
  children: string
  gallery: keyof typeof orbitPictures
}) {
  const pictures = orbitPictures[gallery]
  const lastWordStart = children.lastIndexOf(" ") + 1
  const trigger = useRef<HTMLSpanElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const tapped = useRef(false)
  const leaveTimer = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const motion = useRef({
    angle: 0,
    speed: 4,
    cards: pictures.map(() => ({ reach: 0, opacity: 0 })),
    visible: false,
  })

  const show = () => {
    window.clearTimeout(leaveTimer.current)
    setMounted(true)
    setOpen(true)
  }

  const hide = () => {
    window.clearTimeout(leaveTimer.current)
    tapped.current = false
    setOpen(false)
  }

  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  useEffect(() => {
    if (!open) return
    const dismissOutside = (event: PointerEvent) => {
      if (!trigger.current?.contains(event.target as Node)) hide()
    }
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide()
    }
    document.addEventListener("pointerdown", dismissOutside)
    document.addEventListener("keydown", dismissWithEscape)
    return () => {
      document.removeEventListener("pointerdown", dismissOutside)
      document.removeEventListener("keydown", dismissWithEscape)
    }
  }, [open])

  useEffect(() => {
    const term = trigger.current
    const overlay = stage.current
    const rotor = ring.current
    const state = motion.current
    if (!term || !overlay || !rotor || (!open && !state.visible)) return

    const cards = Array.from(rotor.querySelectorAll<HTMLElement>(".midnight-orbit__card"))
    const faces = cards.map((card) => card.querySelectorAll<HTMLElement>(".midnight-orbit__face"))
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const initialCards = state.cards.map((card) => ({ ...card }))
    const initialSpeed = state.speed
    const reopening = open && state.visible
    if (open) {
      state.visible = true
      overlay.hidden = false
    }

    const start = performance.now()
    let previous = start
    let frame = 0

    const draw = (time: number) => {
      const elapsed = Math.max(0, time - start)
      const reduced = preference.matches
      if (!open && (reduced || elapsed >= 534)) {
        overlay.hidden = true
        state.visible = false
        state.angle = 0
        state.speed = 4
        state.cards.forEach((card) => Object.assign(card, { reach: 0, opacity: 0 }))
        return
      }

      const rect = Array.from(term.getClientRects()).reduce<DOMRect | null>(
        (widest, line) => !widest || line.width > widest.width ? line : widest, null,
      )
      if (!rect) return
      const cardWidth = cards[0].offsetWidth
      const radius = Math.max(130, rect.width / 2 + cardWidth * 0.2)
      const width = 2 * radius + cardWidth * 1.4
      const height = 2 * radius * Math.sin(28 * Math.PI / 180) + cardWidth * 2
      overlay.style.width = `${width}px`
      overlay.style.height = `${height}px`
      overlay.style.left = `${rect.left + (rect.width - width) / 2}px`
      overlay.style.top = `${rect.top + (rect.height - height) / 2}px`

      state.speed = open
        ? interpolate(initialSpeed, 1, easeOut(clamp(elapsed / (reopening ? 400 : 1600)), 3))
        : interpolate(initialSpeed, 4, clamp(elapsed / 400) ** 3)
      state.angle = reduced ? 0 : (state.angle - Math.max(0, time - previous) * 360 / 14000 * state.speed) % 360
      previous = time
      rotor.style.transform = `rotateY(${state.angle}deg)`

      cards.forEach((card, index) => {
        const enterDelay = reopening ? 0 : index * 80
        const leaveDelay = (cards.length - 1 - index) * 80 / 3
        const reach = open
          ? easeOut(clamp((elapsed - enterDelay) / (reopening ? 300 : 800)), reopening ? 3 : 4)
          : clamp((elapsed - leaveDelay) / 400) ** 3
        const fade = open
          ? easeOut(clamp((elapsed - enterDelay) / (reopening ? 200 : 250)), 2)
          : easeOut(clamp((elapsed - 240) / 200), 2)
        const current = state.cards[index]
        current.reach = reduced ? 1 : interpolate(initialCards[index].reach, Number(open), reach)
        current.opacity = reduced ? 1 : interpolate(initialCards[index].opacity, Number(open), fade)
        const shade = (1 - Math.cos((index * 60 + state.angle) * Math.PI / 180)) * 0.05
        card.style.transform = `translateZ(${radius * current.reach}px) scale(${0.3 + 0.7 * current.reach})`
        card.style.setProperty("--midnight-orbit-shade", String(shade))
        faces[index].forEach((face) => { face.style.opacity = String(current.opacity) })
      })

      if (!reduced) frame = requestAnimationFrame(draw)
    }

    const updatePosition = () => {
      if (preference.matches) draw(performance.now())
    }
    const updatePreference = () => {
      cancelAnimationFrame(frame)
      draw(performance.now())
    }
    preference.addEventListener("change", updatePreference)
    window.addEventListener("scroll", updatePosition, { passive: true })
    window.addEventListener("resize", updatePosition)
    draw(start)
    return () => {
      cancelAnimationFrame(frame)
      preference.removeEventListener("change", updatePreference)
      window.removeEventListener("scroll", updatePosition)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, mounted])

  return (
    <>
      <span
        ref={trigger}
        className="midnight-orbit-trigger"
        role="button"
        tabIndex={0}
        aria-pressed={open}
        onPointerEnter={(event) => { if (event.pointerType !== "touch") show() }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch" && !tapped.current) {
            leaveTimer.current = window.setTimeout(hide, 100)
          }
        }}
        onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) show() }}
        onBlur={hide}
        onClick={() => {
          if (tapped.current) hide()
          else {
            tapped.current = true
            show()
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          if (event.repeat) return
          if (open) hide()
          else show()
        }}
      >
        {children.slice(0, lastWordStart)}
        <span className="midnight-image-stack-ending">
          {children.slice(lastWordStart)}
          <MidnightImageStack />
        </span>
      </span>
      {mounted && createPortal(
        <div ref={stage} className="midnight-orbit" aria-hidden="true" hidden>
          <div className="midnight-orbit__tilt">
            <div ref={ring} className="midnight-orbit__ring">
              {pictures.map((source, index) => (
                <div className="midnight-orbit__slot" key={source} style={{ transform: `rotateY(${index * 60}deg)` }}>
                  <div className="midnight-orbit__card">
                    <img className="midnight-orbit__face" src={source} alt="" />
                    <img className="midnight-orbit__face midnight-orbit__face--back" src={source} alt="" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
