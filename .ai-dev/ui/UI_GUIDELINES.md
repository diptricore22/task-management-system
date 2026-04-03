# 🎨 UI Design Guidelines

> **The visual design system for this project. Reference this for all frontend/UI work.**  
> AI should read this before generating any UI code or designing any component.

---

## Design Principles

1. **Clarity first** — users should instantly understand what to do
2. **Mobile-first** — design for 375px wide, then scale up
3. **Consistent spacing** — use the spacing scale, not arbitrary values
4. **Accessible by default** — WCAG 2.1 AA minimum

---

## Color System

Define your color tokens here. Update once and use everywhere via CSS variables.

```css
:root {
  /* --- Brand Colors --- */
  --color-primary:       hsl(220, 90%, 56%);  /* Main actions, links */
  --color-primary-dark:  hsl(220, 85%, 46%);  /* Hover state */
  --color-primary-light: hsl(220, 90%, 96%);  /* Backgrounds, badges */

  /* --- Semantic Colors --- */
  --color-success:   hsl(145, 65%, 42%);
  --color-warning:   hsl(38, 92%, 50%);
  --color-danger:    hsl(0, 78%, 55%);
  --color-info:      hsl(200, 80%, 50%);

  /* --- Neutral Scale --- */
  --color-gray-50:  hsl(220, 20%, 98%);
  --color-gray-100: hsl(220, 15%, 94%);
  --color-gray-200: hsl(220, 15%, 88%);
  --color-gray-300: hsl(220, 12%, 76%);
  --color-gray-400: hsl(220, 10%, 58%);
  --color-gray-500: hsl(220, 10%, 44%);
  --color-gray-600: hsl(220, 10%, 34%);
  --color-gray-700: hsl(220, 12%, 24%);
  --color-gray-800: hsl(220, 14%, 16%);
  --color-gray-900: hsl(220, 16%, 10%);

  /* --- Semantic Aliases --- */
  --color-text:          var(--color-gray-800);
  --color-text-muted:    var(--color-gray-500);
  --color-bg:            var(--color-gray-50);
  --color-surface:       #ffffff;
  --color-border:        var(--color-gray-200);

  /* --- Dark mode (optional) --- */
  /* Define these inside a [data-theme="dark"] selector */
}
```

---

## Typography

```css
:root {
  /* Font Families */
  --font-sans:  'Inter', 'Segoe UI', sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes (fluid, clamped) */
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  2.25rem;    /* 36px */

  /* Font Weights */
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;

  /* Line Heights */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

---

## Spacing Scale

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

---

## Border Radius

```css
:root {
  --radius-sm:   0.25rem;  /* 4px — small elements */
  --radius-md:   0.5rem;   /* 8px — inputs, badges */
  --radius-lg:   0.75rem;  /* 12px — cards */
  --radius-xl:   1rem;     /* 16px — modals, panels */
  --radius-full: 9999px;   /* pills, avatars */
}
```

---

## Shadows

```css
:root {
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.05);
  --shadow-lg:  0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06);
  --shadow-xl:  0 20px 50px rgba(0,0,0,0.14);
}
```

---

## Breakpoints

```css
/* Mobile first: add breakpoints upward */
/* xs:  default (0px+) */
/* sm:  640px+ */
/* md:  768px+ */
/* lg:  1024px+ */
/* xl:  1280px+ */
/* 2xl: 1536px+ */

@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## Layout

- **Max content width:** `1200px` centered
- **Page padding:** `--space-4` (mobile) → `--space-8` (desktop)
- **Grid columns:** 12-column grid system
- **Sidebar width:** `240px` (collapsed: `64px`)

---

## Component Design Tokens

### Buttons
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  /* Hover: --color-primary-dark */
}
```

### Input Fields
```css
.input {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  /* Focus: --color-primary border */
  /* Error: --color-danger border */
}
```

### Cards
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
}
```

---

## Accessibility Requirements

- Color contrast ratio: minimum **4.5:1** for text (WCAG AA)
- All interactive elements must be keyboard-focusable
- Focus ring must be visible (don't remove `outline`)
- Images must have `alt` text
- Forms must have `<label>` for all inputs
- Error messages must be associated via `aria-describedby`
- Modals must trap focus and be closeable with `Escape`

---

## Page Reference Files

HTML reference files live in `ui/pages/`.  
When building a feature, reference the relevant page template to AI.

| Page | File | Notes |
|------|------|-------|
| Login | `pages/login.html` | Auth page layout |
| Dashboard | `pages/dashboard.html` | Main app shell |
| List view | `pages/list.html` | Table/grid layout |
| Detail view | `pages/detail.html` | Single item view |
| Form | `pages/form.html` | Create/edit form |
| Error | `pages/error.html` | 404/500 pages |
