# Checkvist Checkbox Behaviour

Research from checkvist.com/help, blog, and forum. Not exhaustive — 3 pages surveyed.

## States

1. **Open** — default state for new items
2. **Closed/completed** — toggled with Space
3. **Invalidated/cancelled** — toggled with Shift+Space (represents "not applicable", distinct from done)

## Parent-Child Cascade

4. Closing a parent **closes ALL children** automatically
5. When all children are closed, parent **auto-closes** (configurable in Settings: "Close parent task when the last child is closed")
6. Closing parent greys out and strikes through all children
7. No option to close parent and keep children open (requested feature, not implemented)

## Visual

8. Parent items with children do **NOT show checkboxes** — only leaf items do
9. Closed items: strikethrough + greyed out
10. Invalidated items: greyed + italicized

## Completed Item Management

11. `hc` — hide completed items from view
12. Completed items can be "moved down" to bottom of their branch
13. `wipe` — delete all completed permanently
14. `reset` — reopen all completed

## List Style Types

15. `[]` prefix = checkbox, `[*]` = bullet, `[1]` = numbered
16. Children inherit parent's list style
17. All checkboxes are actionable
18. Style can be set globally via Options menu or per-branch via prefix

## Known Gaps in This Research

1. Visual checkbox appearance (square? circle? custom icon?)
2. Progress indicators on parents (e.g. "3/5 done")?
3. Bulk close/open operations beyond reset/wipe?
4. Behaviour when reopening a closed parent — do children reopen?
5. How closed items interact with search/filter
6. Keyboard shortcuts beyond Space / Shift+Space
7. How done state interacts with drag/reorder
