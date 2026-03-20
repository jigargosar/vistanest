import { generateKeyBetween } from 'fractional-indexing'
import type { OutlineItem } from '../store-mobx/model'

// === Starter items — shown on first load ===

const k1 = generateKeyBetween(null, null)
const k2 = generateKeyBetween(k1, null)
const k3 = generateKeyBetween(k2, null)

const k1_1 = generateKeyBetween(null, null)
const k1_2 = generateKeyBetween(k1_1, null)
const k1_3 = generateKeyBetween(k1_2, null)
const k1_4 = generateKeyBetween(k1_3, null)

const k2_1 = generateKeyBetween(null, null)
const k2_2 = generateKeyBetween(k2_1, null)
const k2_3 = generateKeyBetween(k2_2, null)

const k3_1 = generateKeyBetween(null, null)
const k3_2 = generateKeyBetween(k3_1, null)

const k1_2_1 = generateKeyBetween(null, null)
const k1_2_2 = generateKeyBetween(k1_2_1, null)

export const starterItems: OutlineItem[] = [
  { id: 's-1', parentId: null, sortKey: k1, text: '## Welcome to VistaNest', collapsed: false, done: false, note: 'A keyboard-first hierarchical outliner' },
  { id: 's-1-1', parentId: 's-1', sortKey: k1_1, text: 'Press **J/K** to navigate up and down', collapsed: false, done: false },
  { id: 's-1-2', parentId: 's-1', sortKey: k1_2, text: 'Press **Tab** to indent, **Shift+Tab** to outdent', collapsed: false, done: false },
  { id: 's-1-2-1', parentId: 's-1-2', sortKey: k1_2_1, text: 'This item is nested one level deeper', collapsed: false, done: false },
  { id: 's-1-2-2', parentId: 's-1-2', sortKey: k1_2_2, text: 'So is this one', collapsed: false, done: false },
  { id: 's-1-3', parentId: 's-1', sortKey: k1_3, text: 'Press **Enter** to create a sibling, **Shift+Enter** for a child', collapsed: false, done: false },
  { id: 's-1-4', parentId: 's-1', sortKey: k1_4, text: 'Press **X** to mark done, **Space** to collapse', collapsed: false, done: false },

  { id: 's-2', parentId: null, sortKey: k2, text: '## Markdown support', collapsed: false, done: false },
  { id: 's-2-1', parentId: 's-2', sortKey: k2_1, text: 'Use `## heading` for sections', collapsed: false, done: false },
  { id: 's-2-2', parentId: 's-2', sortKey: k2_2, text: 'Use **bold**, *italic*, and `code` inline', collapsed: false, done: false },
  { id: 's-2-3', parentId: 's-2', sortKey: k2_3, text: 'Visual hierarchy comes from content, not depth', collapsed: false, done: false, tags: [{ label: 'tip', type: 'label' }] },

  { id: 's-3', parentId: null, sortKey: k3, text: '## Try it out', collapsed: false, done: false },
  { id: 's-3-1', parentId: 's-3', sortKey: k3_1, text: 'Edit this item — press **F2** or **E E**', collapsed: false, done: false, tags: [{ label: 'try-me', type: 'progress' }] },
  { id: 's-3-2', parentId: 's-3', sortKey: k3_2, text: 'Open command palette — **Ctrl+K**', collapsed: false, done: true },
]

// === Bench utility — not used in production ===
// To perf test: change starterItems export above to makeTree(N, depth)

export function makeTree(n: number, maxDepth: number): OutlineItem[] {
  const items: OutlineItem[] = []
  const parentStack: { id: string; depth: number; childKey: string | null }[] = []

  for (let i = 0; i < n; i++) {
    const depth = i % maxDepth
    while (parentStack.length > depth) {
      parentStack.pop()
    }
    const parentId = parentStack.length > 0 ? parentStack[parentStack.length - 1].id : null
    const parent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : null
    const sortKey = generateKeyBetween(parent?.childKey ?? null, null)
    if (parent) {
      parent.childKey = sortKey
    }
    const id = 'item-' + i
    items.push({
      id,
      parentId,
      sortKey,
      text: 'test item ' + i,
      collapsed: false,
      done: false,
    })
    parentStack.push({ id, depth, childKey: null })
  }
  return items
}
