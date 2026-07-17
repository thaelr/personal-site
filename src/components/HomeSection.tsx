import heroPortrait from "../hero-portrait.png"

type HeroButtonProps = {
  label: string
  targetId: string
}

function HeroButton({ label, targetId }: HeroButtonProps) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <button
      onClick={() => scrollTo(targetId)}
      className="hero-cta font-mono text-[12px] tracking-[0.22em] uppercase"
    >
      <span
        aria-hidden="true"
        className="hero-cta__bracket hero-cta__bracket--left"
      >
        [
      </span>
      <span className="hero-cta__label">{label}</span>
      <span
        aria-hidden="true"
        className="hero-cta__bracket hero-cta__bracket--right"
      >
        ]
      </span>
    </button>
  )
}

export default function HomeSection() {
  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="relative z-20 flex flex-col justify-center px-8 pb-14 pt-24 md:px-14 lg:pl-20 lg:pr-4 lg:pb-16 lg:pt-16">
          <h1 className="mb-5 max-w-[7ch] text-[clamp(3.6rem,7.2vw,7rem)] font-light leading-[0.86] tracking-[-0.045em] text-chalk">
            <span className="block">Nikolai</span>
            <span className="block">Sekushenko</span>
          </h1>

          <div className="mb-10 inline-flex w-fit rounded-[4px] bg-surface px-3 py-2 font-mono text-[clamp(0.7rem,0.9vw,0.9rem)] tracking-[0.28em] text-fog-light uppercase">
            AI PRODUCT ENGINEER
          </div>

          <div className="max-w-[34rem]">
            <p className="mb-6 max-w-[31rem] text-[clamp(1rem,1.45vw,1.28rem)] font-light leading-[1.5] text-chalk">
              From a Siberian semiconductor lab to a $1.5M e-commerce business
              and conversational AI products.
            </p>

            <p className="max-w-[29rem] text-[clamp(0.92rem,1.08vw,1rem)] leading-[1.82] text-fog-light">
              Give me a messy problem at the intersection of AI, product, and
              business. I’ll figure out what actually matters, build the system,
              and ship it.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-7">
            <HeroButton label="VIEW WORK" targetId="work" />
            <HeroButton label="ABOUT ME" targetId="about" />
          </div>
        </div>

        <div className="relative min-h-[22rem] overflow-hidden px-3 pb-3 pt-0 sm:px-5 sm:pb-5 lg:min-h-[100svh] lg:px-0 lg:pb-0">
          <div className="hero-portrait-shell relative h-[min(92vw,42rem)] min-h-[22rem] w-full lg:h-full lg:min-h-[100svh]">
            <div className="absolute inset-0 bg-[#070606]" />
            <img
              src={heroPortrait}
              alt="Black-and-white portrait of Nikolai Sekushenko"
              className="hero-portrait-image absolute inset-0 h-full w-full object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
