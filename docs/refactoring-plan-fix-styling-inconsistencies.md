# Refactoring Plan: Fix Styling Inconsistencies

## Principles

These two rules govern all styling decisions. Specific findings may shift as code evolves, but these principles remain the bar.

### 1. Static values in classes, dynamic values in inline style

Test: "does this value change at runtime?" If no, it belongs in a class (Tailwind utility or CSS class). If yes, inline style.

This single rule prevents:
- Mixing Tailwind, CSS classes, and inline style for the same static property
- Re-declaring inherited values (e.g. font-family inherited from body)
- Overriding a CSS class with inline style for the same static value
- Using multiple formats for static sizing (Tailwind class vs inline px vs bracket notation)

### 2. All colors through theme CSS variables

No hardcoded color values that bypass the theme system. Every color that appears in the UI must trace back to a CSS variable set by the theme store. Hardcoded rgba/hex values won't adapt on theme switch.

## Solution: @theme inline

Tailwind v4's `@theme inline` directive maps runtime CSS variables to Tailwind color tokens. The `inline` keyword is required because the variables are set at runtime by the theme store.

The naming strips the category prefix from the CSS variable to avoid stutter with Tailwind's utility prefix:

```
var(--bg-deep)       → --color-deep       → bg-deep
var(--text-primary)  → --color-primary    → text-primary
var(--border-subtle) → --color-subtle     → border-subtle
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

## Specific Tracks

Current findings snapshot. Line numbers may drift as code changes — use principles above to guide decisions.

### Track 1: @theme inline migration

29 inline color/background/border styles convert directly to Tailwind classes. 4 conditional styles convert to className ternaries. 8 dynamic/computed values stay as inline style legitimately.

### Track 2: Font size unification

Font sizes set 4 different ways across 16 locations: Tailwind brackets (`text-[13px]`), Tailwind named (`text-xs`), inline style numbers (`fontSize: 16`), CSS classes (`font-size: 26px`). Per principle 1, static sizes belong in classes.

### Track 3: kbd variant approach

`global.css` defines `kbd` base styles. Two locations override inline with slightly different values (height 18 vs 20, padding 4px vs 5px). Per principle 1, use a CSS variant class instead of inline overrides.

### Track 4: Transition removal

6 interactive elements have `transition-colors` or `transition-transform`, violating CLAUDE.md convention ("no CSS transitions on interactive elements"). Remove all.

### Track 5: Icon deduplication

SearchIcon defined in both TopBar.tsx and CommandPalette.tsx (same SVG, different API). Settings gear SVG duplicated in TopBar.tsx and OutlineTree.tsx. Extract shared icons to a single location.

### Track 6: OutlineTree offset investigation

`OutlineTree` has `marginTop: var(--topbar-h)` plus `paddingTop: 40`, but TopBar is a flex child with `shrink-0` (not fixed/absolute). The margin may be leftover from when TopBar was fixed. Investigate whether 92px of dead space above content is intentional.

### Track 7: Redundant override deletion

4 locations re-declare `fontFamily: 'var(--font-body)'` which is already inherited from body. Delete.

### Track 8: global.css class cleanup

7 custom CSS classes in `global.css`. 3 use class-toggling patterns (`.is-focused`, `.is-active`) and should stay as CSS classes. 4 can migrate to Tailwind:

**Keep in CSS** (class toggling with JS):
1. `.outline-item-row` / `.is-focused` — focus state + box-shadow
2. `.topbar-btn` / `.is-active` — hover + active state
3. `.theme-option` / `.is-active` — hover + active state

**Can move to Tailwind:**
1. `.chevron-toggle` — hover only, no class toggling. Replace with `hover:text-secondary hover:bg-raised`.
2. `.command-palette-item` — hover only, no class toggling. Replace with `hover:bg-hover`.
3. `.md-h1` / `.md-h2` / `.md-h3` — static typography (font-size, font-weight, letter-spacing, line-height). No CSS vars, no state. All values map to Tailwind utilities.
4. `.md-code` — static + CSS vars for bg/border. Can move to Tailwind after @theme inline registration.

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
