# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Goal

Checkvist clone with full feature parity — keyboard-first hierarchical outliner with collaboration, sync, tags, due dates, assignees, and more. See `docs/reference/checkvist/` for saved source and screenshots.

# Release Definition

VistaNest v1 is shipped when:
- Persistence works (data survives reload)
- `@react-hooks-library/core` is fully replaced with custom hooks in `src/lib/hooks.ts`
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

# v1 Feature Work

You should only work on the next "Not started" item in the v1 roadmap status table (`docs/v1-roadmap.md`). Do not skip ahead. Do not work on multiple items at once.

Each feature has a research file in `checkvist-research/` with v1 scope decisions at the top. You must read it before implementing. The v1 scope decisions override Checkvist's full behavior — if the research says "deferred to v2", you must not build it. Build only what the v1 scope section says to build.

You should follow convention 8 for all new code styling.

You should update the roadmap status table and `docs/Board.md` after completing each item.

You should not refactor existing code unless it directly blocks the current roadmap item.

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
6. `@react-hooks-library/core` — being phased out (unmaintained, stale handler bug in useEventListener). You should not add new usages. Replacements go in `src/lib/hooks.ts`. Existing usages work due to accidental mitigation — do not flag them.
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

All colors via CSS custom properties. Theme store holds 5 presets (midnight, charcoal, slate, paper, phosphor). `applyTheme()` sets variables on `:root`. Layout/typography constants in `global.css`. See `docs/refactoring-plan-fix-styling-inconsistencies.md` for the plan to migrate inline style vars to Tailwind v4 `@theme inline` tokens.

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
7. `@react-hooks-library/core` usage in components is legacy — not a pattern to follow. You should write new hooks in `src/lib/hooks.ts` instead. The library will be fully replaced before v1 ships.
8. New code must use Tailwind classes for static values — not inline style. Inline var() is acceptable for theme colors only until @theme inline lands. Do not pattern-match existing code — it predates these rules. See `docs/refactoring-plan-fix-styling-inconsistencies.md` "New Code Direction" section.
9. You must use `createItem()` from model.ts to create OutlineItems — never inline the fields. One place for defaults prevents bugs when adding new fields.
10. Pure functions (no store state) belong in model.ts — the store is for state and actions only. Do not mix pure logic into the store.
11. You must read `docs/Board.md` backlog before modifying store or model code — it captures known issues and approved decisions.
12. You must not copy patterns from existing store code — existing code predates these rules. Read model.ts and this conventions list before writing new code.

13. No test suite yet — intentional. Track bugs found during UI testing in Board.md backlog with a `[bug]` prefix. When bug count justifies the overhead, add vitest and write regression tests. Every bug that reaches UI testing gets a test when the suite is added.


# Manholes (read before touching store or model)

Structural traps in the codebase. Stepping into one produces silent bugs — code compiles, app runs, behavior is wrong. Read this before every store or model change.

1. **allItems vs items.** allItems is the raw array including soft-deleted items. items is a computed that filters deleted out. Use items for reads (finding siblings, counting, iterating). Use allItems for mutations (push, splice). Using allItems for reads leaks deleted items into UI. Using items for writes fails silently — it's a computed, not the source.

2. **New fields on OutlineItem.** Every new field must be added to createItem() in model.ts. TypeScript catches required fields but not optional ones — an optional field without a default silently becomes undefined.

3. **getSiblings operates on whatever array you pass it.** If you pass allItems, deleted siblings appear. Every call site must pass this.items.

4. **Undo restores allItems only.** pushUndo snapshots allItems via toJS(). Any new state outside allItems (separate arrays, view modes, selection sets) won't be restored by undo unless explicitly added to the snapshot.

5. **visibleItems rebuilds the full tree on every access.** It's a MobX computed but calls buildVisibleItems which does a full walk. Cache in a local variable if you access it more than once in an action.

6. **Persistence serializes allItems as JSON on every change.** Adding non-serializable data (functions, circular refs, large blobs) to OutlineItem will break persistence silently. Keep items flat and serializable.
