import { generateKeyBetween } from 'fractional-indexing'
import type { OutlineItem } from '../store-mobx/model'

function makeTree(n: number, maxDepth: number): OutlineItem[] {
  const items: OutlineItem[] = []
  const parentStack: { id: string; depth: number; childKey: string | null }[] = []

  for (let i = 0; i < n; i++) {
    const depth = i % maxDepth
    // trim stack to current depth
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

export const sampleItems: OutlineItem[] = makeTree(2000, 1)
