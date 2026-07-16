const LINKS = [
  { label: 'Email', href: 'mailto:placeholder@example.com' },
  { label: 'Telegram', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Wellfound', href: '#' },
]

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="min-h-screen flex flex-col justify-between border-t border-rule py-24 lg:py-32"
    >
      <div className="px-8 md:px-14 lg:pl-20 lg:pr-44">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <div className="font-mono text-[clamp(2.8rem,4.5vw,4rem)] font-bold text-chalk/10 leading-none tracking-tight mb-2">
            04
          </div>
          <div className="font-mono text-[11px] tracking-[0.28em] text-fog uppercase">
            CONTACT
          </div>
        </div>

        {/* Main statement */}
        <div className="max-w-[760px] mb-20 lg:mb-28">
          <h2 className="text-[clamp(2.6rem,5.5vw,5.2rem)] font-light leading-[1.0] tracking-[-0.03em] text-chalk">
            Let's build
            <br />
            something difficult.
          </h2>
        </div>

        {/* Links */}
        <div className="pt-2">
          <div className="font-mono text-[10px] tracking-[0.28em] text-fog/40 uppercase mb-8">
            Reach out
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            {LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[13px] tracking-[0.2em] text-fog hover:text-chalk uppercase transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="px-8 md:px-14 lg:pl-20 lg:pr-44 mt-auto pt-16">
        <div className="border-t border-rule pt-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <span className="font-mono text-[9px] tracking-[0.2em] text-fog/30 uppercase">
            Nikolai Sekushenko — AI Product Engineer
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] text-fog/20 uppercase">
            Portfolio · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </section>
  )
}
