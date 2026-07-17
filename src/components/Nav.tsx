interface NavProps {
  activeSection: string
}

const NAV_ITEMS = [
  { id: "home", num: "01", label: "HOME" },
  { id: "work", num: "02", label: "WORK" },
  { id: "about", num: "03", label: "ABOUT" },
  { id: "contact", num: "04", label: "CONTACT" },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export default function Nav({ activeSection }: NavProps) {
  const activeIdx = NAV_ITEMS.findIndex((i) => i.id === activeSection)
  const desktopOffsets = [0, -8, -16, -24]
  const mobileOffsets = [0, -3, -6, -9]

  return (
    <>
      <nav className="pointer-events-none fixed bottom-[max(1.4rem,3svh)] right-[max(1rem,3vw)] z-50 hidden lg:block">
        <ul className="flex flex-col items-end gap-2">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = item.id === activeSection
            const dist = Math.abs(idx - activeIdx)
            const opacity = isActive ? 1 : dist === 1 ? 0.5 : 0.34

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  style={{
                    opacity,
                    transform: `translateX(${desktopOffsets[idx]}px)`,
                  }}
                  className="pointer-events-auto block text-right font-mono uppercase tracking-[0.18em] transition-all duration-200 ease-out cursor-pointer"
                >
                  <span
                    className={isActive ? "text-chalk" : "text-fog"}
                    style={{ fontSize: isActive ? "0.96rem" : "0.82rem" }}
                  >
                    {item.num} {item.label}
                    {isActive ? " <" : ""}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <nav className="pointer-events-none fixed bottom-4 right-3 z-50 lg:hidden">
        <ul className="flex flex-col items-end gap-1 rounded-[4px] border border-dim/70 bg-void/75 px-3 py-3 backdrop-blur-[3px]">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = item.id === activeSection

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  style={{ transform: `translateX(${mobileOffsets[idx]}px)` }}
                  className="pointer-events-auto block text-right font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-all duration-200 ease-out cursor-pointer"
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
