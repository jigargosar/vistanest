# Code Review — Full Audit (2026-03-17)

33 agents across 4 waves. Scope: full `src/` directory + uncommitted diff.

## Wave 1 — Initial diff review (10 agents)

Diff: extract `buildSortedChildrenMap`, add F2 binding, add ee sequence e2e test.

### Correctness — NO ISSUES
### Refactor equivalence — NO ISSUES
buildSortedChildrenMap produces identical results to inline code.
### MobX patterns — NO ISSUES
All actions, computed, reaction, toJS correct.
### Keyboard bindings — NO ISSUES
F2 is unique, no conflicts, ignoreInputs correct.
### API consistency — NO ISSUES
Naming, style all match existing patterns.
### CLAUDE.md compliance — NO ISSUES
### Fresh eyes — NO ISSUES
Refactor improves readability, clear intent.
### E2E test quality — OBSERVATION
Missing screenshot after ee edit. F2 edit captures `04-after-edit.png` but ee edit has no snapshot.
### Edge cases — OBSERVATION
F2 while already editing is redundant (not harmful). startEditing re-sets editingId to same value.
### Regression risk — LOW
ee sequence timing depends on @tanstack/hotkeys sequence timeout (default 1000ms). Should be fine but could be flaky on very slow CI.

## Wave 2 — Readability and cure vs disease (7 agents)

### Line density — REVERT TO MULTI-LINE
The one-liner `result.push({ item, depth, childCount: itemChildren.length, hasChildren: itemChildren.length > 0 })` is 109 chars, inconsistent with rest of file where all multi-field objects are spread out. Hides redundant `itemChildren.length` computation.

### Abstraction naming — NAME IS MISLEADING
`buildSortedChildrenMap` over-specifies (sorting is implementation detail) and under-specifies (doesn't say "by parent"). Suggestion: `buildChildrenByParentMap`. Fits existing get/build naming convention.

### Code flow tracing — EXTRACTION HELPS DEBUGGING
Separates filtering, grouping, and walking into isolatable steps. Each step independently testable.

### Was duplication bad? — SPLIT VERDICT
One agent: over-engineering (only 2 call sites, 8 lines). Another: +2 clearly better (DRY, testable). The extraction is fine but only barely justified at 2 call sites.

### Filter hiding — .filter() IS MORE EXPLICIT
But `visibleIds` purpose is 15 lines away from the call site. A named intermediate variable would help: `const itemsInFilteredTree = items.filter(...)`.

### F2 binding — PULLS ITS WEIGHT
Standard convention (Excel, VS Code, file managers). Additive discoverability, no confusion with ee.

### ee test — SPLIT VERDICT
One agent: redundant (same code path as F2 test). Another: tests sequence infrastructure (`sq()`) which is a genuinely different path through @tanstack/hotkeys. The sequence matcher IS a different code path from single-key — worth keeping.

### Net assessment scores
- buildSortedChildrenMap extraction: +2 (clearly better)
- F2 binding: +1 (net positive)
- ee test: +1 (net positive)
- Overall: ship as-is

## Wave 3 — Bug hunting (6 agents, full src/ scope)

### Confirmed bugs (all pre-existing)

#### BUG-1: deleteItem doesn't clear editingId (HIGH)
Location: `outline-store.ts` deleteItem method.
If editing is stopped then item deleted, editingId remains pointing to deleted item. Harmless in practice (input won't render for non-existent item) but violates state invariant.

#### BUG-2: undo doesn't restore focusedId (HIGH)
Location: `outline-store.ts` undo method.
After undo, focusedId can point to a non-existent item. moveFocus handles idx=-1 by defaulting to 0, so no crash. But focus jumps unexpectedly after undo.

#### BUG-3: startEditing doesn't verify item exists (MEDIUM)
Location: `outline-store.ts` startEditing method.
If focusedId is stale (due to BUG-2), editingId gets set to non-existent item. Downstream of BUG-2.

#### BUG-4: Command palette doesn't restore focus on close (MEDIUM)
Location: `CommandPalette.tsx`.
After Ctrl+K then Escape, DOM focus is lost. Keyboard shortcuts still work (global handlers) but focus ring disappears.

#### BUG-5: Edit stop doesn't restore focus to outline row (MEDIUM)
Location: `OutlineItem.tsx`.
After Enter/Escape in edit mode, DOM focus goes nowhere. Same as BUG-4 — keyboard still works, visual focus lost.

### Agent false positives corrected

1. "useEffect never clears keyboard handlers" — WRONG. `useEffect(() => setupKeyboard(), [])` returns cleanup function. React calls it on unmount. `[]` dep means runs once.
2. "MAX_UNDO shift() reverses undo order" — WRONG. push()+pop() is LIFO; shift() removes oldest on overflow. Textbook bounded stack.
3. "indent collapsed state not restored on undo" — WRONG. toJS() captures all properties including collapsed. pushUndo() runs before mutation.
4. "handleEditBlur races with other handlers" — UNLIKELY. MobX actions are synchronous, browser event loop processes one event at a time.

### Keyboard leak — NO BUGS
All keys correctly handled. ignoreInputs:true prevents global handlers during input editing.

### Tree integrity — NO BUGS
All mutation guards correct: indent first child, outdent root, move boundaries, delete subtree.

### Undo correctness — 1 CONFIRMED (BUG-2 above), rest false positives

### DOM focus — 2 CONFIRMED (BUG-4, BUG-5 above)

### State corruption — 3 CONFIRMED (BUG-1, BUG-2, BUG-3 above)

### Race conditions — all false positives after correction

## Wave 4 — ISI / POLP / TDA audit (10 agents, full src/ scope)

### ISI — Interface Segregation

#### ISI-1: Store internal helpers exposed publicly
- `pushUndo()` — internal, no external consumers
- `moveFocus()` — only called by focusDown/focusUp
- `moveItem()` — only called by moveItemDown/moveItemUp

#### ISI-2: Component prop interface issues
- OutlineItem receives full VisibleItem — only uses 4 fields
- InlineTag.type is `string` — should be `'priority'|'progress'|'due'|'label'`
- InlineTag.styleMap uses `Record<string>` — allows invalid keys at runtime
- TitleAction.children is ReactNode — expects SVG elements only
- CommandPalette.action is `() => void` — too permissive
- OutlineTree passes visibleItem + derived booleans — redundant

#### ISI-3: Type definitions too broad
- OutlineItem mixes core fields with render-only optionals (note?, tags?). Store methods never use note/tags.
- ThemeColors is 35-property monolith — components use 3-10 each
- VisibleItem.hasChildren is redundant — derivable from childCount > 0
- ThemeDef mixes identity/metadata/implementation. ThemeSwitcher never accesses colors.

### POLP — Principle of Least Privilege

#### POLP-1: Global state over-access
- CommandPalette imports BOTH stores — mixes outline + theme domains
- keyboard.ts toggles command palette — keyboard handler shouldn't know about UI modal state
- OutlineTree accesses items.length directly — should be a getter

#### POLP-2: Function parameter scope
- getSiblings/getDescendantIds/getAncestorIds all receive full items array — called 6+ times per interaction, O(n) scan each time
- buildSortedChildrenMap already groups by parent but isn't reused by these helpers
- OutlineItem event handlers extract item.id from full VisibleItem

#### POLP-3: Module export leaks
- theme-store.ts:84 — `applyTheme(midnight)` executes at import time (module-level side effect)
- applyTheme() exported but never imported externally
- src/data/sample-items.ts — exported but never imported; duplicated in outline-store.ts

### TDA — Tell Don't Ask

#### TDA-1: Components querying store and branching
- OutlineTree reads focusedId/editingId, computes isFocused/isEditing booleans — store should expose isFocused(id), isEditing(id)
- ThemeSwitcher reads currentTheme, compares with === 3 times — store should expose isThemeActive(name)
- CommandPalette reads focusedId, wraps every command in if(id) — store should expose getAvailableCommands()
- TopBar computes isFocused from filterQuery.length + local state
- 12+ branching sites across 5 components

#### TDA-2: Store action optional id anti-pattern
All 9 mutation methods use:
```
const targetId = id ?? this.focusedId
if (!targetId) return
```
toggleCollapse, toggleDone, startEditing, deleteItem, indentItem, outdentItem, moveItem, createSibling, createChild — all fall back to this.focusedId when caller should TELL which id.

#### TDA-3: Helper function design
- hotkey.ts uses `'k' in b` property check — should use discriminated union with type field
- getSiblings scans full array 6+ times per interaction — should accept pre-built childrenMap
- getDescendantIds/getAncestorIds do O(n) scans — should accept lookup maps
- buildVisibleItems checks item.collapsed inline — mixes filtering with traversal
- markdown.tsx does sequential regex asking — could use tokenizer with discriminated unions

### Cross-cutting architectural issues

#### ARCH-1: Fat singleton store
outlineStore is a god-object with ~25 public members. Every component sees the full API. As features grow (collab, sync, offline), coupling compounds.

#### ARCH-2: No privilege boundaries
Every component imports stores directly with full mutation access. No distinction between local UI state (focusedId, filterQuery) and shared state (items, done status).

#### ARCH-3: Circular intent flow
keyboard.ts -> store <- components creates two independent mutation paths. Can't add middleware (logging, validation, optimistic updates) without changing both.

#### ARCH-4: Hidden undo state
undoStack is module-level, not observable. UI can't show "undo available" or gray out undo hint.

#### ARCH-5: Theme logic duplicated
Both ThemeSwitcher and CommandPalette loop over themes array independently.

## Issue counts

| Wave | Scope | Issues |
|------|-------|--------|
| 1 — Initial review | diff only | 0 bugs, 3 observations |
| 2 — Readability | diff only | 2 style nits |
| 3 — Bug hunting | full src/ | 5 confirmed bugs |
| 4 — ISI/POLP/TDA | full src/ | ~40 violations |

## Fix Plans (20 agents, Wave 5)

### Sequencing Strategy

#### Phase 1: Critical bugs + style nits (fix now, <1 day)

1. **BUG-1** — Guard in deleteItem: clear editingId if deleted item/descendant matches. Use existing `idsToDelete` set.
2. **BUG-2** — Store focusedId in undo snapshots (change `undoStack` from `OutlineItem[][]` to `{ items, focusedId }[]`). Restores focus correctly on undo.
3. **BUG-3** — Add existence guard in startEditing: `if (!this.items.find(i => i.id === targetId)) return`. Downstream of BUG-2 fix.
4. **BUG-4+5** — Focus manager: either centralized `focusManager` module with ref registration, or `useEffect` + `querySelector` on `data-outline-item-id` in OutlineTree. Recommended: centralized focus manager for Checkvist scale.
5. **Style** — Revert one-liner push to multi-line, extract `const childCount = itemChildren.length`. Rename `buildSortedChildrenMap` to `buildChildrenByParentMap`.

#### Phase 2: Foundation for scaling (before next feature, ~2-3 days)

6. **ISI-1** — Use underscore prefix convention (`_pushUndo`, `_moveFocus`, `_moveItem`) now. Migrate to facade pattern when TDA fixes are in.
7. **ISI-2** — Fix in priority order: (a) InlineTag.type to union type, (b) styleMap to `Record<TagType>`, (c) CommandPalette action naming, (d) OutlineItem props extraction, (e) TitleAction SVG children, (f) OutlineTree prop threading.
8. **ISI-3** — Split OutlineItem into `OutlineItemCore` (synced: id, parentId, sortKey, text, done, tags) + `OutlineItemLocalState` (local: collapsed, note). Defer ThemeColors split and hasChildren removal.
9. **POLP-1** — Store-level facade: segment outlineStore API into `.outline` (reads) and `.actions` (mutations). Short-term pragmatic fix; migrate to context+hooks when splitting stores.
10. **POLP-2** — Add `get itemById()` computed map for O(1) lookups. Refactor `getAncestorIds` to use it. Defer childrenMap threading to helpers until performance demands it.
11. **POLP-3** — Move `applyTheme(midnight)` to explicit init in App.tsx. Remove applyTheme export. Delete duplicate `src/data/sample-items.ts`.
12. **TDA-1** — NOT a real problem for React components (false positive). Component branching on store state is idiomatic React. Optionally add `isFocused(id)`, `isEditing(id)` getters for readability, but not required.
13. **TDA-2** — Make id required on all 9 mutation methods. keyboard.ts passes `store.focusedId` explicitly. Prepares for multi-select (Checkvist feature).
14. **TDA-3** — Fix hotkey.ts discriminated union now (trivial). Defer getSiblings map threading and markdown tokenizer until needed.
15. **ARCH-5** — Command registry pattern for CommandPalette. Features register commands; palette queries registry. Scales to tags, due dates, assignees.

#### Phase 3: Architectural scaling (when adding collab/sync)

16. **ARCH-1** — Split into domain stores: `outlineStore` (items+undo), `focusStore`, `editingStore`, `filterStore`, `commandPaletteStore`. MobX docs recommend one store per domain.
17. **ARCH-2** — Context+hooks for phase 1 (low friction). Migrate to computed views + action objects when collab demands it. Inject keyboard bindings from App.tsx instead of direct store imports.
18. **ARCH-3** — Accept current two-path pattern for MVP (idiomatic MobX). Add command/dispatch layer when collab/sync requires serializable mutation intents.
19. **ARCH-4** — Separate `undoStore` with observable `canUndo`/`canRedo` getters. Support redo via `Mod+Shift+Z`. BottomBar observes availability.
20. **ARCH-5 (extended)** — If command registry adopted in Phase 2, this is already solved.

### What NOT to fix

1. ThemeColors 35-property monolith — defer until 10+ themes or custom theme support
2. markdown.tsx tokenizer — sequential regex works for 4 non-overlapping patterns; rewrite when adding escaping/nesting
3. getSiblings O(n) scanning — negligible at current scale (<30 items); profile first at 1000+ items
4. ARCH-3 command layer — premature without real collab constraints to design against
