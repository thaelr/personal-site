import type {
  ChapterId,
  ContactChannelId,
  SectionId,
  WorkCaseSlug,
} from "./types"

/** Section order, ids and numbering are part of the URL/anchors contract. */
export const SECTIONS = ["home", "work", "about", "contact"] as const

export const SECTION_NUMBERS: Record<SectionId, string> = {
  home: "01",
  work: "02",
  about: "03",
  contact: "04",
}

/** Career chapter order, ids and progress values are structural. */
export const CHAPTER_ORDER = ["physics", "procurement", "ecommerce", "ai"] as const

export const CHAPTER_PROGRESS: Record<ChapterId, number> = {
  physics: 0.25,
  procurement: 0.5,
  ecommerce: 0.75,
  ai: 1,
}

export const WORK_CASE_ORDER = ["case-01", "case-02"] as const

/** External destinations are locale-independent. */
export const WORK_CASE_LINKS: Record<
  WorkCaseSlug,
  { presentation: string; github: string }
> = {
  "case-01": {
    presentation:
      "https://github.com/thaelr/stateful-conversation-engine/releases/download/v1/Dialogue-Engine-Architecture.pdf",
    github: "https://github.com/thaelr/stateful-conversation-engine",
  },
  "case-02": {
    presentation:
      "https://github.com/thaelr/LeadFlowAI/releases/download/v1/LeadFlow-AI-Product-Overview.pdf",
    github: "https://github.com/thaelr/LeadFlowAI",
  },
}

export const CONTACT_CHANNELS: {
  id: ContactChannelId
  value: string
  href?: string
}[] = [
  { id: "email", value: "shenko.nik@gmail.com", href: "mailto:shenko.nik@gmail.com" },
  { id: "whatsapp", value: "+84375216093", href: "https://wa.me/84375216093" },
  { id: "telegram", value: "@Taabler", href: "https://t.me/Taabler" },
  {
    id: "linkedin",
    value: "linkedin.com/in/nikolai-sekushenko",
    href: "https://www.linkedin.com/in/nikolai-sekushenko/",
  },
  { id: "github", value: "github.com/thaelr", href: "https://github.com/thaelr" },
]
