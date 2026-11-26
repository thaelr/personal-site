export type Locale = "en" | "ru"

export type SectionId = "home" | "work" | "about" | "contact"

export type ChapterId = "physics" | "procurement" | "ecommerce" | "ai"

export type WorkCaseSlug = "case-01" | "case-02"

export type ContactChannelId =
  | "email"
  | "whatsapp"
  | "telegram"
  | "linkedin"
  | "github"

/** Text fragment that may be highlighted or force a line break. */
export type InlinePart = {
  text: string
  highlight?: boolean
  breakBefore?: boolean
  breakAfter?: boolean
}

export type WorkTagContent = {
  text: string
  statusIndicator?: boolean
}

export type MetricContent = {
  title: string
  description: string
}

export type CapabilityContent = {
  title: string
  description: string
}

export type WorkCaseContent = {
  slug: WorkCaseSlug
  index: string
  title: string
  tags: WorkTagContent[]
  lead: string
  statement: InlinePart[]
  body: string[]
  metrics?: MetricContent[]
  capabilities?: CapabilityContent[]
}

export type ECommerceStepContent = {
  title: string
  paragraphs: string[]
  note?: string
  compact?: boolean
  drips?: boolean
}

export type AiProductContent = {
  label: string
  paragraphs: string[]
}

export type AboutChapterContent = {
  id: ChapterId
  eyebrow: string
  title: string
  summary?: InlinePart[]
  tags?: string[]
  intro?: string[]
  callouts?: string[]
  followup?: string[]
  lifecycleLabel?: string
  lifecycleItems?: string[]
  asideReveal?: {
    buttonText: string
    revealedText: string
  }
  steps?: ECommerceStepContent[]
  authorComment?: string[]
  products?: AiProductContent[]
}

export type SiteContent = {
  meta: {
    title: string
    description: string
  }
  nav: {
    ariaLabel: string
    items: Record<SectionId, string>
  }
  home: {
    name: string
    badge: string
    careerLines: string[]
    offerWideLines: string[]
    offerCompactLine: string
    actions: {
      work: string
      about: string
    }
    portraitAlt: string
  }
  work: {
    index: {
      id: "midnight-persona" | "ecommerce" | "client-work"
      index: string
      title: string
      description: string
      caseIntro?: string[]
      metrics: { value: string; label: string }[]
      status?: { label: string; value: string }
    }[]
    eyebrow: string
    title: string
    intro: string
    chartAlt: string
    cases: WorkCaseContent[]
    linkLabels: {
      presentation: string
      github: string
    }
    notice: {
      title: string
      paragraphs: string[]
      okay: string
      close: string
    }
  }
  about: {
    eyebrow: string
    title: string
    introLines: string[]
    chapters: AboutChapterContent[]
    chapterToggle: {
      expand: string
      collapse: string
    }
    best: {
      title: string
      tags: WorkTagContent[]
      paragraphs: string[]
    }
  }
  contact: {
    eyebrow: string
    cta: string
    channelLabels: Record<ContactChannelId, string>
  }
}
