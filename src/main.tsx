import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { detectLocale } from './content'
import { getWorkViewFromPathname } from './work'
import './index.css'

const container = document.getElementById('root')!
const base = import.meta.env.BASE_URL
const locale = detectLocale(window.location.pathname, base)
const initialWorkView =
  getWorkViewFromPathname(window.location.pathname, locale, base) ?? { kind: 'overview' as const }
const app = (
  <React.StrictMode>
    <App locale={locale} base={base} initialWorkView={initialWorkView} />
  </React.StrictMode>
)

// Prerendered documents ship real markup; development serves an empty shell.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}
