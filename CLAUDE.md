# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Goal

Checkvist clone with full feature parity — keyboard-first hierarchical outliner with collaboration, sync, tags, due dates, assignees, and more. See `docs/reference/checkvist/` for saved source and screenshots.

# Release Definition

VistaNest v1 is shipped when:
- Persistence works (data survives reload)
- Library fragility from review3.1 is resolved
- Checkbox + done state is visible in UI
- Soft delete with trash view works
- Archive for done items works
- Notes panel exists
- Multiple lists with switcher works
- Tags can be added/removed with existing UI
- JSON import/export works
- README exists with screenshots
- Deployed and accessible via URL

See docs/v1-roadmap.md for sequencing.

# Decision making

You should never scope technical decisions to the current MVP state. This project will grow to Checkvist-level complexity (real-time sync, collaboration, offline-first, multiple lists). You should evaluate libraries, patterns, and architecture against that full vision.

# Commands

```
pnpm dev              # Start Vite dev server (HTTPS via basic-ssl, hot reload)
pnpm build            # Production build
pnpm typecheck        # Type check without emit
pnpm typecheck:watch  # Type check in watch mode
pnpm test:e2e         # Run Playwright e2e tests (starts its own dev server on port 5188)
pnpm test:e2e:ui      # Playwright interactive UI
pnpm test:e2e:update  # Update visual snapshots
pnpm test:e2e -- --grep "smoke"  # Run a single test by name
```

# Stack

1. React 19 + TypeScript (strict mode)
2. Vite 8 + Tailwind v4 + pnpm
3. State: MobX (`src/store-mobx/`) — `makeAutoObservable` on plain objects (not classes)
4. `fractional-indexing` for item ordering (`sortKey: string`)
5. `@tanstack/hotkeys` for keyboard shortcuts, wrapped by `src/lib/hotkey.ts`
6. `@react-hooks-library/core` for `useEventListener` and other hooks
7. CSS variables for theming — themes are JS objects that apply to `:root`
8. Playwright for e2e tests with visual snapshot regression (HTTPS, chromium-only)

# Architecture

## Data model

Flat array of `OutlineItem` with `parentId` + `sortKey`. Tree is computed at render time via depth-first walk. No nested data structure.

## Stores

Two module-level MobX singletons, both using `makeAutoObservable` with `autoBind`:

1. `outlineStore` — items, focus, editing, filter, command palette state. `visibleItems` is a computed that builds the tree on every access. Persistence via `reaction()` to localStorage. Undo via in-memory snapshot array (`toJS()` before each mutation, max 50).
2. `themeStore` — current theme name. `setTheme()` applies CSS variables to `:root`.

## Component structure

1. `App.tsx` — layout shell, wires `setupKeyboard()` in `useEffect`
2. `OutlineTree.tsx` — list header, renders visible items
3. `OutlineItem.tsx` — single item row with inline editing
4. `TopBar.tsx` — logo, breadcrumb, search filter
5. `BottomBar.tsx` — keyboard shortcut hints
6. `CommandPalette.tsx` — Ctrl+K command overlay
7. `ThemeSwitcher.tsx` — theme dropdown

## Keyboard handling

`src/lib/hotkey.ts` provides `hk()` and `sq()` helpers that wrap `@tanstack/hotkeys`. `src/lib/keyboard.ts` defines all bindings declaratively via `setupKeyboard()`, wired up in App's `useEffect`. All handlers call store actions directly — no intermediate dispatch layer.

## Theming

All colors via CSS custom properties. Theme store holds 5 presets (midnight, charcoal, slate, paper, phosphor). `applyTheme()` sets variables on `:root`. Layout/typography constants in `global.css`.

## Markdown in items

Item text supports `## headings`, `**bold**`, `*italic*`, `` `code` ``. Parsed at render time via `src/lib/markdown.tsx`. Users type markdown — visual hierarchy comes from content, not depth.

## Benchmarks & perf notes

`bench/` — perf benchmarks and findings log. `bench/bench-filter.ts` benchmarks ancestor lookup strategies. `bench/perf-notes.md` captures raw timing data, conclusions, and known perf characteristics (render cost, DOM listener churn, etc.). Consult before adding console.log timing to production code — the finding may already be documented. To perf test with large data: change `loadItems()` to return `makeTree(N, depth)` from `src/data/sample-items.ts`. Revert before committing.

# Key conventions

1. You should not add CSS transitions on interactive elements — snappy keyboard response
2. You should not add hover highlights on outline items
3. You must wrap every component in `observer()` — no exceptions
4. You should use `reaction()` for persistence in MobX
5. You should use in-memory snapshot array with `toJS()` before each mutation for undo
6. You can find reference docs in `docs/reference/zustand-docs-summary/` and `docs/reference/legend-state-research/`
