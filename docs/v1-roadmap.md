# VistaNest v1 Roadmap

Goal: Ship a keyboard-first hierarchical outliner you'd actually use daily instead of Checkvist.

Scope cut: No due dates, assignees, collaboration, real-time sync, offline-first, or drag-and-drop in v1.

---

## Phase 1 — Foundation

1. **Enable persistence + clean test data** — remove `localStorage.removeItem()` in `loadItems()`, load saved items on startup, keep reaction-based auto-save. Move `makeTree()` to bench-only (document in bench/perf-notes.md how to perf test), create small realistic starter items for first-load, capture perf findings to bench/perf-notes.md, remove timing logs from production code.
2. **Fix library fragility** — address `@react-hooks-library/core` options instability from review3.1 (revert to manual event handlers or explicitly pin the accidental re-registration behavior)

## Phase 2 — Core Features

3. **Checkbox + done UI** — visible checkbox on each item row, wired to existing `toggleDone` action, visual done state (strikethrough already exists, add the checkbox)
4. **Soft delete + trash** — add `deletedAt: number | null` to `OutlineItem`, filter deleted items from active view, trash view to browse deleted items, restore action, "empty trash" for permanent delete
5. **Archive** — add `archivedAt: number | null` to `OutlineItem`, archive action for done items, archive view, bulk "archive all done" command
6. **Notes panel** — expand/collapse note area on focused item, inline edit, keyboard shortcut to toggle
7. **Multiple lists** — `List` model (`id`, `name`, `sortKey`, `createdAt`), list switcher in sidebar/top bar, items scoped to active list via `listId` field, default list on first load
8. **Tags UI** — inline tag add/remove on items, tag filter in command palette, tag type styling already exists in `InlineTag`
9. **Import/export** — JSON export of all lists + items, JSON import with merge/replace option

## Phase 3 — Ship

10. Remove sample data fallback, clean up remaining timing logs
11. Final e2e pass — update Playwright snapshots for new UI elements
12. README with screenshots and keyboard shortcut reference
13. Deploy (GitHub Pages or similar)

---

## Status

| # | Item | Status |
|---|------|--------|
| 1 | Enable persistence + clean test data | Done |
| 2 | Fix library fragility | Not started |
| 3 | Checkbox + done UI | Not started |
| 4 | Soft delete + trash | Not started |
| 5 | Archive | Not started |
| 6 | Notes panel | Not started |
| 7 | Multiple lists | Not started |
| 8 | Tags UI | Not started |
| 9 | Import/export | Not started |
| 10 | Remove sample data | Not started |
| 11 | Final e2e pass | Not started |
| 12 | README | Not started |
| 13 | Deploy | Not started |
