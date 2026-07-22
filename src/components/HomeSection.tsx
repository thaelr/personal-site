import { useState } from "react"
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
  const [badgeActive, setBadgeActive] = useState(false)

  return (
    <section id="home" className="hero-home">
      <div className="hero-home__inner">
        <div className="hero-home__grid">
          <div className="hero-home__content">
            <h1 className="hero-home__name">Nikolai Sekushenko</h1>

            <button
              type="button"
              className="hero-home__badge font-mono uppercase"
              aria-pressed={badgeActive}
              onClick={() => setBadgeActive((current) => !current)}
            >
              <span className="hero-home__badge-lamp" aria-hidden="true" />
              <span className="hero-home__badge-text">AI PRODUCT ENGINEER</span>
            </button>

            <div className="hero-home__photo-wrap">
              <div className="hero-portrait-shell hero-home__photo-shell">
                <img
                  src={heroPortrait}
                  alt="Black-and-white portrait of Nikolai Sekushenko"
                  className="hero-portrait-image hero-home__photo-image"
                />
              </div>
            </div>

            <div className="hero-home__copy">
              <p className="hero-home__career">
                <span className="hero-home__line hero-home__line--desktop">
                  From a Siberian semiconductor lab to a $1.5M
                </span>
                <span className="hero-home__line hero-home__line--desktop">
                  e-commerce business and conversational AI products.
                </span>
              </p>

              <p className="hero-home__offer">
                <span className="hero-home__line hero-home__line--desktop">
                  Give me a messy problem at the intersection of AI,
                </span>
                <span className="hero-home__line hero-home__line--desktop hero-home__line--offer-wide">
                  product, and business. I’ll figure out what actually matters,
                </span>
                <span className="hero-home__line hero-home__line--desktop hero-home__line--offer-wide">
                  build the system, and ship it.
                </span>
                <span className="hero-home__line hero-home__line--desktop hero-home__line--offer-compact">
                  product, and business. I’ll figure out what actually matters,
                  build the system, and ship it.
                </span>
              </p>
            </div>

            <div className="hero-home__actions">
              <HeroButton
                label="VIEW WORK"
                targetId="work"
                sizeClassName="hero-cta--work"
              />
              <HeroButton
                label="ABOUT ME"
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
