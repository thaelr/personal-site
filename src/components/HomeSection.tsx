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
      <div className="absolute left-0 top-0 hidden h-full w-1 bg-[#2d4428] lg:block" />
      <div className="absolute inset-x-0 top-0 hidden h-[11rem] bg-[linear-gradient(180deg,rgba(19,19,17,0.88)_0%,rgba(19,19,17,0.34)_54%,rgba(19,19,17,0)_100%)] lg:block" />

      <div className="relative mx-auto min-h-[100svh] max-w-[1440px] px-8 pb-14 pt-24 md:px-14 lg:px-0 lg:pb-0 lg:pt-0">
        <div className="relative min-h-[100svh] lg:h-[1024px] lg:min-h-[100svh]">
          <div className="relative z-20 flex flex-col justify-center lg:absolute lg:left-[112px] lg:top-[160px] lg:max-w-[850px]">
            <h1 className="mb-6 text-[clamp(3.6rem,7.1vw,5.1rem)] font-light leading-[0.92] tracking-[-0.045em] text-chalk lg:mb-7 lg:whitespace-nowrap">
              <span className="block lg:inline">Nikolai</span>
              <span className="block lg:ml-[0.22em] lg:inline">Sekushenko</span>
            </h1>

            <div className="mb-16 inline-flex w-fit rounded-[4px] bg-[#2e2e2c] px-8 py-3 font-mono text-[clamp(0.72rem,1vw,0.98rem)] tracking-[0.16em] text-chalk uppercase lg:mb-[5.8rem]">
              AI PRODUCT ENGINEER
            </div>

            <div className="max-w-[53rem]">
              <p className="mb-7 max-w-[34rem] text-[clamp(1.3rem,2.1vw,1.62rem)] font-light leading-[1.28] text-chalk lg:mb-8">
                From a Siberian semiconductor lab to a $1.5M e-commerce
                business and conversational AI products.
              </p>

              <p className="max-w-[33rem] text-[clamp(1.02rem,1.36vw,1.18rem)] leading-[1.42] text-chalk-dim">
                Give me a messy problem at the intersection of AI, product, and
                business. I’ll figure out what actually matters, build the
                system, and ship it.
              </p>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-7 lg:mt-[4.2rem] lg:gap-[4.8rem]">
              <HeroButton label="VIEW WORK" targetId="work" />
              <HeroButton label="ABOUT ME" targetId="about" />
            </div>
          </div>

          <div className="relative mt-12 min-h-[24rem] overflow-hidden lg:absolute lg:right-[57px] lg:top-[59px] lg:mt-0 lg:h-[693px] lg:w-[693px]">
            <div className="hero-portrait-shell relative h-[min(96vw,40rem)] min-h-[24rem] w-full lg:h-full">
              <img
                src={heroPortrait}
                alt="Black-and-white portrait of Nikolai Sekushenko"
                className="hero-portrait-image absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
