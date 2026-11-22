import { useState, useEffect } from "react"
import Nav from "./components/Nav"
import HomeSection from "./components/HomeSection"
import WorkSection from "./components/WorkSection"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"
import { ContentProvider } from "./content"
import { SECTIONS } from "./content/structure"
import type { Locale, SectionId } from "./content/types"

function isSectionId(value: string): value is SectionId {
  return (SECTIONS as readonly string[]).includes(value)
}

function Site() {
  // Server rendering has no URL hash, so the first client render must match
  // this value; the mount effect below applies the hash immediately after.
  const [activeSection, setActiveSection] = useState<SectionId>("home")

  useEffect(() => {
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
  }, [])

  return (
    <div className="page-shell bg-void text-chalk font-sans min-h-screen overflow-x-hidden">
      <Nav activeSection={activeSection} />
      <HomeSection />
      <WorkSection />
      <AboutSection />
      <ContactSection />
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
