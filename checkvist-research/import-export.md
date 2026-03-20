# Checkvist Import & Export — Complete Reference

Sources: checkvist.com/help, checkvist.com/auth/api, blog.checkvist.com

---

## Export

### Access

- Keyboard shortcut: `ex`
- Menu: "Export..." in the Actions ellipsis menu or toolbar

### Scope Logic (Automatic Defaults)

Checkvist determines export scope from context:

- **Selected branch** — exports just that branch (the selected item and all its children)
- **No selection** — exports the entire list
- **Focused/hoisted list** — exports only the focused section
- User can override defaults in the Export dialog

### Formats

#### 1. Rich Text (RTF)

- Preserves formatting: headers, bold, italic, hyperlinks, images, bullets, checkboxes
- Designed for pasting into Google Docs, Word, Pages, email clients
- Auto-generate headings from hierarchy (1-5 levels configurable)
- Added May 2019

#### 2. Markdown

- Plain text with Markdown syntax
- Options:
  - "Generate automatic headers from" — controls how many hierarchy levels become headings (H1 reserved for list name)
  - Can generate headers only for items that have sub-items
  - Custom Markdown headings in item text are preserved as-is
  - Deeper hierarchy levels beyond the heading threshold become Markdown sub-lists (bullet lists)
- Notes appear as plain text with author attribution
- Embedded images included as Markdown image syntax
- Attached files appear as Markdown links

#### 3. OPML (Outline Processor Markup Language)

- XML format, OPML 2.0 with non-standard Checkvist extensions
- Preserves all attributes: tags, due dates, assignees, status, notes, priorities
- Compatible with OmniOutliner and similar outliner tools
- Primary format used for backup (contains the most complete data)

#### 4. Plain Text

- Unformatted text, no markup
- Subtasks indented with tab characters
- Line breaks within items replaced with spaces
- Optional: include notes (same indentation as parent item)
- Status and update details shown in parentheses
- Readable by any text editor

#### 5. HTML (Historical)

- Mentioned in a 2010 blog post as an export format
- Not documented: whether this is still available or was replaced by Rich Text

#### 6. Confluence Wiki (Historical)

- Mentioned in a 2010 blog post as an export format
- Not documented: whether this is still available

### Export Options (Customization)

Each format allows toggling inclusion/exclusion of:
- Tags (exported in `#tag` notation alongside task names)
- Due dates
- Assignees
- Notes
- Formatting (bold, italic, etc.)

### Print Preview

Available from export dialog with additional controls:
- Hide/show tags
- Hide/show due dates
- Hide/show notes
- Display/hide note content
- Print checkboxes option

### Copy Variants (Related but Separate from Export)

| Shortcut | Behavior |
|----------|----------|
| `Ctrl+C` | Copy selected items to clipboard |
| `Ctrl+Shift+C` | Copy selected item text + its unique Checkvist permalink URL in Markdown format |
| `Ctrl+X` | Cut selected items |
| `Ctrl+D` | Duplicate selected items |

- Copying a parent item copies the entire branch (all children)
- Copied format converts to Markdown
- Copy-paste preserves formatting and hyperlinks
- Context-aware: respects collapsed/expanded state when copying

---

## Import

### Access

- Keyboard shortcut: `im`
- Menu: "Import" in the Actions menu
- Paste method: `Ctrl+V` with multi-line text triggers an import dialog asking user preference

### Formats

#### 1. Plain Text

- Analyzes relative indentation of each line to determine hierarchy
- Recognizes various indentation patterns (tabs, spaces, dashes, bullets)
- Example:
  ```
  top-level item
  - sub-item
  - another sub-item
    - deeply nested
  another top-level item
  ```
- **"Separate tasks with empty line" toggle:**
  - OFF (default): each line becomes a separate item
  - ON: items are separated by blank lines, allowing multi-line content within a single item
- Line breaks within items are preserved during import

#### 2. OPML

- Imports OPML 2.0 with Checkvist non-standard extensions
- Restores all attributes from previously exported data (tags, due dates, assignees, status, notes)
- Compatible with OPML files from other outliner tools

### Placement Options

Where imported items land:

1. **On top of list** — prepended before existing items
2. **At bottom of list** — appended after existing items
3. **Under currently selected item** — inserted as children of the focused item
4. **Replace list's contents** — destructive option, completely replaces all existing items in the list

The placement UI was enhanced in November 2020 to make these options more accessible.

### Import Behavior Details

- No merge capability — import always adds new items (or replaces everything)
- No deduplication — importing the same data twice creates duplicates
- Tags in `#tag` notation are recognized during import (since 2010)
- Not documented: whether priorities, due dates, or assignees are parsed from plain text import (they are preserved in OPML)

### Smart Syntax (API Import)

The API supports `parse_tasks` parameter which recognizes:
- `^due` — due date notation
- `#tags` — tag notation
- `!3` — priority notation

Not documented: whether the UI import also supports this smart syntax, or if it's API-only.

---

## Backup & Restore

### Free Account

- Manual OPML export available (zipped format containing all lists)
- Deleted items restorable within 24 hours via `rd` shortcut

### PRO Account

- **Automatic 30-day cloud backup** — Checkvist creates backups automatically
- Checkvist skips backup if no changes were made since last backup
- Manual backup of all lists in OPML format (zipped)
- Deleted items restorable within 10 days (extended from 24 hours)
- **Dropbox integration:**
  - Saves latest backup as zipped OPML files to a Dropbox folder
  - Older backups retrievable from Dropbox file history

### Restore Deleted Items

- Shortcut: `rd`
- Shows items deleted in the last 24 hours (free) or 10 days (PRO)
- Allows selective restoration

---

## API Import/Export

### Authentication

- Basic HTTP authentication, OR
- Token-based: `token` query parameter or `X-Client-Token` header

### Import Endpoint

**POST** `/checklists/{checklist_id}/import.(json|xml)`

Parameters:
| Parameter | Description |
|-----------|-------------|
| `import_content` | List items in Checkvist import format (plain text with indentation) |
| `import_content_note` | Note for the first created item (optional) |
| `parent_id` | Parent list item ID — imports as children of this item (optional) |
| `position` | 1-based position for first imported item (optional) |
| `parse_tasks` | If present, recognizes smart syntax: `^due`, `#tags`, `!3` priority |
| `separate_with_empty_line` | `'singleItem'` = treat all content as one item; other value = separate on empty lines; default = each line is a separate item |
| `replace_existing` | Danger flag: replaces entire list content |
| `add_files[1]`, `add_files[2]` | File attachments (PRO only) |
| `checklist_id` | Can use format `'tag:tagname'` to select first list with that tag |
| `status` | Optional status (0=open, 1=done, 2=invalidated) for first imported task |

Response: Returns created tasks organized hierarchically (JSON array or XML `<tasks>` structure).

### Export via API

No dedicated bulk export endpoint documented. Data retrieval is through:
- `GET /checklists.json` — list all checklists
- `GET /checklists/{id}/tasks.json` — list all tasks in a checklist
- Individual task CRUD endpoints

Not documented: whether there is an OPML export endpoint via API, or if OPML export is UI-only.

### Checklist ID by Tag

The API allows `checklist_id` to be specified as `tag:tagname`, which selects the first checklist tagged with that name. This enables workflows where external tools import into a specific list by tag rather than numeric ID.

---

## Web Clipper Export

- Browser extension captures web content into Checkvist
- Clipped content can be exported to Markdown or Rich Text
- Used for creating "done list" reports from collected items

---

## Keyboard Shortcuts Summary (Import/Export Related)

| Shortcut | Action |
|----------|--------|
| `im` | Open import dialog |
| `ex` | Open export dialog |
| `Ctrl+C` | Copy selected items |
| `Ctrl+X` | Cut selected items |
| `Ctrl+V` | Paste (triggers import dialog for multi-line) |
| `Ctrl+D` | Duplicate selected items |
| `Ctrl+Shift+C` | Copy item text + permalink URL |
| `tc` or `lc` | Copy task permalink to clipboard |
| `rd` | View and restore deleted items |
| `Ctrl+Z` or `uu` | Undo last action |

---

## Not Documented

The following details were not found in the sources searched:

- Whether JSON is a native export format (API returns JSON, but UI export dialog lists RTF/Markdown/OPML/Plain Text)
- Whether HTML export is still available (last mentioned in 2010)
- Whether Confluence Wiki export is still available (last mentioned in 2010)
- Whether the UI import recognizes smart syntax (`^due`, `#tags`, `!3`) or if that's API-only
- Whether there is an OPML export API endpoint (UI has it, API docs don't mention it)
- Exact OPML extension attributes Checkvist uses (non-standard fields for tags, due dates, etc.)
- Maximum import size limits
- Whether import supports CSV format
- Whether export includes item creation/modification timestamps
- How export handles item status (open/closed/invalidated) in each format
- Whether "replace list contents" on import triggers an undo snapshot or is truly destructive

---

## Implications for VistaNest

### V1 Scope (from release definition: "JSON import/export works")

1. **JSON export** — Serialize the flat `OutlineItem[]` array to JSON. Include all fields: `id`, `parentId`, `sortKey`, `content`, `done`, `deleted`, `tags`, `notes`. This is simpler than Checkvist's approach since VistaNest uses a flat model already.

2. **JSON import** — Parse a JSON file back into `OutlineItem[]`. Validate structure, regenerate IDs to avoid conflicts with existing items, recompute `sortKey` values using `fractional-indexing`.

3. **Scope**: Export per-list (VistaNest will have multiple lists by v1). Import creates a new list or appends to existing.

4. **Placement options**: At minimum support "replace list" and "append to list". "Under selected item" is a nice-to-have.

### Post-V1 Considerations

5. **OPML** — Standard outliner interchange format. Important for interop with other tools (WorkFlowy, Dynalist, OmniOutliner). The flat `parentId` model maps cleanly to OPML's nested `<outline>` elements via tree reconstruction.

6. **Markdown export** — High value for sharing. Checkvist's "automatic headers from hierarchy" is a good pattern. VistaNest already has markdown in items, so export needs to handle the distinction between item-level markdown and structural markdown (hierarchy-to-headings).

7. **Plain text import** — Checkvist's indentation analysis is essential for paste-to-import. This is the most natural onboarding path: users paste an indented list and it becomes structured items.

8. **Backup** — Automatic periodic export to localStorage or downloadable file. OPML is the right format for full-fidelity backup since it's a standard and preserves hierarchy.

9. **Copy/paste clipboard** — `Ctrl+C` on selected items should copy as Markdown. `Ctrl+V` of multi-line text should trigger import. This is a keyboard-first pattern that fits VistaNest's design.

10. **No merge** — Checkvist doesn't merge on import, only add or replace. This simplifies implementation: no conflict resolution needed.

11. **API import** — Checkvist's `parse_tasks` smart syntax (`#tags`, `^due`) is worth adopting for the plain text import path. It lets users type natural syntax and have metadata extracted automatically.

12. **ID handling on import** — Imported items need new IDs generated. If importing a VistaNest JSON export back, `parentId` references must be remapped from old IDs to new IDs to maintain hierarchy.
