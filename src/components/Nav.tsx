interface NavProps {
  activeSection: string
}

export const NAV_ITEMS = [
  { id: "home", num: "01", label: "HOME" },
  { id: "work", num: "02", label: "WORK" },
  { id: "about", num: "03", label: "ABOUT" },
  { id: "contact", num: "04", label: "CONTACT" },
]

function scrollTo(id: string) {
  const section = document.getElementById(id)
  if (!section) return

  window.history.replaceState(null, "", `#${id}`)
  section.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function Nav({ activeSection }: NavProps) {
  const mobileOffsets = [0, -3, -6, -9]
  const desktopNavClassName =
    activeSection === "home"
      ? "site-nav site-nav--desktop site-nav--home"
      : "site-nav site-nav--desktop site-nav--section"

  return (
    <>
      <nav className={desktopNavClassName} aria-label="Global site navigation">
        <ul className="site-nav__list">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeSection

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className={`site-nav__button ${isActive ? "site-nav__button--active" : "site-nav__button--inactive"}`}
                >
                  {item.num} {item.label}
                  {isActive ? " <" : ""}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <nav className="site-nav-mobile pointer-events-none fixed bottom-4 right-3 z-50 lg:hidden" aria-label="Global site navigation">
        <ul className="site-nav-mobile__list">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = item.id === activeSection

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  style={{ transform: `translateX(${mobileOffsets[idx]}px)` }}
                  className="site-nav-mobile__button pointer-events-auto block text-right font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-200 ease-out cursor-pointer"
                >
                  <span className={isActive ? "text-chalk" : "text-fog"}>
                    {item.num} {item.label}
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
