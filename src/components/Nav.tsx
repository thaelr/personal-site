import { useEffect, useState } from "react"
import { useSiteContent } from "../content"
import { SECTIONS, SECTION_NUMBERS } from "../content/structure"
import type { SectionId } from "../content/types"
import type { WorkChapter, WorkView } from "../work"

interface NavProps {
  activeSection: SectionId
  workView: WorkView
  chapters: WorkChapter[]
  activeChapterId: string | null
  onWorkBack: () => void
  onChapterSelect: (chapterId: string) => void
}

function scrollToSection(id: SectionId) {
  const section = document.getElementById(id)
  if (!section) return

  window.history.replaceState(null, "", `#${id}`)
  section.scrollIntoView({ behavior: "smooth", block: "start" })
}

function getBackLabel(view: WorkView): string {
  return view.kind === "client-case" ? "← CLIENT WORK" : "← WORK"
}

export default function Nav({
  activeSection,
  workView,
  chapters,
  activeChapterId,
  onWorkBack,
  onChapterSelect,
}: NavProps) {
  const { nav } = useSiteContent()
  const [mobileOpen, setMobileOpen] = useState(false)
  const workReadingMode = workView.kind !== "overview"
  const workOverviewMobile = workView.kind === "overview" && activeSection === "work"
  const currentChapterIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === activeChapterId),
  )
  const currentChapterLabel = chapters.length
    ? `${String(currentChapterIndex + 1).padStart(2, "0")}/${String(chapters.length).padStart(2, "0")}`
    : null
  const mobilePanelId = workReadingMode ? "work-chapter-navigation" : "work-global-navigation"
  const mobileOffsets = [0, -3, -6, -9]
  const desktopNavClassName =
    activeSection === "home"
      ? "site-nav site-nav--desktop site-nav--home"
      : "site-nav site-nav--desktop site-nav--section"

  useEffect(() => {
    setMobileOpen(false)
  }, [workView.kind, activeChapterId])

  const selectChapter = (chapterId: string) => {
    setMobileOpen(false)
    onChapterSelect(chapterId)
  }

  return (
    <>
      <nav className={desktopNavClassName} aria-label={nav.ariaLabel}>
        <ul className="site-nav__list">
          {workReadingMode ? (
            <>
              <li>
                <button type="button" onClick={onWorkBack} className="site-nav__button site-nav__button--active">
                  {getBackLabel(workView)}
                </button>
              </li>
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => selectChapter(chapter.id)}
                    className={`site-nav__button ${chapter.id === activeChapterId ? "site-nav__button--active" : "site-nav__button--inactive"}`}
                    aria-current={chapter.id === activeChapterId ? "location" : undefined}
                  >
                    {chapter.desktopLabel ?? chapter.label}
                  </button>
                </li>
              ))}
            </>
          ) : (
            SECTIONS.map((id) => {
              const isActive = id === activeSection

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(id)}
                    className={`site-nav__button ${isActive ? "site-nav__button--active" : "site-nav__button--inactive"}`}
                  >
                    {SECTION_NUMBERS[id]} {nav.items[id]}
                    {isActive ? " <" : ""}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </nav>

      {workReadingMode || workOverviewMobile ? (
        <nav className="work-mobile-nav lg:hidden" aria-label={nav.ariaLabel}>
          <div className="work-mobile-nav__bar">
            {workReadingMode ? (
              <button type="button" className="work-mobile-nav__back" onClick={onWorkBack}>
                {getBackLabel(workView)}
              </button>
            ) : (
              <span className="work-mobile-nav__label">02 / {nav.items.work}</span>
            )}

            {workReadingMode && chapters.length ? (
              <button
                type="button"
                className="work-mobile-nav__toggle"
                aria-expanded={mobileOpen}
                aria-controls={mobilePanelId}
                onClick={() => setMobileOpen((current) => !current)}
              >
                {currentChapterLabel} {mobileOpen ? "▴" : "▾"}
              </button>
            ) : workReadingMode ? null : (
              <button
                type="button"
                className="work-mobile-nav__toggle"
                aria-expanded={mobileOpen}
                aria-controls={mobilePanelId}
                onClick={() => setMobileOpen((current) => !current)}
              >
                SECTIONS {mobileOpen ? "▴" : "▾"}
              </button>
            )}
          </div>

          {mobileOpen ? (
            <ul id={mobilePanelId} className="work-mobile-nav__panel">
              {workReadingMode
                ? chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <button
                        type="button"
                        className="work-mobile-nav__item"
                        onClick={() => selectChapter(chapter.id)}
                        aria-current={chapter.id === activeChapterId ? "location" : undefined}
                      >
                        {chapter.label}
                      </button>
                    </li>
                  ))
                : SECTIONS.map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        className="work-mobile-nav__item"
                        onClick={() => {
                          setMobileOpen(false)
                          scrollToSection(id)
                        }}
                        aria-current={id === activeSection ? "location" : undefined}
                      >
                        {SECTION_NUMBERS[id]} / {nav.items[id]}
                      </button>
                    </li>
                  ))}
            </ul>
          ) : null}
        </nav>
      ) : (
        <nav className="site-nav-mobile pointer-events-none fixed bottom-4 right-3 z-50 lg:hidden" aria-label={nav.ariaLabel}>
          <ul className="site-nav-mobile__list">
            {SECTIONS.map((id, idx) => {
              const isActive = id === activeSection

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(id)}
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
      )}
    </>
  )
}
