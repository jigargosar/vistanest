import { useEffect, useRef } from 'react'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { CommandPalette } from './components/CommandPalette'
import { useOutlineStore } from './store/outline-store'

export function App() {
  const focusedId = useOutlineStore((s) => s.focusedId)
  const editingId = useOutlineStore((s) => s.editingId)
  const commandPaletteOpen = useOutlineStore((s) => s.commandPaletteOpen)

  const lastEPressRef = useRef(0)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const store = useOutlineStore.getState()

      // Ctrl+Z — undo (not in inputs)
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          store.undo()
          return
        }
      }

      // Ctrl+K — toggle command palette
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        store.setCommandPaletteOpen(!store.commandPaletteOpen)
        return
      }

      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (store.editingId) return

      const id = store.focusedId

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          if (e.altKey && id) store.moveItem(id, 'down')
          else store.moveFocus('down')
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          if (e.altKey && id) store.moveItem(id, 'up')
          else store.moveFocus('up')
          break
        case ' ':
          e.preventDefault()
          if (id) store.toggleCollapse(id)
          break
        case 'Enter':
          e.preventDefault()
          if (id) {
            if (e.shiftKey) store.createChild(id)
            else store.createSibling(id)
          }
          break
        case 'F2':
          e.preventDefault()
          if (id) store.startEditing(id)
          break
        case 'e': {
          const now = Date.now()
          if (now - lastEPressRef.current < 400) {
            e.preventDefault()
            lastEPressRef.current = 0
            if (id) store.startEditing(id)
          } else {
            lastEPressRef.current = now
          }
          break
        }
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          if (id) store.deleteItem(id)
          break
        case 'Tab':
          e.preventDefault()
          if (id) {
            if (e.shiftKey) store.outdentItem(id)
            else store.indentItem(id)
          }
          break
        case 'x':
          e.preventDefault()
          if (id) store.toggleDone(id)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedId, editingId, commandPaletteOpen])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <TopBar />
      <OutlineTree />
      <BottomBar />
      <CommandPalette />
    </div>
  )
}
