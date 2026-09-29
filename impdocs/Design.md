# Design System
## MedFA — Medical Diagnosis Using Fuzzy Automata

**Version:** 1.0  
**Last Updated:** September 29, 2026  
**Purpose:** Single source of truth for visual and UX consistency across all AI models and developers.

---

## 1. Design Principles

1. **Calm, not clinical** — Professional medical credibility without intimidating users.
2. **Clarity over decoration** — Diagnosis results and uncertainty must be immediately understandable.
3. **Trust through transparency** — Show evidence, uncertainty, and the decision-support disclaimer clearly.
4. **Accessible by default** — WCAG 2.1 AA minimum; color is never the only signal.
5. **Responsive first** — Fully usable from 320px mobile width through desktop.

---

## 2. Brand Identity

### Product Name
- **Display name:** MedFA
- **Expanded name:** Medical Diagnosis Using Fuzzy Automata
- **Tagline:** "Clarity from uncertain symptoms."

### Tone of Voice
- Calm, clear, evidence-aware, non-alarmist
- Say: "Possible conditions", "confidence estimate", "symptoms contributing"
- Never say: "You have", "confirmed diagnosis", "guaranteed", "medical advice"

---

## 3. Color System

### Primary Palette

| Token | Hex | Use |
|-------|-----|-----|
| `primary-900` | `#0F3D4C` | Headings, dark brand elements |
| `primary-700` | `#146C7E` | Primary buttons, links, active states |
| `primary-600` | `#16859A` | Hover states, key UI accents |
| `primary-100` | `#DDF4F7` | Light backgrounds, information panels |
| `primary-50` | `#F1FAFB` | Page background tint |

### Neutral Palette

| Token | Hex | Use |
|-------|-----|-----|
| `neutral-950` | `#17212B` | Main text |
| `neutral-700` | `#44515C` | Secondary text |
| `neutral-500` | `#6B7885` | Placeholder/muted text |
| `neutral-300` | `#D5DCE2` | Borders, dividers |
| `neutral-100` | `#F3F5F7` | Disabled/backgrounds |
| `white` | `#FFFFFF` | Cards/surfaces |

### Semantic Palette

| Token | Hex | Use |
|-------|-----|-----|
| `success` | `#168A5B` | Low-risk confirmations, positive status |
| `success-bg` | `#E7F6EE` | Success background |
| `warning` | `#B76A00` | Caution, incomplete input |
| `warning-bg` | `#FFF4DE` | Warning background |
| `danger` | `#C53A3A` | Errors/urgent warning only |
| `danger-bg` | `#FDEBEC` | Error background |
| `info` | `#246CB6` | Informational messages |
| `info-bg` | `#EAF3FD` | Info background |

### Diagnosis Confidence Colors

| Range | Color | Label |
|-------|-------|-------|
| 70-100% | `#168A5B` | Higher relevance |
| 40-69% | `#B76A00` | Moderate relevance |
| 0-39% | `#6B7885` | Lower relevance |

**Important:** Do not use red to indicate a diagnosis confidence score. Red is reserved for errors and urgent safety notices.

---

## 4. Typography

### Font Families

```css
--font-sans: "Inter", "Noto Sans", Arial, sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

- Use **Inter** for all UI and content text.
- Use **JetBrains Mono** only for mathematical formulas, rule IDs, and code snippets.
- Load fonts from `next/font/google` where possible; use system fallback when unavailable.

### Type Scale

| Style | Size / Line Height | Weight | Use |
|-------|---------------------|--------|-----|
| Display | 36px / 44px | 700 | Landing page hero only |
| H1 | 30px / 38px | 700 | Page title |
| H2 | 24px / 32px | 700 | Section heading |
| H3 | 18px / 26px | 600 | Card / subsection title |
| Body | 16px / 24px | 400 | Default text |
| Body Small | 14px / 20px | 400 | Supporting text |
| Label | 14px / 20px | 600 | Inputs, form labels |
| Caption | 12px / 16px | 400 | Metadata, timestamps |

Rules:
- Never use font size below 12px.
- Use sentence case, not ALL CAPS except compact status badges.
- Limit line length to approximately 70 characters for long content.

---

## 5. Spacing & Layout

### Spacing Scale

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

### Layout Rules

- Maximum content width: `1200px`; standard reading/form width: `800px`.
- Desktop page padding: 32px; tablet: 24px; mobile: 16px.
- Use 8px base grid; avoid arbitrary spacing values.
- Card border radius: `12px`; buttons/input radius: `8px`; pills/badges: `999px`.
- Standard card shadow: `0 2px 8px rgba(23, 33, 43, 0.08)`.

### Breakpoints

| Name | Width | Layout behavior |
|------|-------|-----------------|
| Mobile | <640px | Single column, full-width controls |
| Tablet | 640-1023px | Two columns when content permits |
| Desktop | >=1024px | Main content + optional side panel |

---

## 6. Component Specifications

### Buttons

| Type | Background | Text | Usage |
|------|------------|------|-------|
| Primary | `primary-700` | White | Main action: "Analyze symptoms" |
| Secondary | White + `primary-700` border | `primary-700` | Back, edit, alternative action |
| Ghost | Transparent | `primary-700` | Low-emphasis action |
| Danger | `danger` | White | Destructive action only |

- Height: 44px minimum.
- Horizontal padding: 16px minimum.
- Focus ring: 3px `primary-100` + 1px `primary-700` outline.
- Disabled: `neutral-300` background, `neutral-500` text, no pointer cursor.

### Form Inputs

- Label always visible above input; do not rely only on placeholder.
- Input height: 44px minimum.
- Border: 1px `neutral-300`; focus border `primary-700`.
- Error state includes red border, icon, and text description.
- Sliders must show current numeric value and unit.
- Toggles must have explicit labels such as "Present" / "Not present".

### Cards

- Background: white; border `1px solid #D5DCE2`; radius 12px.
- Padding: 20px desktop, 16px mobile.
- Do not nest more than one card level.

### Diagnosis Result Card

Must contain:
1. Rank number (e.g., `#1`)
2. Condition name
3. Plain-language category/description
4. Confidence percentage and progress bar
5. Confidence label: Higher / Moderate / Lower relevance
6. Expandable "Why this result?" section
7. Top symptom contributors with numeric contribution values

Never call confidence a probability, certainty, or confirmed likelihood.

### Progress Bar

- Height: 10px; radius 999px; background `neutral-100`.
- Include text value (e.g., `78%`) adjacent to bar; never rely on color alone.
- Animate on result load for maximum 400ms; honor `prefers-reduced-motion`.

### Alerts

- **Medical disclaimer**: Always visible on intake and result pages; use `info-bg` or `warning-bg`.
- **Critical care notice**: If emergency symptom rule is triggered, use `danger-bg`, clear action language: "Seek emergency medical care now."
- Do not hide safety notices behind modal dialogs.

---

## 7. Required Screens

### 7.1 Symptom Intake (`/`)

```
Header: Logo | "Decision-support prototype" badge
Main: H1 "Tell us about the symptoms"
      Medical disclaimer alert
      Step/progress indicator
      Demographics section (optional age/sex/risk factors)
      Symptom groups (general, respiratory, cardiac, digestive, neurological)
      Input controls (slider/toggle/numeric)
      Missing-data reassurance
      Primary CTA: "Analyze symptoms"
Footer: Privacy note | Disclaimer
```

### 7.2 Diagnosis Results (`/results`)

```
Header
Main: H1 "Possible conditions"
      Disclaimer alert
      Input completeness / limitations panel
      Ranked diagnosis cards
      Explainability side panel or expandable section
      "Start a new assessment" button
Footer
```

### 7.3 Session History (`/history`)

- Show anonymous local/demo sessions only.
- Cards show date/time, top result, and delete control.
- Include "Clear all history" with confirmation dialog.

### 7.4 Rule Editor (`/admin/rules`)

- Clearly mark: "Admin / Research configuration".
- Table: rule ID, symptom, source state, target state, weight, status.
- Validate weights are within 0.0-1.0.
- Require explicit confirmation before saving rule changes.

---

## 8. Interaction Rules

- Show inline validation when an input loses focus; show all errors on submit.
- Preserve form values if API request fails.
- Show loading state: button spinner + "Analyzing symptom pattern…".
- Do not use endless spinners; show error/retry after 10 seconds.
- Results should appear only after a successful backend response.
- Do not make any diagnosis card visually alarming based solely on ranking.

---

## 9. Accessibility Requirements

- Meet **WCAG 2.1 AA** contrast requirements.
- All interactive elements must be keyboard accessible.
- Use semantic HTML: `button`, `label`, `fieldset`, `legend`, `main`, `nav`.
- Add accessible names/ARIA labels for icon-only controls.
- Use `aria-live="polite"` for diagnosis-result updates.
- Support `prefers-reduced-motion`.
- Maintain visible focus state at all times.
- Never convey confidence or errors solely with color.

---

## 10. Icons & Imagery

- Icon library: **Lucide React** only.
- Icon size: 16px inline, 20px button, 24px feature/card header.
- Do not use decorative medical stock photos in MVP.
- Use simple line icons; avoid emoji in production interface.
- Use SVG logo only; no raster logo where possible.

---

## 11. Copy Standards

### Approved Examples
- "This tool provides decision support and does not replace a clinician."
- "Based on the information entered, these conditions may be relevant."
- "Some fields were not provided, so these results have additional uncertainty."
- "Why this result?"

### Prohibited Examples
- "You have influenza."
- "Diagnosis confirmed."
- "This result is 78% certain."
- "No need to see a doctor."

---

## 12. Tailwind Token Mapping

```ts
colors: {
  primary: {
    50: '#F1FAFB', 100: '#DDF4F7', 600: '#16859A',
    700: '#146C7E', 900: '#0F3D4C'
  },
  neutral: {
    100: '#F3F5F7', 300: '#D5DCE2', 500: '#6B7885',
    700: '#44515C', 950: '#17212B'
  },
  success: '#168A5B', warning: '#B76A00', danger: '#C53A3A', info: '#246CB6'
}
```
