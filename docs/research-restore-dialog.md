# Restore Dialog — Research

Date: 2026-03-21
Sources: checkvist.com/help, blog.checkvist.com, discuss.checkvist.com, Workflowy/Notion/Dynalist/Todoist docs

## Checkvist Behavior (confirmed)

1. `rd` two-key sequence opens a modal dialog over the current list
2. Dialog shows all recently deleted items from the current list
3. Selection uses Checkvist's standard item selection — click, Shift+arrows, `st` sticky (not checkboxes)
4. "Restore selected" button at bottom (or press `rd` again to restore)
5. Restored items go under original parent if parent still in same place, else top of list
6. 24h restore window (free) / 10 days (pro) — items auto-purge after window
7. No "empty trash" or "restore all" — time-based purge only
8. `Ctrl+Z` / `uu` provides one-step undo immediately after deletion (separate from restore dialog)

## Not confirmed

1. Flat vs hierarchical display in dialog — not documented
2. Whether restoring a parent auto-restores its children — implied yes (deleted together as a unit)
3. Whether deletion timestamps are shown — not mentioned
4. Whether dialog groups items by deletion event — not mentioned

## Cross-app comparison

| App | Has trash? | UI type | Restore position | Keyboard trigger |
|---|---|---|---|---|
| Checkvist | Yes | Modal dialog | Original parent or top | `rd` |
| Workflowy | Yes | Modal popup | Likely original position | No (menu) |
| Notion | Yes | Sidebar panel | Bottom of original parent | No (sidebar) |
| Dynalist | No | Version history only | Manual re-add | No |
| Todoist | No | Backup download only | New project | No |
| Logseq | No | None | N/A | No |

## VistaNest v1 Scope Decisions

1. `rd` sequence opens modal dialog
2. Show all soft-deleted items in tree structure (nested under parents)
3. Click a single item to restore it
4. Restore under original parent if it exists in active items
5. Restore to top of list if parent absent
6. Escape to close
7. No checkboxes, no multi-select, no bulk actions
8. No empty trash, no time windows, no auto-purge
