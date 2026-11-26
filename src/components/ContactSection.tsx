import { useState } from "react"
import { useSiteContent } from "../content"
import { CONTACT_CHANNELS } from "../content/structure"

export default function ContactSection() {
  const { contact } = useSiteContent()
  const [active, setActive] = useState(false)

  return (
    <section id="contact" className="contact-section">
      <div className="contact-section__inner">
        <div className="contact-section__grid">
          <div className="contact-section__cta-wrap">
            <button
              type="button"
              className="contact-cta"
              aria-pressed={active}
              onClick={() => setActive((current) => !current)}
            >
              <span className="contact-cta__lamp" aria-hidden="true" />
              <span className="contact-cta__text">{contact.cta}</span>
            </button>
          </div>

          <div className="contact-section__links-wrap">
            <ul className="contact-section__links-list">
              {CONTACT_CHANNELS.map((channel) => (
                <li key={channel.id} className="contact-section__links-item">
                  <span className="contact-section__links-label">
                    {contact.channelLabels[channel.id]}:
                  </span>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      className="contact-section__link"
                      target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    >
                      {channel.value}
                    </a>
                  ) : (
                    <span className="contact-section__link-text">{channel.value}</span>
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
