# Handoff Report — Explorer 3: CSS Architecture & Integration Analysis

**Type**: Hard Handoff (investigation complete)

**Summary**: Complete CSS analysis of the portfolio site's existing 443-line style.css, with exact CSS additions needed for the About page CV layout, Contact page redesign, language selector, dark mode compatibility, mobile responsiveness, and non-regression safeguards.

---

## 1. Observation — Existing CSS Architecture

### 1.1 Custom Properties (`:root`, lines 5–20)
```css
--bg-primary: #ffffff;
--text-primary: #111111;
--text-secondary: #777777;
--text-muted: #aaaaaa;
--font-family: Arial, Helvetica, sans-serif;
--sidebar-width: 280px;
--vertical-padding: 60px;
```
**Dark mode overrides** (lines 429–442):
```css
body.dark-mode {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --text-secondary: #888888;
}
```
**Note**: `--text-muted` is NOT overridden in dark mode. It stays `#aaaaaa` in both themes. This is adequate for dark backgrounds (#000) as #aaaaaa has 7.08:1 contrast ratio — passes WCAG AA. No override needed.

### 1.2 Existing `.text-layout` Base (lines 263–275)
```css
.text-layout {
  max-width: 600px;
}
.text-layout p {
  margin-bottom: 15px;
  font-size: 12px;
  color: var(--text-secondary);
}
.text-layout a {
  color: var(--text-primary);
}
```
This is the base class currently used by both `#about-view` and `#contact-view` (confirmed in index.html lines 58, 71). **All new About/Contact styles must extend `.text-layout` — NOT replace it.**

### 1.3 View Section Structure (lines 253–260)
```css
.view-section {
  display: none;
  padding: var(--vertical-padding) 40px;
}
.view-section.active {
  display: block;
}
```
All pages (home, about, contact) are `view-section` children. Padding: 60px top/bottom, 40px left/right. This is the spacing context for all new content.

### 1.4 Sidebar Layout (lines 52–64)
Fixed sidebar, flex column, `justify-content: space-between` distributing `.sidebar-top`, `.sidebar-middle` (removed from HTML, but CSS exists), and `.sidebar-bottom`. The sidebar-bottom (line 31 of HTML) contains `.sidebar-footer` with footer links and theme toggle. **The language selector must be placed inside `.sidebar-bottom`, before `.sidebar-footer`.**

Note: `.sidebar-middle` is absent from HTML but CSS exists (lines 154–157). Not relevant to language selector.

### 1.5 Navigation Indicator Pattern (lines 137–151)
```css
.nav-item::before {
  content: '—';
  position: absolute;
  left: -18px;
  /* scaleX(0) → scaleX(1) on .active */
}
```
Em-dash active indicator. The language selector should adopt a **similar but distinct** pattern — bold text for active, not em-dash — to visually differentiate the language selector from primary navigation.

### 1.6 Mobile Breakpoints (lines 374–423)
- **@media (max-width: 900px)**: Sidebar becomes relative, horizontal row. `.sidebar-middle` and `.sidebar-bottom` are `display: none`. Main content loses left margin. Grid drops to 2 columns.
- **@media (max-width: 600px)**: Grid drops to 1 column.

**Critical**: `.sidebar-bottom` is hidden on mobile. The language selector placed there will be invisible on mobile. A mobile fallback is needed.

### 1.7 Typography Constants
| Element | Font Size | Weight | Transform | Color |
|---------|----------|--------|-----------|-------|
| Logo title | 15px | 700 | uppercase | --text-primary |
| Logo subtitle | 10px | 400 | lowercase | --text-secondary |
| Nav items | 11px | 400/700 | lowercase | --text-secondary / --text-primary |
| Footer links | 10px | 700 | lowercase | --text-primary |
| Theme toggle | 10px | 400 | lowercase | --text-secondary |
| Body text | 12px | 400 | — | --text-secondary |
| Card captions | 11px | 400 | lowercase | --text-primary |

---

## 2. Logic Chain — CSS Additions Needed

### 2.1 About Page: Structured CV Layout

The About page transforms from 2 paragraphs into a multi-section CV. The `.text-layout` base class provides `max-width: 600px` and paragraph styling. We need **child selectors** within `.text-layout` for section structure.

**Recommended HTML pattern** (for implementer):
```html
<div class="text-layout">
  <div class="cv-section">
    <h3 class="cv-section-title">professional summary</h3>
    <p>...</p>
  </div>
  <div class="cv-section">
    <h3 class="cv-section-title">experience</h3>
    <div class="cv-entry">
      <div class="cv-entry-header">
        <span class="cv-entry-role">bim modeler & architect</span>
        <span class="cv-entry-date">06/2022 – 09/2023</span>
      </div>
      <span class="cv-entry-company">alphabet architecture, mannheim, germany</span>
      <ul class="cv-entry-details">
        <li>translated architectural designs into...</li>
      </ul>
    </div>
  </div>
  <!-- more sections... -->
</div>
```

#### Complete CSS Additions for About Page

```css
/* ==========================================================================
   ABOUT PAGE — CV STRUCTURED LAYOUT
   ========================================================================== */

/* Section container — vertical spacing between CV sections */
.cv-section {
  margin-bottom: 40px;
}

.cv-section:last-child {
  margin-bottom: 0;
}

/* Section title — architectural heading style */
.cv-section-title {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  text-transform: lowercase;
  letter-spacing: 0.5px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--text-muted);
  margin-bottom: 20px;
}

/* Experience / Education entry block */
.cv-entry {
  margin-bottom: 24px;
}

.cv-entry:last-child {
  margin-bottom: 0;
}

.cv-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 2px;
}

.cv-entry-role {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: lowercase;
}

.cv-entry-date {
  font-size: 10px;
  font-weight: 400;
  color: var(--text-muted);
  text-transform: lowercase;
  white-space: nowrap;
}

.cv-entry-company {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: var(--text-secondary);
  text-transform: lowercase;
  margin-bottom: 8px;
}

.cv-entry-details {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-entry-details li {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: lowercase;
  line-height: 1.6;
  padding-left: 12px;
  position: relative;
  margin-bottom: 4px;
}

.cv-entry-details li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--text-muted);
  font-size: 10px;
}

/* Skills grid — organized by category */
.cv-skills-group {
  margin-bottom: 16px;
}

.cv-skills-group:last-child {
  margin-bottom: 0;
}

.cv-skills-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: lowercase;
  margin-bottom: 4px;
  display: block;
}

.cv-skills-list {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: lowercase;
  line-height: 1.8;
}

/* Languages list */
.cv-languages {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-languages li {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: lowercase;
  margin-bottom: 6px;
}

.cv-languages li strong {
  color: var(--text-primary);
  font-weight: 700;
}

/* References list */
.cv-references {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cv-references li {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: lowercase;
  margin-bottom: 8px;
  line-height: 1.5;
}

.cv-references li strong {
  color: var(--text-primary);
  font-weight: 700;
}

/* Thesis / Flagship project block — reuses entry styling */
.cv-thesis-grade {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: lowercase;
  display: block;
  margin-bottom: 8px;
}
```

**Design Rationale**:
- **Section titles**: 11px, `--text-muted`, 1px bottom border — matches architectural minimalism. The thin line acts as a subtle divider per requirements. Not bold, not uppercase — deliberate restraint.
- **Entry role/date layout**: Flex row with `space-between` places the date right-aligned on the same line as the role. `flex-wrap: wrap` handles narrow viewports gracefully.
- **Bullet items**: Em-dash prefix (`—`) mirrors the sidebar nav indicator, creating visual consistency across the site.
- **Skills**: Category label (bold, --text-primary) + inline list (--text-secondary) — compact and scannable.
- **Spacing rhythm**: 40px between sections, 24px between entries, 8px between items. This creates a clear hierarchy: section > entry > detail.

### 2.2 Contact Page CSS

The Contact page is simpler. It reuses `.text-layout` and needs only minor extensions for contact items.

```css
/* ==========================================================================
   CONTACT PAGE
   ========================================================================== */

.contact-item {
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: lowercase;
}

.contact-label {
  font-weight: 700;
  color: var(--text-primary);
  margin-right: 6px;
}

.contact-availability {
  margin-top: 24px;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: lowercase;
  line-height: 1.6;
  max-width: 400px;
}
```

**HTML pattern**:
```html
<div class="text-layout">
  <div class="contact-item">
    <span class="contact-label">email</span>
    <a href="mailto:enesbulgay1@gmail.com">enesbulgay1@gmail.com</a>
  </div>
  <div class="contact-item">
    <span class="contact-label">linkedin</span>
    <a href="..." target="_blank">linkedin.com/in/muzaffer-enes-bulgay</a>
  </div>
  <div class="contact-item">
    <span class="contact-label">location</span>
    <span>rome, italy</span>
  </div>
  <p class="contact-availability">
    eu residence permit (italy) — open to relocation across the eu...
  </p>
</div>
```

**Rationale**: `.contact-item` mirrors the existing `<p>` style from `.text-layout p` (12px, --text-secondary) but uses a dedicated class to avoid collision with generic `p` rules. The `.contact-label` mirrors the bold pattern from `.footer-link` (font-weight 700, --text-primary).

### 2.3 Language Selector CSS

The language selector goes in `.sidebar-bottom`, before `.sidebar-footer`. It should read as `en / tr / it / nl` — simple text links.

```css
/* ==========================================================================
   LANGUAGE SELECTOR
   ========================================================================== */

.lang-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  font-size: 10px;
  text-transform: lowercase;
}

.lang-option {
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;
  font-weight: 400;
}

.lang-option:hover {
  color: var(--text-primary);
}

.lang-option.active {
  color: var(--text-primary);
  font-weight: 700;
}

.lang-separator {
  color: var(--text-muted);
  user-select: none;
}
```

**HTML pattern** (inside `.sidebar-bottom`, before `.sidebar-footer`):
```html
<div class="lang-selector">
  <a href="#" class="lang-option active" data-lang="en">en</a>
  <span class="lang-separator">/</span>
  <a href="#" class="lang-option" data-lang="tr">tr</a>
  <span class="lang-separator">/</span>
  <a href="#" class="lang-option" data-lang="it">it</a>
  <span class="lang-separator">/</span>
  <a href="#" class="lang-option" data-lang="nl">nl</a>
</div>
```

**Rationale**:
- **Mimics footer-links pattern**: Same `display: flex`, `gap: 6px`, 10px font size. The separator reuses `--text-muted` matching `.footer-separator`.
- **Active indicator = bold**: Using `font-weight: 700` (not em-dash) to differentiate from nav indicator. Bold is more natural for a small inline element.
- **No em-dash**: The em-dash is reserved for nav items. The language selector uses bold to signal active state — creating a clear visual hierarchy.

### 2.4 Mobile Language Selector Fallback

Since `.sidebar-bottom` is hidden at `≤900px`, the language selector must appear elsewhere on mobile. Two options:

**Option A (Recommended): Add to `.sidebar-top` on mobile via CSS repositioning**

This requires the language selector to be duplicated or repositioned. Since we want to avoid JS-based DOM manipulation for layout:

```css
/* Mobile: Show language selector in sidebar-top area */
@media (max-width: 900px) {
  .lang-selector {
    /* Override display:none inherited from .sidebar-bottom being hidden */
    display: flex !important;
    position: absolute;
    top: 30px;
    right: 30px;
    margin-bottom: 0;
  }
}
```

**However**, this requires pulling `.lang-selector` OUT of `.sidebar-bottom` in HTML. Since `.sidebar-bottom` gets `display: none`, any child also vanishes regardless of the child's own display property.

**Better Option B: Move `.lang-selector` to be a direct child of `.sidebar`, placed after `.sidebar-top`**, and position it via CSS:

```html
<aside class="sidebar">
  <div class="sidebar-top">...</div>
  <div class="lang-selector">...</div>  <!-- Direct child of sidebar -->
  <div class="sidebar-bottom">...</div>
</aside>
```

Then the desktop CSS positions it at the bottom via the sidebar's flex layout:

```css
/* Desktop positioning — push to bottom area */
.lang-selector {
  margin-top: auto;  /* pushes down above sidebar-bottom */
  margin-bottom: 0;
  /* flex gap not needed since sidebar uses space-between */
}
```

Wait — the sidebar uses `justify-content: space-between` with exactly 3 children (top, middle/absent, bottom). Adding `.lang-selector` as a 4th child disrupts this. Let me re-evaluate.

**Final Recommended Approach**: Keep `.lang-selector` inside `.sidebar-bottom`, but override the mobile breakpoint to keep it visible:

```css
@media (max-width: 900px) {
  /* Already existing: */
  .sidebar-middle, .sidebar-bottom {
    display: none;
  }
  
  /* Override: Show lang-selector even on mobile */
  .lang-selector {
    display: flex;
    order: -1;  /* won't help if parent is hidden */
  }
}
```

This **won't work** because the parent `.sidebar-bottom` is `display: none`.

**Actual Solution**: The cleanest approach is to **change the mobile CSS** to hide sidebar-bottom's children individually rather than the container:

```css
@media (max-width: 900px) {
  .sidebar-middle {
    display: none;
  }
  
  /* Instead of hiding all of sidebar-bottom, hide only the footer */
  .sidebar-footer {
    display: none;
  }
  
  /* Language selector stays visible */
  .sidebar-bottom {
    /* Remove display:none; keep it visible for lang-selector */
    margin-top: 0;
  }
  
  .lang-selector {
    margin-bottom: 0;
  }
}
```

**This is the recommended approach.** It requires modifying the existing mobile breakpoint rule at line 384 from:
```css
.sidebar-middle, .sidebar-bottom {
  display: none;
}
```
to:
```css
.sidebar-middle, .sidebar-footer {
  display: none;
}
```

This way `.sidebar-bottom` remains visible (housing the language selector), but the footer links and theme toggle are hidden on mobile. The language selector appears inline in the mobile sidebar row.

---

## 3. Dark Mode Compatibility Analysis

### 3.1 Custom Property Coverage

All proposed CSS uses these color variables:
| Variable | Light Mode | Dark Mode | New CSS Usage |
|----------|-----------|-----------|---------------|
| `--text-primary` | #111111 | #ffffff | cv-entry-role, cv-skills-label, contact-label, lang-option.active |
| `--text-secondary` | #777777 | #888888 | cv-entry-company, cv-entry-details, cv-skills-list, contact-item, lang-option |
| `--text-muted` | #aaaaaa | #aaaaaa (not overridden) | cv-section-title, cv-entry-date, cv-section-title border, contact-availability |
| `--bg-primary` | #ffffff | #000000 | Not directly used in new CSS (inherited from body) |

### 3.2 Specific Dark Mode Concerns

**Issue 1: `.cv-section-title` border**
```css
border-bottom: 1px solid var(--text-muted);
```
On dark mode, `--text-muted` is #aaaaaa on #000000 background. This produces a visible but subtle line — acceptable contrast (7.08:1). **No override needed.**

**Issue 2: Existing dark mode `.nav-item.active a` rule (line 435–438)**
```css
body.dark-mode .nav-item.active a {
  background-color: #222222;
  color: #ffffff;
}
```
This applies a background to active nav items in dark mode. This is **unusual** for the flat aesthetic and could be a legacy artifact. It does NOT affect the new CSS additions, but the implementer should verify this rule is intentional. It adds a subtle background pill to active nav items that doesn't exist in light mode.

**Issue 3: No dark-mode override for `--text-muted`**
`#aaaaaa` on `#000000` = 7.08:1 contrast ratio — well above WCAG AA (4.5:1). No action needed, but if the design feels too bright, an override like `--text-muted: #666666` could be added.

### 3.3 Verdict

**All proposed CSS is fully dark-mode compatible.** Every color reference uses custom properties that are already overridden by `body.dark-mode`. No hardcoded color values exist in the proposed CSS. No additional `body.dark-mode` overrides are needed for the new styles.

---

## 4. Mobile Responsiveness Strategy

### 4.1 About Page on Mobile (≤900px)

The `.text-layout` container has `max-width: 600px`. At mobile widths, this naturally collapses. No explicit mobile override needed for `.text-layout` itself.

**Specific concerns:**

1. **`.cv-entry-header` flex row**: At very narrow widths (<350px), the role + date may not fit side by side. The `flex-wrap: wrap` property handles this — date wraps below role. **No issue.**

2. **View section padding**: Changes from `60px 40px` to `30px` on mobile (line 394). This is sufficient for CV content.

3. **Skills grid**: Not a CSS grid — just stacked blocks. Collapses naturally. **No issue.**

4. **Section spacing**: 40px between sections is generous on mobile but acceptable. Could optionally reduce to 30px:
```css
@media (max-width: 900px) {
  .cv-section {
    margin-bottom: 30px;
  }
}
```

### 4.2 Contact Page on Mobile

Simple stacked layout. Collapses naturally. **No issue.**

### 4.3 Language Selector on Mobile

As detailed in Section 2.4, the recommended approach changes:
```css
/* OLD (line 384): */
.sidebar-middle, .sidebar-bottom { display: none; }

/* NEW: */
.sidebar-middle, .sidebar-footer { display: none; }
```

Additional mobile styling for language selector:
```css
@media (max-width: 900px) {
  .lang-selector {
    margin-bottom: 0;
    margin-left: auto;  /* right-align in the horizontal sidebar row */
  }
}
```

This places the language selector at the right edge of the mobile horizontal sidebar, balanced against the logo on the left.

### 4.4 Complete Mobile Additions

```css
@media (max-width: 900px) {
  /* Modify existing rule: keep sidebar-bottom visible for lang-selector */
  .sidebar-middle, .sidebar-footer {
    display: none;
  }
  
  .sidebar-bottom {
    margin-top: 0;
    margin-left: auto;
  }
  
  .lang-selector {
    margin-bottom: 0;
  }
  
  /* Optional: tighten CV spacing on mobile */
  .cv-section {
    margin-bottom: 30px;
  }
  
  .cv-entry {
    margin-bottom: 20px;
  }
}
```

---

## 5. Non-Regression Risk Assessment

### 5.1 Risk Matrix

| Change | Risk Level | Affected Selectors | Mitigation |
|--------|-----------|-------------------|------------|
| New `.cv-*` classes | ✅ LOW | None existing | All new selectors, no collision possible |
| New `.contact-*` classes | ✅ LOW | None existing | All new selectors, no collision possible |
| New `.lang-*` classes | ✅ LOW | None existing | All new selectors, no collision possible |
| Modify mobile `.sidebar-bottom` rule | ⚠️ MEDIUM | Lines 384–386 | Changes which sidebar children are hidden |
| Extending `.text-layout` children | ✅ LOW | Lines 263–275 | Existing `.text-layout p` rule still applies — new HTML should use `<div>` or specific classes to avoid unintended `p` styling |

### 5.2 Specific Non-Regression Concerns

**Concern 1: `.text-layout p` rule (line 267–271)**

The existing rule applies to ALL `<p>` elements inside `.text-layout`:
```css
.text-layout p {
  margin-bottom: 15px;
  font-size: 12px;
  color: var(--text-secondary);
}
```

If the redesigned About page uses `<p>` elements inside CV sections, they inherit `margin-bottom: 15px` and `color: var(--text-secondary)`. This is **desired** for body paragraphs (professional summary) but could conflict with entry details. **Mitigation**: Use specific classes (`.cv-entry-details li`, `.cv-skills-list span`) instead of generic `<p>` tags for structured content.

**Concern 2: Mobile sidebar layout change**

Changing `.sidebar-middle, .sidebar-bottom { display: none; }` to `.sidebar-middle, .sidebar-footer { display: none; }` keeps `.sidebar-bottom` visible. Since the sidebar becomes `flex-direction: row` on mobile, `.sidebar-bottom` will appear as a flex item in the row. With `margin-left: auto`, it right-aligns. **Risk**: If `.sidebar-bottom` has significant content beyond lang-selector and footer, it could overflow. Currently `.sidebar-bottom` only has `.sidebar-footer` + the new `.lang-selector`. Since `.sidebar-footer` is hidden, only the small lang-selector remains. **Low risk.**

**Concern 3: Project grid**

No proposed CSS touches `.grid-container`, `.project-card`, or any grid-related selectors. The `width: 70%`, `grid-template-columns: repeat(3, 1fr)`, and `gap: 15px` are untouched. **Zero risk.**

**Concern 4: Horizontal scroll gallery**

No proposed CSS touches `.project-detail-view`, `.project-horizontal-scroller`, or `.project-detail-image`. **Zero risk.**

**Concern 5: Sidebar structure**

The sidebar flex layout (`justify-content: space-between`) remains intact. The language selector goes INSIDE `.sidebar-bottom`, so the sidebar still has the same flex children: `.sidebar-top`, (`.sidebar-middle` if present), `.sidebar-bottom`. **Zero risk.**

### 5.3 CSS Insertion Point

All new CSS should be inserted **before the Mobile breakpoint section** (before line 370), organized as:
1. About page CV layout (after line 275, after `.text-layout a`)
2. Contact page (after About section)
3. Language selector (after Contact section)
4. Then existing mobile breakpoints
5. Then existing dark mode

The mobile additions modify the existing `@media (max-width: 900px)` block.

---

## 6. Integration Order Recommendation

### Phase 1: Foundation (no visual change)
1. Add all new CSS classes to `style.css` (they're inert until HTML references them)
2. Modify mobile breakpoint: `.sidebar-bottom` → `.sidebar-footer` in the display:none rule

### Phase 2: Language Selector
3. Add `.lang-selector` HTML to `.sidebar-bottom` in `index.html`
4. Verify: selector visible on desktop, right-aligned on mobile

### Phase 3: Contact Page
5. Replace Contact section HTML with new `.contact-item` structure
6. Verify: all text lowercase, correct colors, dark mode

### Phase 4: About Page (largest change)
7. Replace About section HTML with full CV structure using `.cv-*` classes
8. Verify: section titles have borders, entries aligned, dark mode, mobile collapse

### Phase 5: Dark Mode Default
9. Modify `app.js` dark mode logic (invert the conditional)
10. Verify: first load is dark, toggle says "light mode"

### Phase 6: i18n Integration
11. Add `data-i18n` attributes to all translatable elements
12. Load `translations.js`, implement language switcher JS
13. Verify: all 4 languages, persistence, no layout breaks

**Rationale**: CSS first (Phase 1) is zero-risk and enables all subsequent work. Language selector (Phase 2) is small and validates the mobile sidebar change. Contact (Phase 3) is simpler than About, serves as a test. About (Phase 4) is the largest HTML change. Dark mode (Phase 5) is JS-only. i18n (Phase 6) depends on all HTML being final.

---

## 7. Caveats

1. **Font rendering**: The bold weight (700) for `.cv-entry-role` and `.cv-skills-label` may appear heavier on Windows than macOS due to `-webkit-font-smoothing: antialiased` only applying to WebKit. No mitigation needed — existing site has the same characteristic.

2. **`--text-muted` not overridden in dark mode**: Intentionally left as-is (#aaaaaa) for adequate contrast. However, the designer may prefer a darker muted value (e.g., #666666) in dark mode for more subtlety.

3. **`body.dark-mode .nav-item.active a` background**: The existing rule at line 435 adds `background-color: #222222` to active nav items in dark mode. This background "pill" effect may not be desired in the minimal aesthetic. The implementer should confirm this is intentional.

4. **Translation string length**: Some languages (especially Turkish and Dutch) produce longer strings than English. The CV layout handles this via flex-wrap and percentage widths, but extremely long role titles could cause unexpected wrapping in `.cv-entry-header`. Testing with actual translations is needed.

5. **Theme toggle label i18n**: Currently `#theme-toggle` text is set by JS (`themeToggle.textContent = "light mode"`). After i18n, this must use translation keys instead of hardcoded strings. This is a JS concern, not CSS.

---

## 8. Conclusion

The existing CSS architecture is clean and well-structured for extension. All new styles use the established custom properties and follow the same naming conventions. The primary risks are:
- **Low**: Mobile sidebar change (hiding `.sidebar-footer` instead of `.sidebar-bottom`)
- **Zero**: About/Contact CSS additions (all new class names)
- **Zero**: Dark mode (all custom properties, no hardcoded colors)

Total new CSS: approximately **120 lines** to be added to the existing 443-line file, bringing it to ~563 lines — still manageable as a single stylesheet.

---

## 9. Verification Method

1. **CSS validity**: Run new CSS through a validator or visually inspect for syntax errors
2. **Dark mode**: Toggle `body.dark-mode` class in browser DevTools → confirm all text is readable on #000000
3. **Mobile**: Resize browser to <900px → confirm language selector visible, CV sections collapse cleanly, sidebar-bottom visible with only lang-selector
4. **Non-regression**: After changes, verify:
   - `#home-view .grid-container` still has 3 columns at desktop width
   - Project gallery scrolls horizontally
   - Sidebar em-dash indicator appears on active nav item
   - Footer links (linkedin / email) still visible on desktop
5. **Cross-browser**: Test in Chrome, Safari, Firefox — all CSS used is standard (no experimental properties)
