# Checkvist Tags — Complete Reference

Sources: checkvist.com/help, checkvist.com/features, blog.checkvist.com (tags-early-access, finalizing-tags, nine-keys-to-9-priority-colors)

---

## Adding Tags

### Method 1: Tag Dialog (`tt`)

- Select one or more list items, press `tt` to open the Tags dialog.
- Type a tag name. Autocomplete suggests tags already used across your lists.
- Add multiple tags at once: `#one, #two` (comma-separated).
- Dialog supports adding and removing tags from the selected item(s).
- Works with multi-selected items — apply tags to many items at once.

### Method 2: Smart Syntax (`#tag`)

- While editing an item's text, type `#tagname` at the end of the line.
- Autocomplete activates as you type after `#`.
- Multi-word tags use hyphens or underscores: `#two-words`, `#two_words`.
- Tags support non-Latin characters (e.g., Cyrillic, accented letters).
- Tags support hyphens within the name (e.g., `#checkvist-ui`).

### Tagging Lists (not just items)

- Double-click a list title and append `#tag` using smart syntax.
- On the home page, select multiple lists and click the "Tag" button or press `tt`.

---

## Tag Display

- The `#` symbol is NOT displayed in the rendered tag — tags appear as clean labels (e.g., "work" not "#work").
- Tags are rendered inline on the item row as clickable elements.

---

## Removing Tags

- `ct` keyboard shortcut: clears ALL tags from the selected item(s). Works on single and multi-selected items.
- Via the `tt` Tag Dialog: individual tags can be removed from the dialog UI.

There is no documented shortcut for removing a single specific tag without opening the dialog.

---

## Filtering by Tags

### Within Current List

- Click a tag on any item to filter the list to all items with that tag.
- Press `/` to focus the search field, then type `#tagname` or `tag:tagname` — autocomplete helps find the tag.
- The filter applies as you type (live/dynamic filtering).

### Across All Lists

- From the search field, press `Enter` twice to search across all accessible lists.
- `Ctrl+Enter` from the search field also searches across all lists.

### Clearing Filters

- `cf` shortcut: clears the current filter.
- `Esc` twice: also clears the filter.
- Click the X icon on the filter bar.

---

## Searching by Tags

- Press `/` or `ff` to focus the search/filter field.
- Type `#tagname` or `tag:tagname` to search by tag.
- Autocomplete is available in the search field when typing `#` or `tag:`.
- Combined search: you can mix text, tags, due dates, assignees, and colors in a single search query.
- From search results, you can perform operations on items (change status, clear tags, etc.).
- `gg` shortcut navigates to a specific task from search results.

---

## Tag Management (PRO Feature)

Accessible via the `tt` dialog or the Tags page (`gt`).

### Tag Colors

- PRO users can assign colors to tags for visual distinction.
- Not documented: how many colors, how they're selected.

### Private Tags

- Tags can be made private — visible only to you, not collaborators.
- Not documented: exact UI for toggling privacy.

### Rename Tags

- Rename a tag across all items and all lists at once.
- Not documented: whether rename preserves tag color and privacy settings.

### Merge Tags

- Merge two similar tags into one. All items with either tag end up with the merged tag.
- Not documented: which tag name survives a merge (user choice or alphabetical).

### Delete Tag Usages

- Bulk-delete a tag from all items across all lists.
- Not documented: whether this is reversible (likely not).

### Tags Page (`gt`)

- Press `gt` (Go Tags) to navigate to a dedicated Tags page.
- Shows all tags and their usage count across lists.
- Functions as a comprehensive tag map for the account.

---

## Special Tag Types

### Time Estimation Tags

- Syntax: `#1h`, `#30m`, `#2h30m`
- Recognized as time-estimate metadata.
- Not documented: whether these are summed, displayed differently, or used in reports.

### Priority / Color Tags (Separate System)

Colors (priorities) in Checkvist are NOT tags — they are a separate metadata system:

- Press number keys `1`-`9` on a selected item to set a color/priority.
- Press `0` to remove the color.
- Smart syntax: `!1` through `!9` at the beginning or end of an item sets color inline while editing.
- Both background and foreground text colors can be set (9 levels).
- PRO users can customize the color palette via "Set colors" dialog or Profile > Settings.
- Color customization is account-wide — affects all lists and all users in the account.
- Colors sync between mobile and desktop.
- Search by color: `priority:1` or `color:1` in the search field.

### Due Dates (Separate System)

Due dates are also NOT tags — separate metadata:

- `dd` keyboard shortcut opens the Due Date dialog.
- Smart syntax: `^today`, `^tomorrow`, `^+4d` (4 days ahead), `^td` (today), `^asap`.
- `dr` sets a repeating due pattern.
- `cd` clears the due date from a task.
- Search by due: `due:today`, `due:overdue`, etc.

### Assignees (Separate System)

- `ae` keyboard shortcut for Assign.
- Smart syntax: `@username` while editing.
- Search by: `assignee:name`.

---

## Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `tt` | Open Tags dialog (add/remove tags) |
| `ct` | Clear ALL tags from selected item(s) |
| `gt` | Go to Tags page (all tags overview) |
| `ff` or `/` | Focus search/filter field |
| `cf` | Clear current filter |
| `Esc Esc` | Clear current filter (alternative) |
| `gg` | Go to task from search results |
| `1`-`9` | Set color/priority (not a tag) |
| `0` | Remove color/priority |
| `dd` | Open Due Date dialog (not a tag) |
| `cd` | Clear due date (not a tag) |
| `ae` | Assign (not a tag) |
| `dr` | Set repeating due date |
| `hc` | Hide completed tasks (on search results) |

---

## Smart Syntax Summary

| Syntax | What it does |
|--------|-------------|
| `#tagname` | Add a tag |
| `#two-words` | Multi-word tag with hyphen |
| `#two_words` | Multi-word tag with underscore |
| `#1h`, `#30m` | Time estimation tag |
| `!1` - `!9` | Set color/priority |
| `^today`, `^+4d` | Set due date |
| `@username` | Set assignee |

---

## Cross-List Behavior

- Tag autocomplete draws from tags across ALL of a user's lists, not just the current list.
- The Tags page (`gt`) shows tags and usage across all lists.
- Rename and merge operations apply across all lists.
- Bulk-delete removes a tag from all lists.
- Search with `Enter Enter` or `Ctrl+Enter` searches tags across all lists.
- Lists themselves can be tagged (not just items within lists).

---

## Not Documented

- Maximum tag name length.
- Whether tag names are case-sensitive (e.g., `#Work` vs `#work`).
- Whether spaces are allowed in tag names (hyphens/underscores are documented as alternatives).
- Whether tags are ordered/sorted on an item, or displayed in creation order.
- How many tags can be on a single item.
- Whether the tag dialog shows tags grouped by list or flat.
- Whether tag colors are per-tag or per-tag-per-list.
- How time estimation tags (`#1h`) interact with parent items (rollup?).
- Whether removing a `#` tag from the item text also removes the tag metadata, or if they are decoupled once applied.
- Whether tag: search supports AND/OR operators (e.g., `tag:work tag:urgent`).
- Import/export format for tags (noted as "not supported" in early access, likely added later).
- Tag watching (email notifications on tagged item changes) — was planned, status unknown.

---

## Implications for VistaNest

### Core Tag System

1. **Tags are metadata, not inline text.** When a user types `#tagname` in smart syntax, the tag is extracted and stored as structured metadata. The `#` is not displayed in the rendered tag label. VistaNest needs a `tags: string[]` field on `OutlineItem`, not just text parsing.

2. **Tag dialog (`tt`) is the primary UI.** Most tag operations go through a dialog with autocomplete, not inline editing. This is a modal interaction — press `tt`, type, select from autocomplete, confirm.

3. **Autocomplete draws from all lists.** The tag pool is global across the user's account. VistaNest should maintain a computed set of all tags in use, derived from all items across all lists.

4. **Multi-word tags use hyphens/underscores.** No spaces in tag names. This simplifies parsing — a tag is a contiguous string of non-whitespace characters after `#`.

### Separate Metadata Systems

5. **Colors/priorities are NOT tags.** They are a separate axis with number-key shortcuts (`1`-`9`, `0` to clear). VistaNest should implement `priority: number | null` as a separate field, not as a special tag. Search syntax is `priority:N` or `color:N`.

6. **Due dates are NOT tags.** Separate field, separate dialog (`dd`), separate smart syntax (`^date`). VistaNest should implement `dueDate: string | null` as its own field.

7. **Assignees are NOT tags.** Separate field, `@username` syntax. For v1 single-user, this can be deferred, but the data model should reserve space for it.

### Filtering and Search

8. **Tags are clickable to filter.** Clicking a tag on an item instantly filters the list. This is the simplest discovery mechanism. VistaNest already has a filter system — clicking a tag should set the filter to that tag.

9. **Search combines all metadata.** A single search field accepts text, `#tags`, `priority:N`, `due:date`, `assignee:name`. VistaNest's search/filter should be designed for this combined syntax from the start, even if only tags are implemented in v1.

### V1 Scope

For the v1 release definition ("Tags can be added/removed with existing UI"):

- **Minimum:** `tags: string[]` on items, `tt` dialog with autocomplete, `ct` to clear, click-to-filter, `#tag` smart syntax during editing.
- **Defer to post-v1:** Tag management (rename, merge, delete across lists, colors, privacy), Tags page (`gt`), time estimation tags, cross-list search.
