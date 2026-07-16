import { useState } from 'react'

interface Chapter {
  id: string
  num: string
  title: string
  company: string
  dates: string
  takeaway: string
  metric: string
  annotation?: string
  annotationRotate?: string
  paragraphs: string[]
}

const CHAPTERS: Chapter[] = [
  {
    id: 'chapter-1',
    num: '01',
    title: 'The Rzhanov Institute in Siberia',
    company: 'Institute of Catalysis, SB RAS',
    dates: '2018 – 2020',
    takeaway: 'First encounter with research infrastructure and experimental data systems.',
    metric: '14 months on-site',
    annotation: '← cold, methodical, and worth it',
    annotationRotate: '-2deg',
    paragraphs: [
      'Placeholder paragraph one. This is where full narrative text about the Rzhanov Institute period will appear when expanded. The work involved research processes, data handling, and an introduction to scientific infrastructure.',
      'Placeholder paragraph two. Additional context about the formative period, key learnings, and how this experience shaped subsequent professional choices.',
      'Placeholder paragraph three. A concluding observation on what this chapter meant in the overall arc of the career.',
    ],
  },
  {
    id: 'chapter-2',
    num: '02',
    title: 'Supplying the State',
    company: 'State procurement / government supply chain',
    dates: '2019 – 2021',
    takeaway: 'Learned how large organizations actually move, decide, and get stuck.',
    metric: '₽ — procurement volume, TBD',
    annotation: 'this is where logistics stopped being abstract',
    annotationRotate: '1.5deg',
    paragraphs: [
      'Placeholder paragraph one. Full account of the state-supply period: procurement complexity, stakeholder navigation, and understanding institutional decision-making from the inside.',
      'Placeholder paragraph two. Specific learnings about operational constraints, timeline pressures, and working within bureaucratic systems.',
      'Placeholder paragraph three. How this translated into later product instincts — especially around feasibility and delivery risk.',
    ],
  },
  {
    id: 'chapter-3',
    num: '03',
    title: 'E-commerce in a Wartime Economy',
    company: 'E-commerce operations',
    dates: '2021 – 2025',
    takeaway: 'Operated under genuine uncertainty. Kept things running. Learned when to cut.',
    metric: '4 years · high volatility',
    annotation: '← first time managing a real deadline',
    annotationRotate: '-1.8deg',
    paragraphs: [
      'Placeholder paragraph one. This period covers operating an e-commerce business during a period of severe economic disruption. Supply chains, currency volatility, and demand unpredictability were constant factors.',
      'Placeholder paragraph two. Product and operational decisions made under real pressure. What worked, what failed, and what stayed permanently in the decision-making toolkit.',
      'Placeholder paragraph three. The transition from running operations to building AI products: how accumulated operational instincts informed a new direction.',
    ],
  },
]

function AccordionChapter({ chapter }: { chapter: Chapter }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-rule">
      <button
        className="w-full text-left py-7 lg:py-8 group cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-6 items-start">
          {/* Chapter number */}
          <span className="font-mono text-[11px] text-fog/50 tracking-[0.18em] pt-[3px]">
            {chapter.num}
          </span>

          {/* Main content */}
          <div>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-6 mb-2">
              <h3 className="text-[1.2rem] font-normal leading-snug text-chalk group-hover:text-chalk transition-colors">
                {chapter.title}
              </h3>
              <span className="font-mono text-[10px] tracking-[0.16em] text-fog/60 uppercase mt-1 md:mt-0">
                {chapter.dates}
              </span>
            </div>
            <div className="font-mono text-[10px] tracking-[0.14em] text-fog/50 mb-3">
              {chapter.company}
            </div>
            <div className="text-[0.82rem] text-fog-light leading-relaxed max-w-[520px]">
              {chapter.takeaway}
            </div>
            {/* Metric */}
            <div className="font-mono text-[10px] tracking-[0.16em] text-fog/45 mt-3 italic">
              {chapter.metric}
            </div>
          </div>

          {/* Expand indicator */}
          <div className="font-mono text-[11px] text-fog/50 group-hover:text-fog-light transition-colors pt-[3px] select-none">
            {open ? '−' : '+'}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="pl-[calc(1.5ch+24px)] pb-10 relative">
          {chapter.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-[0.86rem] leading-[1.85] text-fog-light max-w-[560px] mb-5 last:mb-0"
            >
              {p}
            </p>
          ))}

          {/* Annotation */}
          {chapter.annotation && (
            <div
              className="absolute right-8 bottom-8 font-mono text-[10px] italic text-fog/35 hidden lg:block"
              style={{ transform: `rotate(${chapter.annotationRotate})` }}
            >
              {chapter.annotation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Annotation({
  text,
  rotate,
  className = '',
}: {
  text: string
  rotate: string
  className?: string
}) {
  return (
    <div
      className={`font-mono text-[10px] italic text-fog/30 hidden lg:block absolute ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      {text}
    </div>
  )
}

export default function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 border-t border-rule">
      <div className="px-8 md:px-14 lg:pl-20 lg:pr-44">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <div className="font-mono text-[clamp(2.8rem,4.5vw,4rem)] font-bold text-chalk/10 leading-none tracking-tight mb-2">
            03
          </div>
          <div className="font-mono text-[11px] tracking-[0.28em] text-fog uppercase">
            ABOUT
          </div>
        </div>

        {/* Career chapters accordion */}
        <div className="relative max-w-[780px] mb-20 lg:mb-28">
          <div className="font-mono text-[10px] tracking-[0.2em] text-fog/40 uppercase mb-10">
            Earlier chapters
          </div>

          {/* Annotation: scattered note near accordion */}
          <div className="relative">
            <Annotation
              text="← things I actually learned"
              rotate="-1.5deg"
              className="right-[-60px] top-[30px]"
            />
            {CHAPTERS.map(ch => (
              <AccordionChapter key={ch.id} chapter={ch} />
            ))}
            <div className="border-t border-rule" />
          </div>
        </div>

        {/* ── CURRENT CAREER BLOCK ── */}
        <div className="relative max-w-[780px] mb-20 lg:mb-28">
          {/* Annotation */}
          <Annotation
            text="still building"
            rotate="2deg"
            className="right-[-40px] top-[60px]"
          />

          <div className="mb-8">
            <div className="font-mono text-[10px] tracking-[0.2em] text-fog/60 uppercase mb-3">
              Current
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-8 mb-6">
              <h3 className="text-[clamp(1.6rem,3vw,2.6rem)] font-light leading-snug text-chalk tracking-[-0.015em]">
                AI Product Engineer
              </h3>
              <span className="font-mono text-[11px] tracking-[0.16em] text-fog/60">
                2025 – Present
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[3fr_2fr] gap-x-16 gap-y-8 mb-12">
            <div>
              <p className="text-[0.875rem] leading-[1.85] text-fog-light mb-5">
                Placeholder text for the current career block. Full narrative will describe
                the scope of current work: what kinds of AI products, what role in
                the process, what distinguishes this phase from earlier periods.
              </p>
              <p className="text-[0.875rem] leading-[1.85] text-fog-light mb-5">
                Second paragraph placeholder. More detail on current responsibilities,
                the types of problems being solved, and the environment in which
                the work takes place. End-to-end ownership, product thinking, technical depth.
              </p>
              <p className="text-[0.875rem] leading-[1.85] text-fog-light">
                Third paragraph placeholder. A reflection on where things are heading —
                the ambition, the current focus, and what success looks like in
                this role.
              </p>
            </div>

            {/* Current metrics */}
            <div className="space-y-6">
              <div className="font-mono text-[9px] tracking-[0.22em] text-fog/40 uppercase mb-4">
                Current metrics
              </div>
              {[
                { v: '—', l: 'Metric placeholder', n: 'TBD' },
                { v: '—', l: 'Metric placeholder', n: 'TBD' },
                { v: '—', l: 'Metric placeholder', n: 'TBD' },
              ].map((m, i) => (
                <div key={i} className="border-l border-rule pl-5">
                  <div className="text-[1.6rem] font-light text-chalk leading-none tracking-tight mb-1">
                    {m.v}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.16em] text-fog uppercase">
                    {m.l}
                  </div>
                  <div className="font-mono text-[8px] text-fog/40 mt-1 italic">{m.n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Annotation near current block */}
          <Annotation
            text="every metric above will be real"
            rotate="-1deg"
            className="right-0 bottom-[-30px]"
          />
        </div>

        {/* ── WHAT I DO BEST ── */}
        <div className="max-w-[780px]">
          <div className="border-t border-rule pt-12 mb-12">
            <h3 className="text-[clamp(1.1rem,2vw,1.5rem)] font-light text-chalk tracking-[-0.01em]">
              What I Do Best
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16">
            {[
              {
                title: 'Product from zero',
                desc: 'Translating ambiguous problems into defined product scopes. Discovery, architecture decisions, and shipping — without needing a separate PM layer.',
              },
              {
                title: 'Conversational systems',
                desc: 'Designing conversation architectures that hold up under real user behavior. Not demos — products that handle edge cases.',
              },
              {
                title: 'Technical depth',
                desc: 'Enough engineering depth to make informed decisions about model integration, latency tradeoffs, and system design without outsourcing judgment.',
              },
              {
                title: 'Operating under pressure',
                desc: 'Comfortable making decisions with incomplete information. History of delivering in volatile, under-resourced environments.',
              },
            ].map((item, i) => (
              <div key={i} className="border-t border-rule py-8">
                <div className="text-[0.9rem] font-medium text-chalk mb-3 tracking-tight">
                  {item.title}
                </div>
                <p className="text-[0.82rem] leading-[1.8] text-fog-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
