# Checkvist Notes/Comments Feature — Research

## Concept

In Checkvist, a **note** is a comment on a list item. Notes are not sub-items — they cannot have tags, due dates, completion status, or invalidation. They exist purely as supplementary commentary attached to an item. Multiple notes can be attached to a single list item.

Notes also serve as **collaboration comments** — when a list is shared, each collaborator can add their own notes to items, creating a discussion thread per item.

## Display

- Notes appear **inline below the item** they belong to, not in a side panel or popup.
- The `sn` keyboard shortcut toggles **show/hide all notes on the page** — this is a global toggle, not per-item.
- Individual notes are expandable/collapsible on their items.
- Not documented: Whether there is a visible icon, badge, or note count indicator on items that have notes in the collapsed/hidden state. The help docs do not describe a specific visual indicator, but the feature clearly needs one since `sn` toggles visibility — there must be a way to know which items have notes when notes are hidden.

## Adding Notes

- Press `nn` on a focused/selected list item to add a new note.
- Not documented: Whether `nn` opens an inline editor below the item or a separate input area. Based on the inline display model, it likely opens an inline text area below the item.

## Editing Notes

- **Only the note's author can edit their own notes.** This is a hard permission rule.
- To edit a note: **double-click it** or use the `ee` (edit) shortcut or press `F2`.
- Additional editing shortcuts from blog:
  - `ei` — edit insert (cursor at beginning of note text)
  - `ea` — edit append (cursor at end of note text)
  - These reduce keystrokes vs `ee`, which pre-selects the entire note text.
- Not documented: Whether you need to focus/select a specific note before using `ee`/`ei`/`ea`, or whether these work when the parent item is focused.

## Deleting Notes

- `cn` — **clears ALL notes** from the selected list item. This is a bulk operation, not per-note deletion.
- **Anyone with write access** to the list can delete notes (unlike editing, which is author-only).
- Not documented: Whether there is a way to delete a single note without clearing all notes on the item.

## Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `nn` | Add a note/comment to the focused list item |
| `sn` | Show/hide all notes on the page (toggle) |
| `cn` | Clear (delete) all notes on the selected list item |
| `ee` / `F2` | Edit the selected note |
| `ei` | Edit note with cursor at beginning (insert mode) |
| `ea` | Edit note with cursor at end (append mode) |
| `Ctrl+B` | Bold (while editing note) |
| `Ctrl+I` | Italic (while editing note) |
| `Ctrl+K` | Add/edit hyperlink (while editing note) |

## Formatting Support

Notes support the **same formatting as list items**, which uses GitHub Flavored Markdown (GFM) plus some Checkvist-specific syntax.

### Supported in notes:

- **Bold**: `**text**` or `Ctrl+B`
- **Italic**: `*text*` or `Ctrl+I`
- **Strikethrough**: `~~text~~`
- **Inline code**: backtick-wrapped
- **Code blocks**: triple backticks with optional language specification
- **Headers**: `#` through `######`
- **Unordered lists**: `*` prefix
- **Ordered lists**: `1.` prefix
- **Blockquotes**: `>` prefix
- **Tables**: GitHub table syntax
- **Separators**: `----` (four or more hyphens)
- **Links**: `[text](URL)`, auto-linked bare URLs
- **Internal links**: `[[link to list item]]` syntax
- **Images**: `img:` syntax or drag-and-drop

Markdown is enabled by default but can be disabled per-list or globally. The formatting toolbar/palette is accessible via `Shift+Shift` (command palette).

## Images and Attachments

- **Images**: Can be added to notes via drag-and-drop or the `img:` syntax (for uploading a file). This was a later addition announced on the blog.
- **File attachments**: Not documented as a separate feature for notes. The `img:` syntax handles image uploads specifically. General file attachments on notes are not mentioned.

## @Mentions

- In notes, you can `@mention` any person who the list is shared with.
- @mentions trigger **email notifications** to the mentioned user.
- This is the primary collaboration mechanism for notes.

## Email Notifications

- Information about new notes appears in email notifications to list collaborators.
- @mentions in notes trigger targeted notifications.

## Slack Integration

- Slack message text can be placed directly into notes via integration, keeping the inbox list item compact while the full Slack message lives in the expandable note.

## What Notes Cannot Do

- Cannot have tags
- Cannot have due dates
- Cannot be completed or invalidated
- Cannot be reordered (not documented, inferred — they are comments, not items)
- Cannot be nested (no sub-notes)
- Not documented: Whether notes have timestamps or author attribution displayed in the UI.

## Not Documented (Gaps)

1. **Note indicator in list view**: No explicit description of how items with notes are visually distinguished when notes are hidden (icon, badge, count).
2. **Note panel vs inline**: The exact UI layout is not described in help docs. Evidence points to inline display below items, not a side panel.
3. **Per-note deletion**: Only `cn` (clear all) is documented. Unknown if individual notes can be deleted separately.
4. **Note timestamps**: Whether creation/edit timestamps are shown on notes.
5. **Author attribution**: Whether the note author's name/avatar is displayed (likely yes for shared lists, given the author-edit permission model).
6. **Note ordering**: Whether notes appear in chronological order or can be reordered.
7. **Note count**: Whether a count of notes is shown on the item.
8. **Max note length**: No limits documented.
9. **Navigation between notes**: No keyboard shortcuts documented for moving between notes on the same item.
10. **Undo for note deletion**: Whether `cn` (clear all notes) can be undone.

---

## Implications for VistaNest

### Core behavior to implement

1. **Notes are comments, not sub-items.** They live in a separate data structure from outline items. A note has: `id`, `itemId`, `text`, `authorId`, `createdAt`, `updatedAt`. No tags, due dates, or status.
2. **Inline display below the item.** When notes are visible, they render directly below the parent item row, not in a side panel. This keeps the outliner feel intact.
3. **Global show/hide toggle (`sn`)** for all notes on the page. This is a view-level toggle, not per-item.
4. **`nn` to add a note** to the focused item — opens an inline editor below the item.
5. **`cn` to clear all notes** on the focused item.

### Simplifications for v1

- **Single user = no author permissions.** Skip the "only author can edit" rule for now. All notes are editable/deletable.
- **Skip @mentions and email notifications.** No collaboration in v1.
- **Skip Slack integration.**
- **Per-note delete** is probably needed even if Checkvist only documents bulk clear. A delete button/shortcut per note is more user-friendly for single-user.
- **Markdown in notes** should use the same parser as item text (`src/lib/markdown.tsx`). No additional formatting engine needed.

### Data model sketch

```
Note {
  id: string
  itemId: string          // parent outline item
  text: string            // markdown content
  createdAt: number       // timestamp
  updatedAt: number       // timestamp
}
```

Notes array lives in the store alongside items. Persisted to localStorage via the same `reaction()` pattern.

### UI sketch

- **Note indicator**: Small icon or badge on items that have notes (visible when notes are hidden globally). A comment/note icon with optional count.
- **Inline note area**: Below the item row, slightly indented, with a subtle background color to distinguish from item content.
- **Note editor**: Inline textarea that appears when pressing `nn` or editing an existing note. Same markdown preview approach as item editing.

### Keyboard shortcuts to implement

| Shortcut | Action |
|----------|--------|
| `nn` | Add note to focused item |
| `sn` | Toggle show/hide all notes |
| `cn` | Clear all notes on focused item |
| `ee` / `F2` | Edit note (when note is focused) |
| `Escape` | Close note editor |
