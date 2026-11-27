import { useEffect, useRef, useState } from "react"
import { useSiteContent } from "../content"
import { CONTACT_CHANNELS } from "../content/structure"

export default function ContactSection() {
  const { contact } = useSiteContent()
  const [active, setActive] = useState(false)
  const lamp = useRef<HTMLSpanElement>(null)
  const glow = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const source = lamp.current
    const layer = glow.current
    if (!source || !layer) return

    const position = () => {
      const { left, top, width, height } = source.getBoundingClientRect()
      layer.style.setProperty("--contact-glow-x", `${left + width / 2}px`)
      layer.style.setProperty("--contact-glow-y", `${top + height / 2}px`)
    }
    const observer = new ResizeObserver(position)
    observer.observe(source)
    if (source.parentElement) observer.observe(source.parentElement)
    window.addEventListener("scroll", position, { passive: true })
    window.addEventListener("resize", position)
    position()
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", position)
      window.removeEventListener("resize", position)
    }
  }, [])

  useEffect(() => {
    const layer = glow.current
    if (!layer) return
    // The gradient is calibrated to leave headroom for the ignition overshoot.
    const peak = 1.3
    const current = Number(getComputedStyle(layer).opacity)
    const target = active ? 1 / peak : 0
    if (current === target) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    layer.style.opacity = String(target)
    if (reduce) return

    const ignition = active && current === 0
    const frames = ignition ? [
      { opacity: 0, offset: 0 },
      { opacity: 0.7 / peak, offset: 50 / 1040 },
      { opacity: 0.15 / peak, offset: 110 / 1040 },
      { opacity: 1, offset: 190 / 1040 },
      { opacity: 0.8 / peak, offset: 240 / 1040, easing: "cubic-bezier(.215,.61,.355,1)" },
      { opacity: target, offset: 1 },
    ] : [{ opacity: current }, { opacity: target }]
    const animation = layer.animate(frames, {
      duration: ignition ? 1040 : active ? 400 : 700,
      delay: active ? 0 : 300,
      easing: ignition ? "linear" : active ? "cubic-bezier(.215,.61,.355,1)" : "ease-in-out",
      fill: "backwards",
    })
    return () => {
      layer.style.opacity = getComputedStyle(layer).opacity
      animation.cancel()
    }
  }, [active])

  return (
    <section id="contact" className="contact-section">
      <div className="contact-section__glow" ref={glow} aria-hidden="true" />
      <div className="contact-section__inner">
        <div className="contact-section__grid">
          <div className="contact-section__cta-wrap">
            <button
              type="button"
              className="contact-cta"
              aria-pressed={active}
              onClick={() => setActive((current) => !current)}
            >
              <span className="contact-cta__lamp" ref={lamp} aria-hidden="true" />
              <span className="contact-cta__text">{contact.cta}</span>
            </button>
          </div>

          <div className="contact-section__links-wrap">
            <ul className="contact-section__links-list">
              {CONTACT_CHANNELS.map((channel) => (
                <li key={channel.id} className="contact-section__links-item">
                  <span className="contact-section__links-label">
                    {contact.channelLabels[channel.id]}:
                  </span>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="contact-section__link"
                      target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <span className="contact-section__link-text">{channel.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
