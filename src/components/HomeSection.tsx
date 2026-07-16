export default function HomeSection() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col lg:grid lg:grid-cols-[58fr_42fr] relative"
    >
      {/* Left: text content */}
      <div className="flex flex-col justify-center px-8 md:px-14 lg:pl-20 lg:pr-12 pt-20 pb-16 lg:py-24">

        {/* Name — single line on desktop */}
        <h1 className="text-[clamp(2.4rem,4.2vw,3.8rem)] font-light leading-[0.95] tracking-[-0.025em] mb-4 text-chalk lg:whitespace-nowrap">
          Nikolai Sekushenko
        </h1>

        {/* Role — Courier Prime, strong */}
        <div className="font-mono text-[clamp(0.75rem,1.3vw,1.05rem)] tracking-[0.28em] text-fog-light uppercase mb-10 lg:mb-12">
          AI PRODUCT ENGINEER
        </div>

        {/* Headline */}
        <p className="text-[clamp(1rem,1.6vw,1.3rem)] leading-[1.55] text-chalk font-light max-w-[520px] mb-6">
          From a Siberian semiconductor lab to a $1.5M e-commerce business
          and conversational AI.
        </p>

        {/* Offer text */}
        <p className="text-[clamp(0.875rem,1.1vw,0.975rem)] leading-[1.85] text-fog-light max-w-[460px] mb-14 lg:mb-16">
          Give me a messy problem at the intersection of AI, product, and business.
          <br />
          I'll figure out what actually matters, build the system, and ship it.
        </p>

        {/* Buttons — Courier Prime bracket style */}
        <div className="flex flex-wrap items-center gap-5">
          <button
            onClick={() => scrollTo('work')}
            className="font-mono text-[12px] tracking-[0.22em] text-chalk border border-chalk/35 px-6 py-3 hover:bg-chalk/5 hover:border-chalk/60 transition-all duration-200 cursor-pointer"
          >
            [ VIEW WORK ]
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="font-mono text-[12px] tracking-[0.22em] text-fog border border-fog/25 px-6 py-3 hover:border-fog/50 hover:text-fog-light transition-all duration-200 cursor-pointer"
          >
            [ ABOUT ME ]
          </button>
        </div>
      </div>

      {/* Right: portrait — quiet, merges into background */}
      <div className="relative lg:h-full h-[55vw] min-h-[300px] order-first lg:order-last overflow-hidden">
        <div className="absolute inset-0 bg-surface" />

        {/* Bleed fades */}
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-void to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent z-10" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-void to-transparent z-10" />

        {/* Placeholder label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="font-mono text-[9px] tracking-[0.35em] text-fog/25 uppercase mb-2">
            Portrait
          </span>
          <span className="font-mono text-[8px] tracking-[0.2em] text-fog/18 uppercase">
            B&amp;W · waist-up
          </span>
        </div>
      </div>
    </section>
  )
}
