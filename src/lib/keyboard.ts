import { outlineStore } from '../store-mobx/outline-store'

const DOUBLE_TAP_MS = 400

let lastEPress = 0

function isInputFocused(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement).tagName
  return tag === 'INPUT' || tag === 'TEXTAREA'
}

function handleDoubleTap(): boolean {
  const now = Date.now()
  if (now - lastEPress < DOUBLE_TAP_MS) {
    lastEPress = 0
    return true
  }
  lastEPress = now
  return false
}

export function createKeyHandler(): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (isInputFocused(e)) return
    if (outlineStore.editingId) return

    const id = outlineStore.focusedId

    switch (e.key) {
      case 'z':
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
          e.preventDefault()
          outlineStore.undo()
        }
        break
      case 'k':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          outlineStore.setCommandPaletteOpen(!outlineStore.commandPaletteOpen)
        } else {
          e.preventDefault()
          if (e.altKey && id) outlineStore.moveItem(id, 'up')
          else outlineStore.moveFocus('up')
        }
        break
      case 'j':
      case 'ArrowDown':
        e.preventDefault()
        if (e.altKey && id) outlineStore.moveItem(id, 'down')
        else outlineStore.moveFocus('down')
        break
      case 'ArrowUp':
        e.preventDefault()
        if (e.altKey && id) outlineStore.moveItem(id, 'up')
        else outlineStore.moveFocus('up')
        break
      case ' ':
        if (!id) return
        e.preventDefault()
        outlineStore.toggleCollapse(id)
        break
      case 'Enter':
        if (!id) return
        e.preventDefault()
        if (e.shiftKey) outlineStore.createChild(id)
        else outlineStore.createSibling(id)
        break
      case 'F2':
        if (!id) return
        e.preventDefault()
        outlineStore.startEditing(id)
        break
      case 'e':
        if (!id) return
        if (handleDoubleTap()) {
          e.preventDefault()
          outlineStore.startEditing(id)
        }
        break
      case 'Delete':
      case 'Backspace':
        if (!id) return
        e.preventDefault()
        outlineStore.deleteItem(id)
        break
      case 'Tab':
        if (!id) return
        e.preventDefault()
        if (e.shiftKey) outlineStore.outdentItem(id)
        else outlineStore.indentItem(id)
        break
      case 'x':
        if (!id) return
        e.preventDefault()
        outlineStore.toggleDone(id)
        break
    }
  }
}
