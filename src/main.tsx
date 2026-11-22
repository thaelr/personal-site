import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { detectLocale } from './content'
import './index.css'

const container = document.getElementById('root')!
const locale = detectLocale(window.location.pathname, import.meta.env.BASE_URL)
const app = (
  <React.StrictMode>
    <App locale={locale} />
  </React.StrictMode>
)

// Prerendered documents ship real markup; development serves an empty shell.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}
