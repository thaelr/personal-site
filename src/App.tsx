import { useState, useEffect, useLayoutEffect, useRef, type MouseEvent } from "react"
import Nav from "./components/Nav"
import HomeSection from "./components/HomeSection"
import WorkSection from "./components/WorkSection"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"
import { ContentProvider } from "./content"
import { SECTIONS } from "./content/structure"
import type { Locale, SectionId } from "./content/types"
import {
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
}: {
  locale: Locale
  base: string
  initialWorkView: WorkView
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("home")
  const [workView, setWorkView] = useState<WorkView>(initialWorkView)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    getWorkChapters(initialWorkView)[0]?.id ?? null,
  )
  const pendingRestoreRef = useRef<PendingRestore | null>(null)
  const initialChapterHashHandledRef = useRef(false)
  const workViewRef = useRef(workView)
  const workReadingMode = isWorkReadingView(workView)
  const workChapters = getWorkChapters(workView)
  const parentView = getParentWorkView(workView)
  const parentHref = parentView
    ? getWorkPath(parentView, locale, base)
    : getWorkPath(workView, locale, base)

  workViewRef.current = workView

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
      const nextView = getWorkViewFromPathname(window.location.pathname, locale, base)
      if (!nextView) return
      const saved = getWorkHistoryState(event.state)
      pendingRestoreRef.current = { scrollY: saved?.scrollY ?? 0, focusId: saved?.focusId }
      setActiveSection("work")
      setActiveChapterId(getWorkChapters(nextView)[0]?.id ?? null)
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
  }, [base, initialWorkView, locale])

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
  locale = "en",
  base = "/",
  initialWorkView = { kind: "overview" },
}: {
  locale?: Locale
  base?: string
  initialWorkView?: WorkView
}) {
  return (
    <ContentProvider locale={locale}>
      <Site locale={locale} base={base} initialWorkView={initialWorkView} />
    </ContentProvider>
  )
}
