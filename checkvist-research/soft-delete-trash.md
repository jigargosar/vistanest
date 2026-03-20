# Checkvist: Soft Delete & Trash Behavior

Research date: 2026-03-20
Sources: checkvist.com/help, checkvist.com/auth/api, checkvist.com/auth/help

## How Delete Works

### Item Deletion

- Press `Del` to delete the focused item.
- On laptops without a dedicated Del key, use `fn-Backspace`.
- Deletion is immediate from the UI -- the item disappears from the list.
- Works with multi-selected items (bulk delete).

### Children Behavior

- "The list item gets deleted with all its sub-items."
- This is a cascading delete -- parent and all descendants are removed together.
- There is no option to delete a parent but keep its children (e.g., promote children first).

### List Deletion

- Only list owners can delete entire lists.
- Collaborators can only archive or unshare.

## Soft Delete vs Hard Delete

### Internal Implementation (from API docs)

The API documentation for `DELETE /checklists/{checklist_id}` states: "at the moment of the call, the list is marked for deletion only. Actual data deletion occurs later, once a day."

This confirms Checkvist uses **soft delete** internally. Items are marked as deleted but not immediately purged from the database.

The task deletion API (`DELETE /checklists/{checklist_id}/tasks/{task_id}`) does not explicitly document the same "marked for deletion" behavior, but the restore feature's existence implies tasks also use soft delete.

## Trash / Restore Mechanism

### There Is No Persistent Trash View

Checkvist does **not** have a dedicated trash bin or recycle bin view that you can browse at any time. Instead, it has a **restore dialog** that shows recently deleted items within a time window.

### Restore Dialog

- Keyboard shortcut: `rd` (or List actions menu > "Restore deleted").
- Opens a dialog showing "all recently deleted items."
- Items are displayed with checkboxes for selection.
- Select items, then press "Restore selected" button.
- Supports bulk and "sticky" selection for restoring multiple items.
- Restored items **appear at the top of the list** (not in their original position).

### Restore Time Windows

- **Free accounts:** 24 hours from deletion.
- **PRO accounts:** 10 days from deletion.
- After the window expires, items are permanently gone.

## Undo Behavior

- `Ctrl+Z` or `uu` provides one-step undo.
- This is the fastest recovery -- works immediately after deletion.
- The undo is generic (not delete-specific) -- it undoes "the last action."
- Not documented: whether undo restores items to their original position (likely yes, since it's a general undo, not the restore dialog).
- Not documented: how many levels of undo are supported for delete specifically.

## Permanent Delete

### Wipe Command

- Keyboard shortcut: type `wipe` in command mode.
- Permanently deletes **all completed tasks** in the list or under a selected branch.
- This is scoped -- you choose the branch or entire list.
- No restoration after wipe.
- This is separate from item deletion -- it targets completed items specifically.

### Automatic Purge

- Based on the API docs, actual data deletion "occurs later, once a day."
- Items past their restore window (24h free / 10d pro) are presumably purged in this daily job.

## Related Features

### Hide Completed (`hc`)

- Toggles visibility of completed and invalidated items.
- This is a **view filter**, not a delete -- items remain in the data.
- Safer alternative to deletion for managing clutter.

### Reset (`reset`)

- Re-opens all completed tasks in the list or under selected node.
- Opposite of wipe -- instead of deleting completed items, it uncompletes them.

### Archive vs Delete

- **Archive** moves a list to an "Archived" section. It does not affect other team members. Archived lists remain recoverable and accessible.
- **Delete** removes the list with a time-limited restore window. Only owners can delete.
- Archive is non-destructive; delete is destructive (though soft).

## Keyboard Shortcuts Summary

| Shortcut | Action |
|---|---|
| `Del` | Delete focused item (with all sub-items) |
| `fn-Backspace` | Same as Del (for laptops) |
| `Ctrl+Z` | Undo last action |
| `uu` | Undo last action (vim-style) |
| `rd` | Open restore deleted dialog |
| `hc` | Hide/show completed items |
| `wipe` | Permanently delete all completed tasks |
| `reset` | Re-open all completed tasks |

## Not Documented

- Whether restored items retain their original parent/position or always go to list root.
- Whether sub-items of a deleted parent can be individually restored (or only the parent, which brings back all children).
- Exact behavior of undo for bulk delete (does one Ctrl+Z restore all items from a bulk delete?).
- Whether there is a "permanently delete" action for individual items (not just wipe for completed).
- Whether the restore dialog shows the original hierarchy of deleted items.
- How many undo levels are supported.
- Whether delete is available during editing mode or only in navigation mode.
- Whether there is an "empty trash" action (likely no, since there is no persistent trash view -- items auto-purge after the time window).

## Implications for VistaNest

### What to Build for v1

1. **Soft delete with `deletedAt` timestamp.** Mark items as deleted rather than removing from the array. This matches Checkvist's internal approach and is simpler to implement than a separate trash data structure.

2. **Cascade to children.** When a parent is soft-deleted, all descendants must also be marked deleted. The `visibleItems` computed already filters -- add `deletedAt == null` to the filter.

3. **Restore dialog (`rd` shortcut).** A modal/overlay listing recently deleted items with checkboxes and a "Restore selected" button. Restored items go to the top of the list (matching Checkvist behavior). No time window needed for v1 (local-only, no storage pressure).

4. **Undo support.** The existing undo mechanism (snapshot array with `toJS()`) should already handle delete undo -- verify it captures the pre-delete state. `Ctrl+Z` should restore deleted items to their original position (unlike the restore dialog which puts them at top).

5. **`Del` key binding.** Add to keyboard setup. Must work with multi-selection if that exists.

### What to Defer Past v1

- Wipe command (permanent delete of completed items).
- Time-limited restore windows (only relevant with server-side storage).
- Archive feature (separate from soft delete).
- Hide completed toggle (`hc`).
- Reset command.
- Permanently delete individual items.

### Key Design Decision

The restore dialog and undo serve different purposes:
- **Undo** = "I just made a mistake" -- restores to original position, limited history.
- **Restore dialog** = "I deleted something a while ago" -- puts items at list top, browse all soft-deleted items.

Both are needed. Undo alone is insufficient because it only covers the last N actions. The restore dialog is insufficient alone because it loses item position.

### Data Model Addition

```typescript
// Add to OutlineItem
deletedAt: number | null  // null = active, timestamp = soft-deleted
```

The `visibleItems` computed filters out `deletedAt != null`. The restore dialog queries items where `deletedAt != null`, sorted by `deletedAt` descending (most recently deleted first).
