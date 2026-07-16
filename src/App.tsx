import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import HomeSection from './components/HomeSection'
import WorkSection from './components/WorkSection'
import AboutSection from './components/AboutSection'
import ContactSection from './components/ContactSection'

const SECTIONS = ['home', 'work', 'about', 'contact']

export default function App() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    SECTIONS.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <div className="bg-void text-chalk font-sans min-h-screen">
      <Nav activeSection={activeSection} />
      <HomeSection />
      <WorkSection />
      <AboutSection />
      <ContactSection />
    </div>
  )
}
