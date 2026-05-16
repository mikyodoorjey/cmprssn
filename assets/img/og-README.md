# Open Graph image assets — production spec

Batch 1 of the AI-search-optimization plan wires OG / Twitter Card meta tags
across all 14 pages, but the PNG files those tags reference don't exist yet.
This file is the brief for producing them.

Until they ship, social previews on LinkedIn / X / Slack will fall back to
"no image." Pages still validate; they just look worse than they could.

## Required files

All files live in `assets/img/` and are referenced from page `<head>` as
`https://www.cmprssn.xyz/assets/img/og-<slug>.png`.

| File | Used by |
|---|---|
| `og-home.png` | `/` (index.html) |
| `og-methodology.png` | `/methodology.html` |
| `og-audit.png` | `/audit.html` |
| `og-about.png` | `/about.html` |
| `og-field-notes.png` | `/field-notes/` |
| `og-the-legible-organization.png` | field-notes/the-legible-organization.html |
| `og-why-ai-transformation-is-mostly-not-about-ai.png` | field-notes/why-ai-transformation-is-mostly-not-about-ai.html |
| `og-your-company-needs-a-world-model.png` | field-notes/your-company-needs-a-world-model.html |
| `og-the-ai-native-company.png` | field-notes/the-ai-native-company.html |
| `og-a-content-agent-doesnt-need-a-better-prompt.png` | field-notes/a-content-agent-doesnt-need-a-better-prompt.html |
| `og-you-do-not-automate-roles-you-transfer-mandates.png` | field-notes/you-do-not-automate-roles-you-transfer-mandates.html |
| `og-agent-memory-is-not-one-thing.png` | field-notes/agent-memory-is-not-one-thing.html |
| `og-four-different-things-called-goals.png` | field-notes/four-different-things-called-goals.html |
| `og-ai-native-people.png` | field-notes/ai-native-people.html |

## Specs (all files)

- **Dimensions:** 1200 × 630 px
- **Format:** PNG (preferred) or JPG; under 500KB
- **Color space:** sRGB
- **Safe area:** keep critical content inside the inner 1080 × 510 rectangle
  (centered) — Slack and some Android previews crop the edges

## Visual template

Per the brand contract in `design.md`:

- **Background:** `--bg` (#F8F5EC, cream)
- **Headline:** Parabole Trial, weight 500, color `--ink` (#191918), tight
  letter-spacing (-0.02em), 1.04 line-height. Sized to fill ~2/3 of the
  canvas height. Each page uses its `og:title` text verbatim.
- **Accent rule:** 4px horizontal `--accent` (#C97B2B, amber) bar above the
  headline, 120px wide, left-aligned with the headline.
- **Eyebrow:** Decima Mono Pro (or fallback monospace), uppercase, 22px,
  `--accent`. For main pages: "CMPRSSN · METHODOLOGY", "CMPRSSN · AUDIT",
  etc. For field-notes: "FIELD NOTE · {{NN}}" where NN is the field-note
  number (see field-notes/index.html for canonical numbering).
- **Footer wordmark:** "CMPRSSN" in Parabole, weight 700, 28px, `--ink`,
  bottom-left. Optional small `growth@cmprssn.xyz` to the right.
- **Padding:** 80px on all sides minimum.

## Production options

1. **Figma / design tool:** build a template frame, swap headline + eyebrow
   per page, export each as PNG. Fastest for 14 cards.
2. **Headless rendering:** a `puppeteer` or `playwright` script that loads an
   HTML/CSS template and screenshots it. Lets the script run from
   `scripts/` as part of a future build pipeline.
3. **Single fallback:** until per-page cards exist, drop one
   `og-default.png` into this directory and update every page's `og:image`
   to point at it. This is the lowest-effort path if cards are weeks away.

The meta tags are already in place; producing the images is the only
remaining step to make OG previews render properly.
