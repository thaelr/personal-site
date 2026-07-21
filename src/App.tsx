import { useState, useEffect } from "react"
import Nav from "./components/Nav"
import HomeSection from "./components/HomeSection"
import WorkSection from "./components/WorkSection"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"

const SECTIONS = ["home", "work", "about", "contact"] as const

export default function App() {
  const [activeSection, setActiveSection] = useState(() => {
    const hash = window.location.hash.replace("#", "")
    return SECTIONS.includes(hash) ? hash : "home"
  })

  useEffect(() => {
    const sections = SECTIONS
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (!sections.length) return

    let frameId = 0

    const updateActiveSection = () => {
      const controlLine = window.innerHeight * 0.25
      const nextActive =
        sections.find((section) => {
          const rect = section.getBoundingClientRect()
          return rect.top <= controlLine && rect.bottom >= controlLine
        })?.id ??
        (controlLine < sections[0].getBoundingClientRect().top
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
      if (SECTIONS.includes(hash as (typeof SECTIONS)[number])) {
        setActiveSection(hash)
      }

      scheduleUpdate()
    }

    scheduleUpdate()
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
