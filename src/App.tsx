import { useState, useEffect, useLayoutEffect, useRef, type MouseEvent } from "react"
import Nav from "./components/Nav"
import HomeSection from "./components/HomeSection"
import WorkSection from "./components/WorkSection"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"
import { ContentProvider, detectLocale } from "./content"
import { applyDocumentMeta } from "./content/meta"
import { SECTIONS } from "./content/structure"
import type { Locale, SectionId } from "./content/types"
import {
  WORK_ROUTE_VIEWS,
  getParentWorkView,
  getWorkChapters,
  getWorkOriginId,
  getWorkPath,
  getWorkViewFromPathname,
  isWorkReadingView,
  type WorkView,
} from "./work"

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect
const WORK_HISTORY_KEY = "personalSiteWork"

type WorkHistoryState = {
  view: WorkView
  scrollY: number
  focusId?: string
  parentPath?: string
}

type PendingRestore = { scrollY?: number; focusId?: string; targetId?: string }

function isSectionId(value: string): value is SectionId {
  return (SECTIONS as readonly string[]).includes(value)
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

function getHistoryState(): Record<string, unknown> {
  const state = window.history.state
  return state && typeof state === "object" ? state : {}
}

function getWorkHistoryState(state: unknown): WorkHistoryState | null {
  if (!state || typeof state !== "object") return null
  const value = (state as Record<string, unknown>)[WORK_HISTORY_KEY]
  return value && typeof value === "object" ? (value as WorkHistoryState) : null
}

function mergeWorkHistoryState(workState: WorkHistoryState): Record<string, unknown> {
  return { ...getHistoryState(), [WORK_HISTORY_KEY]: workState }
}

/** Rewrite a stored parent path into the active locale without changing its view. */
function normalizeParentPath(
  parentPath: string | undefined,
  locale: Locale,
  base: string,
): string | undefined {
  if (!parentPath) return parentPath
  const parentLocale = detectLocale(parentPath, base)
  if (parentLocale === locale) return parentPath
  const views: WorkView[] = [{ kind: "overview" }, ...WORK_ROUTE_VIEWS]
  const match = views.find((view) => getWorkPath(view, parentLocale, base) === parentPath)
  return match ? getWorkPath(match, locale, base) : parentPath
}

function restoreWindowScroll(scrollY: number) {
  const root = document.documentElement
  const previousScrollBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = "auto"
  window.scrollTo(0, scrollY)
  root.style.scrollBehavior = previousScrollBehavior
}

function Site({
  locale,
  base,
  initialWorkView,
  onLocaleChange,
}: {
  locale: Locale
  base: string
  initialWorkView: WorkView
  onLocaleChange: (locale: Locale) => void
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("home")
  const [workView, setWorkView] = useState<WorkView>(initialWorkView)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    getWorkChapters(initialWorkView)[0]?.id ?? null,
  )
  const pendingRestoreRef = useRef<PendingRestore | null>(null)
  const initialChapterHashHandledRef = useRef(false)
  const workViewRef = useRef(workView)
  const localeRef = useRef(locale)
  const workReadingMode = isWorkReadingView(workView)
  const workChapters = getWorkChapters(workView)
  const parentView = getParentWorkView(workView)
  const parentHref = parentView
    ? getWorkPath(parentView, locale, base)
    : getWorkPath(workView, locale, base)

  workViewRef.current = workView
  localeRef.current = locale

  useBrowserLayoutEffect(() => {
    const pending = pendingRestoreRef.current
    if (!pending) return
    pendingRestoreRef.current = null

    if (pending.targetId) {
      const root = document.documentElement
      const previousScrollBehavior = root.style.scrollBehavior
      root.style.scrollBehavior = "auto"
      document.getElementById(pending.targetId)?.scrollIntoView({ block: "center", behavior: "auto" })
      root.style.scrollBehavior = previousScrollBehavior
    } else {
      restoreWindowScroll(pending.scrollY ?? 0)
    }

    if (pending.focusId) {
      document.getElementById(pending.focusId)?.focus({ preventScroll: true })
    }
  }, [workView])

  useBrowserLayoutEffect(() => {
    if (initialChapterHashHandledRef.current || !workChapters.length) return
    initialChapterHashHandledRef.current = true

    const chapterId = window.location.hash.replace("#", "")
    if (!workChapters.some((chapter) => chapter.id === chapterId)) return

    const root = document.documentElement
    const previousScrollBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = "auto"
    document.getElementById(chapterId)?.scrollIntoView({ block: "start", behavior: "auto" })
    root.style.scrollBehavior = previousScrollBehavior
    setActiveChapterId(chapterId)
  }, [workChapters])

  useEffect(() => {
    applyDocumentMeta(locale, workView, base)
  }, [base, locale, workView])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    const currentState = getWorkHistoryState(window.history.state)
    window.history.replaceState(
      mergeWorkHistoryState({
        view: initialWorkView,
        scrollY: currentState?.scrollY ?? window.scrollY,
        focusId: currentState?.focusId,
        parentPath: currentState?.parentPath,
      }),
      "",
    )

    let frameId = 0
    const saveScrollPosition = () => {
      if (frameId) return
      const pathname = window.location.pathname
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        if (window.location.pathname !== pathname) return
        const existing = getWorkHistoryState(window.history.state)
        window.history.replaceState(
          mergeWorkHistoryState({
            view: workViewRef.current,
            scrollY: window.scrollY,
            focusId: existing?.focusId,
            parentPath: existing?.parentPath,
          }),
          "",
        )
      })
    }

    const handlePopState = (event: PopStateEvent) => {
      const sessionLocale = localeRef.current
      const urlLocale = detectLocale(window.location.pathname, base)

      if (urlLocale !== sessionLocale) {
        const urlView =
          getWorkViewFromPathname(window.location.pathname, urlLocale, base) ?? { kind: "overview" }
        const savedState = getWorkHistoryState(event.state)
        window.history.replaceState(
          savedState
            ? mergeWorkHistoryState({
                ...savedState,
                parentPath: normalizeParentPath(savedState.parentPath, sessionLocale, base),
              })
            : event.state,
          "",
          `${getWorkPath(urlView, sessionLocale, base)}${window.location.hash}`,
        )
      }

      const nextView = getWorkViewFromPathname(window.location.pathname, sessionLocale, base)
      if (!nextView) return

      const saved = getWorkHistoryState(window.history.state)
      pendingRestoreRef.current = { scrollY: saved?.scrollY ?? 0, focusId: saved?.focusId }

      const hash = window.location.hash.replace("#", "")
      const chapters = getWorkChapters(nextView)
      const chapterId =
        chapters.find((chapter) => chapter.id === hash)?.id ?? chapters[0]?.id ?? null

      if (isSectionId(hash)) {
        setActiveSection(hash)
      } else {
        setActiveSection(nextView.kind === "overview" ? "home" : "work")
      }
      setActiveChapterId(chapterId)
      setWorkView(nextView)
    }

    window.addEventListener("scroll", saveScrollPosition, { passive: true })
    window.addEventListener("popstate", handlePopState)
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.history.scrollRestoration = previousRestoration
      window.removeEventListener("scroll", saveScrollPosition)
      window.removeEventListener("popstate", handlePopState)
    }
    // Initial history is captured once; later locale/view changes keep the same entries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])

  useEffect(() => {
    if (workReadingMode) return
    const sections = SECTIONS
      .map((id) => {
        const element = document.getElementById(id)
        return element ? { id, element } : null
      })
      .filter((section): section is { id: SectionId; element: HTMLElement } => section !== null)
    if (!sections.length) return

    let frameId = 0
    const updateActiveSection = () => {
      const controlLine = window.innerHeight * 0.25
      const nextActive =
        sections.find((section) => {
          const rect = section.element.getBoundingClientRect()
          return rect.top <= controlLine && rect.bottom >= controlLine
        })?.id ??
        (controlLine < sections[0].element.getBoundingClientRect().top
          ? sections[0].id
          : sections.at(-1)?.id ?? "home")
      setActiveSection((current) => (current === nextActive ? current : nextActive))
    }
    const scheduleUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateActiveSection()
      })
    }
    const syncHashSection = () => {
      const hash = window.location.hash.replace("#", "")
      if (isSectionId(hash)) setActiveSection(hash)
      scheduleUpdate()
    }

    syncHashSection()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("hashchange", syncHashSection)
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("hashchange", syncHashSection)
    }
  }, [workReadingMode])

  const saveCurrentEntry = (focusId?: string) => {
    const existing = getWorkHistoryState(window.history.state)
    window.history.replaceState(
      mergeWorkHistoryState({
        view: workView,
        scrollY: window.scrollY,
        focusId: focusId ?? existing?.focusId,
        parentPath: existing?.parentPath,
      }),
      "",
    )
  }

  const navigateToView = (
    nextView: WorkView,
    options: { originId?: string; targetId?: string } = {},
  ) => {
    saveCurrentEntry(options.originId)
    const parentPath = window.location.pathname
    const nextPath = getWorkPath(nextView, locale, base)
    window.history.pushState(
      mergeWorkHistoryState({
        view: nextView,
        scrollY: 0,
        focusId: options.targetId ?? "work-document-title",
        parentPath,
      }),
      "",
      nextPath,
    )
    pendingRestoreRef.current = options.targetId
      ? { targetId: options.targetId, focusId: options.targetId }
      : { scrollY: 0, focusId: "work-document-title" }
    setActiveSection("work")
    setActiveChapterId(getWorkChapters(nextView)[0]?.id ?? null)
    setWorkView(nextView)
  }

  const openWorkView = (
    event: MouseEvent<HTMLAnchorElement>,
    nextView: WorkView,
    originId: string,
  ) => {
    if (!isPlainLeftClick(event)) return
    event.preventDefault()
    navigateToView(nextView, { originId })
  }

  const returnFromWorkView = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(event) || !parentView) return
    event.preventDefault()
    const saved = getWorkHistoryState(window.history.state)
    if (saved?.parentPath === getWorkPath(parentView, locale, base)) {
      window.history.back()
      return
    }
    const targetId = getWorkOriginId(workView)
    navigateToView(parentView, { targetId })
  }

  const switchLocale = (event: MouseEvent<HTMLAnchorElement>, nextLocale: Locale) => {
    if (!isPlainLeftClick(event)) return
    event.preventDefault()
    if (nextLocale === locale) return

    const hash =
      workView.kind === "overview"
        ? `#${activeSection}`
        : activeChapterId
          ? `#${activeChapterId}`
          : ""
    const existing = getWorkHistoryState(window.history.state)
    const nextParentPath = normalizeParentPath(existing?.parentPath, nextLocale, base)

    window.history.replaceState(
      mergeWorkHistoryState({
        view: workView,
        scrollY: window.scrollY,
        focusId: existing?.focusId,
        parentPath: nextParentPath,
      }),
      "",
      `${getWorkPath(workView, nextLocale, base)}${hash}`,
    )
    onLocaleChange(nextLocale)
  }

  const selectChapter = (chapterId: string) => {
    window.history.replaceState(window.history.state, "", `#${chapterId}`)
    setActiveChapterId(chapterId)
    document.getElementById(chapterId)?.scrollIntoView({ block: "start", behavior: "auto" })
  }

  const getViewHref = (view: WorkView) => getWorkPath(view, locale, base)
  const languageHash = workView.kind === "overview"
    ? `#${activeSection}`
    : activeChapterId
      ? `#${activeChapterId}`
      : ""
  const languageHrefs: Record<Locale, string> = {
    en: `${getWorkPath(workView, "en", base)}${languageHash}`,
    ru: `${getWorkPath(workView, "ru", base)}${languageHash}`,
  }

  return (
    <div className="page-shell bg-void text-chalk font-sans min-h-screen overflow-x-hidden">
      <Nav
        activeSection={workReadingMode ? "work" : activeSection}
        workView={workView}
        chapters={workChapters}
        activeChapterId={activeChapterId}
        locale={locale}
        languageHrefs={languageHrefs}
        workBackHref={parentHref}
        onWorkBack={returnFromWorkView}
        onChapterSelect={selectChapter}
        onSectionSelect={setActiveSection}
        onLocaleSwitch={switchLocale}
      />
      {workReadingMode ? (
        <WorkSection
          view={workView}
          getViewHref={getViewHref}
          onOpenView={openWorkView}
          onActiveChapterChange={setActiveChapterId}
        />
      ) : (
        <>
          <HomeSection />
          <WorkSection
            view={workView}
            getViewHref={getViewHref}
            onOpenView={openWorkView}
            onActiveChapterChange={setActiveChapterId}
          />
          <AboutSection />
          <ContactSection />
        </>
      )}
    </div>
  )
}

export default function App({
  locale: initialLocale = "en",
  base = "/",
  initialWorkView = { kind: "overview" },
}: {
  locale?: Locale
  base?: string
  initialWorkView?: WorkView
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  return (
    <ContentProvider locale={locale}>
      <Site
        locale={locale}
        base={base}
        initialWorkView={initialWorkView}
        onLocaleChange={setLocale}
      />
    </ContentProvider>
  )
}
