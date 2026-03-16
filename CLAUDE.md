CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Goal

Checkvist clone with full feature parity — keyboard-first hierarchical outliner with collaboration, sync, tags, due dates, assignees, and more. See `docs/reference/checkvist/` for saved source and screenshots.

# Decision making

Never scope technical decisions to the current MVP state. This project will grow to Checkvist-level complexity (real-time sync, collaboration, offline-first, multiple lists). Evaluate libraries, patterns, and architecture against that full vision.

# Project

VistaNest — a Checkvist-style keyboard-driven hierarchical outliner. Dark-themed, keyboard-first, minimal chrome.

# Commands

```
pnpm dev              # Start Vite dev server (HTTPS, hot reload)
pnpm build            # Production build
pnpm typecheck        # Type check without emit
pnpm typecheck:watch  # Type check in watch mode
```

# Stack

1. React 19 + TypeScript (strict mode)
2. Vite 8 + Tailwind v4 + pnpm
3. State: Zustand (current, `src/store/`) — migrating to MobX (`src/store-mobx/`)
4. MobX stores use `makeAutoObservable` on plain objects (not classes)
5. `fractional-indexing` for item ordering (MobX store uses `sortKey: string`, Zustand still uses `sortOrder: number`)
6. CSS variables for theming — themes are JS objects that apply to `:root`

# Architecture

## Data model

Flat array of `OutlineItem` with `parentId` + sort field. Tree is computed at render time via depth-first walk. No nested data structure.

## Store migration (in progress)

1. `src/store/` — Zustand stores, currently wired to components
2. `src/store-mobx/` — MobX replacement, same API surface, not yet wired
3. Components import from `src/store/` — migration will change imports to `src/store-mobx/` and wrap components in `observer()`

## Component structure

1. `App.tsx` — keyboard handler, layout shell
2. `OutlineTree.tsx` — list header, renders visible items
3. `OutlineItem.tsx` — single item row with inline editing, markdown rendering
4. `TopBar.tsx` — logo, breadcrumb, search filter
5. `BottomBar.tsx` — keyboard shortcut hints
6. `CommandPalette.tsx` — Ctrl+K command overlay
7. `ThemeSwitcher.tsx` — theme dropdown

## Theming

All colors via CSS custom properties. Theme store holds 5 presets (midnight, charcoal, slate, paper, phosphor). `applyTheme()` sets variables on `:root`. Layout/typography constants in `global.css`.

## Markdown in items

Item text supports `## headings`, `**bold**`, `*italic*`, `` `code` ``. Parsed at render time in `OutlineItem.tsx`. Users type markdown — visual hierarchy comes from content, not depth.

# Key conventions

1. No CSS transitions on interactive elements — snappy keyboard response
2. No hover highlights on outline items
3. `observer()` wrapper required on every component reading MobX store (after migration)
4. Persistence via `reaction()` in MobX, manual `saveItems()` in Zustand
5. Undo: in-memory snapshot array, `toJS()` before each mutation
6. Reference docs: `docs/reference/zustand-docs-summary/` and `docs/reference/legend-state-research/`
