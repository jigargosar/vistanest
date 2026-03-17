# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project

VistaNest — a Checkvist-style keyboard-driven hierarchical outliner. Dark-themed, keyboard-first, minimal chrome. Long-term goal is full Checkvist feature parity (real-time sync, collaboration, offline-first, multiple lists). See `docs/reference/checkvist/` for saved source and screenshots.

# Decision-making

You should never scope technical decisions to the current MVP state. This project will grow to Checkvist-level complexity. You should evaluate libraries, patterns, and architecture against that full vision.

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
6. `@react-hooks-library/core` for `useEventListener` (used in TopBar)
7. CSS variables for theming — themes are JS objects that apply to `:root`
8. Playwright for e2e tests with visual snapshot regression (HTTPS, chromium-only)

# Architecture

## Data model

Flat array of `OutlineItem` with `parentId` + `sortKey`. Tree is computed at render time via depth-first walk. No nested data structure.

## Keyboard handling

`src/lib/hotkey.ts` provides `hk()` and `sq()` helpers that wrap `@tanstack/hotkeys`. `src/lib/keyboard.ts` defines all bindings declaratively via `setupKeyboard()`, wired up in App's `useEffect`. All handlers call store actions directly — no intermediate dispatch layer.

## Theming

All colors via CSS custom properties. Theme store holds 5 presets (midnight, charcoal, slate, paper, phosphor). `applyTheme()` sets variables on `:root`. Layout/typography constants in `global.css`.

## Markdown in items

Item text supports `## headings`, `**bold**`, `*italic*`, `` `code` ``. Parsed at render time via `src/lib/markdown.tsx`. Users type markdown — visual hierarchy comes from content, not depth.

# Key conventions

1. You should not add CSS transitions on interactive elements — snappy keyboard response
2. You should not add hover highlights on outline items
3. You must wrap every component in `observer()` — no exceptions
4. You should use `reaction()` for persistence in MobX
5. You should use in-memory snapshot array with `toJS()` before each mutation for undo
6. You can find reference docs in `docs/reference/zustand-docs-summary/` and `docs/reference/legend-state-research/`
