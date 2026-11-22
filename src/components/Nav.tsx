import { useSiteContent } from "../content"
import { SECTIONS, SECTION_NUMBERS } from "../content/structure"
import type { SectionId } from "../content/types"

interface NavProps {
  activeSection: SectionId
}

function scrollTo(id: string) {
  const section = document.getElementById(id)
  if (!section) return

  window.history.replaceState(null, "", `#${id}`)
  section.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function Nav({ activeSection }: NavProps) {
  const { nav } = useSiteContent()
  const mobileOffsets = [0, -3, -6, -9]
  const desktopNavClassName =
    activeSection === "home"
      ? "site-nav site-nav--desktop site-nav--home"
      : "site-nav site-nav--desktop site-nav--section"

  return (
    <>
      <nav className={desktopNavClassName} aria-label={nav.ariaLabel}>
        <ul className="site-nav__list">
          {SECTIONS.map((id) => {
            const isActive = id === activeSection

            return (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className={`site-nav__button ${isActive ? "site-nav__button--active" : "site-nav__button--inactive"}`}
                >
                  {SECTION_NUMBERS[id]} {nav.items[id]}
                  {isActive ? " <" : ""}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <nav className="site-nav-mobile pointer-events-none fixed bottom-4 right-3 z-50 lg:hidden" aria-label={nav.ariaLabel}>
        <ul className="site-nav-mobile__list">
          {SECTIONS.map((id, idx) => {
            const isActive = id === activeSection

            return (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  style={{ transform: `translateX(${mobileOffsets[idx]}px)` }}
                  className="site-nav-mobile__button pointer-events-auto block text-right font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-200 ease-out cursor-pointer"
                >
                  <span className={isActive ? "text-chalk" : "text-fog"}>
                    {SECTION_NUMBERS[id]} {nav.items[id]}
                    {isActive ? " <" : ""}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
