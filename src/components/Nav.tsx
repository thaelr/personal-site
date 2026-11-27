import { useEffect, useState, type MouseEvent } from "react"
import { useSiteContent } from "../content"
import { SECTIONS, SECTION_NUMBERS } from "../content/structure"
import type { Locale, SectionId } from "../content/types"
import type { WorkChapter, WorkView } from "../work"

interface NavProps {
  activeSection: SectionId
  workView: WorkView
  chapters: WorkChapter[]
  activeChapterId: string | null
  locale: Locale
  languageHrefs: Record<Locale, string>
  workBackHref: string
  onWorkBack: (event: MouseEvent<HTMLAnchorElement>) => void
  onChapterSelect: (chapterId: string) => void
  onSectionSelect: (sectionId: SectionId) => void
  onLocaleSwitch: (event: MouseEvent<HTMLAnchorElement>, locale: Locale) => void
}

function scrollToSection(id: SectionId, onSectionSelect: (sectionId: SectionId) => void) {
  const section = document.getElementById(id)
  if (!section) return

  window.history.replaceState(window.history.state, "", `#${id}`)
  onSectionSelect(id)
  section.scrollIntoView({ behavior: "smooth", block: "start" })
}

function getBackLabel(view: WorkView): string {
  return view.kind === "client-case" ? "← CLIENT WORK" : "← WORK"
}

function LanguageSwitch({
  locale,
  hrefs,
  className,
  onSwitch,
}: {
  locale: Locale
  hrefs: Record<Locale, string>
  className: string
  onSwitch: (event: MouseEvent<HTMLAnchorElement>, locale: Locale) => void
}) {
  const { nav } = useSiteContent()

  const languageLink = (targetLocale: Locale, label: string) => {
    const isActive = locale === targetLocale
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (isActive) {
        event.preventDefault()
        return
      }

      onSwitch(event, targetLocale)
    }

    return (
      <a
        href={hrefs[targetLocale]}
        className={`language-switch__link ${isActive ? "language-switch__link--active" : "language-switch__link--inactive"}`}
        aria-current={isActive ? "page" : undefined}
        onClick={handleClick}
      >
        {label}
      </a>
    )
  }

  return (
    <div className={`language-switch ${className}`} aria-label={nav.languageLabel}>
      {languageLink("ru", "RU")}
      <span aria-hidden="true">/</span>
      {languageLink("en", "EN")}
    </div>
  )
}

function ActiveNavArrow() {
  return (
    <svg className="site-nav__active-arrow" viewBox="-16 -19 32 38" aria-hidden="true">
      <path d="M 9 -14.4 L -9 0 L 9 14.4" />
    </svg>
  )
}

export default function Nav({
  activeSection,
  workView,
  chapters,
  activeChapterId,
  locale,
  languageHrefs,
  workBackHref,
  onWorkBack,
  onChapterSelect,
  onSectionSelect,
  onLocaleSwitch,
}: NavProps) {
  const { nav } = useSiteContent()
  const [mobileOpen, setMobileOpen] = useState(false)
  const workReadingMode = workView.kind !== "overview"
  const currentChapterIndex = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === activeChapterId),
  )
  const currentChapterLabel = chapters.length
    ? `${String(currentChapterIndex + 1).padStart(2, "0")}/${String(chapters.length).padStart(2, "0")}`
    : null
  const mobilePanelId = workReadingMode ? "work-chapter-navigation" : "work-global-navigation"
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
        <LanguageSwitch
          locale={locale}
          hrefs={languageHrefs}
          className="language-switch--desktop"
          onSwitch={onLocaleSwitch}
        />
        <ul className="site-nav__list">
          {workReadingMode ? (
            <>
              <li>
                <a href={workBackHref} onClick={onWorkBack} className="site-nav__button site-nav__button--active">
                  {getBackLabel(workView)}
                </a>
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
                    onClick={() => scrollToSection(id, onSectionSelect)}
                    className={`site-nav__button ${isActive ? "site-nav__button--active" : "site-nav__button--inactive"}`}
                  >
                    <span className="site-nav__item-label">
                      {SECTION_NUMBERS[id]} {nav.items[id]}
                      {isActive && <ActiveNavArrow />}
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </nav>


      <nav className="work-mobile-nav lg:hidden" aria-label={nav.ariaLabel}>
        <div className="work-mobile-nav__bar">
          {workReadingMode ? (
            <a href={workBackHref} className="work-mobile-nav__back" onClick={onWorkBack}>
              {getBackLabel(workView)}
            </a>
          ) : (
            <span className="work-mobile-nav__label">{SECTION_NUMBERS[activeSection]} / {nav.items[activeSection]}</span>
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
          <LanguageSwitch
            locale={locale}
            hrefs={languageHrefs}
            className="language-switch--in-bar"
            onSwitch={onLocaleSwitch}
          />
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
                        scrollToSection(id, onSectionSelect)
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
    </>
  )
}
