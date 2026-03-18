# Tailwind Review — Inline Style Audit (2026-03-18)

Audit of inline `style={{}}` usage vs Tailwind v4 utilities across `src/`.
Project uses Tailwind v4 CSS-first config (no tailwind.config file, `@import "tailwindcss"` in global.css).

===

## @theme inline Registration

31 of 38 `style={{` blocks across all components contain at least one CSS variable reference.
Tailwind v4 supports `@theme inline` with CSS variable values that resolve at runtime:

```css
@theme inline {
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-tertiary: var(--text-tertiary);
  --color-text-ghost: var(--text-ghost);
  --color-bg-deep: var(--bg-deep);
  --color-bg-surface: var(--bg-surface);
  --color-bg-raised: var(--bg-raised);
  --color-bg-focus: var(--bg-focus);
  --color-bg-hover: var(--bg-hover);
  --color-border-subtle: var(--border-subtle);
  --color-border-dim: var(--border-dim);
  --color-accent: var(--accent);
  --color-accent-border: var(--accent-border);
  --color-done-text: var(--done-text);
  --color-done-line: var(--done-line);
  --color-red-soft: var(--red-soft);
  --color-green-soft: var(--green-soft);
  --color-yellow-soft: var(--yellow-soft);
}
```

Then: `style={{ color: 'var(--text-primary)' }}` becomes `className="text-text-primary"`.

`@theme inline` is preferred over plain `@theme` — Tailwind v4 docs recommend it for vars referencing other vars, as it eliminates the intermediate variable layer.

Registering 18 color variables + 2 font variables (`--font-body`, `--font-mono`) + 2 spacing variables (`--topbar-h`, `--content-width`) = 22 theme tokens would let those 31 blocks use Tailwind classes instead of inline styles.

===

## Per-File Findings

### OutlineItem.tsx

#### Inline styles replaceable by @theme inline + utilities

1. Line 62: `paddingRight: 8` → `pr-2`
2. Line 63: `paddingTop: rendered.isHeading ? 12 : 7` → conditional classes `pt-3` / `pt-[7px]`
3. Line 64: `paddingBottom: rendered.isHeading ? 12 : 7` → conditional classes `pb-3` / `pb-[7px]`
4. Line 72: `height: 28` → `h-[28px]`
5. Line 73: `cursor: hasChildren ? 'pointer' : 'default'` → conditional `cursor-pointer` / `cursor-default`
6. Line 74: `visibility: hasChildren ? 'visible' : 'hidden'` → conditional `visible` / `invisible`
7. Line 79: `transform: item.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'` → conditional `-rotate-90` / `rotate-0`
8. Line 101: `fontSize: 16` → `text-[16px]` (not `text-base` — that also sets line-height:1.5rem, clobbering lineHeight:1.75)
9. Line 102: `lineHeight: 1.75` → `leading-[1.75]`
10. Line 103: `minHeight: 28` → `min-h-[28px]`
11. Line 104: `fontFamily: 'var(--font-body)'` → register `--font-body` in @theme inline, use `font-body`
12. Line 105: `color: 'var(--text-primary)'` → `text-text-primary` (after @theme inline)
13. Line 106: `background: 'var(--bg-raised)'` → `bg-bg-raised` (after @theme inline)
14. Line 107: `border: '1px solid var(--accent-border)'` → `border border-accent-border` (after @theme inline)
15. Line 114: `fontSize: 16` → `text-[16px]` (same caveat as item 8)
16. Line 115: `lineHeight: 1.75` → `leading-[1.75]`
17. Line 116: `minHeight: 28` → `min-h-[28px]`
18. Line 117: `color: item.done ? 'var(--done-text)' : 'var(--text-primary)'` → conditional `text-done-text` / `text-text-primary`
19. Line 118: `textDecoration: item.done ? 'line-through' : undefined` → conditional `line-through`
20. Line 119: `textDecorationColor: item.done ? 'var(--done-line)' : undefined` → conditional `decoration-done-line`
21. Line 131: `fontSize: 11` → `text-[11px]`
22. Line 132: `fontFamily: 'var(--font-mono)'` → `font-mono` (after @theme inline)
23. Line 133: `color: 'var(--text-ghost)'` → `text-text-ghost` (after @theme inline)
24. Lines 155-175: InlineTag `styleMap` — mixed: 6 of 12 values are CSS variables (4 colors + label bg + label border), 6 are hardcoded `rgba()` literals (priority/progress/due backgrounds and borders). CSS var values replaceable after @theme inline; rgba literals need Tailwind arbitrary values or custom theme tokens.
25. Line 145: note text `color: 'var(--text-secondary)'` → `text-text-secondary` (after @theme inline)
26. Line 182: `fontSize: '11.5px'` → `text-[11.5px]`
27. Line 184: `fontWeight: 400` → `font-normal`
28. Line 185: `padding: '1px 7px'` → `px-[7px] py-px`
29. Line 186: `borderRadius: 3` → `rounded-[3px]`
30. Line 187: `letterSpacing: 0` → `tracking-[0]`

#### Must stay inline

1. Line 61: `paddingLeft: depth * 28 + 8` — runtime computed from `depth` variable

### CommandPalette.tsx

#### Inline styles replaceable by @theme inline + utilities

1. Line 102: `background: 'rgba(0, 0, 0, 0.4)'` → `bg-black/40`
2. Line 102: `paddingTop: 120` → `pt-[120px]`
3. Line 108: `width: 440` → `w-[440px]`
4. Line 109: `maxHeight: 380` → `max-h-[380px]`
5. Line 110: `background: 'var(--bg-raised)'` → `bg-bg-raised` (after @theme inline)
6. Line 111: `border: '1px solid var(--border-dim)'` → `border border-border-dim` (after @theme inline)
7. Line 112: `boxShadow: '0 16px 48px rgba(0,0,0,0.4)'` → `shadow-[0_16px_48px_rgba(0,0,0,0.4)]`
8. Line 117: `height: 48` → `h-12`
9. Line 117: `borderBottom: '1px solid var(--border-subtle)'` → `border-b border-border-subtle` (after @theme inline)
10. Lines 127-131: input — `background: 'transparent'` → `bg-transparent`, `border: 'none'` → `border-none`, color/fontFamily → @theme inline
11. Line 136: `maxHeight: 330` → `max-h-[330px]`
12. Line 138: `color: 'var(--text-tertiary)'` on "No matching commands" → `text-text-tertiary` (after @theme inline)
13. Line 147: `height: 38` → `h-[38px]`
14. Line 148: `background: index === selectedIndex ? 'var(--bg-hover)' : 'transparent'` → conditional `bg-bg-hover` / `bg-transparent`
15. Line 149: `color: 'var(--text-primary)'` → `text-text-primary`
16. Line 150: `fontFamily: 'var(--font-body)'` → `font-body`
17. Line 151: `fontSize: 13` → `text-[13px]`
18. Line 159: kbd `height: 20, minWidth: 20, fontSize: 10, padding: '0 5px'` — global.css kbd sets height: 20, min-width: 20, padding: 0 5px (identical), only fontSize differs (10 vs global 10.5). 3 of 4 props are redundant; only the 0.5px fontSize difference is intentional (if at all)
19. Line 173: SearchIcon `color: 'var(--text-tertiary)'` → `text-text-tertiary` (after @theme inline)

### TopBar.tsx

#### Inline styles replaceable by @theme inline + utilities

1. Lines 33-36: header — `height: 'var(--topbar-h)'`, `background: 'var(--bg-surface)'`, `borderBottom` → @theme inline + utilities
2. Line 41: logo parent `color: 'var(--text-secondary)'` → `text-text-secondary`
3. Line 43: "Vista" text `color: 'var(--accent)'` → `text-accent`
4. Line 48: nav breadcrumb `color: 'var(--text-tertiary)'` → `text-text-tertiary`
5. Line 55: current page `color: 'var(--text-secondary)'` → `text-text-secondary`
6. Lines 69-74: input conditional styles — `background`, `border`, `color`, `fontFamily` all CSS vars → @theme inline
7. Line 91: SearchIcon `color: 'var(--text-tertiary)'` → `text-text-tertiary`

### ThemeSwitcher.tsx

#### Inline styles replaceable by @theme inline + utilities

1. Lines 33-37: dropdown panel — `background`, `border`, `boxShadow`, `width` → @theme inline + utilities
2. Lines 42-44: header — `color: 'var(--text-tertiary)'`, `borderBottom` → @theme inline
3. Lines 57-60: theme option button — `color`, `fontFamily`, `fontSize` → @theme inline + utilities
4. Line 67: swatch — `border: '2px solid var(--border-dim)'` → `border-2 border-border-dim`
5. Line 72: checkmark `color: 'var(--accent)'` → `text-accent`

#### Must stay inline

1. Line 66: `background: theme.swatch` — runtime computed per theme object

### OutlineTree.tsx

#### Inline styles replaceable by @theme inline + utilities

1. Line 16: `marginTop: 'var(--topbar-h)'` → `mt-topbar` (after @theme inline), `paddingTop: 40` → `pt-10`
2. Line 18: `maxWidth: 'calc(var(--content-width) + 64px)'` → `max-w-[calc(var(--content-width)+64px)]`
3. Line 22: `borderBottom: '1px solid var(--border-subtle)'` → `border-b border-border-subtle`
4. Lines 28-29: `letterSpacing: '-0.02em'`, `color: 'var(--text-primary)'` → `tracking-[-0.02em] text-text-primary`
5. Line 52: `color: 'var(--text-tertiary)'` → `text-text-tertiary`

### BottomBar.tsx

#### Inline styles replaceable by @theme inline + utilities

1. Lines 19-21: `background: 'var(--bg-surface)'`, `borderTop`, `color: 'var(--text-ghost)'` → @theme inline
2. Line 29: `background: 'var(--border-subtle)'` → `bg-border-subtle` (after @theme inline)
3. Lines 37-40: kbd `height: 18, minWidth: 18, fontSize: 10, padding: '0 4px'` — all 4 props differ from global.css kbd (height 18 vs 20, minWidth 18 vs 20, fontSize 10 vs 10.5, padding '0 4px' vs '0 5px'). Intentional compact variant for the bottom bar

### App.tsx

#### Inline styles replaceable by @theme inline

1. Line 13: `background: 'var(--bg-deep)'` → `bg-bg-deep` (after @theme inline)

===

## global.css — Classes That Could Be Tailwind

1. `.outline-item-row` (lines 62-71) — `background: transparent` + `.is-focused` state with CSS vars. Uses `.is-focused` class toggling with hover/box-shadow. Keep in CSS.
2. `.topbar-btn` (lines 74-85) — hover/active states with CSS vars. Uses `.is-active` class toggling. Keep in CSS.
3. `.chevron-toggle` (lines 88-95) — base styles + `:hover` only. No class toggling — Tailwind handles hover trivially with `hover:` prefix. Could move to Tailwind.
4. `.theme-option` (lines 98-106) — hover + `.is-active` class toggling. Keep in CSS.
5. `.command-palette-item` (lines 137-142) — base styles + `:hover` only. No class toggling — same as item 3, could move to Tailwind.
6. `.md-h1/.md-h2/.md-h3` (lines 109-126) — static typography (font-size, font-weight, letter-spacing, line-height). All values are fixed, no CSS vars. Could be Tailwind utilities or @apply.
7. `.md-code` (lines 127-134) — font-family, font-size, background, border, border-radius, padding. Uses CSS vars for bg/border. Could move to Tailwind after @theme inline.

===

## Summary

1. **@theme inline registration** — 31 of 38 `style={{` blocks reference CSS vars. Registering 22 theme tokens (18 colors + 2 fonts + 2 spacing) eliminates inline styles from those 31 blocks.
2. **Static utility replacement** — ~26 instances of fixed values (fontSize, width, height, padding, maxHeight, letterSpacing, fontWeight, borderRadius) that map to Tailwind utilities: OutlineItem 14, CommandPalette 10, OutlineTree 3, BottomBar 1. Note: `text-[16px]` not `text-base` (which clobbers line-height).
3. **Conditional class replacement** — 12 instances of ternary style props that map to conditional Tailwind classes: OutlineItem 8 (padding, cursor, visibility, transform, text-decoration, color, decorationColor), TopBar 2 (background, border), ThemeSwitcher 1 (color), CommandPalette 1 (background).
4. **Must stay inline** — 2 instances: `paddingLeft: depth * 28 + 8` in OutlineItem.tsx (runtime computed), `background: theme.swatch` in ThemeSwitcher.tsx (runtime per theme object).
5. **global.css** — 3 class groups (items 1, 2, 4) use class-toggling patterns, keep in CSS. 2 class groups (items 3, 5) are hover-only with no class toggling, could move to Tailwind. 2 class groups (items 6, 7) use only static values or CSS vars, could move to Tailwind.
