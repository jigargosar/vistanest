# Checkvist Archive & Completed Items — Research

## Overview

Checkvist has two distinct concepts that are often conflated:

1. **List archiving** — archiving an entire checklist (list-level operation)
2. **Completed item management** — hiding, moving, wiping, or resetting completed tasks within a list

There is NO per-item "archive" action. Checkvist does not move individual completed items to an archive. Instead, it provides display controls (hide, move down) and destructive cleanup (wipe) for completed items.

---

## Task Status States

Checkvist has exactly three task states:

| Status | Code | Shortcut | Visual |
|---|---|---|---|
| Open | `0` | (default) | Normal text |
| Closed (completed/done) | `1` | `Space` | Strikethrough |
| Invalidated | `2` | `Shift+Space` | Strikethrough (same treatment as closed) |

- `Space` toggles between open and closed.
- `Shift+Space` marks as invalidated (a "not applicable" / "cancelled" state, distinct from done).
- `Del` also toggles task status.
- Both closed and invalidated items receive strikethrough formatting.
- Both closed and invalidated items are treated identically by hide/display operations.

## Parent Auto-Close Behavior

- By default, a parent item is automatically closed when ALL its children are closed or invalidated.
- This is configurable: Profile → Settings → uncheck "Close parent task when the last child is closed."
- Corollary from the API: "for non-leaf tasks, status of its children will be changed. In Checkvist, the status of a non-leaf task is defined as a cumulative status of its children." Closing a parent closes all its children. Reopening a parent reopens all its children.

---

## Hide Completed (`hc`)

- Keyboard shortcut: `hc` (two keystrokes, sequential — a "sequence" shortcut)
- Toggles visibility of completed AND invalidated items.
- When active, completed/invalidated items disappear from the view entirely.
- A small icon appears in the toolbar indicating that completed items are hidden.
- This is a display-only toggle — items are not deleted or moved. Toggling `hc` again shows them.
- `hc` applies to the entire list, not a selected branch.

## Move Completed Down

- Alternative to hiding: "Move completed down" repositions finished tasks to the bottom of their respective branches.
- Items move down only within their own branch level — preserves outline hierarchy.
- This is a display/sort option, not a destructive operation.
- Not documented: whether this is a persistent toggle or a one-time reorder.
- Not documented: the exact keyboard shortcut or menu path to activate this (it is mentioned as an option but the trigger is not specified in the shortcuts list).

---

## Wipe (`wipe`)

- Keyboard shortcut: `wipe` (four keystrokes, sequential)
- **Permanently deletes** all completed tasks.
- Scope: operates on the entire list OR under the currently selected branch (user defines scope before execution).
- This is destructive — items go to the deleted items pool.
- Deleted items can be restored within the restoration window (see below).

## Reset (`reset`)

- Keyboard shortcut: `reset` (five keystrokes, sequential)
- Re-opens all completed tasks (sets them back to open status).
- Scope: operates on the entire list OR under the currently selected node.
- Use case: reusing a checklist template — complete items, then reset to start over.

---

## Restore Deleted (`rd`)

- Keyboard shortcut: `rd` (two keystrokes, sequential)
- Opens a restoration dialog showing recently deleted items.
- User selects specific items from the dialog and clicks "Restore selected."
- Restored items appear at the top of the list.
- **Free accounts**: 24-hour restoration window.
- **PRO accounts**: 10-day restoration window.
- Also accessible via List actions menu (not just the keyboard shortcut).

## Undo

- `Ctrl+Z` or `uu` — undo the last action.
- Not documented: how many undo levels are supported, or whether undo covers wipe/reset operations.

---

## List-Level Archiving

This is a completely separate feature from item completion management.

- Archiving operates on an entire list/checklist, not individual items.
- Archived lists appear in a separate "Archived" section on the homepage.
- **Personal decision**: archiving a list does NOT affect other collaborators. They continue to see the list as active. Only the person who archived it sees it in their archive.
- Archived lists don't trigger notifications by default. PRO users can re-enable notifications for archived lists in profile settings.
- Archived lists remain accessible to all collaborators who had prior permissions.
- Access: List actions menu at the bottom of the toolbar → Archive or Delete.
- Not documented: keyboard shortcut for archiving a list.

### API for Archived Lists

- `GET /checklists.json` with parameter `archived=true` returns archived checklists.
- Standard checklist fields include `task_count` (total leaf tasks) and `task_completed` (completed leaf tasks).

---

## API Details

### Task Status Endpoints

- `POST /checklists/{id}/tasks/{task_id}/close.json` — close a task
- `POST /checklists/{id}/tasks/{task_id}/invalidate.json` — invalidate a task
- `POST /checklists/{id}/tasks/{task_id}/reopen.json` — reopen a task
- Response: returns the modified task AND all child tasks as an array.

### Task Status Field

- `status` field: `0` = open, `1` = closed, `2` = invalidated.

### Task Deletion

- `DELETE /checklists/{id}/tasks/{task_id}.json` — delete a single task.

### No API For

- Hiding completed items (client-side display toggle only)
- Bulk wipe (no bulk delete endpoint; only individual task deletion)
- Restoring deleted items (deletion is marked for later removal, not recoverable via API)
- "Move completed down" (client-side display option only)

---

## Multi-Selection for Bulk Operations

- `Shift+Up/Down` — select adjacent items
- `Ctrl+Click` or `st` — select sparse (non-adjacent) items
- `Ctrl+A` — select all expanded nodes
- Multi-selected items can then be bulk-closed, bulk-deleted, etc.

---

## Visual Summary of Completed Item Lifecycle

```
Open item
  ↓ Space
Closed item (strikethrough)
  ↓ hc
Hidden from view (still exists, toggle to show)
  ↓ wipe
Deleted (in deleted pool)
  ↓ rd (within 24h/10d)
Restored to top of list
```

Alternative path:
```
Closed item
  ↓ "Move completed down"
Moved to bottom of its branch (still visible)
```

Reset path:
```
Closed item
  ↓ reset
Re-opened (back to open status)
```

---

## Not Documented

- Whether "Move completed down" is a persistent toggle or one-time action.
- The exact UI/shortcut to activate "Move completed down."
- How many undo levels exist.
- Whether undo covers wipe/reset.
- Keyboard shortcut for list-level archive (only menu access documented).
- Whether invalidated items have any visual distinction from closed items beyond strikethrough (e.g., different color or icon).
- How "hide completed" interacts with search/filter — are hidden completed items findable via search?
- Whether there is a count/badge showing how many items are hidden.

---

## Implications for VistaNest

1. **No per-item archive needed in v1.** Checkvist does not have per-item archiving. The v1 roadmap says "Archive for done items works" — but Checkvist's model is hide/wipe, not archive. Decision needed: do we match Checkvist's model (hide + wipe + restore), or build a dedicated archive? The release definition should be clarified.

2. **Three task states, not two.** Checkvist has open/closed/invalidated. VistaNest currently has open/done. Adding "invalidated" is not in v1 scope but the data model should not preclude it (use a status field with explicit values, not a boolean).

3. **`hc` (hide completed) is the primary workflow.** Users close items with Space, then toggle visibility with `hc`. This is the most-used pattern — it should be the first thing built.

4. **"Move completed down" is secondary.** It's an alternative display option. Lower priority than `hc`.

5. **`wipe` is destructive cleanup.** It permanently deletes completed items (with a restoration window). This maps to VistaNest's "soft delete with trash view" from the release definition. The `wipe` command + `rd` restore dialog covers both the "archive for done items" and "soft delete with trash view" requirements.

6. **Scoped operations matter.** Both `wipe` and `reset` can operate on the whole list or a selected branch. VistaNest should support scoped operations from the start.

7. **Parent auto-close is expected behavior.** When all children are done, the parent should auto-close. This should be configurable.

8. **Restore goes to top of list.** Restored items appear at the top, not at their original position. This is a simpler implementation.

9. **Hide completed is client-side only.** It's a view filter, not a data mutation. This is consistent with VistaNest's `visibleItems` computed approach — add a filter flag to the store.

10. **Sequence shortcuts (`hc`, `wipe`, `reset`, `rd`).** VistaNest already has `sq()` helper for sequence shortcuts. These should use it.
