export type WorkView =
  | { kind: "overview" }
  | { kind: "case"; id: "midnight-persona" | "ecommerce" }
  | { kind: "client-index" }
  | { kind: "client-case"; id: "leadflowai" }

export type WorkChapter = {
  id: string
  label: string
  desktopLabel?: string
}

export const MIDNIGHT_CHAPTERS: WorkChapter[] = [
  { id: "product", label: "01 / PRODUCT", desktopLabel: "01 PRODUCT" },
  { id: "dialogue", label: "02 / DIALOGUE ENGINE", desktopLabel: "02 DIALOGUE" },
  { id: "engineering", label: "03 / ENGINEERING", desktopLabel: "03 ENGINEERING" },
  {
    id: "generative-media",
    label: "04 / GENERATIVE MEDIA",
    desktopLabel: "04 MEDIA",
  },
  { id: "art-direction", label: "05 / ART DIRECTION", desktopLabel: "05 ART DIRECTION" },
]

export function getWorkChapters(view: WorkView): WorkChapter[] {
  return view.kind === "case" && view.id === "midnight-persona"
    ? MIDNIGHT_CHAPTERS
    : []
}

export function isWorkReadingView(view: WorkView): boolean {
  return view.kind !== "overview"
}
