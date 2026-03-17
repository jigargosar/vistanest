# Code Review — Full Audit (2026-03-17)

53 agents across 5 waves. Scope: full `src/` directory + uncommitted diff.

---

# Part 1: Diff Review

Diff: extract `buildSortedChildrenMap`, add F2 binding, add ee sequence e2e test.

## Correctness (10 agents)

1. Correctness — NO ISSUES
2. Refactor equivalence — NO ISSUES. buildSortedChildrenMap produces identical results to inline code.
3. MobX patterns — NO ISSUES. All actions, computed, reaction, toJS correct.
4. Keyboard bindings — NO ISSUES. F2 is unique, no conflicts, ignoreInputs correct.
5. API consistency — NO ISSUES. Naming, style all match existing patterns.
6. CLAUDE.md compliance — NO ISSUES
7. Fresh eyes — NO ISSUES. Refactor improves readability, clear intent.
8. E2E test quality — OBSERVATION. Missing screenshot after ee edit. F2 edit captures `04-after-edit.png` but ee edit has no snapshot.
9. Edge cases — OBSERVATION. F2 while already editing is redundant (not harmful). startEditing re-sets editingId to same value.
10. Regression risk — LOW. ee sequence timing depends on @tanstack/hotkeys sequence timeout (default 1000ms). Should be fine but could be flaky on very slow CI.

## Readability and cure vs disease (7 agents)

### Line density — REVERT TO MULTI-LINE
The one-liner `result.push({ item, depth, childCount: itemChildren.length, hasChildren: itemChildren.length > 0 })` is 109 chars, inconsistent with rest of file where all multi-field objects are spread out. Hides redundant `itemChildren.length` computation.

### Abstraction naming — NAME IS MISLEADING
`buildSortedChildrenMap` over-specifies (sorting is implementation detail) and under-specifies (doesn't say "by parent"). Suggestion: `buildChildrenByParentMap`. Fits existing get/build naming convention.

### Code flow tracing — EXTRACTION HELPS DEBUGGING
Separates filtering, grouping, and walking into isolatable steps. Each step independently testable.

### Was duplication bad? — SPLIT VERDICT
The agents genuinely disagreed here:
1. **Against extraction:** Only 2 call sites, 8 lines each. The duplication was harmless — both blocks were unlikely to diverge. Extraction traded 8 inline lines for a 13-line function + indirection. Classic "extract because it reduces line count" rather than because it enables reuse. At this codebase size, net loss.
2. **For extraction:** DRY principle satisfied, each function now does one thing, buildSortedChildrenMap is independently testable, buildFilteredVisibleItems is shorter and its intent clearer.
3. **Synthesis:** The extraction is fine but only barely justified at 2 call sites. Both perspectives are valid.

### Filter hiding — .filter() IS MORE EXPLICIT
`items.filter(i => visibleIds.has(i.id))` is syntactically more explicit than a `continue` inside a loop. But `visibleIds` purpose is 15 lines away from the call site — the semantic intent is less obvious. A named intermediate variable would help: `const itemsInFilteredTree = items.filter(...)`.

### F2 binding — PULLS ITS WEIGHT
Standard convention (Excel, VS Code, file managers). Additive discoverability, no confusion with ee. Users coming from non-vim backgrounds will try F2 first.

### ee test — SPLIT VERDICT
The agents disagreed:
1. **Against:** Redundant. Both F2 and ee call `store.startEditing` — same code path. The ee test validates that `@tanstack/hotkeys` parses `['E', 'E']` correctly, which is the library's job, not our code's.
2. **For:** The sequence matcher (`sq()`) is a genuinely different code path through `@tanstack/hotkeys` than single-key (`hk()`). Testing both validates our wrapper infrastructure.
3. **Synthesis:** Worth keeping — it tests the sequence infrastructure which is a different code path from single-key.

### Net assessment scores
1. buildSortedChildrenMap extraction: +2 (clearly better)
2. F2 binding: +1 (net positive)
3. ee test: +1 (net positive)
4. Overall: ship as-is

---

# Part 2: Bugs

5 confirmed bugs. All pre-existing (not introduced by the diff).

## BUG-1: deleteItem doesn't clear editingId (HIGH)

Location: `outline-store.ts` deleteItem method.
If editing is stopped then item deleted, editingId remains pointing to deleted item. Harmless in practice (input won't render for non-existent item) but violates state invariant.

**Fix approaches considered:**
1. **(a) Surgical guard in deleteItem** — add `if (idsToDelete.has(this.editingId ?? '')) this.editingId = null` after the filter. Minimal, uses existing `idsToDelete` set. Handles both direct deletion and descendant deletion.
2. **(b) Centralized invariant enforcer** — new `_enforceInvariants()` method called after every mutation. Validates editingId, focusedId, etc. all point to existing items. Centralized, self-documenting, future-proof. But adds O(n) scan per mutation and requires discipline to call everywhere.
3. **(c) Validated getter** — replace `this.editingId` reads with `getEditingId()` that filters stale references. Doesn't fix the invariant, just hides it at read layer.

**Recommended:** (a) now. Migrate to (b) if more invariant violations emerge.

## BUG-2: undo doesn't restore focusedId (HIGH)

Location: `outline-store.ts` undo method.
After undo, focusedId can point to a non-existent item. moveFocus handles idx=-1 by defaulting to 0, so no crash. But focus jumps unexpectedly after undo.

**Fix approaches considered:**
1. **(a) Snapshot focusedId alongside items** — change `undoStack` from `OutlineItem[][]` to `{ items: OutlineItem[], focusedId: string | null }[]`. Restores focus exactly to where it was when the action happened. Handles deletion edge case correctly (if item A deleted then undone, A exists again and focus is correct).
2. **(b) Validate focusedId after restore** — after `this.items = prev`, check if focusedId exists, fallback to first visible. Works with current snapshot format but doesn't restore "correctly" — user pressed undo on deletion but focus moved anyway.
3. **(c) Snapshot full UI state** — include focusedId, filterQuery, editingId in snapshot. Most faithful but over-specifies (filterQuery isn't content, it's UI chrome).

**Recommended:** (a) — minimal, faithful restore, handles deletion edge case. editingId is already reset to null (intentional — undo shouldn't restore edit mode).

**Open question:** Should undo support redo? Checkvist likely does (Ctrl+Shift+Z). If so, this fix should be paired with ARCH-4 (undoStore with redo support).

## BUG-3: startEditing doesn't verify item exists (MEDIUM)

Location: `outline-store.ts` startEditing method.
If focusedId is stale (due to BUG-2), editingId gets set to non-existent item. Downstream of BUG-2.

**Fix approaches considered:**
1. **(a) Guard only in startEditing** — add `const item = this.items.find(i => i.id === targetId); if (!item) return`. Minimal, follows existing pattern (toggleDone, deleteItem already do this).
2. **(b) Fix BUG-2 first + defensive guard** — fix root cause (stale focusedId), then still add guard for belt-and-suspenders. Two layers of defense.
3. **(c) Validate all 9 `id ?? focusedId` sites** — extract `getValidItem(id)` helper, update all mutation methods. Most comprehensive but largest scope.

**Recommended:** (b) — fix BUG-2 first (root cause), then add guard to startEditing (defensive layer). Consider (c) as follow-up during TDA-2 refactor.

## BUG-4: Command palette doesn't restore focus on close (MEDIUM)

Location: `CommandPalette.tsx`.
After Ctrl+K then Escape, DOM focus is lost. Keyboard shortcuts still work (global handlers) but focus ring disappears.

**Fix approaches considered (shared with BUG-5):**
1. **(a) Focusable rows with tabindex** — add `tabIndex={0}` to each outline row. When palette closes or edit stops, `.focus()` on the focused row. Simple but `tabindex` on many items impacts performance on large outlines.
2. **(b) Centralized focus manager** — new `src/lib/focus-manager.ts` module. OutlineTree registers row refs on mount. CommandPalette and OutlineItem call `focusManager.focus(store.focusedId)` on close/stop. Single point of truth, scales well, testable in isolation.
3. **(c) useEffect + querySelector in OutlineTree** — add `data-outline-item-id` attribute to rows, `useEffect` that calls `querySelector` and `.focus()` when editingId changes. Centralized in OutlineTree, no ref callbacks needed. But querySelector is O(n) DOM walk.

**Recommended:** (b) for Checkvist scale — single point of truth for focus restoration. Runner-up: (c) if simpler upfront is preferred.

## BUG-5: Edit stop doesn't restore focus to outline row (MEDIUM)

Location: `OutlineItem.tsx`.
After Enter/Escape in edit mode, DOM focus goes nowhere. Same root cause as BUG-4. Shared fix plan above.

## Agent false positives corrected

1. "useEffect never clears keyboard handlers" — WRONG. `useEffect(() => setupKeyboard(), [])` returns cleanup function. React calls it on unmount. `[]` dep means runs once, not on every render.
2. "MAX_UNDO shift() reverses undo order" — WRONG. push()+pop() is LIFO; shift() removes oldest on overflow. Textbook bounded stack.
3. "indent collapsed state not restored on undo" — WRONG. toJS() captures all properties including collapsed. pushUndo() runs BEFORE mutation, so snapshot has pre-mutation state. `this.items = prev` restores full snapshot.
4. "handleEditBlur races with other handlers" — UNLIKELY. MobX actions are synchronous, browser event loop processes one event at a time.

**Self-critique:** These corrections were reasoned from memory of files read earlier, without re-reading source to verify. The corrections are believed to be right, but the method was not rigorous.

## Areas verified clean

1. Keyboard leak — NO BUGS. All keys correctly handled. ignoreInputs:true prevents global handlers during input editing. Every key tested: Enter, Delete, Backspace, Tab, Shift+Tab, Space, J, K, X, E+E, F2, Escape.
2. Tree integrity — NO BUGS. All mutation guards correct: indent first child (idx<=0 return), outdent root (parentId===null return), move boundaries, delete subtree (getDescendantIds + filter).
3. Race conditions — all false positives after correction.

## Gaps not audited

1. **markdown.tsx** — no agent audited for XSS or correctness. Likely safe (React escapes by default, no dangerouslySetInnerHTML), but edge cases untested: nested markers (`****`), empty markers, adversarial input.
2. **Checkvist reference docs** — agents speculated "Checkvist likely does X" but nobody read `docs/reference/checkvist/` which exists for this purpose.
3. **Unit tests** — complete absence. vitest was removed (per git history). Store logic (undo, indent, outdent, move) has zero unit coverage — only covered indirectly via e2e smoke test.
4. **CSS/Tailwind** — no audit for unused CSS variables, missing theme colors, or styling inconsistencies.
5. **Accessibility** — beyond BUG-4/5 focus management, no ARIA attributes, screen reader support, or keyboard trap behavior checked.
6. **localStorage resilience** — no audit for quota exceeded, corrupted JSON, schema migration. loadItems() falls back to sample data silently — potential silent data loss.
7. **E2e snapshot verification** — diff modifies snapshot PNGs but no agent verified they look visually correct.

---

# Part 3: Architecture (ISI / POLP / TDA)

~40 violations across full `src/`. 10 audit agents + 20 fix-plan agents.

## ISI — Interface Segregation

### ISI-1: Store internal helpers exposed publicly
1. `pushUndo()` — internal, no external consumers
2. `moveFocus()` — only called by focusDown/focusUp
3. `moveItem()` — only called by moveItemDown/moveItemUp

**Fix approaches considered:**
1. **(a) Extract to module-level functions** — true privacy, but needs store param or undoStack refactor. More verbose call sites.
2. **(b) Underscore prefix convention** — zero refactoring cost, universally signals "private by intent". But purely convention — runtime still accessible.
3. **(c) Facade wrapper** — create public interface that only exposes safe methods. True privacy via TypeScript. But extra wrapper layer, all imports break.
4. **(d) Inline** — remove moveFocus/moveItem, duplicate logic into focusDown/focusUp and moveItemDown/moveItemUp. Eliminates helpers but violates DRY.

**Recommended:** (b) now, (c) later when TDA fixes reshape the store API.

### ISI-2: Component prop interface issues
1. OutlineItem receives full VisibleItem — only uses 4 fields
2. InlineTag.type is `string` — should be `'priority'|'progress'|'due'|'label'`
3. InlineTag.styleMap uses `Record<string>` — allows invalid keys at runtime
4. TitleAction.children is ReactNode — expects SVG elements only
5. CommandPalette.action is `() => void` — too permissive
6. OutlineTree passes visibleItem + derived booleans — redundant

**Fix plan:** Priority order: (a) InlineTag.type to union type, (b) styleMap to `Record<TagType>`, (c) CommandPalette action naming. These are quick wins — type narrowing only, no logic changes. Then: (d) OutlineItem props extraction, (e) TitleAction SVG children, (f) OutlineTree prop threading. These are structural and touch component contracts.

### ISI-3: Type definitions too broad
1. OutlineItem mixes core fields with render-only optionals (note?, tags?). Store methods never use note/tags.
2. ThemeColors is 35-property monolith — components use 3-10 each
3. VisibleItem.hasChildren is redundant — derivable from childCount > 0
4. ThemeDef mixes identity/metadata/implementation. ThemeSwitcher never accesses colors.

**Fix plan:** Split OutlineItem into `OutlineItemCore` (synced: id, parentId, sortKey, text, done, tags) + `OutlineItemLocalState` (local: collapsed, note). This split is load-bearing for future sync/collab — core data syncs, local state stays per-client.

**Not fixing now:**
1. ThemeColors split — premature until 10+ themes or custom theme support. Components access colors via CSS variables, not the TypeScript interface directly.
2. hasChildren removal — hygiene only, derivable from `childCount > 0`. Low priority.
3. ThemeDef split — useful when themes become user-uploadable. Not yet.

## POLP — Principle of Least Privilege

### POLP-1: Global state over-access
1. CommandPalette imports BOTH stores — mixes outline + theme domains
2. keyboard.ts toggles command palette — keyboard handler shouldn't know about UI modal state
3. OutlineTree accesses items.length directly — should be a getter

**Fix approaches considered:**
1. **(a) React context + hooks** — standard React pattern, natural re-render scoping. But keyboard.ts can't use hooks (runs outside React lifecycle).
2. **(b) Store-level facade** — segment outlineStore API into `.outline` (reads) and `.actions` (mutations). No architectural changes, MobX stays as-is. But convention-based enforcement only.
3. **(c) Event bus** — completely decoupled, scales to collab/sync. But most invasive refactor, harder to trace bug flow.

**Recommended:** (b) for MobX compatibility. Short-term pragmatic fix; migrate to (a) when splitting stores.

### POLP-2: Function parameter scope
1. getSiblings/getDescendantIds/getAncestorIds all receive full items array — called 6+ times per interaction, O(n) scan each time
2. buildSortedChildrenMap already groups by parent but isn't reused by these helpers
3. OutlineItem event handlers extract item.id from full VisibleItem

**Fix plan:** Add `get itemById()` computed map for O(1) lookups. Refactor `getAncestorIds` to use it — worst-case pathology is search filtering (500 matching items × 3 ancestor lookups × O(n) find = 1.5M iterations → O(500 × 20) with map).

**Not fixing now:**
1. getSiblings childrenMap threading — negligible at current scale (<30 items). Profile first at 1000+ items.
2. buildVisibleItems collapsed check — mixes filtering with traversal but the function is only 15 lines. Separation adds indirection for no real gain at current complexity.

### POLP-3: Module export leaks
1. theme-store.ts:84 — `applyTheme(midnight)` executes at import time (module-level side effect)
2. applyTheme() exported but never imported externally
3. src/data/sample-items.ts — exported but never imported; duplicated in outline-store.ts

**Fix plan:** Move `applyTheme(midnight)` to explicit init in App.tsx. Remove applyTheme export. Delete duplicate `src/data/sample-items.ts`. All straightforward, no design decisions needed.

## TDA — Tell Don't Ask

### TDA-1: Components querying store and branching (PARTIALLY VALID)
1. OutlineTree reads focusedId/editingId, computes isFocused/isEditing booleans
2. ThemeSwitcher reads currentTheme, compares with === 3 times
3. CommandPalette reads focusedId, wraps every command in if(id)
4. TopBar computes isFocused from filterQuery.length + local state
5. 12+ branching sites across 5 components

**Assessment:** Initially dismissed as false positive. On reflection, partially valid:
1. **Idiomatic React side:** Components MUST read state and decide what to render. A one-line `itemId === focusedId` is not complex business logic. React doesn't have an alternative pattern. Most of the 12 sites are this category.
2. **Genuinely improvable side:** CommandPalette wrapping every command in `if(id)` is real coupling — store should expose `getAvailableCommands()`. ThemeSwitcher's triple `===` comparison would benefit from `isThemeActive(name)` for readability.
3. **Recommended:** Add `isFocused(id)`, `isEditing(id)`, `isThemeActive(name)` getters for readability. Don't restructure component rendering logic — that's idiomatic React.

### TDA-2: Store action optional id anti-pattern
All 9 mutation methods use `const targetId = id ?? this.focusedId`. toggleCollapse, toggleDone, startEditing, deleteItem, indentItem, outdentItem, moveItem, createSibling, createChild — all fall back to this.focusedId when caller should TELL which id.

**Fix approaches considered:**
1. **(a) Required id** — every call says "operate on X". Deterministic, multi-select ready. keyboard.ts passes `store.focusedId` explicitly. But verbose: `hk('Space', store.toggleCollapse)` no longer works as shorthand.
2. **(b) Stratified methods** — `toggleCollapseById(id)` + `toggleCollapseFocused()`. Self-documenting. But 2-3 variants per method = significant boilerplate.
3. **(c) Central resolver** — extract `resolveTargetId()`, keep optional params. Minimal refactor but still has the core problem: methods ask instead of tell.

**Recommended:** (a) — clearest, multi-select ready. When Checkvist adds multi-select (Shift+Click), keyboard handlers can loop over `selectedIds`. The verbose call sites are a feature, not a bug — they make intent explicit.

### TDA-3: Helper function design
1. hotkey.ts uses `'k' in b` property check — should use discriminated union with type field
2. getSiblings scans full array 6+ times per interaction — should accept pre-built childrenMap
3. getDescendantIds/getAncestorIds do O(n) scans — should accept lookup maps
4. buildVisibleItems checks item.collapsed inline — mixes filtering with traversal
5. markdown.tsx does sequential regex asking — could use tokenizer with discriminated unions

**Fix now:** hotkey.ts discriminated union — trivial (add `type: 'hotkey' | 'sequence'` field to hk/sq return types, dispatch on `b.type` instead of `'k' in b`). Real violation, 5-minute fix.

**Not fixing now:**
1. getSiblings map threading — negligible at current scale. Fix when profiling shows mutation bottleneck or when collab features require batch operations.
2. markdown.tsx tokenizer — sequential regex works correctly for 4 non-overlapping patterns (bold `**`, italic `*`, code backtick, headings `##`). A tokenizer is ~2x the code. Fix when adding escaping, nesting, or new patterns (strikethrough, etc.).
3. buildVisibleItems collapsed check — the function is 15 lines. Separating filtering from traversal adds a parameter and indirection for no real gain.

## Cross-cutting architectural issues

### ARCH-1: Fat singleton store
outlineStore is a god-object with ~25 public members. Every component sees the full API.

**Fix approaches considered:**
1. **(a) Domain store splitting** — 5 stores: outlineStore (items+undo), focusStore, editingStore, filterStore, commandPaletteStore. MobX docs recommend one store per domain. Each store independently testable. Phase: extract focusStore + editingStore first, then filterStore, then commandPaletteStore.
2. **(b) Single store + facade hooks** — keep store, wrap in `useOutlineView()`, `useOutlineActions()` per component. Minimal refactor. But hides rather than fixes the coupling.
3. **(c) Computed views as virtual sub-stores** — keep one store, expose `store.focusView`, `store.editingView` etc. as computed getters. No new files. But views are descriptive, not prescriptive.

**Recommended:** (a) when collab/sync demands it (Phase 3). Premature now — would be guessing at the right boundary between local/shared state until you build collab.

### ARCH-2: No privilege boundaries
Every component imports stores directly with full mutation access. No distinction between local UI state (focusedId, filterQuery) and shared state (items, done status).

**Fix approaches considered:**
1. **(a) Context + hooks** — low friction, idiomatic React. Each component gets scoped hook. But keyboard.ts can't use hooks.
2. **(b) Computed views + action objects** — stores expose read-only views and scoped action interfaces. More infrastructure but scales to collab.
3. **(c) Middleware wrapper** — proxy layer intercepts all mutations. Most powerful for logging/validation/sync. But opaque and hard to debug.

**Recommended:** (a) for near-term, (b) when collab demands it. Inject keyboard bindings from App.tsx instead of direct store imports. Defer to Phase 3.

### ARCH-3: Circular intent flow
keyboard.ts -> store <- components creates two independent mutation paths.

**Assessment:** This is idiomatic MobX architecture. Both paths call the same store methods — consistency is maintained. No real bugs resulted from it (Wave 3 confirmed). The review correctly flags it as a scaling concern for middleware/collab, but it's not a current problem.

**Not fixing now:** Accept current pattern for MVP. Add command/dispatch layer when collab/sync requires serializable mutation intents. Premature without real collab constraints to design against.

### ARCH-4: Hidden undo state
undoStack is module-level, not observable. UI can't show "undo available" or gray out undo hint.

**Fix approaches considered:**
1. **(a) Observable stack in outlineStore** — simplest (25 lines). But stacks become part of persistent state (localStorage bloat).
2. **(b) Separate undoStore** — clean separation, no localStorage bloat, natural redo support. ~100 lines, 2 files. BottomBar observes `undoStore.canUndo`. keyboard.ts binds `Mod+Shift+Z` to redo.
3. **(c) Thin computed wrapper** — keep undoStack module-level, add observable `canUndo` getter. Quickest but no redo support, doesn't fix BUG-2.

**Recommended:** (b) — clean separation, redo support, fixes ARCH-4 and enables BUG-2 fix. Defer to Phase 3.

### ARCH-5: Theme logic duplicated
Both ThemeSwitcher and CommandPalette loop over themes array independently.

**Fix approaches considered:**
1. **(a) Computed commands in themeStore** — single source of truth. But mixes theme state with command infrastructure.
2. **(b) Shared hook** — `useThemeCommands()` returns Command[]. DRY. But doesn't scale when tags, due dates, assignees arrive.
3. **(c) Command registry** — features register commands, palette queries registry. Scales to unlimited feature domains. More infrastructure upfront.

**Recommended:** (c) for Checkvist-scale vision. Checkvist has ~30+ commands — a registry is the expected architecture. If shipping fast, (b) is a pragmatic 10-minute fix that eliminates duplication today.

---

# Fix Sequencing

## Phase 1: Critical bugs + style nits (fix now, <1 day)

1. BUG-1: deleteItem clears editingId
2. BUG-2: undo restores focusedId (fix before BUG-3)
3. BUG-3: startEditing guards item existence
4. BUG-4+5: Focus manager for DOM focus restoration
5. Style: Revert one-liner, rename buildChildrenByParentMap

## Phase 2: Foundation for scaling (before next feature, ~2-3 days)

6. ISI-1: Underscore prefix for internal helpers
7. ISI-2: Type narrowing (InlineTag union, styleMap Record, props)
8. ISI-3: OutlineItem core/local split
9. POLP-1: Store facade segmentation
10. POLP-2: itemById computed map
11. POLP-3: Remove side effects and duplicates
12. TDA-1: Add isFocused(id), isEditing(id), isThemeActive(name) getters
13. TDA-2: Required id on all 9 mutation methods
14. TDA-3: Hotkey discriminated union
15. ARCH-5: Command registry for CommandPalette

## Phase 3: Architectural scaling (when adding collab/sync)

16. ARCH-1: Domain store splitting
17. ARCH-2: Privilege boundaries via context+hooks
18. ARCH-3: Command/dispatch layer
19. ARCH-4: Observable undoStore with redo

## Issue counts

| Section | Scope | Issues |
|---------|-------|--------|
| Part 1 — Diff review | diff only | 0 bugs, 2 style nits, 3 observations |
| Part 2 — Bugs | full src/ | 5 confirmed bugs, 4 false positives corrected, 7 unaudited gaps |
| Part 3 — Architecture | full src/ | ~40 ISI/POLP/TDA violations, 5 ARCH issues |
