# Checkvist: Multiple Lists Research

Research conducted 2026-03-20 from checkvist.com/help and blog.checkvist.com.

## 1. How are multiple lists organized?

Checkvist uses a **flat list of lists** model. There is no folder hierarchy, no nesting of lists inside other lists. Each list is a top-level entity. Organization relies on three mechanisms:

### Tags on lists
- Lists can be tagged using `#tag` smart syntax directly in the list title.
- On the home page, you can filter lists by clicking tags or using the search field.
- Bulk-tagging: select multiple lists on the home page via checkboxes, then click "Tag Lists" in the bottom bar to apply tags to all selected lists at once.
- Tags on lists serve the same grouping purpose that folders would in other apps.

### Archived section
- Archived lists appear in a dedicated "Archived" section on the home page, visually separated from active lists.
- Archiving is **per-user** -- if you archive a shared list, other collaborators still see it as active in their view.
- Archived lists do not appear in the `ll` (Lists and Locations) popup.
- Archived lists do not send notifications by default.
- Archiving is available from the bottom of the "list actions menu" in the toolbar.

### Progress indicators on home page
- Each list on the home page shows either:
  - The count of **open tasks** (excluding parent items) if the progress counter is enabled on that list
  - The **total list item count** otherwise
- This gives a quick workload overview without opening each list.

### No sidebar
There is **no persistent sidebar** showing all lists. The UI is page-based:
- **Lists home page**: A dedicated full page showing all your lists. Accessed via logo click or `gh` shortcut.
- **Inside a list**: The top bar shows navigation links (Lists, Due, Tags) and the current list title. No other lists are visible. You are working in one list at a time.

### No folder/group hierarchy
Lists cannot be nested inside other lists or grouped into folders. The only organizational primitives are:
- Tags (for filtering)
- Archive (for hiding inactive lists)
- Bookmarks (for quick access to specific locations)

## 2. Navigation between lists

### Lists and Locations menu (`ll`)
The primary list switcher. This is the most important navigation mechanism.

- Press `ll` to open a command-palette-style popup.
- The popup shows **all lists and individual list items** across your entire workspace.
- Type-ahead search/filtering: start typing to narrow results.
- Press Enter to navigate to the selected list or item.
- This popup also serves as the entry point for **creating new lists** (type a name that doesn't match any existing list, press Enter or click "Create a new list").
- The `ll` menu is a **tab within the broader command palette** (`Shift+Shift`). The command palette has multiple tabs; Lists and Locations is one of them.
- Copy/cut/URL-copy shortcuts (`Ctrl+C`, `Ctrl+X`, `Ctrl+Shift+C`) work inside this menu, so you can copy a list item's text or URL without leaving the navigation popup.

### Home page (`gh`)
- Press `gh` or click the logo to navigate to the lists home page.
- Shows all active lists with checkboxes for multi-selection.
- Supports bulk operations: share, tag, archive, delete (via bottom bar when items are selected).
- Lists can be filtered by tags on this page.

### History navigation (`g left`, `g right`)
- Navigate backward and forward through recently visited locations.
- Works like browser back/forward but for Checkvist locations.
- Works across lists -- if you went from List A to List B, `g left` takes you back to List A at the position you were at.

### Bookmarks
Bookmarks save locations for quick return. They work across lists and preserve context.

- `ab` -- Add bookmark for the currently selected item. You can name it and assign a number shortcut.
- `bb` -- Open the Bookmarks tab in the command palette. Shows all bookmarks with type-ahead filtering.
- `b` + number (e.g., `b1`, `b2`) -- Jump directly to a numbered bookmark. Numbers are assigned when creating the bookmark.
- `cb` -- Clear/remove a bookmark from the selected item.

**What bookmarks can save:**
- A specific list item in any list
- A filtered view (the current search/filter is preserved)
- A focused/hoisted view
- A Due page with specific filters
- Cross-list search results

**Bookmark creation from filters:**
When a filter is active, a bookmark icon appears on the right side of the filter field. Click it to save that specific filtered view as a bookmark.

### Cross-list aggregation pages
These pages pull data from all lists into a single view:

**Due page (`gd`)**
- Shows all tasks with due dates across all lists, regardless of which list they belong to.
- Can filter by due period: today, tomorrow, overdue, ASAP, this week, etc.
- `sc` (show context) displays parent items as breadcrumbs so you can see which list/branch an item belongs to.
- You can bookmark filtered Due page views.
- Completed tasks remain visible on the Due page even when hidden elsewhere.

**Tags page (`gt`)**
- Shows all tags used across all lists on one page.
- Click a tag to see all items with that tag across all lists.
- Serves as a cross-list organizational view.

**Search (`/` or `ff`)**
- `/` or `ff` sets focus into the search field.
- Typing filters the **current list** in real-time as you type.
- Press **Enter twice** to search across **all lists** (cross-list search).
- Cross-list search works only with **whole words** (not partial matches).
- `ESC ESC` or `cf` clears the active filter.
- `rf` refreshes the filter results.
- `?` displays search syntax reference.

**Search syntax supports:**
- Tags: `#tagname`
- Assignees: `@username`
- Due dates: `^today`, `^tomorrow`, `^overdue`, `^week`, `^month`, `^ASAP`
- Status: `in:open`, `in:closed`
- Colors: `color:1`
- Attachments: `has:attachment`
- Partial words (single list only), whole words (cross-list)

### Permalinks
- Every list has a unique URL.
- Every list item has a unique URL.
- List permalinks preserve view state: current filters, expand/collapse state, display options.
- Permalinks can be shared with collaborators or used as external links.
- Timestamps on items (shown via `sd`) also serve as permalinks.

### Zen mode navigation
- `om` activates zen mode (distraction-free), hiding navigation elements.
- Keyboard shortcuts and command palette (`Shift+Shift`) still work in zen mode.
- You can still switch lists via `ll` while in zen mode.

## 3. Creating a new list

### Method 1: From the `ll` menu
1. Press `ll` to open the Lists and Locations popup.
2. Type the new list name in the search field.
3. Press Enter or click the "Create a new list" link.
4. The new list is created and you navigate to it.

### Method 2: From the home page
1. Press `gh` to go to the lists home page.
2. Use the creation interface there (enter name in search field, press Enter).

### Method 3: Extract branch as new list (`xx`)
1. Select the top-level item of a branch in any list.
2. Press `xx`.
3. The branch is **removed** from the original list and becomes an independent new list.
4. A **link** is created in the original list pointing to the new list, shown as the list title.
5. The new list is **automatically shared** with all collaborators who had access to the original list -- no manual re-sharing needed.

### Method 4: Copy list
1. Open the list actions menu in the toolbar.
2. Select "Copy list..."
3. Options when copying:
   - Create as a new independent list
   - Inline into another list as a single node (the list name becomes the root item)
   - Filter what gets copied by: completion status, specific tags, due date ranges, other attributes
4. Collaborators from the original are NOT automatically added to the copy.

### Method 5: Import (does NOT create a new list)
- Import adds content **into an existing list**, not as a new list.
- Placement options: on top, at bottom, or under the currently selected item.
- Supported formats:
  - **Plain text**: Hierarchy detected from relative indentation.
  - **OPML**: XML format for outlines; preserves Checkvist-specific attributes including repeating tasks.
- "Replace list's contents" option exists but is described as "dangerous."

### Default state of new lists
- All new lists are **private by default**.
- New lists start empty (except when created via extract or copy).

## 4. Can lists be reordered, renamed, deleted?

### Renaming
- **Double-click the list title** on the list page to enter edit mode.
- Press Enter or click Save to confirm.
- Press Escape to cancel.
- Tags can be added directly into the title using `#tag` smart syntax during editing.

### Deletion
- Only the list **owner** can permanently delete a list.
- Non-owners can only **unshare** themselves (remove their own access).
- Deletion is in the list actions menu in the toolbar.
- There is no "trash" or recovery for deleted lists -- deletion appears to be permanent.

### Archiving
- Available from the bottom of the list actions menu.
- Archived lists move to the "Archived" section on the home page.
- Archiving is **per-user**: archiving a shared list does not affect other collaborators' view.
- Archived lists do not appear in the `ll` popup.
- Archived lists do not send notifications by default.
- Archived lists can be unarchived.

### Reordering
**Partially documented.** One help page mentions that lists on the home page can be reordered via drag-and-drop or by using bulk selection and the bottom action bar. However, the main help reference does not describe this in detail -- no sort-order control or explicit ordering mechanism is documented beyond that brief mention. Tag-based filtering remains the primary way to organize what you see on the home page.

## 5. Is there a default/home list?

**Not documented.** Checkvist does not appear to have a concept of a "default" or "home" list that opens automatically on login. The entry point after login is the **lists home page** (showing all lists), not any specific list.

The closest equivalents to a "home list" are:
- Bookmarks: You can bookmark a specific list and use `b1` to jump to it instantly.
- The `ll` menu remembers recent locations and shows them at the top.
- Browser bookmark to a specific list's permalink.

## 6. Can items be moved between lists?

### Move (`mm`)
The primary mechanism for moving items between lists.

1. Select one or more items.
   - Multi-select via `Shift+arrow` (adjacent items) or `st`/`Ctrl+click` (non-adjacent items).
   - `Ctrl+A` selects all expanded items.
2. Press `mm`.
3. A destination dialog appears with type-ahead search.
4. Type to find your target list or list item.
5. Press Enter to confirm.

**Positioning behavior:**
- **If you choose a list**: selected items move to the **top** of that list.
- **If you choose a specific list item**: selected items move **under it as children**.
- You cannot select an arbitrary position within the target list's hierarchy -- placement is determined by what you select as the destination.

**After the move:**
- You stay in your **current location** (no navigation to the target list).
- The moved items disappear from your current view.

### Copy/Paste across lists
- `Ctrl+C` copies selected items (including branch children).
- `Ctrl+X` cuts selected items.
- Navigate to the target list.
- `Ctrl+V` pastes at the current cursor position.
- `Ctrl+D` duplicates items in place.

### Copy with URL
- `Ctrl+Shift+C` copies the item text with its unique Checkvist URL in Markdown format.
- Useful for creating cross-references between lists.

### Extract as list (`xx`)
- Converts a branch into a new independent list.
- The branch is removed from the original list.
- A link to the new list is left in the original location.
- Collaborators are automatically carried over.

### Move within a list (for reference)
- `Ctrl+Up/Down` moves items up/down within the current list.
- `Ctrl+Home` moves item to the top of the list.
- `Ctrl+End` moves item to the bottom of the list.
- `Tab` indents (makes child of previous sibling).
- `Shift+Tab` outdents (moves up one level).

## 7. Keyboard shortcuts for list navigation

### List switching and navigation
| Shortcut | Action |
|---|---|
| `ll` | Open Lists and Locations menu -- switch lists, search across all lists/items, create new list |
| `gh` | Go to lists home page |
| `g left` | Navigate to previous location (history back) |
| `g right` | Navigate to next location (history forward) |
| `Shift+Shift` | Open command palette (includes Lists and Locations tab) |

### Cross-list pages
| Shortcut | Action |
|---|---|
| `gd` | Go to Due page (aggregates due items from all lists) |
| `gt` | Go to Tags page (shows all tags across all lists) |
| `/` or `ff` | Search/filter current list; Enter Enter for cross-list search |
| `cf` or `ESC ESC` | Clear active filter |
| `rf` | Refresh filter results |
| `?` | Show search syntax reference |

### Bookmarks
| Shortcut | Action |
|---|---|
| `bb` | Open bookmarks tab in command palette |
| `ab` | Add bookmark for currently selected item |
| `cb` | Clear/remove bookmark |
| `b` + number | Jump to numbered bookmark (e.g., `b1`, `b2`) |

### Moving items between lists
| Shortcut | Action |
|---|---|
| `mm` | Move selected items to another list or location |
| `xx` | Extract branch as a new independent list |
| `Ctrl+C` | Copy selected items/branch |
| `Ctrl+X` | Cut selected items/branch |
| `Ctrl+V` | Paste items at current position |
| `Ctrl+Shift+C` | Copy item text with unique URL (Markdown format) |

### Item navigation within a list
| Shortcut | Action |
|---|---|
| `Up` or `j` / `Down` or `k` | Move up/down through items |
| `Home` or `Fn+Left` | Jump to first item |
| `End` or `Fn+Right` | Jump to last item |
| `PgUp` or `Fn+Up` | Scroll up one page |
| `PgDown` or `Fn+Down` | Scroll down one page |
| `Left` / `Right` | Collapse / expand branches |
| `Shift+Right` | Hoist (focus on single item and its children) |
| `Shift+Left` | Un-hoist (go back to parent) |

### Item movement within a list
| Shortcut | Action |
|---|---|
| `Ctrl+Up` / `Ctrl+Down` | Move item up/down in hierarchy |
| `Ctrl+Home` | Move item to top of list |
| `Ctrl+End` | Move item to bottom of list |
| `Tab` | Indent (make child of previous sibling) |
| `Shift+Tab` | Outdent (move up one level) |

### Selection (for bulk operations including cross-list move)
| Shortcut | Action |
|---|---|
| `Shift+Up/Down` | Select adjacent items |
| `st` or `Ctrl+click` | Toggle selection on non-adjacent items |
| `Ctrl+A` | Select all expanded items |

### List view/display
| Shortcut | Action |
|---|---|
| `hc` | Hide/show completed items |
| `hf` | Hide/show items due after tomorrow |
| `sd` | Show/hide details (timestamps, author) |
| `sc` | Show/hide context (parent breadcrumbs on Due/Search pages) |
| `pc` | Show/hide progress counter |
| `om` | Toggle zen mode (distraction-free) |
| `oo` | Open options menu |
| `ec` | Expand/collapse branch options |
| `ec0` through `ec9` | Collapse to specific depth level |
| `ss` | Sort list or branch |
| `wc` | Word count |

### Item editing
| Shortcut | Action |
|---|---|
| `Enter` | Add new item below current |
| `Alt+Enter` | Insert item above current |
| `Shift+Enter` | Add child/sub-item |
| `ee` or `F2` | Edit item text |
| `dd` | Set/modify due date |
| `tt` | Manage tags |
| `aa` | Open actions menu |

## 8. Are lists shareable independently?

Yes. Every list has its own independent sharing configuration. Sharing one list does not affect any other list.

### Public sharing (per list)
- Any list can be made public via an **unguessable link**.
- Configure the public link as **read-only** or **editable**.
- People without Checkvist accounts can **view** public lists.
- **Editing** a public list requires a Checkvist account.
- You can share a **filtered or focused view** -- recipients see the filtered state but can unfocus/unfilter if they choose.
- **PRO features:**
  - Set an **expiry time** on public links (temporary sharing).
  - Add **password protection** to public links.
  - Allow **search engine indexing** of public lists.

### Private sharing (per list)
- Invite specific people by email.
- The share dialog accepts multiple email addresses at once.
- You can include an optional message explaining the invitation.
- Each invitee receives a specific permission level.

### Permission levels
- **Owner**: Full control. Can delete the list. Can enable Markdown mode. Can customize list styling (PRO). Only one owner per list (the creator). Only the owner can permanently delete a list.
- **Writer**: Can edit and delete items. Can share the list with others. Can send notifications. Requires a Checkvist account.
- **Reader**: View-only access. Can change status of tasks **assigned to them**. Can add notes. Can attach files. Does not need a Checkvist account for public lists.

### Bulk sharing from home page
- On the lists home page, select multiple lists via checkboxes.
- Click the share button in the bottom bar to share all selected lists at once.

### Notification control (per list)
- **Watch/unwatch** individual lists via the bell icon in the list toolbar.
- Watching a list means you get notified of changes made by others.
- **Manual notifications** (free): Send email summaries of your changes to selected collaborators. Covers changes from the last ~30 minutes of your session.
- **Automatic notifications** (PRO): Choose between:
  - Real-time alerts (sent every ~5 minutes)
  - Daily digest at a preferred time
  - Daily due task reminders
- Notifications can be **paused selectively** for specific lists.
- Configuration is centralized on the Profile > Notifications page where you can select which lists to watch.
- You can send a **test notification** to preview the email format.
- There is an "All lists" option to watch every list that has due dates.

### Key sharing behaviors
- Archiving is **per-user** and does not affect other collaborators.
- When a branch is extracted as a new list (`xx`), collaborators from the original list **automatically get access** to the new list without manual re-sharing.
- Only the **owner** can delete a list; non-owners can only unshare (remove themselves).
- Copying a list does NOT carry over collaborators to the copy.

## 9. List styles (per-list setting)

Each list has a configurable display style that applies to the entire list:
- **None**: Default plain text, no item prefixes.
- **Numbered**: Numeric prefixes on items.
- **Boxes**: Checkbox prefixes (ideal for task/checklist use).
- **Bullets**: Bullet point prefixes.

Smart syntax allows **mixing styles within a single list** by prefixing individual items:
- `[]` -- Checkbox toggle on this item.
- `[*]` -- Bullet point on this item.
- `[1]` -- Numbered item.

This means the list-level style is a default, but individual items can override it.

## 10. Embedding and iframe support

Public lists can be embedded in external webpages via iframe code provided in the Share dialog. Embedded list viewers can:
- Print the list
- Open in a new tab
- Export the list
- Import content (if they have write access)

## 11. Crawl vs Jump reordering modes (within lists)

Checkvist distinguishes two modes for reordering items within a list:
- **Jump mode** (`Ctrl+Up/Down`): Moves items in larger increments, skipping over collapsed branches.
- **Crawl mode** (`Ctrl+Alt+Up/Down` or `Shift+Alt+Up/Down`): Moves items one position at a time.
- `Alt+PgUp` / `Alt+PgDown`: Move to top/bottom under current parent item.

## Summary: Checkvist Multi-List Architecture

### Mental model
Lists are **independent, flat, top-level entities**. No folders, no nesting, no hierarchy among lists. Each list is a self-contained outliner document with its own sharing, its own settings, its own URL.

### Navigation paradigm
The UI is **one-list-at-a-time** with fast switching:
1. **Lists home page** (`gh`) -- the hub showing all lists, like an email inbox
2. **`ll` command palette** -- the fast keyboard switcher, searchable, also creates lists
3. **Tags on lists** -- lightweight grouping/filtering on the home page
4. **Bookmarks** -- saved locations across lists with number shortcuts
5. **Cross-list aggregation** -- Due page, Tags page, and global search pull from all lists
6. **History** -- `g left`/`g right` for back/forward across lists

### No persistent sidebar
There is no always-visible panel showing your list of lists. Navigation between lists is through **explicit actions** (shortcuts, command palette, home page). This is consistent with Checkvist's keyboard-first philosophy -- navigation is through shortcuts and search rather than always-visible chrome.

### Cross-list operations
- **Move items** (`mm`) -- move to another list with a destination picker
- **Extract branch** (`xx`) -- split a branch into a new list with auto-linking
- **Copy/paste** -- standard clipboard operations work across lists
- **Search** -- cross-list search via Enter Enter
- **Due page** -- see all due items from all lists in one view
- **Tags page** -- see all tags from all lists in one view

---

## Implications for VistaNest

### Data model changes
- Each `OutlineItem` needs a `listId` field. The flat array model stays the same, but items now belong to a specific list.
- A new `List` entity is needed: `{ id, title, sortKey, createdAt, archivedAt?, style? }`. Flat array, same pattern as items.
- `visibleItems` computed must filter by the currently active list.
- Persistence: each list's items could be stored under a separate localStorage key (e.g., `vistanest:list:<id>:items`) or all items in one store with `listId` filtering. The single-store approach is simpler for v1 but the per-list approach scales better for lazy loading.

### Store changes
- `outlineStore` needs: `currentListId`, `lists` array, actions for CRUD on lists.
- `visibleItems` must filter by `currentListId` before building the tree.
- Undo snapshots become per-list (you don't want undoing in List B to affect List A).
- Persistence reactions need to handle the active list changing (save current list, load new list).

### Navigation / UI
- Checkvist's model (no sidebar, one-list-at-a-time, command palette switcher) maps directly to VistaNest's existing architecture. The `CommandPalette` can be extended with a "Lists" tab or mode.
- The `ll` shortcut maps to a lists mode in the existing command palette. Type-ahead filtering of list names, Enter to switch, option to create new.
- `gh` shortcut navigates to a lists home view (could be a separate route or a mode of the main view).
- History navigation (`g left`/`g right`) is a nice-to-have but not v1 critical. It would require a location history stack.
- TopBar breadcrumb should show the current list name, clickable to rename.

### v1 minimal scope (from roadmap: "Multiple lists with switcher")
1. `List` data model and store.
2. Create new list (from command palette).
3. Switch between lists (from command palette).
4. Rename list (double-click title in TopBar).
5. Delete list (from command palette or action menu).
6. Each list persists independently.
7. A "home" view showing all lists is desirable but could be deferred if the command palette switcher is good enough.

### Deferred to post-v1
- Moving items between lists (`mm`).
- Extracting branch as new list (`xx`).
- List archiving.
- Tags on lists.
- List styles (None/Numbered/Boxes/Bullets).
- Sharing and permissions (requires backend).
- Cross-list search, Due page, Tags page aggregation.
- Bookmarks.
- History navigation.
- Bulk list operations on home page.
