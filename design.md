---
owner: mikyo
last-verified-date: 2026-05-12
upstream-refs:
  - company/marketing/website/cmprssn-website-v4/cmprssn-tokens.css
  - company/marketing/website/cmprssn-website-v4/index.html
  - company/marketing/website/cmprssn-website-v4/audit.html
  - company/marketing/website/cmprssn-website-v4/methodology.html
topics: [website, design-system, cmprssn-website-v4, css, tokens]
answers:
  - What design rules govern the CMPRSSN website v4?
  - Where should shared website styles live?
  - What are the website design tokens and component rules?
role-relevant: [marketing, design, engineering]
content-type: decision
status: current
confidence: medium
how-to-verify: |
  - [ ] Confirm shared styles live in cmprssn-tokens.css
  - [ ] Confirm page-specific CSS only contains unique layout rules
---

# CMPRSSN Design System

The contract. Every page on this site must follow it. If you find yourself
about to write a style rule that already exists somewhere else, **stop** —
it goes in `cmprssn-tokens.css`, not on the page.

---

## Cardinal rule

> **Anything shared between two or more pages lives in `cmprssn-tokens.css`.**
> Pages only declare what is unique to that page (its layout, its specific
> element classes that don't exist elsewhere).

If a rule appears in two `<style>` blocks or two CSS files with the same
selector, that is a bug. Find every copy, reconcile to one definition in
`cmprssn-tokens.css`, delete the rest.

---

## File map

```
cmprssn-tokens.css   ← THE source of truth. Tokens + every shared component.
cmprssn.js           ← Vanilla behavior layer (~370 lines). Replaces the v4
                       React bundle. One file; included by every page via
                       <script src="/cmprssn.js?v=N" defer>. Initializers are
                       opt-in via DOM presence — pages declare behavior with
                       markup (e.g. class="reveal", [data-stream], etc.).
                       See header comment for the full list of initializers.
index.html           ← Home. Only page-specific layout/composition.
about.html           ← About. Only page-specific.
audit.html           ← Audit page. Only page-specific.
methodology.html     ← Methodology. Only page-specific.
field-notes/
  index.html         ← Field-notes overview. Only page-specific.
  field-notes.css    ← Shared ARTICLE styles (article-body, article-h1,
                       article-dek, pullquote, refrain, etc).
                       Used only by article detail pages.
  *.html             ← 9 article detail pages. No <style> blocks except
                       tiny page-specific overrides if absolutely required.
```

**No build step, no framework.** Every page is hand-edited HTML. The nav
and footer are inlined into every page (13 copies total). Editing the nav
means editing 13 files — accepted trade-off for HTML-native editability.

Every HTML page **must** `<link rel="stylesheet" href="cmprssn-tokens.css">`.
The home page now does this. Subpages already do this. No page may
redeclare design tokens (`--bg`, `--ink`, `--accent`, etc.) in an inline
`<style>` block. There is **one** `:root` declaration, and it is in
`cmprssn-tokens.css`.

---

## Design tokens

All defined in `cmprssn-tokens.css` `:root`. Never hard-code these values.

### Color

| Token             | Value                       | Use                                                |
|-------------------|-----------------------------|----------------------------------------------------|
| `--bg`            | `#F8F5EC`                   | Page background (paper cream)                      |
| `--bg-elev-1`     | `#F3F2E7`                   | Slightly elevated surfaces                         |
| `--bg-elev-2`     | `#E5E4DB`                   | More elevated (card hover bg variant)              |
| `--ink`           | `#191918`                   | Primary text, full-strength borders                |
| `--ink-dark`      | `rgba(25,25,24,0.92)`       | Dark borders that need to look near-ink            |
| `--fg-muted`      | `rgba(25,25,24,0.72)`       | Body copy on light bg                              |
| `--fg-subtle`     | `rgba(25,25,24,0.60)`       | Eyebrows, captions, mono-uppercase metadata        |
| `--line`          | `rgba(25,25,24,0.10)`       | Soft hairline borders                              |
| `--line-strong`   | `rgba(25,25,24,0.30)`       | Strong dividers                                    |
| `--accent`        | `#FCAA2D`                   | Amber. Used for emphasis, hover state, accent rule |

**Card hover bg** is `#FFFCF2` — a warmer off-white. This is the only
hard-coded color outside `:root` and it lives in the shared
`.method-card:hover, .stage-card:hover` rule. Don't reintroduce it
elsewhere.

### Type

| Token             | Value                                  |
|-------------------|----------------------------------------|
| `--font-display`  | `'Parabole Trial', Georgia, serif`     |
| `--font-text`     | `'Inter', system-ui, sans-serif`       |
| `--font-mono`     | `'Decima Mono Pro', ui-monospace, monospace` |

### Layout

| Token             | Value                       |
|-------------------|-----------------------------|
| `--pad-x`         | `clamp(24px, 4vw, 56px)`    |
| `--max-w`         | `1400px`                    |
| `--section-y`     | `clamp(80px, 10vw, 160px)`  |

The `.wrap` class uses `--max-w` + `--pad-x` everywhere. Never redeclare
its rules in a page file.

---

## Typography hierarchy

### The rule that broke five times

> **A subtitle must never use the same font family as its title.**

If the title is `var(--font-display)` (Parabole), the subtitle is
`var(--font-text)` (Inter). No exceptions. This applies to:

- Page hero h1 + lede
- Section h2 + lede
- Card title + dek
- Anywhere a heading is followed by a descriptive paragraph

### Title scale (`--font-display`, weight 400)

| Use               | Size                          | Line-height | Letter-spacing |
|-------------------|-------------------------------|-------------|----------------|
| Page hero (h1)    | `clamp(44px, 7.4vw, 96px)`    | `1.02`      | `-0.02em`      |
| Section h2        | `clamp(32px, 4.8vw, 64px)`    | `1.08`      | `-0.02em`      |
| Card title (h3)   | `clamp(22px, 2.2vw, 32px)`    | `1.15`      | `-0.01em`      |
| Sub-card title    | `clamp(20px, 2.1vw, 26px)`    | `1.18`      | `-0.01em`      |

Italic emphasis inside a title: `em { font-style: italic; font-weight: 500; color: var(--accent); }`

### Lede / subtitle scale (`--font-text`, weight 300)

| Use               | Size                          | Line-height | Color           |
|-------------------|-------------------------------|-------------|-----------------|
| Page hero lede    | `clamp(18px, 1.5vw, 22px)`    | `1.55`      | `--fg-muted`    |
| Section lede      | `clamp(18px, 1.5vw, 22px)`    | `1.55`      | `--ink`         |
| Card dek          | `clamp(16px, 1.25vw, 18px)`   | `1.55`      | `--fg-muted`    |

### Body (`--font-text`, weight 400)

| Use               | Size                          | Line-height | Color           |
|-------------------|-------------------------------|-------------|-----------------|
| Article body      | `clamp(17px, 1.3vw, 19px)`    | `1.7`       | `--fg-muted`    |
| Section paragraph | `clamp(16px, 1.2vw, 18px)`    | `1.65`      | `--fg-muted`    |
| Card body         | `clamp(15px, 1.15vw, 17px)`   | `1.6`       | `--fg-muted`    |
| Caption / data    | `13–14px`                     | `1.55`      | `--fg-muted`    |

### Eyebrow (`--font-mono`, weight 500, uppercase, letter-spacing `0.22em`)

| Use               | Size                          | Color           |
|-------------------|-------------------------------|-----------------|
| Section eyebrow   | `14px`                        | `--fg-subtle`   |
| Card eyebrow      | `11–12px`                     | `--fg-subtle`   |
| Caption metadata  | `10–11px`                     | `--fg-subtle`   |

All eyebrows include a 28×1px amber rule: `<span class="rule"></span>`.

---

## Components

Every component below is **defined once** in `cmprssn-tokens.css`. Pages
that use a component just apply the class. Pages that need a page-specific
variant declare **only the overriding properties**, never the whole rule
again.

### `.eyebrow`

Mono uppercase metadata with a 28px amber rule. Used everywhere a section
or card starts.

```html
<div class="eyebrow"><span class="rule"></span><span>Label text</span></div>
```

### Surface cards (`.method-card`, `.stage-card`)

Soft-paper card with a warm-on-hover background and an amber 2px bar
slide-in. The shell rules (`background`, `transition`, `::before` bar,
`:hover` bg/lift/shadow) are **shared**. Each card variant only declares
its border and the `::before { top }` offset.

```css
/* tokens.css — shared shell, do not redeclare.
   The amber bar (::before) is positioned at top: 0, flush against the
   border (no gap). Every consuming page inherits this. */
.method-card, .stage-card { position:relative; background:rgba(243,242,231,0.5); ... }
.method-card::before, .stage-card::before { top: 0; height: 2px; /* amber bar */ }
.method-card:hover, .stage-card:hover { background:#FFFCF2; transform:translateY(-3px); ... }

/* index.html — page-specific border only */
.method-card { border: 1px solid var(--line); }

/* methodology.html — page-specific border only */
.stage-card { border: 1px solid var(--line); border-top: 1px solid var(--ink); ... }
```

The amber bar always touches the top border. Do not introduce a gap.

### CTAs

Four canonical buttons, all defined in `cmprssn-tokens.css`. The hover
affordance is the same on all of them: a colored panel slides up from
below via a `::before` pseudo. The arrow icon moves `(3px, -3px)`.

| Class                  | Resting              | On hover                |
|------------------------|----------------------|-------------------------|
| `.cta-amber`           | Amber on cream       | Cream-on-amber inverts to ink-on-cream |
| `.cta-ghost`           | Outline on cream     | Ink fill slides up      |
| `.cta-amber-on-dark`   | Amber on dark band   | Cream slides up         |
| `.cta-ghost-on-dark`   | Outline on dark band | Cream border, cream slides up |

Never define these classes on a page. If a page needs a sub-variant, give
it a different class name (e.g., `.audit-cta` extending `.cta-amber`).

### Nav

Static HTML (`<header class="nav-shell">…</header>`) inlined into every page.
All 13 copies are identical except for the `is-active` class on one
`.nav-link`. CSS for `.nav-shell`, `.nav-link`, `.hamburger`, and
`.mobile-sheet` lives in `cmprssn-tokens.css`. Default state: cream backdrop
with hairline bottom border (visible on page load — never transparent over
imagery). Scroll behavior (`.is-scrolled` + wordmark/logo SVG compression
tween) is driven by `cmprssn.js → initNav()`.

### Footer

Static HTML (`<footer class="site-footer">…</footer>`) inlined into every
page. The `© <span data-current-year>2026</span>` placeholder is updated to
the live year by a tiny inline `<script>` on each page. Footer CSS is
declared inline in `index.html` and in the small shared block injected into
each subpage's `<head>`.

---

## Hover patterns

Five canonical patterns. If you want a hover effect, pick one of these. Don't invent a sixth.

1. **Card lift** — `translateY(-3px)` + `box-shadow: 0 22px 40px -22px rgba(25,25,24,0.16)` over 320ms. Used by `.method-card`, `.stage-card`.
2. **Amber rule slide-in** — a 2px amber `::before` bar scales from `scaleX(0)` to `scaleX(1)` over 360ms. Used by surface cards.
3. **Amber left rule + warm tint** — element keeps its position (no layout shift, no indent), gets a 2px amber left rule that scales from `scaleY(0)` to `scaleY(1)`, and an `rgba(252,170,45,0.03)` background tint fades in. Used by `.vector-item`, `.ladder-row`, `.deliverable`, `.three-item`, `.roster-member`. **Never animate `padding-left` on hover** — it forces the container to shift width and feels jarring. **The element MUST have a permanent left padding (~20–24px) at rest** so the amber rule has standing breathing room from the content — otherwise the rule overlaps the text when it appears.
4. **Cream fills from bottom** — for CTAs. `::before` pseudo with `transform: translateY(101%)` slides to `translateY(0)` over 380ms.
5. **Bolder + tint** — used by data grids (`.heatmap-cell`). On hover the cell changes `font-weight` and `background` only. No layout shift, no transform, no size change.

**Never combine** patterns 1 and 5 — if a hover causes a layout shift in a grid or table, fix it.

---

## Page checklist

When adding a new page, in order:

1. `<link rel="stylesheet" href="cmprssn-tokens.css">` in `<head>`.
2. Inline the canonical `<header class="nav-shell">…</header>` near the top
   of `<body>`. Mark the active page by adding `is-active` to its
   `.nav-link`. Copy from any existing page.
3. Inline the canonical `<div class="mobile-sheet" id="mobile-sheet">…</div>`
   directly after the nav.
4. Page content using shared components (`.eyebrow`, `.method-card` or
   `.stage-card`, `.cta-amber` family, `.wrap`). Add `class="reveal"` to
   anything that should fade up on viewport entry; add `class="compress-on-enter"`
   to headlines that should compress letter-spacing on entry.
5. Inline the canonical `<footer class="site-footer">…</footer>` at the
   bottom of `<body>`.
6. Just before `</body>`:
   ```html
   <script>
     document.querySelectorAll('[data-current-year]').forEach(el => {
       el.textContent = new Date().getFullYear();
     });
   </script>
   <script src="/cmprssn.js?v=3" defer></script>
   ```
7. Page-specific `<style>` block (if needed) for layout that genuinely
   doesn't exist anywhere else. Keep it short. Anything reused goes in
   `cmprssn-tokens.css`.

Bump the `?v=N` on `cmprssn.js` when you edit that file, so browsers
re-fetch instead of serving cached JS.

---

## When you find drift

If you discover that the same class is defined in two places and the two
copies disagree:

1. Pick the version that matches `design.md`. If neither matches, write the
   correct version per this doc.
2. Put it in `cmprssn-tokens.css`.
3. Delete the duplicate copies from page files.
4. Verify in the browser preview that every consuming page still renders
   correctly.

Do not "fix it on one page" without reconciling the others. That's how we
got here.

---

## Editorial register (content, not code)

Words matter as much as type. Two rules:

1. **No undefined jargon on marketing surfaces.** If a term like "MVO" or
   "Atlas" appears, it must be defined inline. The exception: field-notes
   articles where the article itself is the definition.
2. **Don't claim a client base you don't have.** Avoid phrasing like
   "every company I have worked with" — use "every company I've seen up
   close" or "the founders I've talked to." See the existing field-notes
   for tone.

---

## Last note

This document is the contract. If a future change makes a page diverge
from it, the change is wrong — not the document. Update the document
*only* when the design system itself genuinely evolves, and update every
consuming page in the same commit.
