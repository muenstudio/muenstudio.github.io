# Handoff Report — i18n Architecture for Portfolio Website

**Type:** Hard handoff — task complete  
**Author:** Explorer 2  
**Date:** 2026-06-08T22:20:00+03:00

---

## 1. Observation

### Current Translatable Elements (from index.html)

| Element | Location | Line | Current Text |
|---------|----------|------|-------------|
| Logo subtitle | `.logo-subtitle` | 17 | `BIM Specialist & Architect` |
| Logo location | `.logo-location` | 18 | `Rome, Italy` |
| Nav: home | `#nav-home a` | 23 | `home` |
| Nav: about | `#nav-about a` | 24 | `about` |
| Nav: contact | `#nav-contact a` | 25 | `contact` |
| Footer: linkedin | `.footer-link` (1st) | 34 | `linkedin` |
| Footer: email | `.footer-link` (2nd) | 36 | `email` |
| Theme toggle | `#theme-toggle` | 39 | `dark mode` / `light mode` |
| About section | `#about-view .text-layout` | 57-67 | Professional summary (2 paragraphs) |
| Contact section | `#contact-view .text-layout` | 70-81 | Contact info |

### Current Architecture (from app.js)

- Hash-based routing: `#home`, `#about`, `#contact`, `#project/slug`
- Dark mode toggle sets `textContent` directly (line 194, 197)
- No i18n infrastructure exists
- `translations.js` is listed in PROJECT.md as a new file to create

### CSS Patterns (from style.css)

- All text is `text-transform: lowercase`
- Font sizes: 10-15px, `Arial, Helvetica, sans-serif`
- Sidebar footer: 10px, `flex` layout with `gap: 6px`
- Theme toggle: 10px, lowercase, with `::before` dot pseudo-element
- Mobile: `sidebar-bottom` is `display: none` at ≤900px (line 384-386) — **important**: language selector in sidebar-bottom will be hidden on mobile

---

## 2. Logic Chain

### 2.1 Translation Key Strategy

**Decision: Nested object by section → flat keys within each section.**

Rationale: The site has clear sections (sidebar, about, contact, footer). Nested grouping by section makes keys readable and maintainable, while flat keys within each section avoid excessive nesting depth.

Structure: `window.translations = { en: { key: value }, tr: { key: value }, ... }`

### 2.2 DOM Binding Strategy

**Decision: `data-i18n` attribute on every translatable element.**

Each element that needs translation gets `data-i18n="keyName"`. The `setLanguage()` function queries all `[data-i18n]` elements and sets their `textContent` (or `innerHTML` for elements containing links/markup).

For elements with mixed content (like contact entries with `<strong>` labels and `<a>` links), use `data-i18n-html="keyName"` to set `innerHTML` instead of `textContent`.

### 2.3 Theme Toggle Integration

The theme toggle text (`dark mode` / `light mode`) is set dynamically by app.js. The i18n system must:
1. Store both "dark mode" and "light mode" translations
2. When language switches, re-apply the correct theme label based on current state
3. When theme toggles, use the current language to get the correct label

### 2.4 About Page — New HTML Structure

The About page needs to be redesigned (R1) with structured sections. Each section needs `data-i18n` keys. The new structure will have these translatable sections:
- Professional summary (2 paragraphs)
- Experience entries (4 positions + thesis)
- Education entries (3 items)
- Technical skills (7 categories)
- Languages (4 entries)
- References (4 names — names stay constant, only the section title translates)

### 2.5 Contact Page — New HTML Structure

The Contact page needs redesign (R2). Translatable elements:
- Intro paragraph
- Labels (email, linkedin, location, availability)
- Availability statement

---

## 3. Complete `translations.js` File Content

```javascript
/**
 * translations.js — Multi-language support for portfolio site
 * Languages: English (en), Turkish (tr), Italian (it), Dutch (nl)
 * 
 * Usage: <element data-i18n="keyName">fallback</element>
 *        <element data-i18n-html="keyName">fallback with <a>html</a></element>
 */

window.translations = {

  // ============================================================
  // ENGLISH
  // ============================================================
  en: {
    // --- Sidebar ---
    "sidebar.subtitle": "bim specialist & architect",
    "sidebar.location": "rome, italy",
    "nav.home": "home",
    "nav.about": "about",
    "nav.contact": "contact",

    // --- Footer ---
    "footer.linkedin": "linkedin",
    "footer.email": "email",
    "theme.dark": "dark mode",
    "theme.light": "light mode",

    // --- Language selector ---
    "lang.label": "en",

    // --- About Page ---
    // Professional Summary
    "about.summary.title": "— professional summary",
    "about.summary.p1": "highly skilled bim specialist, revit expert, and master architect with 8+ years of professional experience across italy, germany, turkey, and north macedonia. combining advanced expertise in autodesk revit, bim coordination, scan-to-bim, hbim (heritage bim), and parametric modeling with hands-on construction site experience — fluent in moving between architectural design, technical detailing, and on-site execution. specialized in clash detection (navisworks), custom revit family creation, shared parameters frameworks, schedules, and quantity take-off extraction directly from bim models, in line with icomos and iso 19650 standards.",
    "about.summary.p2": "master of science in architecture (restoration & conservation) graduate from sapienza university of rome with the highest distinction (110/110), with a thesis processing 512m-point photogrammetric datasets and producing lod 350+ parametric revit models. equally comfortable on the construction site as in the bim environment. trilingual professional (turkish, english c2, italian) with proven ability to bridge multi-disciplinary teams across borders and deliver under deadlines.",

    // Experience
    "about.experience.title": "— experience",

    "about.exp1.role": "bim modeler & architect (erasmus+ internship)",
    "about.exp1.period": "06/2022 – 09/2022 & 06/2023 – 09/2023",
    "about.exp1.company": "alphabet architecture, mannheim, germany",
    "about.exp1.d1": "recruited for two consecutive summer terms based on prior performance and technical reliability",
    "about.exp1.d2": "translated architectural designs into detailed revit bim models for residential and mixed-use projects",
    "about.exp1.d3": "built custom revit families and parametric assemblies",
    "about.exp1.d4": "coordinated daily with project teams, structural consultants, and advisors",

    "about.exp2.role": "junior architect & bim modeler",
    "about.exp2.period": "02/2022 – 06/2022",
    "about.exp2.company": "h2n architecture, ankara, turkey",
    "about.exp2.d1": "produced detailed bim documentation, survey drawings (rilievi), and quantity take-offs for cultural heritage assets",
    "about.exp2.d2": "supported multi-disciplinary bim coordination, clash detection, and model review",
    "about.exp2.d3": "conducted on-site technical measurements and translated them into as-built revit models",

    "about.exp3.role": "architectural intern (construction site)",
    "about.exp3.period": "08/2021 – 09/2021",
    "about.exp3.company": "bcm i̇nşaat – daff i̇nşaat joint venture, ankara, turkey",
    "about.exp3.d1": "site internship; on-site exposure to construction processes, structural execution, and coordination",

    "about.exp4.role": "part-time architect",
    "about.exp4.period": "09/2020 – 01/2022",
    "about.exp4.company": "nokta grup architecture, ankara, turkey",
    "about.exp4.d1": "worked 4 days per week alongside university studies for over a year",
    "about.exp4.d2": "led design development and produced complete documentation packages",
    "about.exp4.d3": "coordinated directly with senior architects and consultants",

    // Thesis
    "about.thesis.title": "— master's thesis",
    "about.thesis.name": "integrated hbim for heritage conservation: scan-to-bim and adaptive reuse",
    "about.thesis.institution": "sapienza university of rome · supervisor: prof. carlo inglese · final grade: 110/110",
    "about.thesis.d1": "built a parametric revit bim model at lod 350+, structured per icomos international standards",
    "about.thesis.d2": "processed a 512 million-point photogrammetric dataset using agisoft metashape and autodesk recap",
    "about.thesis.d3": "engineered a custom shared parameters framework with 22 project-specific parameters",
    "about.thesis.d4": "automated thematic documentation through revit view filters",
    "about.thesis.d5": "extracted quantitative take-offs directly from bim model data",

    // Education
    "about.education.title": "— education",
    "about.edu1.degree": "master of science in architecture — restoration & conservation",
    "about.edu1.period": "09/2023 – 03/2026",
    "about.edu1.institution": "sapienza university of rome, italy — final grade: 110/110",
    "about.edu2.degree": "bachelor of architecture (b.arch.)",
    "about.edu2.period": "09/2018 – 03/2023",
    "about.edu2.institution": "ankara yıldırım beyazıt university, turkey",
    "about.edu3.degree": "erasmus+ exchange semester — architecture",
    "about.edu3.period": "02/2021 – 06/2021",
    "about.edu3.institution": "international balkan university, skopje, north macedonia",

    // Skills
    "about.skills.title": "— technical skills",
    "about.skills.bim3d.label": "bim & 3d modeling",
    "about.skills.bim3d.value": "autodesk revit (advanced, 8+ years), navisworks, archicad, rhino + grasshopper, sketchup",
    "about.skills.coord.label": "bim coordination",
    "about.skills.coord.value": "clash detection, model checking, issue tracking, dalux, shared parameters, schedules",
    "about.skills.reality.label": "reality capture & gis",
    "about.skills.reality.value": "agisoft metashape (advanced), autodesk recap pro, cloudcompare, qgis, photogrammetry, point cloud processing",
    "about.skills.docs.label": "documentation & take-off",
    "about.skills.docs.value": "view filters, thematic views, quantity take-off from bim, custom family creation",
    "about.skills.viz.label": "visualization & rendering",
    "about.skills.viz.value": "lumion, enscape, v-ray, d5 render, twinmotion",
    "about.skills.design.label": "design & documentation",
    "about.skills.design.value": "autocad, adobe photoshop, adobe indesign, adobe illustrator",
    "about.skills.standards.label": "standards & methodologies",
    "about.skills.standards.value": "icomos heritage documentation standards, iso 19650, bim coordination workflows",

    // Languages
    "about.languages.title": "— languages",
    "about.lang.tr": "turkish (native)",
    "about.lang.en": "english c2 (full professional)",
    "about.lang.it": "italian a2 (elementary)",
    "about.lang.de": "german a1 (basic)",

    // References
    "about.references.title": "— references",
    "about.ref.note": "available upon request",

    // --- Contact Page ---
    "contact.title": "— contact",
    "contact.intro": "for inquiries regarding bim coordination, parametric modeling, scan-to-bim, and architectural restoration consultation, please reach out via email or linkedin.",
    "contact.email.label": "email",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "location",
    "contact.location.value": "rome, italy",
    "contact.availability.label": "availability",
    "contact.availability.value": "eu residence permit (italy) + eligible for dutch zoekjaar visa — open to relocation across the eu"
  },

  // ============================================================
  // TURKISH
  // ============================================================
  tr: {
    // --- Sidebar ---
    "sidebar.subtitle": "bim uzmanı & mimar",
    "sidebar.location": "roma, i̇talya",
    "nav.home": "ana sayfa",
    "nav.about": "hakkımda",
    "nav.contact": "i̇letişim",

    // --- Footer ---
    "footer.linkedin": "linkedin",
    "footer.email": "e-posta",
    "theme.dark": "karanlık mod",
    "theme.light": "aydınlık mod",

    // --- Language selector ---
    "lang.label": "tr",

    // --- About Page ---
    "about.summary.title": "— profesyonel özet",
    "about.summary.p1": "i̇talya, almanya, türkiye ve kuzey makedonya'da 8 yılı aşkın profesyonel deneyime sahip, yüksek nitelikli bim uzmanı, revit eksperi ve yüksek lisans dereceli mimar. autodesk revit, bim koordinasyonu, scan-to-bim, hbim (kültürel miras bim), ve parametrik modelleme konularında ileri düzey uzmanlığı, şantiye deneyimiyle birleştiren — mimari tasarım, teknik detaylandırma ve saha uygulaması arasında akıcı geçiş yapabilen bir profesyonel. navisworks ile çakışma tespiti, özel revit aile oluşturma, paylaşımlı parametre çerçeveleri, çizelgeler ve bim modellerinden doğrudan metraj çıkarımı konularında uzmanlaşmış; icomos ve iso 19650 standartlarına uygun çalışma deneyimi.",
    "about.summary.p2": "roma sapienza üniversitesi mimarlık yüksek lisans (restorasyon & konservasyon) programından en yüksek dereceyle (110/110) mezun; tezinde 512 milyon noktalı fotogrametrik veri seti işleyerek lod 350+ parametrik revit modelleri üreten bir profesyonel. şantiyede olduğu kadar bim ortamında da rahat çalışabilen, üç dil bilen (türkçe, i̇ngilizce c2, i̇talyanca), sınır ötesi çok disiplinli ekipleri bir araya getirme ve teslim tarihlerine uyma konusunda kanıtlanmış yetkinliğe sahip.",

    // Experience
    "about.experience.title": "— deneyim",

    "about.exp1.role": "bim modelcisi & mimar (erasmus+ stajı)",
    "about.exp1.period": "06/2022 – 09/2022 & 06/2023 – 09/2023",
    "about.exp1.company": "alphabet architecture, mannheim, almanya",
    "about.exp1.d1": "önceki performans ve teknik güvenilirliğe dayanarak art arda iki yaz dönemi için davet edildi",
    "about.exp1.d2": "mimari tasarımları konut ve karma kullanımlı projeler için detaylı revit bim modellerine dönüştürdü",
    "about.exp1.d3": "özel revit aileleri ve parametrik montajlar oluşturdu",
    "about.exp1.d4": "proje ekipleri, yapısal danışmanlar ve müşavirlerle günlük koordinasyon sağladı",

    "about.exp2.role": "mimar & bim modelcisi",
    "about.exp2.period": "02/2022 – 06/2022",
    "about.exp2.company": "h2n mimarlık, ankara, türkiye",
    "about.exp2.d1": "kültürel miras varlıkları için detaylı bim dokümantasyonu, rölöve çizimleri ve metraj çıkarımları üretti",
    "about.exp2.d2": "çok disiplinli bim koordinasyonu, çakışma tespiti ve model incelemesini destekledi",
    "about.exp2.d3": "sahada teknik ölçümler gerçekleştirdi ve bunları mevcut durum revit modellerine aktardı",

    "about.exp3.role": "mimarlık stajyeri (şantiye)",
    "about.exp3.period": "08/2021 – 09/2021",
    "about.exp3.company": "bcm i̇nşaat – daff i̇nşaat ortak girişimi, ankara, türkiye",
    "about.exp3.d1": "şantiye stajı; yapım süreçleri, strüktürel uygulama ve koordinasyona sahada maruz kalma",

    "about.exp4.role": "yarı zamanlı mimar",
    "about.exp4.period": "09/2020 – 01/2022",
    "about.exp4.company": "nokta grup mimarlık, ankara, türkiye",
    "about.exp4.d1": "üniversite eğitimiyle eş zamanlı olarak haftada 4 gün, bir yılı aşkın süre çalıştı",
    "about.exp4.d2": "tasarım geliştirme sürecini yönetti ve eksiksiz dokümantasyon paketleri üretti",
    "about.exp4.d3": "kıdemli mimarlar ve danışmanlarla doğrudan koordinasyon sağladı",

    // Thesis
    "about.thesis.title": "— yüksek lisans tezi",
    "about.thesis.name": "kültürel miras koruma için entegre hbim: scan-to-bim ve uyarlanabilir yeniden kullanım",
    "about.thesis.institution": "roma sapienza üniversitesi · danışman: prof. carlo inglese · final notu: 110/110",
    "about.thesis.d1": "icomos uluslararası standartlarına uygun, lod 350+ düzeyinde parametrik revit bim modeli oluşturdu",
    "about.thesis.d2": "agisoft metashape ve autodesk recap kullanarak 512 milyon noktalı fotogrametrik veri setini işledi",
    "about.thesis.d3": "22 projeye özel parametreyle özel bir paylaşımlı parametre çerçevesi geliştirdi",
    "about.thesis.d4": "revit görünüm filtreleri aracılığıyla tematik dokümantasyonu otomatikleştirdi",
    "about.thesis.d5": "bim model verilerinden doğrudan kantitatif metraj çıkardı",

    // Education
    "about.education.title": "— eğitim",
    "about.edu1.degree": "mimarlık yüksek lisansı — restorasyon & konservasyon",
    "about.edu1.period": "09/2023 – 03/2026",
    "about.edu1.institution": "roma sapienza üniversitesi, i̇talya — final notu: 110/110",
    "about.edu2.degree": "mimarlık lisansı",
    "about.edu2.period": "09/2018 – 03/2023",
    "about.edu2.institution": "ankara yıldırım beyazıt üniversitesi, türkiye",
    "about.edu3.degree": "erasmus+ değişim dönemi — mimarlık",
    "about.edu3.period": "02/2021 – 06/2021",
    "about.edu3.institution": "uluslararası balkan üniversitesi, üsküp, kuzey makedonya",

    // Skills
    "about.skills.title": "— teknik beceriler",
    "about.skills.bim3d.label": "bim & 3b modelleme",
    "about.skills.bim3d.value": "autodesk revit (i̇leri düzey, 8+ yıl), navisworks, archicad, rhino + grasshopper, sketchup",
    "about.skills.coord.label": "bim koordinasyonu",
    "about.skills.coord.value": "çakışma tespiti, model kontrolü, sorun takibi, dalux, paylaşımlı parametreler, çizelgeler",
    "about.skills.reality.label": "gerçeklik yakalama & cbs",
    "about.skills.reality.value": "agisoft metashape (i̇leri düzey), autodesk recap pro, cloudcompare, qgis, fotogrametri, nokta bulutu i̇şleme",
    "about.skills.docs.label": "dokümantasyon & metraj",
    "about.skills.docs.value": "görünüm filtreleri, tematik görünümler, bim'den metraj çıkarımı, özel aile oluşturma",
    "about.skills.viz.label": "görselleştirme & render",
    "about.skills.viz.value": "lumion, enscape, v-ray, d5 render, twinmotion",
    "about.skills.design.label": "tasarım & dokümantasyon",
    "about.skills.design.value": "autocad, adobe photoshop, adobe indesign, adobe illustrator",
    "about.skills.standards.label": "standartlar & metodolojiler",
    "about.skills.standards.value": "icomos kültürel miras dokümantasyon standartları, iso 19650, bim koordinasyon iş akışları",

    // Languages
    "about.languages.title": "— diller",
    "about.lang.tr": "türkçe (ana dil)",
    "about.lang.en": "i̇ngilizce c2 (tam profesyonel)",
    "about.lang.it": "i̇talyanca a2 (temel)",
    "about.lang.de": "almanca a1 (başlangıç)",

    // References
    "about.references.title": "— referanslar",
    "about.ref.note": "talep üzerine sunulabilir",

    // --- Contact Page ---
    "contact.title": "— i̇letişim",
    "contact.intro": "bim koordinasyonu, parametrik modelleme, scan-to-bim ve mimari restorasyon danışmanlığı ile ilgili talepleriniz için lütfen e-posta veya linkedin üzerinden ulaşın.",
    "contact.email.label": "e-posta",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "konum",
    "contact.location.value": "roma, i̇talya",
    "contact.availability.label": "uygunluk",
    "contact.availability.value": "ab oturma izni (i̇talya) + hollanda zoekjaar vizesi hakkı — ab genelinde yeniden konumlandırmaya açık"
  },

  // ============================================================
  // ITALIAN
  // ============================================================
  it: {
    // --- Sidebar ---
    "sidebar.subtitle": "specialista bim & architetto",
    "sidebar.location": "roma, italia",
    "nav.home": "home",
    "nav.about": "chi sono",
    "nav.contact": "contatti",

    // --- Footer ---
    "footer.linkedin": "linkedin",
    "footer.email": "email",
    "theme.dark": "modalità scura",
    "theme.light": "modalità chiara",

    // --- Language selector ---
    "lang.label": "it",

    // --- About Page ---
    "about.summary.title": "— profilo professionale",
    "about.summary.p1": "specialista bim altamente qualificato, esperto revit e architetto con laurea magistrale, con oltre 8 anni di esperienza professionale tra italia, germania, turchia e macedonia del nord. competenze avanzate in autodesk revit, coordinamento bim, scan-to-bim, hbim (heritage bim) e modellazione parametrica combinate con esperienza diretta in cantiere — capacità di operare fluidamente tra progettazione architettonica, dettaglio tecnico ed esecuzione in sito. specializzato in clash detection (navisworks), creazione di famiglie revit personalizzate, framework di parametri condivisi, abachi e computi metrici estratti direttamente dai modelli bim, in conformità con gli standard icomos e iso 19650.",
    "about.summary.p2": "laureato magistrale in architettura (restauro e conservazione) presso l'università sapienza di roma con il massimo dei voti (110/110), con una tesi che ha elaborato dataset fotogrammetrici da 512 milioni di punti producendo modelli revit parametrici a lod 350+. altrettanto a proprio agio in cantiere quanto nell'ambiente bim. professionista trilingue (turco, inglese c2, italiano) con comprovata capacità di coordinare team multidisciplinari internazionali e rispettare le scadenze.",

    // Experience
    "about.experience.title": "— esperienza",

    "about.exp1.role": "modellatore bim & architetto (tirocinio erasmus+)",
    "about.exp1.period": "06/2022 – 09/2022 & 06/2023 – 09/2023",
    "about.exp1.company": "alphabet architecture, mannheim, germania",
    "about.exp1.d1": "selezionato per due periodi estivi consecutivi sulla base delle prestazioni precedenti e dell'affidabilità tecnica",
    "about.exp1.d2": "tradotto progetti architettonici in modelli bim revit dettagliati per progetti residenziali e a uso misto",
    "about.exp1.d3": "creato famiglie revit personalizzate e assemblaggi parametrici",
    "about.exp1.d4": "coordinamento quotidiano con team di progetto, consulenti strutturali e advisor",

    "about.exp2.role": "architetto junior & modellatore bim",
    "about.exp2.period": "02/2022 – 06/2022",
    "about.exp2.company": "h2n architettura, ankara, turchia",
    "about.exp2.d1": "prodotto documentazione bim dettagliata, rilievi e computi metrici per beni del patrimonio culturale",
    "about.exp2.d2": "supportato il coordinamento bim multidisciplinare, la clash detection e la revisione del modello",
    "about.exp2.d3": "eseguito misurazioni tecniche in sito e tradotte in modelli revit as-built",

    "about.exp3.role": "tirocinante in architettura (cantiere)",
    "about.exp3.period": "08/2021 – 09/2021",
    "about.exp3.company": "bcm i̇nşaat – daff i̇nşaat joint venture, ankara, turchia",
    "about.exp3.d1": "tirocinio in cantiere; esposizione diretta ai processi costruttivi, all'esecuzione strutturale e al coordinamento",

    "about.exp4.role": "architetto part-time",
    "about.exp4.period": "09/2020 – 01/2022",
    "about.exp4.company": "nokta grup architettura, ankara, turchia",
    "about.exp4.d1": "lavorato 4 giorni a settimana parallelamente agli studi universitari per oltre un anno",
    "about.exp4.d2": "guidato lo sviluppo progettuale e prodotto pacchetti documentali completi",
    "about.exp4.d3": "coordinamento diretto con architetti senior e consulenti",

    // Thesis
    "about.thesis.title": "— tesi di laurea magistrale",
    "about.thesis.name": "hbim integrato per la conservazione del patrimonio: scan-to-bim e riuso adattivo",
    "about.thesis.institution": "università sapienza di roma · relatore: prof. carlo inglese · voto finale: 110/110",
    "about.thesis.d1": "costruito un modello bim revit parametrico a lod 350+, strutturato secondo gli standard internazionali icomos",
    "about.thesis.d2": "elaborato un dataset fotogrammetrico da 512 milioni di punti utilizzando agisoft metashape e autodesk recap",
    "about.thesis.d3": "progettato un framework di parametri condivisi personalizzato con 22 parametri specifici del progetto",
    "about.thesis.d4": "automatizzato la documentazione tematica tramite filtri di visualizzazione revit",
    "about.thesis.d5": "estratto computi metrici quantitativi direttamente dai dati del modello bim",

    // Education
    "about.education.title": "— formazione",
    "about.edu1.degree": "laurea magistrale in architettura — restauro e conservazione",
    "about.edu1.period": "09/2023 – 03/2026",
    "about.edu1.institution": "università sapienza di roma, italia — voto finale: 110/110",
    "about.edu2.degree": "laurea triennale in architettura",
    "about.edu2.period": "09/2018 – 03/2023",
    "about.edu2.institution": "ankara yıldırım beyazıt university, turchia",
    "about.edu3.degree": "semestre di scambio erasmus+ — architettura",
    "about.edu3.period": "02/2021 – 06/2021",
    "about.edu3.institution": "international balkan university, skopje, macedonia del nord",

    // Skills
    "about.skills.title": "— competenze tecniche",
    "about.skills.bim3d.label": "bim & modellazione 3d",
    "about.skills.bim3d.value": "autodesk revit (avanzato, 8+ anni), navisworks, archicad, rhino + grasshopper, sketchup",
    "about.skills.coord.label": "coordinamento bim",
    "about.skills.coord.value": "clash detection, verifica modello, gestione criticità, dalux, parametri condivisi, abachi",
    "about.skills.reality.label": "reality capture & gis",
    "about.skills.reality.value": "agisoft metashape (avanzato), autodesk recap pro, cloudcompare, qgis, fotogrammetria, elaborazione nuvole di punti",
    "about.skills.docs.label": "documentazione & computi",
    "about.skills.docs.value": "filtri di visualizzazione, viste tematiche, computo metrico da bim, creazione famiglie personalizzate",
    "about.skills.viz.label": "visualizzazione & rendering",
    "about.skills.viz.value": "lumion, enscape, v-ray, d5 render, twinmotion",
    "about.skills.design.label": "progettazione & documentazione",
    "about.skills.design.value": "autocad, adobe photoshop, adobe indesign, adobe illustrator",
    "about.skills.standards.label": "standard & metodologie",
    "about.skills.standards.value": "standard icomos per la documentazione del patrimonio, iso 19650, workflow di coordinamento bim",

    // Languages
    "about.languages.title": "— lingue",
    "about.lang.tr": "turco (madrelingua)",
    "about.lang.en": "inglese c2 (professionale completo)",
    "about.lang.it": "italiano a2 (elementare)",
    "about.lang.de": "tedesco a1 (base)",

    // References
    "about.references.title": "— referenze",
    "about.ref.note": "disponibili su richiesta",

    // --- Contact Page ---
    "contact.title": "— contatti",
    "contact.intro": "per richieste relative a coordinamento bim, modellazione parametrica, scan-to-bim e consulenza in restauro architettonico, si prega di contattare via email o linkedin.",
    "contact.email.label": "email",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "sede",
    "contact.location.value": "roma, italia",
    "contact.availability.label": "disponibilità",
    "contact.availability.value": "permesso di soggiorno ue (italia) + idoneo per visto zoekjaar olandese — disponibile al trasferimento in tutta l'ue"
  },

  // ============================================================
  // DUTCH
  // ============================================================
  nl: {
    // --- Sidebar ---
    "sidebar.subtitle": "bim-specialist & architect",
    "sidebar.location": "rome, italië",
    "nav.home": "home",
    "nav.about": "over mij",
    "nav.contact": "contact",

    // --- Footer ---
    "footer.linkedin": "linkedin",
    "footer.email": "e-mail",
    "theme.dark": "donkere modus",
    "theme.light": "lichte modus",

    // --- Language selector ---
    "lang.label": "nl",

    // --- About Page ---
    "about.summary.title": "— professioneel profiel",
    "about.summary.p1": "hooggekwalificeerde bim-specialist, revit-expert en architect met masterdiploma, met meer dan 8 jaar professionele ervaring in italië, duitsland, turkije en noord-macedonië. geavanceerde expertise in autodesk revit, bim-coördinatie, scan-to-bim, hbim (heritage bim) en parametrisch modelleren gecombineerd met praktische bouwplaatservaring — vloeiend in de overgang tussen architectonisch ontwerp, technische detaillering en uitvoering op locatie. gespecialiseerd in clash detection (navisworks), aangepaste revit-families, frameworks voor gedeelde parameters, schema's en hoeveelhedenberekening rechtstreeks uit bim-modellen, conform icomos- en iso 19650-normen.",
    "about.summary.p2": "master of science in architectuur (restauratie & conservering) afgestudeerd aan de sapienza universiteit van rome met de hoogste onderscheiding (110/110), met een thesis over de verwerking van fotogrammetrische datasets van 512 miljoen punten en de productie van parametrische revit-modellen op lod 350+. even comfortabel op de bouwplaats als in de bim-omgeving. drietalige professional (turks, engels c2, italiaans) met bewezen vermogen om multidisciplinaire teams over grenzen heen te verbinden en deadlines te halen.",

    // Experience
    "about.experience.title": "— ervaring",

    "about.exp1.role": "bim-modelleur & architect (erasmus+ stage)",
    "about.exp1.period": "06/2022 – 09/2022 & 06/2023 – 09/2023",
    "about.exp1.company": "alphabet architecture, mannheim, duitsland",
    "about.exp1.d1": "geselecteerd voor twee opeenvolgende zomerperiodes op basis van eerdere prestaties en technische betrouwbaarheid",
    "about.exp1.d2": "architectonische ontwerpen vertaald naar gedetailleerde revit bim-modellen voor residentiële en gemengde projecten",
    "about.exp1.d3": "aangepaste revit-families en parametrische samenstellingen gebouwd",
    "about.exp1.d4": "dagelijkse coördinatie met projectteams, constructief adviseurs en begeleiders",

    "about.exp2.role": "junior architect & bim-modelleur",
    "about.exp2.period": "02/2022 – 06/2022",
    "about.exp2.company": "h2n architectuur, ankara, turkije",
    "about.exp2.d1": "gedetailleerde bim-documentatie, opmetingstekeningen en hoeveelhedenberekeningen geproduceerd voor cultureel erfgoed",
    "about.exp2.d2": "multidisciplinaire bim-coördinatie, clash detection en modelcontrole ondersteund",
    "about.exp2.d3": "technische metingen op locatie uitgevoerd en vertaald naar as-built revit-modellen",

    "about.exp3.role": "architectuurstagiair (bouwplaats)",
    "about.exp3.period": "08/2021 – 09/2021",
    "about.exp3.company": "bcm i̇nşaat – daff i̇nşaat joint venture, ankara, turkije",
    "about.exp3.d1": "bouwplaatsstage; directe blootstelling aan bouwprocessen, constructieve uitvoering en coördinatie",

    "about.exp4.role": "parttime architect",
    "about.exp4.period": "09/2020 – 01/2022",
    "about.exp4.company": "nokta grup architectuur, ankara, turkije",
    "about.exp4.d1": "4 dagen per week gewerkt naast de universitaire studie gedurende meer dan een jaar",
    "about.exp4.d2": "leidde ontwerpontwikkeling en produceerde complete documentatiepakketten",
    "about.exp4.d3": "directe coördinatie met senior architecten en adviseurs",

    // Thesis
    "about.thesis.title": "— masterscriptie",
    "about.thesis.name": "geïntegreerde hbim voor erfgoedbehoud: scan-to-bim en adaptief hergebruik",
    "about.thesis.institution": "sapienza universiteit van rome · begeleider: prof. carlo inglese · eindcijfer: 110/110",
    "about.thesis.d1": "een parametrisch revit bim-model gebouwd op lod 350+, gestructureerd volgens internationale icomos-normen",
    "about.thesis.d2": "een fotogrammetrische dataset van 512 miljoen punten verwerkt met agisoft metashape en autodesk recap",
    "about.thesis.d3": "een aangepast framework voor gedeelde parameters ontworpen met 22 projectspecifieke parameters",
    "about.thesis.d4": "thematische documentatie geautomatiseerd via revit-weergavefilters",
    "about.thesis.d5": "kwantitatieve hoeveelhedenberekeningen rechtstreeks uit bim-modelgegevens geëxtraheerd",

    // Education
    "about.education.title": "— opleiding",
    "about.edu1.degree": "master of science in architectuur — restauratie & conservering",
    "about.edu1.period": "09/2023 – 03/2026",
    "about.edu1.institution": "sapienza universiteit van rome, italië — eindcijfer: 110/110",
    "about.edu2.degree": "bachelor architectuur",
    "about.edu2.period": "09/2018 – 03/2023",
    "about.edu2.institution": "ankara yıldırım beyazıt universiteit, turkije",
    "about.edu3.degree": "erasmus+ uitwisselingssemester — architectuur",
    "about.edu3.period": "02/2021 – 06/2021",
    "about.edu3.institution": "international balkan university, skopje, noord-macedonië",

    // Skills
    "about.skills.title": "— technische vaardigheden",
    "about.skills.bim3d.label": "bim & 3d-modellering",
    "about.skills.bim3d.value": "autodesk revit (gevorderd, 8+ jaar), navisworks, archicad, rhino + grasshopper, sketchup",
    "about.skills.coord.label": "bim-coördinatie",
    "about.skills.coord.value": "clash detection, modelcontrole, issuetracking, dalux, gedeelde parameters, schema's",
    "about.skills.reality.label": "reality capture & gis",
    "about.skills.reality.value": "agisoft metashape (gevorderd), autodesk recap pro, cloudcompare, qgis, fotogrammetrie, puntenwolkverwerking",
    "about.skills.docs.label": "documentatie & hoeveelheden",
    "about.skills.docs.value": "weergavefilters, thematische weergaven, hoeveelhedenberekening uit bim, aangepaste families",
    "about.skills.viz.label": "visualisatie & rendering",
    "about.skills.viz.value": "lumion, enscape, v-ray, d5 render, twinmotion",
    "about.skills.design.label": "ontwerp & documentatie",
    "about.skills.design.value": "autocad, adobe photoshop, adobe indesign, adobe illustrator",
    "about.skills.standards.label": "normen & methodologieën",
    "about.skills.standards.value": "icomos-normen voor erfgoeddocumentatie, iso 19650, bim-coördinatieworkflows",

    // Languages
    "about.languages.title": "— talen",
    "about.lang.tr": "turks (moedertaal)",
    "about.lang.en": "engels c2 (volledig professioneel)",
    "about.lang.it": "italiaans a2 (elementair)",
    "about.lang.de": "duits a1 (basis)",

    // References
    "about.references.title": "— referenties",
    "about.ref.note": "beschikbaar op aanvraag",

    // --- Contact Page ---
    "contact.title": "— contact",
    "contact.intro": "voor vragen over bim-coördinatie, parametrisch modelleren, scan-to-bim en advies over architectonische restauratie, neem contact op via e-mail of linkedin.",
    "contact.email.label": "e-mail",
    "contact.linkedin.label": "linkedin",
    "contact.location.label": "locatie",
    "contact.location.value": "rome, italië",
    "contact.availability.label": "beschikbaarheid",
    "contact.availability.value": "eu-verblijfsvergunning (italië) + in aanmerking voor nederlands zoekjaarvisum — open voor verhuizing binnen de eu"
  }

};
```

---

## 4. DOM Integration Strategy

### 4.1 Attribute Convention

Two custom attributes are used:

| Attribute | Purpose | Method |
|-----------|---------|--------|
| `data-i18n="key"` | Plain text content | `element.textContent = translations[lang][key]` |
| `data-i18n-html="key"` | Content with HTML (links, strong) | `element.innerHTML = translations[lang][key]` |

### 4.2 Sidebar HTML — Adding `data-i18n` Attributes

```html
<aside id="sidebar" class="sidebar">
  <div class="sidebar-top">
    <div class="logo-container">
      <a href="#home" class="logo-title">Muzaffer Enes Bulgay</a>
      <span class="logo-subtitle" data-i18n="sidebar.subtitle">bim specialist & architect</span>
      <span class="logo-location" data-i18n="sidebar.location">rome, italy</span>
    </div>

    <nav class="main-nav">
      <ul>
        <li id="nav-home" class="nav-item active"><a href="#home" data-i18n="nav.home">home</a></li>
        <li id="nav-about" class="nav-item"><a href="#about" data-i18n="nav.about">about</a></li>
        <li id="nav-contact" class="nav-item"><a href="#contact" data-i18n="nav.contact">contact</a></li>
      </ul>
    </nav>
  </div>

  <div class="sidebar-bottom">
    <div class="sidebar-footer">
      <div class="footer-links">
        <a href="https://linkedin.com/in/muzaffer-enes-bulgay" target="_blank" class="footer-link" data-i18n="footer.linkedin">linkedin</a>
        <span class="footer-separator">/</span>
        <a href="mailto:enesbulgay1@gmail.com" class="footer-link" data-i18n="footer.email">email</a>
      </div>
      <!-- Language Selector (NEW) -->
      <div class="lang-selector" id="lang-selector">
        <a href="#" class="lang-option active" data-lang="en">en</a>
        <span class="lang-separator">/</span>
        <a href="#" class="lang-option" data-lang="tr">tr</a>
        <span class="lang-separator">/</span>
        <a href="#" class="lang-option" data-lang="it">it</a>
        <span class="lang-separator">/</span>
        <a href="#" class="lang-option" data-lang="nl">nl</a>
      </div>
      <div class="theme-toggle-wrap">
        <a href="#" id="theme-toggle" data-i18n="theme.dark">dark mode</a>
      </div>
    </div>
  </div>
</aside>
```

**Key decisions:**
- Logo name (`Muzaffer Enes Bulgay`) does NOT get `data-i18n` — it's a proper name, never translated
- Language selector sits between footer-links and theme-toggle, matching the vertical flow
- The `data-i18n` on `#theme-toggle` is handled specially — it flips between `theme.dark` and `theme.light` based on current mode

### 4.3 About Page HTML — New Structured Layout

```html
<section id="about-view" class="view-section">
  <div class="text-layout about-layout">

    <!-- Professional Summary -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.summary.title">— professional summary</h3>
      <p data-i18n="about.summary.p1">...</p>
      <p data-i18n="about.summary.p2">...</p>
    </div>

    <!-- Experience -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.experience.title">— experience</h3>

      <div class="experience-entry">
        <div class="exp-role" data-i18n="about.exp1.role">bim modeler & architect (erasmus+ internship)</div>
        <div class="exp-meta">
          <span class="exp-period" data-i18n="about.exp1.period">06/2022 – 09/2022 & 06/2023 – 09/2023</span>
          <span class="exp-company" data-i18n="about.exp1.company">alphabet architecture, mannheim, germany</span>
        </div>
        <ul class="exp-details">
          <li data-i18n="about.exp1.d1">recruited for two consecutive summer terms...</li>
          <li data-i18n="about.exp1.d2">translated architectural designs...</li>
          <li data-i18n="about.exp1.d3">built custom revit families...</li>
          <li data-i18n="about.exp1.d4">coordinated daily with project teams...</li>
        </ul>
      </div>

      <div class="experience-entry">
        <div class="exp-role" data-i18n="about.exp2.role">junior architect & bim modeler</div>
        <div class="exp-meta">
          <span class="exp-period" data-i18n="about.exp2.period">02/2022 – 06/2022</span>
          <span class="exp-company" data-i18n="about.exp2.company">h2n architecture, ankara, turkey</span>
        </div>
        <ul class="exp-details">
          <li data-i18n="about.exp2.d1">produced detailed bim documentation...</li>
          <li data-i18n="about.exp2.d2">supported multi-disciplinary bim coordination...</li>
          <li data-i18n="about.exp2.d3">conducted on-site technical measurements...</li>
        </ul>
      </div>

      <div class="experience-entry">
        <div class="exp-role" data-i18n="about.exp3.role">architectural intern (construction site)</div>
        <div class="exp-meta">
          <span class="exp-period" data-i18n="about.exp3.period">08/2021 – 09/2021</span>
          <span class="exp-company" data-i18n="about.exp3.company">bcm inşaat – daff inşaat joint venture, ankara, turkey</span>
        </div>
        <ul class="exp-details">
          <li data-i18n="about.exp3.d1">site internship...</li>
        </ul>
      </div>

      <div class="experience-entry">
        <div class="exp-role" data-i18n="about.exp4.role">part-time architect</div>
        <div class="exp-meta">
          <span class="exp-period" data-i18n="about.exp4.period">09/2020 – 01/2022</span>
          <span class="exp-company" data-i18n="about.exp4.company">nokta grup architecture, ankara, turkey</span>
        </div>
        <ul class="exp-details">
          <li data-i18n="about.exp4.d1">worked 4 days per week...</li>
          <li data-i18n="about.exp4.d2">led design development...</li>
          <li data-i18n="about.exp4.d3">coordinated directly with senior architects...</li>
        </ul>
      </div>
    </div>

    <!-- Thesis -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.thesis.title">— master's thesis</h3>
      <div class="thesis-name" data-i18n="about.thesis.name">integrated hbim for heritage conservation...</div>
      <div class="thesis-institution" data-i18n="about.thesis.institution">sapienza university of rome · supervisor: prof. carlo inglese · final grade: 110/110</div>
      <ul class="exp-details">
        <li data-i18n="about.thesis.d1">built a parametric revit bim model...</li>
        <li data-i18n="about.thesis.d2">processed a 512 million-point photogrammetric dataset...</li>
        <li data-i18n="about.thesis.d3">engineered a custom shared parameters framework...</li>
        <li data-i18n="about.thesis.d4">automated thematic documentation...</li>
        <li data-i18n="about.thesis.d5">extracted quantitative take-offs...</li>
      </ul>
    </div>

    <!-- Education -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.education.title">— education</h3>
      <div class="edu-entry">
        <div class="edu-degree" data-i18n="about.edu1.degree">master of science in architecture — restoration & conservation</div>
        <div class="edu-meta">
          <span class="edu-period" data-i18n="about.edu1.period">09/2023 – 03/2026</span>
          <span class="edu-institution" data-i18n="about.edu1.institution">sapienza university of rome, italy — final grade: 110/110</span>
        </div>
      </div>
      <div class="edu-entry">
        <div class="edu-degree" data-i18n="about.edu2.degree">bachelor of architecture (b.arch.)</div>
        <div class="edu-meta">
          <span class="edu-period" data-i18n="about.edu2.period">09/2018 – 03/2023</span>
          <span class="edu-institution" data-i18n="about.edu2.institution">ankara yıldırım beyazıt university, turkey</span>
        </div>
      </div>
      <div class="edu-entry">
        <div class="edu-degree" data-i18n="about.edu3.degree">erasmus+ exchange semester — architecture</div>
        <div class="edu-meta">
          <span class="edu-period" data-i18n="about.edu3.period">02/2021 – 06/2021</span>
          <span class="edu-institution" data-i18n="about.edu3.institution">international balkan university, skopje, north macedonia</span>
        </div>
      </div>
    </div>

    <!-- Technical Skills -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.skills.title">— technical skills</h3>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.bim3d.label">bim & 3d modeling</span>
        <span class="skill-value" data-i18n="about.skills.bim3d.value">autodesk revit (advanced, 8+ years)...</span>
      </div>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.coord.label">bim coordination</span>
        <span class="skill-value" data-i18n="about.skills.coord.value">clash detection, model checking...</span>
      </div>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.reality.label">reality capture & gis</span>
        <span class="skill-value" data-i18n="about.skills.reality.value">agisoft metashape (advanced)...</span>
      </div>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.docs.label">documentation & take-off</span>
        <span class="skill-value" data-i18n="about.skills.docs.value">view filters, thematic views...</span>
      </div>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.viz.label">visualization & rendering</span>
        <span class="skill-value" data-i18n="about.skills.viz.value">lumion, enscape, v-ray...</span>
      </div>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.design.label">design & documentation</span>
        <span class="skill-value" data-i18n="about.skills.design.value">autocad, adobe photoshop...</span>
      </div>
      <div class="skill-row">
        <span class="skill-label" data-i18n="about.skills.standards.label">standards & methodologies</span>
        <span class="skill-value" data-i18n="about.skills.standards.value">icomos heritage documentation standards...</span>
      </div>
    </div>

    <!-- Languages -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.languages.title">— languages</h3>
      <div class="lang-list">
        <span data-i18n="about.lang.tr">turkish (native)</span>
        <span data-i18n="about.lang.en">english c2 (full professional)</span>
        <span data-i18n="about.lang.it">italian a2 (elementary)</span>
        <span data-i18n="about.lang.de">german a1 (basic)</span>
      </div>
    </div>

    <!-- References -->
    <div class="about-section">
      <h3 class="section-heading" data-i18n="about.references.title">— references</h3>
      <div class="references-list">
        <div class="ref-entry">
          <span class="ref-name">selim ulusoy</span>
          <span class="ref-role">director, alphabet planning & project development gmbh, mannheim, germany</span>
        </div>
        <div class="ref-entry">
          <span class="ref-name">atilla hatipoğlu</span>
          <span class="ref-role">principal architect, h2n architecture, ankara, turkey</span>
        </div>
        <div class="ref-entry">
          <span class="ref-name">görkem aytekin</span>
          <span class="ref-role">architect, nokta grup architecture, ankara, turkey</span>
        </div>
        <div class="ref-entry">
          <span class="ref-name">nesibe önal aslan</span>
          <span class="ref-role">construction engineer, bcm i̇nşaat, ankara, turkey</span>
        </div>
        <p class="ref-note" data-i18n="about.ref.note">available upon request</p>
      </div>
    </div>

  </div>
</section>
```

### 4.4 Contact Page HTML — New Structure

```html
<section id="contact-view" class="view-section">
  <div class="text-layout contact-layout">
    <h3 class="section-heading" data-i18n="contact.title">— contact</h3>
    <p data-i18n="contact.intro">for inquiries regarding bim coordination...</p>

    <div class="contact-entries">
      <div class="contact-row">
        <span class="contact-label" data-i18n="contact.email.label">email</span>
        <a href="mailto:enesbulgay1@gmail.com" class="contact-value">enesbulgay1@gmail.com</a>
      </div>
      <div class="contact-row">
        <span class="contact-label" data-i18n="contact.linkedin.label">linkedin</span>
        <a href="https://linkedin.com/in/muzaffer-enes-bulgay" target="_blank" class="contact-value">linkedin.com/in/muzaffer-enes-bulgay</a>
      </div>
      <div class="contact-row">
        <span class="contact-label" data-i18n="contact.location.label">location</span>
        <span class="contact-value" data-i18n="contact.location.value">rome, italy</span>
      </div>
      <div class="contact-row">
        <span class="contact-label" data-i18n="contact.availability.label">availability</span>
        <span class="contact-value" data-i18n="contact.availability.value">eu residence permit (italy) + eligible for dutch zoekjaar visa — open to relocation across the eu</span>
      </div>
    </div>
  </div>
</section>
```

**Note:** Email address and LinkedIn URL are NOT translatable (they're constants). Only their labels and the location/availability values translate.

---

## 5. Language Selector — CSS

```css
/* Language Selector */
.lang-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.lang-option {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: lowercase;
  transition: color 0.2s ease;
  cursor: pointer;
}

.lang-option:hover {
  color: var(--text-primary);
}

.lang-option.active {
  color: var(--text-primary);
  font-weight: 700;
}

.lang-separator {
  font-size: 10px;
  color: var(--text-muted);
}
```

**Rationale:** The language selector mirrors the existing `footer-links` styling pattern exactly (same font size 10px, same gap 6px, same color variables, same hover behavior, same active weight). Placed between footer links and theme toggle for visual grouping.

**Mobile consideration:** At ≤900px, `sidebar-bottom` is `display: none` (style.css line 384). The language selector lives inside `sidebar-bottom`, so it won't be visible on mobile. Options to address this:
1. **Recommended**: Add language selector to a top-bar on mobile (inside `sidebar-top` with media query) 
2. Or change the mobile rule to show `sidebar-bottom` (but this would also show footer links)

---

## 6. `setLanguage()` Function — Pseudocode

```javascript
/**
 * Sets the active language and updates all translatable DOM elements.
 * @param {string} lang - Language code: 'en', 'tr', 'it', 'nl'
 */
function setLanguage(lang) {
  // 1. Validate language exists
  if (!window.translations || !window.translations[lang]) {
    console.warn('Translation not found for:', lang);
    return;
  }

  const t = window.translations[lang];

  // 2. Update all data-i18n elements (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // 3. Update all data-i18n-html elements (innerHTML)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  // 4. Special handling: theme toggle
  //    The theme toggle must show the CORRECT label for the current theme state
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const isDark = document.body.classList.contains('dark-mode');
    const themeKey = isDark ? 'theme.light' : 'theme.dark';
    themeToggle.textContent = t[themeKey];
    // Update data-i18n attribute so future setLanguage calls know which key to use
    themeToggle.setAttribute('data-i18n', themeKey);
  }

  // 5. Update language selector active state
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
  });

  // 6. Update <html lang="..."> attribute
  document.documentElement.setAttribute('lang', lang);

  // 7. Persist to localStorage
  localStorage.setItem('language', lang);

  // 8. Store current language globally for other functions to reference
  window.currentLanguage = lang;
}
```

---

## 7. Integration Points in `app.js`

### 7.1 Script Loading Order (index.html)

```html
<!-- Add translations.js BEFORE app.js -->
<script src="projects/projects-registry.js"></script>
<script src="translations.js"></script>
<script src="app.js"></script>
```

### 7.2 Initialize Language on DOMContentLoaded (inside app.js)

Add this block AFTER the dark mode logic, inside the existing `DOMContentLoaded` listener:

```javascript
// ── i18n Language Switching ──
// Initialize language from localStorage or default to 'en'
const savedLang = localStorage.getItem('language') || 'en';
setLanguage(savedLang);

// Language selector click handlers
document.querySelectorAll('.lang-option').forEach(option => {
  option.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = option.getAttribute('data-lang');
    setLanguage(lang);
  });
});
```

### 7.3 Dark Mode Toggle — Integration with i18n

The existing dark mode toggle (app.js lines 189-199) must be modified to use translations instead of hardcoded strings:

```javascript
// BEFORE (current):
themeToggle.textContent = "light mode";  // hardcoded
themeToggle.textContent = "dark mode";   // hardcoded

// AFTER (with i18n):
const lang = window.currentLanguage || 'en';
const t = window.translations[lang];
if (document.body.classList.contains('dark-mode')) {
  localStorage.setItem('theme', 'dark');
  themeToggle.textContent = t['theme.light'];
  themeToggle.setAttribute('data-i18n', 'theme.light');
} else {
  localStorage.setItem('theme', 'light');
  themeToggle.textContent = t['theme.dark'];
  themeToggle.setAttribute('data-i18n', 'theme.dark');
}
```

### 7.4 Order of Operations on Page Load

```
1. DOMContentLoaded fires
2. Load project data (existing)
3. Initialize dark mode (existing, but inverted per R4)
4. Call setLanguage(savedLang) — applies all translations
5. Bind language selector click handlers
6. Router runs (existing)
```

**Important:** `setLanguage()` must run AFTER dark mode initialization, because it needs to know the current theme state to set the correct toggle label.

---

## 8. Complete Translation Key Inventory

Total: **85 unique keys** per language, **340 key-value pairs** across all 4 languages.

| Section | Key Count | Key Prefix |
|---------|-----------|------------|
| Sidebar | 5 | `sidebar.*`, `nav.*` |
| Footer | 2 | `footer.*` |
| Theme toggle | 2 | `theme.*` |
| Language selector | 1 | `lang.*` |
| About: summary | 3 | `about.summary.*` |
| About: experience | 16 | `about.exp*.*` |
| About: thesis | 8 | `about.thesis.*` |
| About: education | 7 | `about.edu*.*` |
| About: skills | 15 | `about.skills.*` |
| About: languages | 5 | `about.lang.*`, `about.languages.*` |
| About: references | 2 | `about.ref*.*` |
| Contact | 9 | `contact.*` |
| **Total** | **85** | |

---

## 9. Caveats

1. **Mobile language selector visibility**: The language selector in `sidebar-bottom` is hidden at ≤900px. The implementer should add a mobile-specific language selector placement (e.g., in `sidebar-top` via media query, or a floating bottom element).

2. **Reference names and roles**: Reference entries include names and titles that are proper nouns. These are NOT translated in the translations object — they stay as-is in the HTML. Only the section title ("— references") and note ("available upon request") are translated.

3. **`data-i18n-html` usage**: The current design avoids `data-i18n-html` entirely by separating labels from links. No innerHTML injection is needed, which is safer and simpler. All translations use `textContent` only.

4. **Translation quality**: The translations use standard professional terminology for architecture/BIM in each language. Turkish uses proper dotted/dotless i distinction. Dutch uses standard architectural terminology (e.g., "hoeveelhedenberekening" for quantity take-off, "clash detection" kept in English as is standard in Dutch BIM practice). Italian uses standard Italian BIM terminology (e.g., "computo metrico", "abachi", "rilievi").

5. **About page restructuring**: The new About page HTML structure is significantly different from the current 2-paragraph layout. This is expected — R1 requires a complete redesign with structured CV sections. The implementer needs to create CSS for the new `.about-layout`, `.experience-entry`, `.edu-entry`, `.skill-row`, etc. classes.

6. **`<html lang="">` attribute**: The `setLanguage()` function updates this for accessibility and SEO. Current value is `en` (index.html line 2).

---

## 10. Conclusion

The i18n architecture uses a straightforward pattern:
- **Single file** (`translations.js`) with a `window.translations` global containing all 4 languages
- **`data-i18n` attributes** on every translatable DOM element for declarative binding
- **`setLanguage(lang)`** function queries all marked elements and applies translations via `textContent`
- **Language selector** styled to match existing sidebar footer aesthetic (`en / tr / it / nl`)
- **localStorage persistence** with English default
- **Theme toggle integration** uses current language to display correct label

The architecture is zero-dependency, works on `file://` protocol, and requires no build step. The translations.js file is ~350 lines and contains 85 keys × 4 languages = 340 total translations covering every user-facing text on the site.

---

## 11. Verification Method

1. **Check translations are complete**: For each language object in `translations.js`, verify it contains exactly the same set of keys as the `en` object. Quick check: `Object.keys(translations.en).length === Object.keys(translations.tr).length` (should be 85 for all).

2. **Check DOM coverage**: After implementation, run in console:
   ```javascript
   document.querySelectorAll('[data-i18n]').forEach(el => {
     const key = el.getAttribute('data-i18n');
     if (!window.translations.en[key]) console.error('Missing key:', key);
   });
   ```

3. **Test language switching**: Click each language option (en/tr/it/nl) and verify:
   - Sidebar nav labels change
   - Sidebar subtitle and location change
   - About page all sections change
   - Contact page changes
   - Footer link labels change
   - Theme toggle label changes (in current language)

4. **Test persistence**: Switch to Turkish, reload page. Verify it loads in Turkish.

5. **Test theme toggle interaction**: In Turkish mode, toggle dark/light mode. Verify label shows "aydınlık mod" / "karanlık mod" correctly.
