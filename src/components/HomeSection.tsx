import { NAV_ITEMS } from "./Nav"
import heroPortrait from "../hero-portrait.png"

type HomeSectionProps = {
  activeSection: string
}

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

export default function HomeSection({ activeSection }: HomeSectionProps) {
  const activeIdx = NAV_ITEMS.findIndex((i) => i.id === activeSection)

  return (
    <section id="home" className="hero-home">
      <div className="hero-home__rule" />

      <div className="hero-home__inner">
        <div className="hero-home__grid">
          <div className="hero-home__content">
            <h1 className="hero-home__name">Nikolai Sekushenko</h1>

            <div className="hero-home__badge font-mono uppercase">
              AI PRODUCT ENGINEER
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

          <div className="hero-home__photo-wrap">
            <div className="hero-portrait-shell hero-home__photo-shell">
              <img
                src={heroPortrait}
                alt="Black-and-white portrait of Nikolai Sekushenko"
                className="hero-portrait-image hero-home__photo-image"
              />
            </div>

            <nav className="hero-photo-nav pointer-events-none hidden lg:block">
              <ul className="hero-nav__list">
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = item.id === activeSection
                  const dist = Math.abs(idx - activeIdx)
                  const opacity = isActive ? 1 : dist === 1 ? 0.8 : 0.66

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollTo(item.id)}
                        style={{ opacity }}
                        className={`hero-nav__button pointer-events-auto font-mono uppercase transition-opacity duration-200 ease-out cursor-pointer ${
                          isActive
                            ? "hero-nav__button--active"
                            : "hero-nav__button--inactive"
                        }`}
                      >
                        {item.num} {item.label}
                        {isActive ? " <" : ""}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
