# Tailwind Review — Inline Style Audit (2026-03-18)

Audit of inline `style={{}}` usage vs Tailwind v4 utilities across `src/`.
Project uses Tailwind v4 CSS-first config (no tailwind.config file, `@import "tailwindcss"` in global.css).

===

## @theme Registration

31 of 38 `style={{` blocks across all components contain at least one CSS variable reference.
Tailwind v4 supports `@theme` with CSS variable values that resolve at runtime:

```css
@theme {
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

Registering ~20 color variables + 2 font variables + 2 spacing variables would let those 31 blocks use Tailwind classes instead of inline styles.

===

## Per-File Findings

### OutlineItem.tsx

#### Inline styles replaceable by @theme + utilities

1. Line 84: `paddingRight: 8` → `pr-2`
2. Line 85: `paddingTop: rendered.isHeading ? 12 : 7` → conditional classes `pt-3` / `pt-[7px]`
3. Line 86: `paddingBottom: rendered.isHeading ? 12 : 7` → conditional classes `pb-3` / `pb-[7px]`
4. Line 96: `cursor: hasChildren ? 'pointer' : 'default'` → conditional `cursor-pointer` / `cursor-default`
5. Line 97: `visibility: hasChildren ? 'visible' : 'hidden'` → conditional `visible` / `invisible`
6. Line 101: `transform: item.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'` → conditional `-rotate-90` / `rotate-0`
7. Line 125: `fontSize: 16` → `text-base`
8. Line 126: `lineHeight: 1.75` → `leading-[1.75]`
9. Line 127: `minHeight: 28` → `min-h-[28px]`
10. Line 128: `fontFamily: 'var(--font-body)'` → register `--font-body` in @theme, use `font-body`
11. Line 129: `color: 'var(--text-primary)'` → `text-text-primary` (after @theme)
12. Line 130: `background: 'var(--bg-raised)'` → `bg-bg-raised` (after @theme)
13. Line 131: `border: '1px solid var(--accent-border)'` → `border border-accent-border` (after @theme)
14. Line 138: `fontSize: 16` → `text-base`
15. Line 139: `lineHeight: 1.75` → `leading-[1.75]`
16. Line 140: `minHeight: 28` → `min-h-[28px]`
17. Line 141: `color: item.done ? 'var(--done-text)' : 'var(--text-primary)'` → conditional `text-done-text` / `text-text-primary`
18. Line 142: `textDecoration: item.done ? 'line-through' : undefined` → conditional `line-through`
19. Line 143: `textDecorationColor: item.done ? 'var(--done-line)' : undefined` → conditional `decoration-done-line`
20. Line 155: `fontSize: 11` → `text-[11px]`
21. Line 156: `fontFamily: 'var(--font-mono)'` → `font-mono` (after @theme)
22. Line 157: `color: 'var(--text-ghost)'` → `text-text-ghost` (after @theme)
23. Lines 178-199: InlineTag `styleMap` — all color/background/border values use CSS variables → all replaceable after @theme
24. Line 145: note text `color: 'var(--text-secondary)'` → `text-text-secondary` (after @theme)

#### Must stay inline

1. Line 83: `paddingLeft: depth * 28 + 8` — runtime computed from `depth` variable

### CommandPalette.tsx

#### Inline styles replaceable by @theme + utilities

1. Line 102: `background: 'rgba(0, 0, 0, 0.4)'` → `bg-black/40`
2. Line 102: `paddingTop: 120` → `pt-[120px]`
3. Line 110: `width: 440` → `w-[440px]`
4. Line 111: `maxHeight: 380` → `max-h-[380px]`
5. Line 112: `background: 'var(--bg-raised)'` → `bg-bg-raised` (after @theme)
6. Line 113: `border: '1px solid var(--border-dim)'` → `border border-border-dim` (after @theme)
7. Line 114: `boxShadow: '0 16px 48px rgba(0,0,0,0.4)'` → `shadow-[0_16px_48px_rgba(0,0,0,0.4)]`
8. Line 121: `height: 48` → `h-12`
9. Line 121: `borderBottom: '1px solid var(--border-subtle)'` → `border-b border-border-subtle` (after @theme)
10. Line 130-134: input — `background: 'transparent'` → `bg-transparent`, `border: 'none'` → `border-none`, color/fontFamily → @theme
11. Line 150: `height: 38` → `h-[38px]`
12. Line 151: `background: index === selectedIndex ? 'var(--bg-hover)' : 'transparent'` → conditional `bg-bg-hover` / `bg-transparent`
13. Line 152: `color: 'var(--text-primary)'` → `text-text-primary`
14. Line 153: `fontFamily: 'var(--font-body)'` → `font-body`
15. Line 154: `fontSize: 13` → `text-[13px]`
16. Line 157: kbd `height: 20, minWidth: 20, fontSize: 10, padding: '0 5px'` — global.css kbd sets height: 20, min-width: 20, padding: 0 5px (identical), only fontSize differs (10 vs global 10.5). 3 of 4 props are redundant; only the 0.5px fontSize difference is intentional (if at all)
17. Line 136: `maxHeight: 330` → `max-h-[330px]`
18. Line 138: `color: 'var(--text-tertiary)'` on "No matching commands" → `text-text-tertiary` (after @theme)
19. Line 173: SearchIcon `color: 'var(--text-tertiary)'` → `text-text-tertiary` (after @theme)

### TopBar.tsx

#### Inline styles replaceable by @theme + utilities

1. Line 33-36: header — `height: 'var(--topbar-h)'`, `background: 'var(--bg-surface)'`, `borderBottom` → @theme + utilities
2. Line 41: logo parent `color: 'var(--text-secondary)'` → `text-text-secondary`
3. Line 43: "Vista" text `color: 'var(--accent)'` → `text-accent`
4. Line 48: nav breadcrumb `color: 'var(--text-tertiary)'` → `text-text-tertiary`
5. Line 55: current page `color: 'var(--text-secondary)'` → `text-text-secondary`
6. Line 69-75: input conditional styles — `background`, `border`, `color` all CSS vars → @theme
7. Line 91: SearchIcon `color: 'var(--text-tertiary)'` → `text-text-tertiary`

### ThemeSwitcher.tsx

#### Inline styles replaceable by @theme + utilities

1. Line 58-62: dropdown panel — `background`, `border`, `boxShadow`, `width` → @theme + utilities
2. Line 67-70: header — `color: 'var(--text-tertiary)'`, `borderBottom` → @theme
3. Line 82-86: theme option button — `color`, `fontFamily`, `fontSize` → @theme + utilities
4. Line 89-91: swatch — `border: '2px solid var(--border-dim)'` → `border-2 border-border-dim`
5. Line 97: checkmark `color: 'var(--accent)'` → `text-accent`

### OutlineTree.tsx

#### Inline styles replaceable by @theme + utilities

1. Line 16: `marginTop: 'var(--topbar-h)'` → `mt-topbar` (after @theme), `paddingTop: 40` → `pt-10`
2. Line 18: `maxWidth: 'calc(var(--content-width) + 64px)'` → `max-w-[calc(var(--content-width)+64px)]`
3. Line 22: `borderBottom: '1px solid var(--border-subtle)'` → `border-b border-border-subtle`
4. Line 29-30: `letterSpacing: '-0.02em'`, `color: 'var(--text-primary)'` → `tracking-[-0.02em] text-text-primary`
5. Line 53: `color: 'var(--text-tertiary)'` → `text-text-tertiary`

### BottomBar.tsx

#### Inline styles replaceable by @theme + utilities

1. Line 19-21: `background: 'var(--bg-surface)'`, `borderTop`, `color: 'var(--text-ghost)'` → @theme
2. Line 29: `background: 'var(--border-subtle)'` → `bg-border-subtle` (after @theme)
3. Lines 37-40: kbd `height: 18, minWidth: 18, fontSize: 10, padding: '0 4px'` — all 4 props differ from global.css kbd (height 18 vs 20, minWidth 18 vs 20, fontSize 10 vs 10.5, padding '0 4px' vs '0 5px'). Intentional compact variant for the bottom bar

### App.tsx

#### Inline styles replaceable by @theme

1. Line 13: `background: 'var(--bg-deep)'` → `bg-bg-deep` (after @theme)

===

## global.css — Classes That Could Be Tailwind

1. `.outline-item-row` (line 62-71) — `background: transparent` + `.is-focused` state with CSS vars. Uses `.is-focused` class toggling with hover/box-shadow; moving to Tailwind would require data attributes or conditional className strings, which is a larger refactor for no functional gain. Keep in CSS.
2. `.topbar-btn` (line 74-85) — hover/active states with CSS vars. Same class-toggling pattern as above. Keep in CSS.
3. `.chevron-toggle` (line 88-95) — same class-toggling pattern. Keep in CSS.
4. `.theme-option` (line 98-106) — same class-toggling pattern. Keep in CSS.
5. `.command-palette-item` (line 137-142) — same class-toggling pattern. Keep in CSS.
6. `.md-h1/.md-h2/.md-h3` (line 109-126) — static typography (font-size, font-weight, letter-spacing, line-height). All values are fixed, no CSS vars. Could be Tailwind utilities or @apply.
7. `.md-code` (line 127-134) — font-family, font-size, background, border, border-radius, padding. Uses CSS vars for bg/border. Could move to Tailwind after @theme.

===

## Summary

1. **@theme registration** — 31 of 38 `style={{` blocks reference CSS vars. Registering ~24 theme tokens eliminates inline styles from those 31 blocks.
2. **Static utility replacement** — 14 instances of fixed values (fontSize, width, height, padding, maxHeight, letterSpacing) that map to Tailwind utilities: OutlineItem 8, CommandPalette 5, OutlineTree 1.
3. **Conditional class replacement** — 7 instances of ternary style props that map to conditional Tailwind classes: OutlineItem 6 (padding, cursor, visibility, transform, text-decoration, color), CommandPalette 1 (background).
4. **Must stay inline** — 1 instance: `paddingLeft: depth * 28 + 8` in OutlineItem.tsx (runtime computed).
5. **global.css** — 5 class groups (items 1-5) use class-toggling hover/focus patterns, keep in CSS. 2 class groups (items 6-7) use only static values or CSS vars, could move to Tailwind.
