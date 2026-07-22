# Personal Portfolio

A custom responsive portfolio for an AI Product Engineer.

The site was designed in Figma and implemented as a React application. The interface is built around a custom editorial layout, adaptive typography, section-aware navigation, and subtle interactions.

[View live site](https://thaelr.github.io/personal-site/)

## Preview

<img width="1180" height="788" alt="image" src="https://github.com/user-attachments/assets/a6510d5a-d832-4211-a97a-3adcfc95319c" />

## What Was Built

The site presents selected product work, professional background, and contact information through a single-page narrative structure.

The interface includes:

- a hero section with responsive composition
- selected work and product case studies
- a structured career narrative
- section-aware navigation
- desktop and mobile-specific layouts
- smooth scrolling and hash-based navigation
- responsive typography and spacing
- visual transitions and interaction states

## Responsive System

The layout uses a responsive system that scales continuously across viewport sizes instead of relying only on a few fixed desktop and mobile layouts.

Typography, spacing, navigation, and content proportions scale using CSS variables, `clamp()`, calculated layout values, and breakpoint-specific composition rules.

The desktop version follows a structured multi-column grid, while the mobile layout reorganizes navigation, content order, typography, and image placement for smaller screens. This preserves the visual hierarchy without simply shrinking the desktop version.

## Navigation and Interaction

The navigation tracks the active section as the user scrolls.

Instead of relying only on click state, the application calculates which section currently crosses a control line in the viewport and updates the navigation accordingly.

The navigation also:

- syncs with URL hashes
- supports direct links to individual sections
- uses smooth scrolling
- adapts its position between the hero and content sections
- switches to a dedicated compact layout on mobile
- batches scroll updates with `requestAnimationFrame`

## Visual System

The visual language is built around:

- a dark editorial interface
- restrained monochrome typography
- a limited accent color
- large-scale portrait composition
- monospace interface details
- asymmetric spacing
- subtle hover and active states
- section transitions

The design system is implemented through reusable CSS variables for typography, colors, layout dimensions, spacing, and viewport-based scaling.

## Architecture

The site is structured as a set of independent React sections:

- `HomeSection`
- `WorkSection`
- `AboutSection`
- `ContactSection`
- shared navigation and interaction logic

The component structure stays compact, while the styling layer handles most of the responsive and visual complexity.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Custom CSS
- GitHub Pages
- GitHub Actions

## Deployment

The project is built with Vite and deployed to GitHub Pages through GitHub Actions.

## Implementation Note

The site was first designed in Figma and then refined directly in code to account for real browser behavior, responsive constraints, typography, animation, and interaction details.

---

[View live site](https://thaelr.github.io/personal-site/) · [Email](mailto:shenko.nik@gmail.com) · [Telegram](https://t.me/Taabler)
