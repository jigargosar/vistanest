import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useEventListener } from '@react-hooks-library/core'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { CommandPalette } from './components/CommandPalette'
import { outlineStore } from './store-mobx/outline-store'

export const App = observer(function App() {
  const lastEPressRef = useRef(0)

  useEventListener('keydown', (e) => {
    // Ctrl+Z — undo (not in inputs)
    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        outlineStore.undo()
        return
      }
    }

    // Ctrl+K — toggle command palette
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      outlineStore.setCommandPaletteOpen(!outlineStore.commandPaletteOpen)
      return
    }

    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
    if (outlineStore.editingId) return

    const id = outlineStore.focusedId

    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        e.preventDefault()
        if (e.altKey && id) outlineStore.moveItem(id, 'down')
        else outlineStore.moveFocus('down')
        break
      case 'k':
      case 'ArrowUp':
        e.preventDefault()
        if (e.altKey && id) outlineStore.moveItem(id, 'up')
        else outlineStore.moveFocus('up')
        break
      case ' ':
        e.preventDefault()
        if (id) outlineStore.toggleCollapse(id)
        break
      case 'Enter':
        e.preventDefault()
        if (id) {
          if (e.shiftKey) outlineStore.createChild(id)
          else outlineStore.createSibling(id)
        }
        break
      case 'F2':
        e.preventDefault()
        if (id) outlineStore.startEditing(id)
        break
      case 'e': {
        const now = Date.now()
        if (now - lastEPressRef.current < 400) {
          e.preventDefault()
          lastEPressRef.current = 0
          if (id) outlineStore.startEditing(id)
        } else {
          lastEPressRef.current = now
        }
        break
      }
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        if (id) outlineStore.deleteItem(id)
        break
      case 'Tab':
        e.preventDefault()
        if (id) {
          if (e.shiftKey) outlineStore.outdentItem(id)
          else outlineStore.indentItem(id)
        }
        break
      case 'x':
        e.preventDefault()
        if (id) outlineStore.toggleDone(id)
        break
    }
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <TopBar />
      <OutlineTree />
      <BottomBar />
      <CommandPalette />
    </div>
  )
})
