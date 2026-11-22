import { useState, useEffect, useLayoutEffect, useRef } from "react"
import Nav from "./components/Nav"
import HomeSection from "./components/HomeSection"
import WorkSection from "./components/WorkSection"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"
import { ContentProvider } from "./content"
import { SECTIONS } from "./content/structure"
import type { Locale, SectionId } from "./content/types"
import {
  getWorkChapters,
  isWorkReadingView,
  type WorkView,
} from "./work"

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

function isSectionId(value: string): value is SectionId {
  return (SECTIONS as readonly string[]).includes(value)
}

function restoreWindowScroll(scrollY: number) {
  const root = document.documentElement
  const previousScrollBehavior = root.style.scrollBehavior

  root.style.scrollBehavior = "auto"
  window.scrollTo(0, scrollY)
  root.style.scrollBehavior = previousScrollBehavior
}

function Site() {
  // Server rendering has no URL hash, so the first client render must match
  // this value; the mount effect below applies the hash immediately after.
  const [activeSection, setActiveSection] = useState<SectionId>("home")
  const [workView, setWorkView] = useState<WorkView>({ kind: "overview" })
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)
  const overviewReturnRef = useRef({ scrollY: 0, focusId: "" })
  const clientReturnRef = useRef({ scrollY: 0, focusId: "" })
  const pendingRestoreRef = useRef<{ scrollY: number; focusId?: string } | null>(null)
  const workReadingMode = isWorkReadingView(workView)
  const workChapters = getWorkChapters(workView)

  useBrowserLayoutEffect(() => {
    const pending = pendingRestoreRef.current
    if (!pending) return

    pendingRestoreRef.current = null
    restoreWindowScroll(pending.scrollY)

    if (pending.focusId) {
      document.getElementById(pending.focusId)?.focus({ preventScroll: true })
    }
  }, [workView])

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

      setActiveSection((current) => {
        return current === nextActive ? current : nextActive
      })
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
      if (isSectionId(hash)) {
        setActiveSection(hash)
      }

      scheduleUpdate()
    }

    syncHashSection()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)
    window.addEventListener("hashchange", syncHashSection)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }

      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
      window.removeEventListener("hashchange", syncHashSection)
    }
  }, [workReadingMode])

  const openWorkView = (nextView: WorkView, originId: string) => {
    if (workView.kind === "overview") {
      overviewReturnRef.current = { scrollY: window.scrollY, focusId: originId }
    } else if (workView.kind === "client-index") {
      clientReturnRef.current = { scrollY: window.scrollY, focusId: originId }
    }

    pendingRestoreRef.current = { scrollY: 0, focusId: "work-document-title" }
    setActiveSection("work")
    setActiveChapterId(getWorkChapters(nextView)[0]?.id ?? null)
    setWorkView(nextView)
  }

  const returnFromWorkView = () => {
    if (workView.kind === "client-case") {
      pendingRestoreRef.current = clientReturnRef.current
      setActiveChapterId(null)
      setWorkView({ kind: "client-index" })
      return
    }

    pendingRestoreRef.current = overviewReturnRef.current
    setActiveChapterId(null)
    setWorkView({ kind: "overview" })
  }

  const selectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId)
    document.getElementById(chapterId)?.scrollIntoView({ block: "start", behavior: "auto" })
  }

  return (
    <div className="page-shell bg-void text-chalk font-sans min-h-screen overflow-x-hidden">
      <Nav
        activeSection={workReadingMode ? "work" : activeSection}
        workView={workView}
        chapters={workChapters}
        activeChapterId={activeChapterId}
        onWorkBack={returnFromWorkView}
        onChapterSelect={selectChapter}
      />
      {workReadingMode ? (
        <WorkSection
          view={workView}
          onOpenView={openWorkView}
          onActiveChapterChange={setActiveChapterId}
        />
      ) : (
        <>
          <HomeSection />
          <WorkSection
            view={workView}
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

export default function App({ locale = "en" }: { locale?: Locale }) {
  return (
    <ContentProvider locale={locale}>
      <Site />
    </ContentProvider>
  )
}
