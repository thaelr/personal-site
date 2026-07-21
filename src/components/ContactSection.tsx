import { useState } from "react"

type ContactLink = {
  label: string
  value: string
  href?: string
}

const CONTACT_LINKS: ContactLink[] = [
  {
    label: "E-mail",
    value: "shenko.nik@gmail.com",
    href: "mailto:shenko.nik@gmail.com",
  },
  {
    label: "Whatsapp",
    value: "+84375216093",
    href: "https://wa.me/84375216093",
  },
  {
    label: "Telegram",
    value: "@Taabler",
    href: "https://t.me/Taabler",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/nikolai-sekushenko",
    href: "https://www.linkedin.com/in/nikolai-sekushenko/",
  },
  {
    label: "Github",
    value: "github.com/thaelr",
    href: "https://github.com/thaelr",
  },
]

export default function ContactSection() {
  const [active, setActive] = useState(false)

  return (
    <section id="contact" className="contact-section">
      <div className="contact-section__inner">
        <div className="contact-section__grid">
          <div className="contact-section__eyebrow">
            GET IN TOUCH / PRODUCTS, SYSTEMS, AND INTEGRATION
          </div>

          <div className="contact-section__cta-wrap">
            <button
              type="button"
              className="contact-cta"
              aria-pressed={active}
              onClick={() => setActive((current) => !current)}
            >
              <span className="contact-cta__lamp" aria-hidden="true" />
              <span className="contact-cta__text">LET&apos;S BUILD SOMETHING DIFFICULT</span>
            </button>
          </div>

          <div className="contact-section__links-wrap">
            <ul className="contact-section__links-list">
              {CONTACT_LINKS.map((link) => (
                <li key={link.label} className="contact-section__links-item">
                  <span className="contact-section__links-label">{link.label}:</span>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="contact-section__link"
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    >
                      {link.value}
                    </a>
                  ) : (
                    <span className="contact-section__link-text">{link.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
