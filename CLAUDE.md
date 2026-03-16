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
pnpm test:e2e         # Run Puppeteer smoke tests (requires dev server running)
```

# Stack

1. React 19 + TypeScript (strict mode)
2. Vite 8 + Tailwind v4 + pnpm
3. State: MobX (`src/store-mobx/`) — `makeAutoObservable` on plain objects (not classes)
4. `fractional-indexing` for item ordering (`sortKey: string`)
5. `@react-hooks-library/core` for `useEventListener` and other hooks
6. CSS variables for theming — themes are JS objects that apply to `:root`
7. Puppeteer + Vitest for e2e smoke tests

# Architecture

## Data model

Flat array of `OutlineItem` with `parentId` + `sortKey`. Tree is computed at render time via depth-first walk. No nested data structure.

## Component structure

1. `App.tsx` — layout shell, delegates keyboard handling to `src/lib/keyboard.ts`
2. `OutlineTree.tsx` — list header, renders visible items
3. `OutlineItem.tsx` — single item row with inline editing
4. `TopBar.tsx` — logo, breadcrumb, search filter
5. `BottomBar.tsx` — keyboard shortcut hints
6. `CommandPalette.tsx` — Ctrl+K command overlay
7. `ThemeSwitcher.tsx` — theme dropdown

## Shared modules

1. `src/lib/keyboard.ts` — `handleGlobalShortcuts` and `handleOutlineKeys`
2. `src/lib/markdown.tsx` — `renderMarkdown` for inline heading/bold/italic/code parsing

## Theming

All colors via CSS custom properties. Theme store holds 5 presets (midnight, charcoal, slate, paper, phosphor). `applyTheme()` sets variables on `:root`. Layout/typography constants in `global.css`.

## Markdown in items

Item text supports `## headings`, `**bold**`, `*italic*`, `` `code` ``. Parsed at render time via `src/lib/markdown.tsx`. Users type markdown — visual hierarchy comes from content, not depth.

# Key conventions

1. No CSS transitions on interactive elements — snappy keyboard response
2. No hover highlights on outline items
3. `observer()` wrapper required on every component — no exceptions
4. Persistence via `reaction()` in MobX
5. Undo: in-memory snapshot array, `toJS()` before each mutation
6. Reference docs: `docs/reference/zustand-docs-summary/` and `docs/reference/legend-state-research/`
