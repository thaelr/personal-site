# Personal Site — Agent Instructions

## Scope and status

These are permanent engineering instructions for coding agents working in `thaelr/personal-site`. They are not a request to change the site.

They apply to the entire repository. A concrete user task may define a narrower scope or an explicitly approved target state; it does not silently authorize unrelated changes.

## Responsibility boundary

- The artistic direction—composition, typographic emphasis, references, animation direction, and content—is approved outside the coding agent.
- Choose CSS, React structure, responsive behavior, accessibility details, and the smallest reliable implementation only inside a concrete approved task.
- Execute the approved direction. Do not act as a second art director, perform independent design research, seek more impressive references, invent unspecified states, or change UX according to personal taste.
- When an artistic choice is missing, stop only the affected part. Show the current observed behavior, identify the missing decision, and present only the minimum viable options. Continue independent, explicitly defined work where possible.
- Engineering freedom remains where multiple implementations produce the same observable result. Confirmed bugs inside the authorized scope may be fixed and verified.

## Source precedence

1. The current concrete task plus its approved target mockup, screenshot, or demo defines what must be produced. An explicit new decision overrides older documentation.
2. This `AGENTS.md` defines how to work.
3. The current local code defines existing technical contracts and behavior.
4. Art Direction & Design Principles, when supplied, provide constraints only. They are not a catalog of changes the agent may independently implement.
5. External references apply only to the specifically assigned element and behavior. A link does not authorize copying unrelated effects, colors, or structure.

If a required state is absent from the task, reference, or mockup, do not invent it. Pixel or motion comparison is valid only against an accessible version of the reference; otherwise state the limitation. Read external technical documentation only when needed for API or browser behavior, not to select a new artistic direction.

## Repository map

- `src/index.css`: grid, palette, typography, media queries, states, and animations.
- `src/App.tsx`: section composition, scroll tracking, and URL hash behavior.
- `src/components/Nav.tsx`: right-side desktop navigation and mobile navigation.
- `src/components/HomeSection.tsx`: hero, portrait, and bracketed CTAs.
- `src/components/WorkSection.tsx`: current WORK structure.
- `src/components/AboutSection.tsx`: disclosures, career geometry, and authored text reactions.
- `src/components/ContactSection.tsx`: contacts and CTA.
- `src/content/`: typed English/Russian content, structural IDs, ordering, and locale-independent destinations.
- `src/entry-server.tsx`, `scripts/prerender.mjs`, and `vite.ssr.config.ts`: build-time static rendering for `/` and `/ru/`.
- `package.json`, `vite.config.ts`, and `.github/workflows/deploy.yml`: inspect only when the task concerns dependencies, build, routing, preview, or publication.

Repository: <https://github.com/thaelr/personal-site>. The remote repository does not replace the current local branch. The public site is context for old behavior, not a new target design.

## Graphify workflow

- A local knowledge graph lives in `graphify-out/` and is generated, not source-controlled.
- When `graphify-out/graph.json` exists, use `graphify query`, `graphify path`, or `graphify explain` first for questions about architecture, dependencies, and cross-file relationships. Confirm implementation-critical facts in the current source before editing.
- The graph is a navigation aid, not product specification. The concrete task, this file, and current source take precedence.
- Use `graphify --update` after substantive code or documentation changes when an updated graph will help the current or next task. Do not rebuild it for every small edit.
- Do not use Graphify as a pretext for a full audit when the user requested a scoped change.
- Never commit generated `graphify-out/` artifacts unless the user explicitly asks for them to be shared.

## Preserve existing behavior and appearance

During a technical refactor without a separate design task, preserve:

- the existing composition, 10-column desktop grid, right navigation position, portrait, and HOME / WORK / ABOUT / CONTACT structure;
- text, metrics, links, block ordering, easter eggs, and nonstandard interactions;
- meaningful brackets, green states, and authored effects, even when they look unusual;
- keyboard and touch compatibility, active states, and address/hash navigation.

Do not independently add colors, surfaces, decorative borders, underlines, typography, icons, hover effects, scroll reveals, System Notices, sound, video or motion scenes, or components. Restraint in the base interface and absurdity in selected places is an artistic principle, not permission to create those places.

## CSS engineering

- Before changing CSS, determine which rule actually applies: cascade, specificity, media queries, layout, containing block, stacking context, overflow, and transforms.
- Fix the root cause. Do not accumulate unrelated overrides at the end of `src/index.css`, and do not hide overflow with a new global `overflow-x: hidden` workaround.
- Use Grid, Flexbox, subgrid, custom properties, and local selectors only when technically appropriate. Do not introduce CSS-in-JS, a new design system, a Tailwind migration, or a component library merely for organization.
- Preserve the contracts around `--layout-page-scale`, `--hero-scale`, `--work-scale`, and `--about-scale`; they currently couple geometry and type. A readability fix must not change the overall composition without an approved target state.
- Verify real reading and focus order around `display: contents`, `order`, accordions, fixed/sticky layers, and responsive rearrangement.
- Preserve physical continuity and performance in animations. Do not break `ResizeObserver` measurements or ABOUT scroll geometry. `prefers-reduced-motion` must retain functionality.

## Kinetics require a separate task

Bracket/Crosshair Interaction, Kinetic Disclosure, and Spatial Transition are possible future directions, not authorization to implement them.

If a task explicitly approves one mechanic, implement only that mechanic and only on the named elements. Compare against the assigned target, not an interpretation of words such as “fashion,” “premium,” or “more alive.” Do not add Motion, GSAP, a router, or another dependency without technical necessity inside the authorized scope.

Preserved reference for future tasks: <https://codefronts.com/motion/css-link-effects/crosshair-brackets/>. Do not implement it without a concrete task.

## Working procedure

1. Confirm the repository and branch, then run `git status --short` before changes. Preserve user changes.
2. Read only the concrete task and relevant source. For a complex task, give a short technical plan. If the task includes an approval gate, stop at that gate.
3. Confirm the defect symptom or current mechanics of the component being changed. Separate facts from hypotheses.
4. Change only files directly needed for the authorized task. Do not perform unrelated cleanup.
5. Verify observable behavior. For visual work, use a browser, real interactions, relevant viewport sizes, and the approved target when one exists. For technical fixes, verify no visual regression against the available baseline.
6. Run minimal proportional checks such as `typecheck`, build, or targeted tests when they exist and are relevant. A failing test is not a new specification; do not weaken assertions merely to obtain a pass.
7. Inspect diff and status. Report changed files, observed before/after behavior, checks and results, anything unverified, and blockers. Stop after the requested stage.

If a browser or target is unavailable, do not claim that visual matching was verified.

## Safety and publication

- Without separate authorization, do not commit, push, deploy, rebase, reset, or force-push. A push to `main` triggers GitHub Pages publication.
- Do not change secrets, runtime configuration, or external systems without separate approval.
- Do not turn a bug fix into a product behavior change. Do not invent APIs, routes, text, assets, or configuration variables.
- Do not run excessive analyzers, multi-repository research, or new harness layers for a local change.
- If a defect outside the current scope is discovered, document it and do not fix it automatically.

Success means the approved solution is implemented precisely, everything outside its scope is preserved, and the result is supported by proportionate checks—not by the agent's artistic interpretation.
