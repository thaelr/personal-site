interface NavProps {
  activeSection: string
}

const NAV_ITEMS = [
  { id: 'home', num: '01', label: 'HOME' },
  { id: 'work', num: '02', label: 'WORK' },
  { id: 'about', num: '03', label: 'ABOUT' },
  { id: 'contact', num: '04', label: 'CONTACT' },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function Nav({ activeSection }: NavProps) {
  const activeIdx = NAV_ITEMS.findIndex(i => i.id === activeSection)
  const currentItem = NAV_ITEMS[activeIdx]

  return (
    <>
      {/* Desktop: drum/chamber nav */}
      <nav className="fixed right-0 top-0 h-full z-50 hidden lg:flex flex-col justify-center">
        {/* Vertical track line */}
        <div className="absolute right-[148px] top-[15%] bottom-[15%] w-px bg-rule opacity-60" />

        <ul className="flex flex-col items-end pr-10 gap-0">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = item.id === activeSection
            const dist = Math.abs(idx - activeIdx)
            const opacity = isActive ? 1 : dist === 1 ? 0.28 : 0.14

            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  style={{ opacity, transform: `translateX(${isActive ? 0 : dist * 10}px)` }}
                  className="flex flex-col items-end text-right transition-all duration-350 cursor-pointer py-1 group"
                >
                  {/* Number */}
                  <div
                    className={[
                      'font-mono font-bold leading-none tracking-tight transition-all duration-350',
                      isActive ? 'text-chalk' : 'text-chalk',
                    ].join(' ')}
                    style={{ fontSize: isActive ? '4.2rem' : '1.05rem' }}
                  >
                    {item.num}
                  </div>
                  {/* Label */}
                  <div
                    className="font-mono uppercase tracking-[0.22em] text-chalk transition-all duration-350 mt-px"
                    style={{ fontSize: isActive ? '10px' : '7.5px', opacity: isActive ? 0.55 : 0.7 }}
                  >
                    {item.label}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile: vertical tab with current section number */}
      <div className="lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={() => {
            const next = NAV_ITEMS[(activeIdx + 1) % NAV_ITEMS.length]
            scrollTo(next.id)
          }}
          className="bg-void border-l border-t border-b border-dim flex flex-col items-center justify-center px-[7px] py-5 gap-1"
        >
          <span
            className="font-mono font-bold text-chalk leading-none [writing-mode:vertical-rl] rotate-180"
            style={{ fontSize: '1.1rem' }}
          >
            {currentItem?.num}
          </span>
          <span className="block w-px h-2 bg-fog/30" />
          <span
            className="font-mono text-fog/50 uppercase tracking-[0.14em] [writing-mode:vertical-rl] rotate-180"
            style={{ fontSize: '7px' }}
          >
            {currentItem?.label}
          </span>
        </button>
      </div>
    </>
  )
}
