import { makeAutoObservable, reaction, toJS } from 'mobx'
import { starterItems } from '../data/sample-items'
import {
  buildFilteredVisibleItems,
  buildVisibleItems,
  createItem,
  getDescendantIds,
  getSiblings,
  sortKeyAfterLast,
  sortKeyBetween,
} from './model'
import type { OutlineItem, VisibleItem } from './model'

// === LocalStorage ===

const STORAGE_KEY = 'vistanest-items-mobx'

function loadItems(): OutlineItem[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json) {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((i: OutlineItem) => ({
          ...i,
          deletedAt: i.deletedAt ?? null,
        }))
      }
    }
  } catch {
    // corrupt data, fall through to defaults
  }
  return starterItems
}

// === Undo ===

const MAX_UNDO = 50
const undoStack: OutlineItem[][] = []

// === Store ===

export const outlineStore = makeAutoObservable({
  allItems: loadItems() as OutlineItem[],
  focusedId: null as string | null,
  editingId: null as string | null,
  filterQuery: '',
  commandPaletteOpen: false,
  hideCompleted: false,

  get items(): OutlineItem[] {
    return this.allItems.filter((i) => i.deletedAt === null)
  },

  get visibleItems(): VisibleItem[] {
    const items = this.hideCompleted
      ? this.items.filter((i) => !i.done)
      : this.items

    if (this.filterQuery.trim()) {
      return buildFilteredVisibleItems(items, this.filterQuery.trim())
    }
    return buildVisibleItems(items)
  },

  get completedCount(): number {
    return this.items.filter((i) => i.done).length
  },

  pushUndo() {
    undoStack.push(toJS(this.allItems))
    if (undoStack.length > MAX_UNDO) undoStack.shift()
  },

  undo() {
    const prev = undoStack.pop()
    if (prev) {
      this.allItems = prev
      this.editingId = null
    }
  },

  toggleCollapse(id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    const item = this.items.find((i) => i.id === targetId)
    if (item) item.collapsed = !item.collapsed
  },

  toggleDone(id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    this.pushUndo()
    const item = this.items.find((i) => i.id === targetId)
    if (item) item.done = !item.done
  },

  toggleHideCompleted() {
    this.hideCompleted = !this.hideCompleted
  },

  focusDown() { this.moveFocus('down') },
  focusUp() { this.moveFocus('up') },
  moveItemDown() { this.moveItem('down') },
  moveItemUp() { this.moveItem('up') },

  moveFocus(direction: 'up' | 'down') {
    const visible = this.visibleItems
    const idx = visible.findIndex((v) => v.item.id === this.focusedId)
    let next: number

    if (idx === -1) next = 0
    else if (direction === 'down') next = Math.min(idx + 1, visible.length - 1)
    else next = Math.max(idx - 1, 0)

    const nextItem = visible[next]
    if (nextItem) this.focusedId = nextItem.item.id
  },

  setFocused(id: string) { this.focusedId = id },
  startEditing(id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    this.editingId = targetId
    this.focusedId = targetId
  },
  stopEditing() { this.editingId = null },
  setFilterQuery(query: string) { this.filterQuery = query },
  setCommandPaletteOpen(open: boolean) { this.commandPaletteOpen = open },
  toggleCommandPalette() { this.commandPaletteOpen = !this.commandPaletteOpen },

  updateItemText(id: string, text: string) {
    this.pushUndo()
    const item = this.items.find((i) => i.id === id)
    if (item) item.text = text
    this.editingId = null
  },

  createSibling(afterId?: string) {
    const targetId = afterId ?? this.focusedId
    if (!targetId) return
    const current = this.items.find((i) => i.id === targetId)
    if (!current) return

    this.pushUndo()

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === targetId)
    const after = siblings[idx]?.sortKey ?? null
    const before = siblings[idx + 1]?.sortKey ?? null

    const newId = crypto.randomUUID()
    this.allItems.push(createItem({
      id: newId,
      parentId: current.parentId,
      sortKey: sortKeyBetween(after, before),
      text: '',
    }))
    this.focusedId = newId
    this.editingId = newId
  },

  createChild(parentId?: string) {
    const targetId = parentId ?? this.focusedId
    if (!targetId) return
    const parent = this.items.find((i) => i.id === targetId)
    if (!parent) return

    this.pushUndo()

    const children = getSiblings(this.items, targetId)
    const newId = crypto.randomUUID()

    parent.collapsed = false
    this.allItems.push(createItem({
      id: newId,
      parentId: targetId,
      sortKey: sortKeyAfterLast(children),
      text: '',
    }))
    this.focusedId = newId
    this.editingId = newId
  },

  deleteItem(id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    const current = this.items.find((i) => i.id === targetId)
    if (!current) return

    this.pushUndo()

    const visible = this.visibleItems
    const visIdx = visible.findIndex((v) => v.item.id === targetId)
    const prev = visIdx > 0 ? visible[visIdx - 1] : visible[visIdx + 1]
    this.focusedId = prev ? prev.item.id : null

    const idsToDelete = new Set([targetId, ...getDescendantIds(this.items, targetId)])
    const now = Date.now()
    for (const item of this.allItems) {
      if (idsToDelete.has(item.id)) item.deletedAt = now
    }
  },

  indentItem(id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    const current = this.items.find((i) => i.id === targetId)
    if (!current) return

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === targetId)
    if (idx <= 0) return

    this.pushUndo()

    const newParent = siblings[idx - 1]
    const newParentChildren = getSiblings(this.items, newParent.id)

    current.parentId = newParent.id
    current.sortKey = sortKeyAfterLast(newParentChildren)
    newParent.collapsed = false
  },

  outdentItem(id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    const current = this.items.find((i) => i.id === targetId)
    if (!current || current.parentId === null) return

    const parent = this.items.find((i) => i.id === current.parentId)
    if (!parent) return

    this.pushUndo()

    const grandparentId = parent.parentId
    const parentSiblings = getSiblings(this.items, grandparentId)
    const parentIdx = parentSiblings.findIndex((s) => s.id === parent.id)
    const afterParent = parentSiblings[parentIdx]?.sortKey ?? null
    const beforeNext = parentSiblings[parentIdx + 1]?.sortKey ?? null

    current.parentId = grandparentId
    current.sortKey = sortKeyBetween(afterParent, beforeNext)
  },

  moveItem(direction: 'up' | 'down', id?: string) {
    const targetId = id ?? this.focusedId
    if (!targetId) return
    const current = this.items.find((i) => i.id === targetId)
    if (!current) return

    const siblings = getSiblings(this.items, current.parentId)
    const idx = siblings.findIndex((s) => s.id === targetId)

    if (direction === 'up' && idx <= 0) return
    if (direction === 'down' && idx >= siblings.length - 1) return

    this.pushUndo()

    // Swap sortKeys
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const swapItem = siblings[swapIdx]
    const tempKey = current.sortKey
    current.sortKey = swapItem.sortKey
    swapItem.sortKey = tempKey
  },
}, {}, { autoBind: true })

// Auto-persist items on change
reaction(
  () => JSON.stringify(outlineStore.allItems),
  (json) => localStorage.setItem(STORAGE_KEY, json),
)
