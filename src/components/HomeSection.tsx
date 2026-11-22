import { useState } from "react"
import { useSiteContent } from "../content"
import heroPortrait from "../hero-portrait.png"

type HeroButtonProps = {
  label: string
  targetId: string
  sizeClassName: string
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

function HeroButton({ label, targetId, sizeClassName }: HeroButtonProps) {
  return (
    <button
      onClick={() => scrollTo(targetId)}
      className={`hero-cta ${sizeClassName} font-mono tracking-[0.22em] uppercase`}
    >
      <span
        aria-hidden="true"
        className="hero-cta__bracket hero-cta__bracket--left"
      >
        [
      </span>
      <span className="hero-cta__label">{label}</span>
      <span
        aria-hidden="true"
        className="hero-cta__bracket hero-cta__bracket--right"
      >
        ]
      </span>
    </button>
  )
}

export default function HomeSection() {
  const { home } = useSiteContent()
  const [badgeActive, setBadgeActive] = useState(false)

  return (
    <section id="home" className="hero-home">
      <div className="hero-home__inner">
        <div className="hero-home__grid">
          <div className="hero-home__content">
            <h1 className="hero-home__name">{home.name}</h1>

            <button
              type="button"
              className="hero-home__badge font-mono uppercase"
              aria-pressed={badgeActive}
              onClick={() => setBadgeActive((current) => !current)}
            >
              <span className="hero-home__badge-lamp" aria-hidden="true" />
              <span className="hero-home__badge-text">{home.badge}</span>
            </button>

            <div className="hero-home__photo-wrap">
              <div className="hero-portrait-shell hero-home__photo-shell">
                <img
                  src={heroPortrait}
                  alt={home.portraitAlt}
                  className="hero-portrait-image hero-home__photo-image"
                />
              </div>
            </div>

            <div className="hero-home__copy">
              <p className="hero-home__career">
                {home.careerLines.map((line) => (
                  <span key={line} className="hero-home__line hero-home__line--desktop">
                    {line}
                  </span>
                ))}
              </p>

              <p className="hero-home__offer">
                {home.offerWideLines.map((line) => (
                  <span key={line} className="hero-home__line hero-home__line--desktop hero-home__line--offer-wide">
                    {line}
                  </span>
                ))}
                <span className="hero-home__line hero-home__line--desktop hero-home__line--offer-compact">
                  {home.offerCompactLine}
                </span>
              </p>
            </div>

            <div className="hero-home__actions">
              <HeroButton
                label={home.actions.work}
                targetId="work"
                sizeClassName="hero-cta--work"
              />
              <HeroButton
                label={home.actions.about}
                targetId="about"
                sizeClassName="hero-cta--about"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
