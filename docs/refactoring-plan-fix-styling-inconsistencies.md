# Refactoring Plan: Fix Styling Inconsistencies

## Principles

These two rules govern all styling decisions. Specific findings go stale as code changes — these principles are the durable bar.

### 1. Static values in classes, dynamic values in inline style

Test: "does this value change at runtime?" If no, it belongs in a class (Tailwind utility or CSS class). If yes, inline style.

This single rule prevents:
- Mixing Tailwind, CSS classes, and inline style for the same static property
- Re-declaring inherited values (e.g. font-family inherited from body)
- Overriding a CSS class with inline style for the same static value
- Using multiple formats for static sizing (Tailwind class vs inline px vs bracket notation)

**Bad** — static color and font size in inline style:
```tsx
<span style={{ fontSize: 16, color: 'var(--text-primary)' }}>
```

**Good** — static values in Tailwind classes:
```tsx
<span className="text-[16px] text-primary">
```

**Bad** — re-declaring inherited font-family:
```tsx
<input style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }} />
```

**Good** — body already sets font-family, only non-inherited values need classes:
```tsx
<input className="text-primary" />
```

**Bad** — overriding a CSS class with inline style for the same property:
```tsx
// global.css: kbd { height: 20px; min-width: 20px }
<kbd style={{ height: 18, minWidth: 18 }}>
```

**Good** — use a variant class:
```tsx
<kbd className="kbd-compact">
```

**Legitimate inline** — value computed at runtime:
```tsx
<div style={{ paddingLeft: depth * 28 + 8 }}>
```

**Bad** — hover-only CSS class that could be a Tailwind variant:
```css
.chevron-toggle { background: none; color: var(--text-tertiary) }
.chevron-toggle:hover { color: var(--text-secondary); background: var(--bg-raised) }
```

**Good** — Tailwind hover variants (no class toggling needed):
```tsx
<button className="bg-transparent text-tertiary hover:text-secondary hover:bg-raised">
```

### 2. All colors through theme CSS variables

No hardcoded color values that bypass the theme system. Every color that appears in the UI must trace back to a CSS variable set by the theme store. Hardcoded rgba/hex values won't adapt on theme switch.

**Bad** — hardcoded rgba that won't follow theme:
```tsx
style={{ background: 'rgba(192, 84, 79, 0.12)', color: 'var(--red-soft)' }}
```

**Good** — both background and text through theme vars:
```tsx
className="bg-red-soft/10 text-red-soft"
```

## Solution: @theme inline

Tailwind v4's `@theme inline` directive maps runtime CSS variables to Tailwind color tokens. The `inline` keyword is required because the variables are set at runtime by the theme store.

The naming strips the category prefix from the CSS variable to avoid stutter with Tailwind's utility prefix:

```
var(--bg-deep)       -> --color-deep       -> bg-deep
var(--text-primary)  -> --color-primary    -> text-primary
var(--border-subtle) -> --color-subtle     -> border-subtle
```

### Proposed @theme block (for global.css)

```css
@theme inline {
  /* Colors */
  --color-deep: var(--bg-deep);
  --color-surface: var(--bg-surface);
  --color-raised: var(--bg-raised);
  --color-hover: var(--bg-hover);
  --color-focus: var(--bg-focus);
  --color-subtle: var(--border-subtle);
  --color-dim: var(--border-dim);
  --color-primary: var(--text-primary);
  --color-secondary: var(--text-secondary);
  --color-tertiary: var(--text-tertiary);
  --color-ghost: var(--text-ghost);
  --color-accent: var(--accent);
  --color-accent-dim: var(--accent-dim);
  --color-accent-glow: var(--accent-glow);
  --color-accent-ring: var(--accent-border);
  --color-red-soft: var(--red-soft);
  --color-green-soft: var(--green-soft);
  --color-yellow-soft: var(--yellow-soft);

  /* Fonts */
  --font-body: var(--font-body);
  --font-mono: var(--font-mono);

  /* Spacing */
  --spacing-topbar: var(--topbar-h);
  --spacing-content: var(--content-width);
}
```

No Tailwind v4 name conflicts confirmed. `hover`/`focus` are variant prefixes (use `:`) and don't collide with color tokens.

Font tokens enable `font-body` and `font-mono` classes. Spacing tokens enable `mt-topbar`, `max-w-content`, etc.

### Gotcha: text-base vs text-[16px]

Do not use `text-base` for `fontSize: 16`. Tailwind's `text-base` also sets `line-height: 1.5rem`, which clobbers the explicit `lineHeight: 1.75` used on outline items. Use `text-[16px]` instead.

## Open Questions

### Q1: accent-border naming

`--accent-border` maps to `border-accent-border` (stutter). Rename to `--color-accent-ring` so it becomes `border-accent-ring`? "ring" is Tailwind vocabulary. Alternatives: `accent-edge`, `accent-outline`.

### Q2: done-text / done-line

Only used in 1 location each. Adding to @theme creates `text-done-text` stutter. Leave as inline `var()`, or register as `--color-done` and `--color-strike`?

### Q3: bg-subtle for separator

BottomBar uses `--border-subtle` as a background for a separator div. With @theme it becomes `bg-subtle`. Reads fine, but it's semantically using a "border color" as a "background." Accept, or add a dedicated `--color-separator`?

### Q4: Hardcoded rgba tag colors

InlineTag uses 8 hardcoded rgba values for tag backgrounds and borders. These don't adapt on theme switch. Need new CSS variables in ThemeColors. Tackle as part of this refactor, or separate follow-up?

### Q5: Non-color inline styles

After @theme migration, ~20 inline styles remain for fontSize, height, width, padding, etc. These are static values that per principle 1 should be Tailwind classes. Tackle in this refactor, or separate pass?

## Audit Instruction

To regenerate fresh per-file findings, run this prompt against the codebase:

> In src check all styles and classes, and the css file. Review against the two principles in docs/refactoring-plan-fix-styling-inconsistencies.md. For each file, report every violation with the current code and what it should be. Include global.css classes that can move to Tailwind (hover-only, no class toggling) vs those that must stay (class toggling with JS).
