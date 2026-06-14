# Project: Portfolio Website Redesign

## Architecture
- **Type**: Static single-page app (vanilla HTML/CSS/JS, no build tools)
- **Entry**: `index.html` with hash-based routing (#home, #about, #contact, #project/slug)
- **Styling**: `style.css` — all styles, dark mode via `body.dark-mode` class, CSS custom properties
- **Logic**: `app.js` — router, project grid, gallery, dark mode toggle
- **Projects**: `projects/projects-registry.js` + `projects/project-N/project-data.js`
- **New file**: `translations.js` — i18n translation strings (EN/TR/IT/NL)

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Full Implementation | R1 (About), R2 (Contact), R3 (i18n), R4 (dark mode default) | none | PLANNED |

## Requirements Summary

### R1 — Redesign About Page
- Replace plain text with structured multi-section CV layout
- Sections: professional summary, experience timeline, education, skills, languages, references (names only)
- Ultra-minimalist flat aesthetic matching existing site
- All content translatable via data-i18n

### R2 — Redesign Contact Page
- Clean layout: email (mailto), LinkedIn (external link), location, availability statement
- Minimalist aesthetic, all content translatable

### R3 — Multi-language Support (EN/TR/IT/NL)
- New file `translations.js` with all strings
- Language selector in sidebar (simple text: en / tr / it / nl)
- Persist to localStorage, default English
- Translate: sidebar labels, about content, contact content, footer, theme toggle
- Project titles/descriptions stay as-is

### R4 — Dark Mode Default
- First visit → dark mode (body.dark-mode class)
- Toggle reads "light mode" initially
- Persist preference to localStorage
- Invert current app.js logic

## Code Layout
```
/Users/Muzaffer/Desktop/PORTFOLYO YENI DENEME/
├── index.html          — main SPA page (modify)
├── style.css           — all styles (modify)
├── app.js              — router and logic (modify)
├── translations.js     — NEW: i18n strings
├── projects/
│   ├── projects-registry.js
│   └── project-N/
│       └── project-data.js
└── .agents/            — agent metadata only
```

## Critical Non-Regression
- Project grid: 3-column, 16:9 cards, 70% width, left-aligned
- Horizontal scroll gallery: clip-path crop, inertial smooth scrolling
- Sidebar: flex column, space-between, em-dash active indicator
- Dynamic script injection for project data
- CSS custom properties (--bg-primary, --text-primary, etc.)
- Mobile responsive below 900px
- file:// protocol compatibility
