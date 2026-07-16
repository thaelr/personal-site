function MediaPlaceholder({
  label,
  sublabel,
  aspect = 'aspect-[16/7]',
}: {
  label: string
  sublabel?: string
  aspect?: string
}) {
  return (
    <div className={`w-full ${aspect} bg-surface relative overflow-hidden`}>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#edeae3 1px, transparent 1px), linear-gradient(90deg, #edeae3 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="font-mono text-[10px] tracking-[0.25em] text-fog/40 uppercase">
          {label}
        </span>
        {sublabel && (
          <span className="font-mono text-[9px] tracking-[0.2em] text-fog/25 uppercase">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}

function DocumentPreview({ title }: { title: string }) {
  return (
    <div className="border-t border-rule pt-5 mt-2">
      <div className="flex items-start gap-5">
        {/* Doc icon */}
        <div className="shrink-0 w-9 h-11 bg-surface border border-dim flex items-end justify-center pb-1 relative">
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[10px] border-b-[10px] border-l-void border-b-dim" />
          <span className="font-mono text-[7px] text-fog/50 tracking-widest">PDF</span>
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] tracking-[0.18em] text-fog/60 uppercase mb-1">
            Case Study
          </div>
          <div className="text-[0.8rem] text-fog-light leading-tight">{title}</div>
          <div className="font-mono text-[9px] text-fog/40 mt-2 tracking-wider">
            — document placeholder, PDF will be attached
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({
  value,
  label,
  note,
}: {
  value: string
  label: string
  note?: string
}) {
  return (
    <div className="border-l border-rule pl-5 py-1">
      <div className="text-[2rem] font-light text-chalk leading-none tracking-tight mb-1">
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-[0.16em] text-fog uppercase">
        {label}
      </div>
      {note && (
        <div className="font-mono text-[9px] text-fog/45 mt-1 italic">{note}</div>
      )}
    </div>
  )
}

export default function WorkSection() {
  return (
    <section id="work" className="py-24 lg:py-32 border-t border-rule">
      <div className="px-8 md:px-14 lg:pl-20 lg:pr-44">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <div className="font-mono text-[clamp(2.8rem,4.5vw,4rem)] font-bold text-chalk/10 leading-none tracking-tight mb-2">
            02
          </div>
          <div className="font-mono text-[11px] tracking-[0.28em] text-fog uppercase">
            WORK
          </div>
        </div>

        {/* ── PROJECT 01 ── */}
        <div className="mb-28 lg:mb-36">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-fog/60 uppercase mb-3">
                01 / Conversational AI · Product
              </div>
              <h2 className="text-[clamp(2rem,3.8vw,3.2rem)] font-light leading-[1.05] tracking-[-0.02em] text-chalk max-w-[520px]">
                Conversational AI Product
              </h2>
            </div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-fog/50 uppercase hidden md:block">
              2023 – 2024
            </div>
          </div>

          {/* Description */}
          <div className="grid lg:grid-cols-[1fr_1fr] gap-x-16 gap-y-8 mb-14">
            <p className="text-[0.875rem] leading-[1.8] text-fog-light max-w-[480px]">
              Full-cycle development of a customer-facing conversational AI product. Responsible
              for defining the product strategy, designing the conversation architecture,
              integrating language models, and owning the quality loop from launch
              through iteration. Placeholder description — final copy to follow.
            </p>
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8 items-start">
              <Metric value="—" label="Metric placeholder" note="context TBD" />
              <Metric value="—" label="Metric placeholder" note="context TBD" />
              <Metric value="—" label="Metric placeholder" note="context TBD" />
            </div>
          </div>

          {/* Technical diagram area */}
          <div className="mb-8">
            <div className="font-mono text-[9px] tracking-[0.22em] text-fog/40 uppercase mb-3">
              Technical diagram / Chart
            </div>
            <MediaPlaceholder
              label="Technical diagram placeholder"
              sublabel="Architecture · Flow · Chart"
              aspect="aspect-[16/7]"
            />
          </div>

          {/* Document preview */}
          <DocumentPreview title="Conversational AI Product — Case Study Presentation" />
        </div>

        {/* Thin divider between projects */}
        <div className="w-full h-px bg-rule mb-28 lg:mb-36" />

        {/* ── PROJECT 02 ── */}
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-fog/60 uppercase mb-3">
                02 / B2B · Conversational Automation
              </div>
              <h2 className="text-[clamp(2rem,3.8vw,3.2rem)] font-light leading-[1.05] tracking-[-0.02em] text-chalk max-w-[540px]">
                B2B Conversational Automation
              </h2>
            </div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-fog/50 uppercase hidden md:block">
              2024 – 2025
            </div>
          </div>

          {/* Split: text + media side by side on desktop */}
          <div className="grid lg:grid-cols-[2fr_3fr] gap-x-14 gap-y-8 mb-8 items-start">
            <div>
              <p className="text-[0.875rem] leading-[1.8] text-fog-light mb-6">
                End-to-end automation of business communication workflows using
                conversational AI. Designed the system architecture, defined
                integration patterns with client infrastructure, and led the
                product from pilot to multi-client deployment.
                Placeholder description — final copy to follow.
              </p>
              <div className="font-mono text-[10px] tracking-[0.16em] text-fog/50">
                B2B · Workflow automation · Multi-tenant
              </div>
            </div>

            {/* System-flow diagram area */}
            <div>
              <div className="font-mono text-[9px] tracking-[0.22em] text-fog/40 uppercase mb-3">
                System-flow diagram
              </div>
              <MediaPlaceholder
                label="System-flow diagram placeholder"
                sublabel="Integration · Architecture · Automation flow"
                aspect="aspect-[16/9]"
              />
            </div>
          </div>

          {/* Document preview */}
          <DocumentPreview title="B2B Conversational Automation — Case Study Presentation" />
        </div>
      </div>
    </section>
  )
}
