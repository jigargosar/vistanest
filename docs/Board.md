Board

# Urgent

# InBasket

# Ready

1. Verify rendering fix — measure React render time after spread-props fix (was 320ms, expect lower). Test with 2000 items, type "test" in filter
2. Create docs/mobx-rules.md — document MobX observability rule: don't wrap observables in plain objects or destructure them. Reference from CLAUDE.md
3. Audit MobX observability — moveFocus() and deleteItem() in store still use visibleItems[i].item.id wrapper pattern. Store-side consumption untouched

# In Progress

# Done

1. ThemeSwitcher — merged two useEffects into one
2. Removed `vitest`, `puppeteer`, and `zustand` devDependencies
3. Fix getAncestorIds O(N) lookup — items.find() → Map.get(), 145ms → 0.7ms
4. Fix OutlineItem props — pass observable item directly instead of VisibleItem wrapper, enables MobX fine-grained tracking

# Backlog

1. Icon component consolidation — OutlineTree and TopBar duplicate SVG icons
2. CommandPalette — repeated `if (id)` guard on every command, extract helper
3. OutlineItem — 9 hooks/callbacks wall before JSX, consider grouping or extracting
4. Extract domain types (`OutlineItem`, `VisibleItem`) to shared model file
5. Extract model helpers (getSiblings, buildVisibleItems) as pure functions in model file
6. Evaluate documenting Map lookup rule — is "use Map instead of items.find() in hot paths" a project-level rule or derivable from code?
7. Remove useMemo(renderMarkdown) from OutlineItem — unnecessary with proper MobX observability (unverified)
8. Investigate toJS() in pushUndo — may break observability on undo restore
9. getSiblings called 5x in store mutations with O(N) find pattern — no shared call site for map, not a problem at current scale
10. Clean up test data — restore sample-items.ts (33 items), remove timing logs from model.ts, remove Profiler from OutlineTree, restore localStorage loading

