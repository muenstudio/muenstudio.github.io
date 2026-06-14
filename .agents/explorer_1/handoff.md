# Handoff Report — Explorer 1: Full Implementation Strategy (R1–R4)

**Summary**: Complete analysis of the existing portfolio website (index.html, style.css, app.js) with detailed implementation strategies for all four requirements: About page redesign (R1), Contact page redesign (R2), multi-language support (R3), and dark mode default (R4). All changes target 4 files: index.html, style.css, app.js, and new translations.js.

---

## 1. Observation

### Current Codebase Structure
| File | Lines | Role |
|------|-------|------|
| `index.html` | 96 | Single-page app, hash-based routing, 4 view sections |
| `style.css` | 443 | All styles, CSS custom properties, dark mode via `body.dark-mode` |
| `app.js` | 202 | Router, project grid, gallery, dark mode toggle |
| `projects/projects-registry.js` | 3 | Lists 15 project slugs |

### Current About Section (index.html lines 57–67)
```html
<section id="about-view" class="view-section">
  <div class="text-layout">
    <p>
      highly skilled bim specialist, revit expert, and master architect with 8+ years...
    </p>
    <br>
    <p>
      master of science in architecture (restoration & conservation) graduate...
    </p>
  </div>
</section>
```
- Uses `.text-layout` class (CSS lines 263–275): `max-width: 600px`, paragraphs at `12px`, color `--text-secondary`.
- No structure — just two `<p>` tags with a `<br>`.

### Current Contact Section (index.html lines 70–81)
```html
<section id="contact-view" class="view-section">
  <div class="text-layout">
    <p>for inquiries regarding bim coordination...</p>
    <br>
    <p><strong>email:</strong> <a href="mailto:enesbulgay1@gmail.com">enesbulgay1@gmail.com</a></p>
    <p><strong>phone:</strong> +39 351 964 45 61</p>
    <p><strong>location:</strong> rome, italy</p>
    <p><strong>linkedin:</strong> <a href="https://linkedin.com/in/muzaffer-enes-bulgay" target="_blank">linkedin.com/in/muzaffer-enes-bulgay</a></p>
  </div>
</section>
```
- Also uses `.text-layout`. Contains phone number (must be REMOVED per requirements).
- Uses `<strong>` for labels — this pattern can be adapted for i18n.

### Current Dark Mode Logic (app.js lines 180–200)
```javascript
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "light mode";
  }
  
  themeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "light mode";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "dark mode";
    }
  });
}
```
- Default is **light mode** — dark mode only activates if `localStorage.getItem("theme") === "dark"`.
- Toggle text in HTML (line 39): `dark mode`.

### Sidebar Structure (index.html lines 12–43)
```
sidebar
├── sidebar-top
│   ├── logo-container (logo-title, logo-subtitle, logo-location)
│   └── main-nav (ul > li.nav-item × 3: home, about, contact)
└── sidebar-bottom
    └── sidebar-footer
        ├── footer-links (linkedin / email)
        └── theme-toggle-wrap (#theme-toggle)
```
- Uses `flex-direction: column; justify-content: space-between`.
- Mobile (< 900px): `sidebar-bottom` is `display: none` (CSS line 384–386).

### CSS Custom Properties (style.css lines 5–20)
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111111;
  --text-secondary: #777777;
  --text-muted: #aaaaaa;
  --font-family: Arial, Helvetica, sans-serif;
  --sidebar-width: 280px;
  --vertical-padding: 60px;
}
```

### Dark Mode CSS (style.css lines 429–442)
```css
body.dark-mode {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --text-secondary: #888888;
}
body.dark-mode .nav-item.active a {
  background-color: #222222;
  color: #ffffff;
}
body.dark-mode .project-card-image-wrap {
  background-color: #111111;
}
```

### Translatable Elements Inventory
| Element | Location | Current Text | i18n Key Pattern |
|---------|----------|-------------|-----------------|
| Nav: home | index.html:23 | `home` | `nav.home` |
| Nav: about | index.html:24 | `about` | `nav.about` |
| Nav: contact | index.html:25 | `contact` | `nav.contact` |
| Sidebar subtitle | index.html:17 | `BIM Specialist & Architect` | `sidebar.subtitle` |
| Sidebar location | index.html:18 | `Rome, Italy` | `sidebar.location` |
| Footer: linkedin | index.html:34 | `linkedin` | `footer.linkedin` |
| Footer: email | index.html:36 | `email` | `footer.email` |
| Theme toggle | index.html:39 | `dark mode` / `light mode` | `theme.dark` / `theme.light` |
| About content | index.html:57-67 | (all paragraphs) | `about.*` |
| Contact content | index.html:70-81 | (all paragraphs) | `contact.*` |

---

## 2. Logic Chain

### R1 — About Page Redesign

**Step 1**: The current about section is just two paragraphs inside `.text-layout`. The redesign requires 6 structured sections: professional summary, experience timeline, education, skills, languages, references.

**Step 2**: The `.text-layout` class (max-width 600px) is appropriate for the about page's readable text width but may need to be widened slightly (to 700px) for the experience timeline entries.

**Step 3**: Section separation should use thin horizontal lines (`<hr>` styled as 1px `--text-muted` lines) or CSS `border-bottom` on section containers, consistent with the flat minimalist aesthetic.

**Step 4**: Typographic hierarchy uses: section titles at 11px bold uppercase (matching nav style), body text at 12px regular, dates/roles at 10px `--text-secondary`.

**Step 5**: Each text element needs a `data-i18n` attribute for translation. For long content blocks (like professional summary), use a single `data-i18n` on the `<p>` tag.

**Proposed HTML for About Section** (replaces index.html lines 57–67):

```html
<!-- ABOUT -->
<section id="about-view" class="view-section">
  <div class="text-layout about-layout">

    <!-- professional summary -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.summary.title">professional summary</h3>
      <div class="section-divider"></div>
      <p data-i18n="about.summary.p1">highly skilled bim specialist, revit expert, and master architect with 8+ years of professional experience across italy, germany, turkey, and north macedonia. combining advanced expertise in autodesk revit, bim coordination, scan-to-bim, hbim (heritage bim), and parametric modeling with hands-on construction site experience — fluent in moving between architectural design, technical detailing, and on-site execution. specialized in clash detection (navisworks), custom revit family creation, shared parameters frameworks, schedules, and quantity take-off extraction directly from bim models, in line with icomos and iso 19650 standards.</p>
      <p data-i18n="about.summary.p2">master of science in architecture (restoration &amp; conservation) graduate from sapienza university of rome with the highest distinction (110/110), with a thesis processing 512m-point photogrammetric datasets and producing lod 350+ parametric revit models. equally comfortable on the construction site as in the bim environment. trilingual professional (turkish, english c2, italian) with proven ability to bridge multi-disciplinary teams across borders and deliver under deadlines.</p>
    </div>

    <!-- experience -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.experience.title">experience</h3>
      <div class="section-divider"></div>

      <div class="timeline-entry">
        <span class="timeline-date" data-i18n="about.experience.e1.date">06/2022 – 09/2022 &amp; 06/2023 – 09/2023</span>
        <span class="timeline-role" data-i18n="about.experience.e1.role">bim modeler &amp; architect (erasmus+ internship)</span>
        <span class="timeline-company" data-i18n="about.experience.e1.company">alphabet architecture, mannheim, germany</span>
        <ul class="timeline-details">
          <li data-i18n="about.experience.e1.d1">recruited for two consecutive summer terms based on prior performance and technical reliability</li>
          <li data-i18n="about.experience.e1.d2">translated architectural designs into detailed revit bim models for residential and mixed-use projects</li>
          <li data-i18n="about.experience.e1.d3">built custom revit families and parametric assemblies</li>
          <li data-i18n="about.experience.e1.d4">coordinated daily with project teams, structural consultants, and advisors</li>
        </ul>
      </div>

      <div class="timeline-entry">
        <span class="timeline-date" data-i18n="about.experience.e2.date">02/2022 – 06/2022</span>
        <span class="timeline-role" data-i18n="about.experience.e2.role">junior architect &amp; bim modeler</span>
        <span class="timeline-company" data-i18n="about.experience.e2.company">h2n architecture, ankara, turkey</span>
        <ul class="timeline-details">
          <li data-i18n="about.experience.e2.d1">produced detailed bim documentation, survey drawings (rilievi), and quantity take-offs for cultural heritage assets</li>
          <li data-i18n="about.experience.e2.d2">supported multi-disciplinary bim coordination, clash detection, and model review</li>
          <li data-i18n="about.experience.e2.d3">conducted on-site technical measurements and translated them into as-built revit models</li>
        </ul>
      </div>

      <div class="timeline-entry">
        <span class="timeline-date" data-i18n="about.experience.e3.date">08/2021 – 09/2021</span>
        <span class="timeline-role" data-i18n="about.experience.e3.role">architectural intern (construction site)</span>
        <span class="timeline-company" data-i18n="about.experience.e3.company">bcm i̇nşaat – daff i̇nşaat joint venture, ankara, turkey</span>
        <ul class="timeline-details">
          <li data-i18n="about.experience.e3.d1">site internship; on-site exposure to construction processes, structural execution, and coordination</li>
        </ul>
      </div>

      <div class="timeline-entry">
        <span class="timeline-date" data-i18n="about.experience.e4.date">09/2020 – 01/2022</span>
        <span class="timeline-role" data-i18n="about.experience.e4.role">part-time architect</span>
        <span class="timeline-company" data-i18n="about.experience.e4.company">nokta grup architecture, ankara, turkey</span>
        <ul class="timeline-details">
          <li data-i18n="about.experience.e4.d1">worked 4 days per week alongside university studies for over a year</li>
          <li data-i18n="about.experience.e4.d2">led design development and produced complete documentation packages</li>
          <li data-i18n="about.experience.e4.d3">coordinated directly with senior architects and consultants</li>
        </ul>
      </div>
    </div>

    <!-- thesis -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.thesis.title">master's thesis — flagship bim project</h3>
      <div class="section-divider"></div>
      <span class="timeline-role" data-i18n="about.thesis.name">integrated hbim for heritage conservation: scan-to-bim and adaptive reuse</span>
      <span class="timeline-company" data-i18n="about.thesis.info">sapienza university of rome · supervisor: prof. carlo inglese · final grade: 110/110</span>
      <ul class="timeline-details">
        <li data-i18n="about.thesis.d1">built a parametric revit bim model at lod 350+, structured per icomos international standards</li>
        <li data-i18n="about.thesis.d2">processed a 512 million-point photogrammetric dataset using agisoft metashape and autodesk recap</li>
        <li data-i18n="about.thesis.d3">engineered a custom shared parameters framework with 22 project-specific parameters</li>
        <li data-i18n="about.thesis.d4">automated thematic documentation through revit view filters</li>
        <li data-i18n="about.thesis.d5">extracted quantitative take-offs directly from bim model data</li>
      </ul>
    </div>

    <!-- education -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.education.title">education</h3>
      <div class="section-divider"></div>
      <div class="education-entry">
        <span class="timeline-date" data-i18n="about.education.e1.date">09/2023 – 03/2026</span>
        <span class="timeline-role" data-i18n="about.education.e1.degree">master of science in architecture — restoration &amp; conservation</span>
        <span class="timeline-company" data-i18n="about.education.e1.school">sapienza university of rome, italy — final grade: 110/110</span>
      </div>
      <div class="education-entry">
        <span class="timeline-date" data-i18n="about.education.e2.date">09/2018 – 03/2023</span>
        <span class="timeline-role" data-i18n="about.education.e2.degree">bachelor of architecture (b.arch.)</span>
        <span class="timeline-company" data-i18n="about.education.e2.school">ankara yıldırım beyazıt university, turkey</span>
      </div>
      <div class="education-entry">
        <span class="timeline-date" data-i18n="about.education.e3.date">02/2021 – 06/2021</span>
        <span class="timeline-role" data-i18n="about.education.e3.degree">erasmus+ exchange semester — architecture</span>
        <span class="timeline-company" data-i18n="about.education.e3.school">international balkan university, skopje, north macedonia</span>
      </div>
    </div>

    <!-- technical skills -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.skills.title">technical skills</h3>
      <div class="section-divider"></div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.bim.label">bim &amp; 3d modeling</span>
        <span class="skills-list" data-i18n="about.skills.bim.list">autodesk revit (advanced, 8+ years), navisworks, archicad, rhino + grasshopper, sketchup</span>
      </div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.coord.label">bim coordination</span>
        <span class="skills-list" data-i18n="about.skills.coord.list">clash detection, model checking, issue tracking, dalux, shared parameters, schedules</span>
      </div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.reality.label">reality capture &amp; gis</span>
        <span class="skills-list" data-i18n="about.skills.reality.list">agisoft metashape (advanced), autodesk recap pro, cloudcompare, qgis, photogrammetry, point cloud processing</span>
      </div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.doc.label">documentation &amp; take-off</span>
        <span class="skills-list" data-i18n="about.skills.doc.list">view filters, thematic views, quantity take-off from bim, custom family creation</span>
      </div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.viz.label">visualization &amp; rendering</span>
        <span class="skills-list" data-i18n="about.skills.viz.list">lumion, enscape, v-ray, d5 render, twinmotion</span>
      </div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.design.label">design &amp; documentation</span>
        <span class="skills-list" data-i18n="about.skills.design.list">autocad, adobe photoshop, adobe indesign, adobe illustrator</span>
      </div>
      <div class="skills-group">
        <span class="skills-label" data-i18n="about.skills.standards.label">standards &amp; methodologies</span>
        <span class="skills-list" data-i18n="about.skills.standards.list">icomos heritage documentation standards, iso 19650, bim coordination workflows</span>
      </div>
    </div>

    <!-- languages -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.languages.title">languages</h3>
      <div class="section-divider"></div>
      <div class="lang-list">
        <span class="lang-entry" data-i18n="about.languages.tr">turkish (native)</span>
        <span class="lang-entry" data-i18n="about.languages.en">english c2 (full professional)</span>
        <span class="lang-entry" data-i18n="about.languages.it">italian a2 (elementary)</span>
        <span class="lang-entry" data-i18n="about.languages.de">german a1 (basic)</span>
      </div>
    </div>

    <!-- references -->
    <div class="about-section">
      <h3 class="section-title" data-i18n="about.references.title">references</h3>
      <div class="section-divider"></div>
      <div class="references-list">
        <div class="ref-entry">
          <span class="ref-name">selim ulusoy</span>
          <span class="ref-detail" data-i18n="about.references.r1">director, alphabet planning &amp; project development gmbh, mannheim, germany</span>
        </div>
        <div class="ref-entry">
          <span class="ref-name">atilla hatipoğlu</span>
          <span class="ref-detail" data-i18n="about.references.r2">principal architect, h2n architecture, ankara, turkey</span>
        </div>
        <div class="ref-entry">
          <span class="ref-name">görkem aytekin</span>
          <span class="ref-detail" data-i18n="about.references.r3">architect, nokta grup architecture, ankara, turkey</span>
        </div>
        <div class="ref-entry">
          <span class="ref-name">nesibe önal aslan</span>
          <span class="ref-detail" data-i18n="about.references.r4">construction engineer, bcm i̇nşaat, ankara, turkey</span>
        </div>
      </div>
    </div>

  </div>
</section>
```

### R2 — Contact Page Redesign

**Step 1**: Current contact page includes phone number — must be removed per requirements. The redesign needs: email (mailto), LinkedIn (external link), location, availability statement.

**Step 2**: Reuse `.text-layout` container. Each contact item is a simple `<div>` with a label span and value span. Availability statement is a separate paragraph.

**Proposed HTML for Contact Section** (replaces index.html lines 70–81):

```html
<!-- CONTACT -->
<section id="contact-view" class="view-section">
  <div class="text-layout contact-layout">

    <div class="contact-intro">
      <p data-i18n="contact.intro">for inquiries regarding bim coordination, parametric modeling, scan-to-bim, and architectural restoration consultation, please reach out via email or linkedin.</p>
    </div>

    <div class="section-divider"></div>

    <div class="contact-items">
      <div class="contact-item">
        <span class="contact-label" data-i18n="contact.email.label">email</span>
        <a href="mailto:enesbulgay1@gmail.com" class="contact-value">enesbulgay1@gmail.com</a>
      </div>
      <div class="contact-item">
        <span class="contact-label" data-i18n="contact.linkedin.label">linkedin</span>
        <a href="https://linkedin.com/in/muzaffer-enes-bulgay" target="_blank" class="contact-value">linkedin.com/in/muzaffer-enes-bulgay</a>
      </div>
      <div class="contact-item">
        <span class="contact-label" data-i18n="contact.location.label">location</span>
        <span class="contact-value" data-i18n="contact.location.value">rome, italy</span>
      </div>
    </div>

    <div class="section-divider"></div>

    <div class="contact-availability">
      <p data-i18n="contact.availability">currently based in rome, italy with an active eu residence permit. eligible for dutch zoekjaar visa as a sapienza graduate. open to relocation across the european union.</p>
    </div>

  </div>
</section>
```

### R3 — Multi-language Support Architecture

**Step 1**: Language selector placement — insert between `footer-links` and `theme-toggle-wrap` inside `sidebar-bottom > sidebar-footer`. This keeps it near the footer without disrupting the sidebar layout.

**Step 2**: The selector is simple text links: `en / tr / it / nl` — matching the existing `footer-links` pattern (using `/` separators).

**Step 3**: `translations.js` loaded before `app.js` via `<script>` tag. Exposes `window.translations` object.

**Step 4**: `applyLanguage(lang)` function in `app.js` queries all `[data-i18n]` elements and sets `textContent` from translations object. Theme toggle label is special-cased (depends on current dark mode state).

**Proposed sidebar HTML changes** (insert after line 37, before line 38 of index.html):

```html
        <div class="lang-selector-wrap">
          <a href="#" class="lang-link active" data-lang="en">en</a>
          <span class="footer-separator">/</span>
          <a href="#" class="lang-link" data-lang="tr">tr</a>
          <span class="footer-separator">/</span>
          <a href="#" class="lang-link" data-lang="it">it</a>
          <span class="footer-separator">/</span>
          <a href="#" class="lang-link" data-lang="nl">nl</a>
        </div>
```

**Proposed translations.js structure:**

```javascript
window.translations = {
  en: {
    // sidebar
    "sidebar.subtitle": "bim specialist & architect",
    "sidebar.location": "rome, italy",
    
    // navigation
    "nav.home": "home",
    "nav.about": "about",
    "nav.contact": "contact",
    
    // footer
    "footer.linkedin": "linkedin",
    "footer.email": "email",
    
    // theme
    "theme.dark": "dark mode",
    "theme.light": "light mode",
    
    // about — professional summary
    "about.summary.title": "professional summary",
    "about.summary.p1": "highly skilled bim specialist, revit expert, and master architect with 8+ years of professional experience across italy, germany, turkey, and north macedonia...",
    "about.summary.p2": "master of science in architecture (restoration & conservation) graduate from sapienza university of rome...",
    
    // about — experience
    "about.experience.title": "experience",
    "about.experience.e1.date": "06/2022 – 09/2022 & 06/2023 – 09/2023",
    "about.experience.e1.role": "bim modeler & architect (erasmus+ internship)",
    "about.experience.e1.company": "alphabet architecture, mannheim, germany",
    "about.experience.e1.d1": "recruited for two consecutive summer terms...",
    "about.experience.e1.d2": "translated architectural designs into detailed revit bim models...",
    "about.experience.e1.d3": "built custom revit families and parametric assemblies",
    "about.experience.e1.d4": "coordinated daily with project teams, structural consultants, and advisors",
    // ... (e2, e3, e4 follow same pattern)
    
    // about — thesis
    "about.thesis.title": "master's thesis — flagship bim project",
    "about.thesis.name": "integrated hbim for heritage conservation: scan-to-bim and adaptive reuse",
    "about.thesis.info": "sapienza university of rome · supervisor: prof. carlo inglese · final grade: 110/110",
    "about.thesis.d1": "built a parametric revit bim model at lod 350+...",
    // ... (d2-d5)
    
    // about — education
    "about.education.title": "education",
    "about.education.e1.date": "09/2023 – 03/2026",
    "about.education.e1.degree": "master of science in architecture — restoration & conservation",
    "about.education.e1.school": "sapienza university of rome, italy — final grade: 110/110",
    // ... (e2, e3)
    
    // about — skills
    "about.skills.title": "technical skills",
    "about.skills.bim.label": "bim & 3d modeling",
    "about.skills.bim.list": "autodesk revit (advanced, 8+ years), navisworks, archicad, rhino + grasshopper, sketchup",
    // ... (other skill groups)
    
    // about — languages
    "about.languages.title": "languages",
    "about.languages.tr": "turkish (native)",
    "about.languages.en": "english c2 (full professional)",
    "about.languages.it": "italian a2 (elementary)",
    "about.languages.de": "german a1 (basic)",
    
    // about — references
    "about.references.title": "references",
    "about.references.r1": "director, alphabet planning & project development gmbh, mannheim, germany",
    "about.references.r2": "principal architect, h2n architecture, ankara, turkey",
    "about.references.r3": "architect, nokta grup architecture, ankara, turkey",
    "about.references.r4": "construction engineer, bcm i̇nşaat, ankara, turkey",
    
    // contact
    "contact.intro": "for inquiries regarding bim coordination, parametric modeling, scan-to-bim, and architectural restoration consultation, please reach out via email or linkedin.",
    "contact.email.label": "email",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "location",
    "contact.location.value": "rome, italy",
    "contact.availability": "currently based in rome, italy with an active eu residence permit. eligible for dutch zoekjaar visa as a sapienza graduate. open to relocation across the european union."
  },
  tr: {
    // Turkish translations — same keys, Turkish values
    "sidebar.subtitle": "bim uzmanı & mimar",
    "sidebar.location": "roma, i̇talya",
    "nav.home": "ana sayfa",
    "nav.about": "hakkımda",
    "nav.contact": "iletişim",
    "footer.linkedin": "linkedin",
    "footer.email": "e-posta",
    "theme.dark": "karanlık mod",
    "theme.light": "aydınlık mod",
    "about.summary.title": "profesyonel özet",
    "about.experience.title": "deneyim",
    "about.education.title": "eğitim",
    "about.skills.title": "teknik beceriler",
    "about.languages.title": "diller",
    "about.references.title": "referanslar",
    "contact.intro": "bim koordinasyonu, parametrik modelleme, scan-to-bim ve mimari restorasyon danışmanlığı ile ilgili sorularınız için lütfen e-posta veya linkedin üzerinden iletişime geçin.",
    "contact.email.label": "e-posta",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "konum",
    "contact.location.value": "roma, i̇talya",
    "contact.availability": "şu anda roma, i̇talya'da aktif ab oturma izni ile yaşamaktadır. sapienza mezunu olarak hollanda zoekjaar vizesine hak kazanmıştır. avrupa birliği genelinde taşınmaya açıktır.",
    // ... (full translations for all keys)
  },
  it: {
    // Italian translations
    "sidebar.subtitle": "specialista bim & architetto",
    "sidebar.location": "roma, italia",
    "nav.home": "home",
    "nav.about": "chi sono",
    "nav.contact": "contatti",
    "footer.linkedin": "linkedin",
    "footer.email": "email",
    "theme.dark": "modalità scura",
    "theme.light": "modalità chiara",
    "about.summary.title": "profilo professionale",
    "about.experience.title": "esperienza",
    "about.education.title": "formazione",
    "about.skills.title": "competenze tecniche",
    "about.languages.title": "lingue",
    "about.references.title": "referenze",
    "contact.intro": "per informazioni su coordinamento bim, modellazione parametrica, scan-to-bim e consulenza di restauro architettonico, contattare via email o linkedin.",
    "contact.email.label": "email",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "posizione",
    "contact.location.value": "roma, italia",
    "contact.availability": "attualmente residente a roma, italia con permesso di soggiorno ue attivo. idoneo per il visto zoekjaar olandese come laureato sapienza. disponibile al trasferimento in tutta l'unione europea.",
    // ... (full translations for all keys)
  },
  nl: {
    // Dutch translations
    "sidebar.subtitle": "bim specialist & architect",
    "sidebar.location": "rome, italië",
    "nav.home": "home",
    "nav.about": "over mij",
    "nav.contact": "contact",
    "footer.linkedin": "linkedin",
    "footer.email": "e-mail",
    "theme.dark": "donkere modus",
    "theme.light": "lichte modus",
    "about.summary.title": "professioneel profiel",
    "about.experience.title": "werkervaring",
    "about.education.title": "opleiding",
    "about.skills.title": "technische vaardigheden",
    "about.languages.title": "talen",
    "about.references.title": "referenties",
    "contact.intro": "voor vragen over bim-coördinatie, parametrisch modelleren, scan-to-bim en architectonische restauratieadvies, neem contact op via e-mail of linkedin.",
    "contact.email.label": "e-mail",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "locatie",
    "contact.location.value": "rome, italië",
    "contact.availability": "momenteel gevestigd in rome, italië met een actieve eu-verblijfsvergunning. in aanmerking komend voor een nederlands zoekjaarvisum als sapienza-afgestudeerde. open voor verhuizing binnen de europese unie.",
    // ... (full translations for all keys)
  }
};
```

**Key design decisions for translations.js:**
1. Flat dot-notation keys (not nested objects) — simplest to query via `data-i18n` attribute lookup
2. All values in lowercase to match the site aesthetic
3. Reference names (selim ulusoy, etc.) are NOT translated — they are proper nouns
4. Skill tool names (Revit, Navisworks, etc.) stay the same across languages — only labels change
5. Dates stay in same format across languages (DD/MM/YYYY)

**applyLanguage() function to add to app.js:**

```javascript
function applyLanguage(lang) {
  const strings = window.translations && window.translations[lang];
  if (!strings) return;
  
  // Apply all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key] !== undefined) {
      el.textContent = strings[key];
    }
  });
  
  // Special: theme toggle depends on current dark mode state
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? strings['theme.light'] : strings['theme.dark'];
  }
  
  // Update active lang indicator
  document.querySelectorAll('.lang-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-lang') === lang);
  });
  
  // Persist
  localStorage.setItem('lang', lang);
  window.currentLang = lang;
}
```

**Language selector click handler (add to app.js):**

```javascript
document.querySelectorAll('.lang-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    applyLanguage(link.getAttribute('data-lang'));
  });
});

// Initialize language
const savedLang = localStorage.getItem('lang') || 'en';
applyLanguage(savedLang);
```

### R4 — Dark Mode Default

**Step 1**: Current logic (app.js lines 183-187) only applies dark mode when `localStorage.getItem("theme") === "dark"`. Must invert.

**Step 2**: The new logic: apply dark mode by default UNLESS `localStorage.getItem("theme") === "light"`.

**Step 3**: The HTML default text (index.html line 39) changes from `dark mode` to `light mode`.

**Proposed replacement for app.js lines 180–200:**

```javascript
// Dark Mode Logic — default is DARK
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const savedTheme = localStorage.getItem("theme");
  // Default to dark mode; only go light if explicitly saved as "light"
  if (savedTheme === "light") {
    document.body.classList.remove("dark-mode");
    themeToggle.textContent = "dark mode";
  } else {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "light mode";
  }
  
  themeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    if (isDark) {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = window.translations 
        ? window.translations[window.currentLang || 'en']['theme.light'] 
        : "light mode";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = window.translations 
        ? window.translations[window.currentLang || 'en']['theme.dark'] 
        : "dark mode";
    }
  });
}
```

**Also change index.html line 39:**
```html
<!-- BEFORE -->
<a href="#" id="theme-toggle">dark mode</a>
<!-- AFTER -->
<a href="#" id="theme-toggle" data-i18n="theme.light">light mode</a>
```

---

## 3. CSS Additions Needed

Add these new CSS rules to `style.css` (after the `.text-layout` block at line 275, before the Grid Layout section at line 277):

```css
/* ==========================================================================
   ABOUT PAGE LAYOUT
   ========================================================================== */

.about-layout {
  max-width: 700px;
}

.about-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: lowercase;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.section-divider {
  width: 100%;
  height: 1px;
  background-color: var(--text-muted);
  margin-bottom: 20px;
  opacity: 0.3;
}

/* Timeline / Experience entries */
.timeline-entry {
  margin-bottom: 25px;
}

.timeline-date {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 3px;
  letter-spacing: 0.3px;
}

.timeline-role {
  display: block;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 2px;
}

.timeline-company {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.timeline-details {
  list-style: none;
  padding: 0;
}

.timeline-details li {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 12px;
  position: relative;
}

.timeline-details li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--text-muted);
  font-size: 10px;
}

/* Education entries */
.education-entry {
  margin-bottom: 18px;
}

/* Skills layout */
.skills-group {
  margin-bottom: 12px;
}

.skills-label {
  display: block;
  font-size: 11px;
  color: var(--text-primary);
  font-weight: 700;
  margin-bottom: 3px;
}

.skills-list {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Languages */
.lang-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lang-entry {
  font-size: 11px;
  color: var(--text-secondary);
}

/* References */
.references-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ref-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ref-name {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 700;
}

.ref-detail {
  font-size: 11px;
  color: var(--text-secondary);
}

/* ==========================================================================
   CONTACT PAGE LAYOUT
   ========================================================================== */

.contact-layout {
  max-width: 600px;
}

.contact-intro {
  margin-bottom: 20px;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: lowercase;
  letter-spacing: 0.3px;
}

.contact-value {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 700;
}

.contact-value:hover {
  opacity: 0.7;
}

.contact-availability {
  margin-top: 10px;
}

.contact-availability p {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* ==========================================================================
   LANGUAGE SELECTOR
   ========================================================================== */

.lang-selector-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: lowercase;
}

.lang-link {
  font-size: 10px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.lang-link:hover {
  color: var(--text-primary);
}

.lang-link.active {
  color: var(--text-primary);
  font-weight: 700;
}
```

---

## 4. Complete File Change Summary

### index.html — Changes Required

| Lines | Action | Description |
|-------|--------|-------------|
| 7 | MODIFY | Add `<script src="translations.js"></script>` BEFORE style.css or add after line 92 (before app.js) |
| 17 | MODIFY | Add `data-i18n="sidebar.subtitle"` to subtitle span |
| 18 | MODIFY | Add `data-i18n="sidebar.location"` to location span |
| 23 | MODIFY | Add `data-i18n="nav.home"` to nav link `<a>` |
| 24 | MODIFY | Add `data-i18n="nav.about"` to nav link `<a>` |
| 25 | MODIFY | Add `data-i18n="nav.contact"` to nav link `<a>` |
| 34 | MODIFY | Add `data-i18n="footer.linkedin"` to linkedin footer link |
| 36 | MODIFY | Add `data-i18n="footer.email"` to email footer link |
| 37–38 | INSERT | Add language selector `div.lang-selector-wrap` between footer-links and theme-toggle-wrap |
| 39 | MODIFY | Change `dark mode` → `light mode`, add `data-i18n="theme.light"` |
| 57–67 | REPLACE | Replace entire about-view section with new multi-section CV layout |
| 70–81 | REPLACE | Replace entire contact-view section with new contact layout |
| 92 | INSERT | Add `<script src="translations.js"></script>` before app.js script tag |

### style.css — Changes Required

| Lines | Action | Description |
|-------|--------|-------------|
| After 275 | INSERT | Add ~150 lines of new CSS for `.about-layout`, `.timeline-entry`, `.section-title`, `.section-divider`, `.skills-group`, `.contact-layout`, `.contact-item`, `.lang-selector-wrap`, `.lang-link` |

### app.js — Changes Required

| Lines | Action | Description |
|-------|--------|-------------|
| 180–200 | REPLACE | Invert dark mode logic — default to dark, check for `"light"` in localStorage |
| After 178 | INSERT | Add `applyLanguage()` function |
| After 178 | INSERT | Add language selector click handlers |
| After 178 | INSERT | Add language initialization (`const savedLang = localStorage.getItem('lang') \|\| 'en'`) |

### translations.js — NEW FILE

| Content | Description |
|---------|-------------|
| Full file | ~300-400 lines, `window.translations = { en: {...}, tr: {...}, it: {...}, nl: {...} }` |

### Script loading order in index.html:
```html
<script src="projects/projects-registry.js"></script>
<script src="translations.js"></script>
<script src="app.js"></script>
```

---

## 5. Caveats

1. **Translation accuracy**: The implementer must produce all four complete translation sets (EN/TR/IT/NL). The Turkish and Italian translations should be reviewed by the user (Muzaffer is trilingual). Dutch translations should be professional but may need native review.

2. **Skill tool names**: Technical tool names (Revit, Navisworks, ArchiCAD, etc.) are proper nouns and should NOT be translated. Only category labels change per language.

3. **Reference names**: Proper names (selim ulusoy, atilla hatipoğlu, etc.) must NOT be translated. Only the title/role descriptions change per language.

4. **Mobile sidebar**: Currently, `sidebar-bottom` is `display: none` on mobile (CSS line 384-386). The language selector lives inside `sidebar-bottom`, so it will be HIDDEN on mobile. The implementer should consider either:
   - Keeping this behavior (acceptable — most mobile users use browser translation), OR
   - Moving the language selector into `sidebar-top` on mobile via a media query

5. **HTML entity encoding**: Content like `&amp;` in data-i18n attributes — the JavaScript `textContent` assignment automatically handles escaping, so translation values should use raw `&` not `&amp;`.

6. **FOUC risk on dark mode**: There may be a brief flash of light mode before JS runs. To mitigate, consider adding `class="dark-mode"` directly to `<body>` in HTML as the initial state, then let JS remove it if localStorage says "light". This prevents flash-of-unstyled-content.

7. **data-i18n on the theme toggle**: The toggle label changes dynamically (light mode ↔ dark mode). The `applyLanguage()` function must handle this specially — checking current dark mode state to pick the right translation key.

---

## 6. Conclusion

The implementation requires coordinated changes across 3 existing files (index.html, style.css, app.js) and creation of 1 new file (translations.js). The changes are well-scoped:

- **index.html**: Replace about section (lines 57-67) and contact section (lines 70-81) with structured HTML, add `data-i18n` attributes to all translatable elements, add language selector to sidebar, add translations.js script tag, change default toggle text.
- **style.css**: Add ~150 lines of new CSS classes after line 275 for about layout, contact layout, and language selector styling. No existing CSS needs modification.
- **app.js**: Invert dark mode logic (lines 180-200), add `applyLanguage()` function and language selector handlers after the router initialization.
- **translations.js**: New file with complete EN/TR/IT/NL translation objects.

**Critical non-regression**: The project grid, horizontal gallery, sidebar flex layout, dynamic script injection, and CSS custom properties are completely untouched. The `.text-layout` base class is preserved (about and contact just add modifier classes).

---

## 7. Verification Method

After implementation:
1. Open `index.html` in browser via `file://` protocol
2. Verify dark mode loads by default on first visit (clear localStorage first: `localStorage.clear()`)
3. Navigate to #about — verify all 7 sections render with proper hierarchy
4. Navigate to #contact — verify email (mailto), LinkedIn (external link), location, availability display
5. Click each language (en/tr/it/nl) — verify ALL text updates including sidebar, nav, about, contact, footer, toggle
6. Refresh page — verify language persists via localStorage
7. Toggle to light mode — refresh — verify light mode persists
8. Navigate to #home — verify project grid unchanged (3 columns, 16:9 cards)
9. Click a project — verify horizontal scroll gallery works
10. Test mobile viewport (< 900px) — verify sidebar collapses correctly
