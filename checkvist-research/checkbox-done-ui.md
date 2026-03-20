# Checkbox + Done UI — Research & v1 Plan

## v1 Scope Decisions

1. **2 states only** — open and done. No invalidated/cancelled state. done: boolean stays, no enum.
2. **No parent-child cascade** — each item's done state is independent. No auto-close children, no auto-close parent.
3. **Checkbox on every item** — not just leaves. Without cascade logic, hiding parent checkboxes would prevent marking parents done.
4. **Hide completed toggle** — H key + command palette. Filter done items from visibleItems computed. Clickable indicator in list header to show hidden count and re-show.
5. **Keep current visual treatment** — strikethrough + done-text/done-line CSS vars.
6. **No model changes** — done: boolean stays. No new fields.

Deferred to v2+: invalidated state (Shift+Space), parent-child cascade, auto-close parent, list style types ([], [*], [1]), wipe/reset bulk ops, progress indicators on parents, move-completed-to-bottom.

---

## Checkvist Reference

Source: checkvist.com/help, blog, forum, keyboard cheatsheet. Not exhaustive — 3 pages surveyed by Claude Code, supplemented by web search.

### States

1. Open — default state for new items
2. Closed/completed — toggled with Space
3. Invalidated/cancelled — toggled with Shift+Space (represents "not applicable", distinct from done)

### Parent-Child Cascade

4. Closing a parent closes ALL children automatically
5. When all children are closed, parent auto-closes (configurable in Settings: "Close parent task when the last child is closed")
6. Closing parent greys out and strikes through all children
7. No option to close parent and keep children open (requested feature, not implemented)

### Visual

8. Parent items with children do NOT show checkboxes — only leaf items do
9. Closed items: strikethrough + greyed out
10. Invalidated items: greyed + italicized

### Completed Item Management

11. hc — hide completed items from view
12. Completed items can be "moved down" to bottom of their branch
13. wipe — delete all completed permanently
14. reset — reopen all completed

### List Style Types

15. [] prefix = checkbox, [*] = bullet, [1] = numbered
16. Children inherit parent's list style
17. All checkboxes are actionable
18. Style can be set globally via Options menu or per-branch via prefix

### Keyboard Shortcuts (from cheatsheet)

- Space — toggle done
- Shift+Space — invalidate
- hc — hide/show completed
- wipe — delete completed
- reset — reopen completed
- sd — show/hide item details

### Changelog Notes

- Closing last task under parent collapses the closed parent

---

## VistaNest Current State

### Model (model.ts)

- done: boolean on OutlineItem
- No status enum, no invalidated state
- No cascade logic
- tags and note fields exist but unused by checkbox logic

### Store (outline-store.ts)

- toggleDone(id) — boolean flip with pushUndo
- completedCount — computed, used in list header
- No hideCompleted state
- visibleItems computed builds tree from all items (no done filtering)

### UI (OutlineItem.tsx)

- X key toggles done (via keyboard.ts)
- Strikethrough + done-text color when done
- No visible checkbox element
- No hide completed toggle

---

## Known Gaps (not researched)

1. Visual checkbox appearance in Checkvist (square? circle? custom icon?)
2. Progress indicators on parents (e.g. "3/5 done")?
3. Bulk close/open operations beyond reset/wipe?
4. Behavior when reopening a closed parent — do children reopen?
5. How closed items interact with search/filter
6. How done state interacts with drag/reorder
7. What other outliners do (Workflowy, Dynalist, Tana, Logseq)
8. UX implications of checkbox-on-every-item vs checkbox-on-leaves-only
9. What happens to focus when item is marked done and hide-completed is on
10. Whether hide-completed should also hide children of done parents

None of these gaps affect the v1 scope decisions above — they all relate to deferred features (cascade, invalidation, list styles) or edge cases that can be addressed after shipping.
