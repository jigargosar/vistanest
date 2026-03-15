import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { useOutlineStore } from './store/outline-store'

export function App() {
  const moveFocus = useOutlineStore((s) => s.moveFocus)
  const toggleCollapse = useOutlineStore((s) => s.toggleCollapse)
  const toggleDone = useOutlineStore((s) => s.toggleDone)
  const focusedId = useOutlineStore((s) => s.focusedId)
  const editingId = useOutlineStore((s) => s.editingId)
  const startEditing = useOutlineStore((s) => s.startEditing)
  const createSibling = useOutlineStore((s) => s.createSibling)
  const createChild = useOutlineStore((s) => s.createChild)
  const deleteItem = useOutlineStore((s) => s.deleteItem)
  const indentItem = useOutlineStore((s) => s.indentItem)
  const outdentItem = useOutlineStore((s) => s.outdentItem)
  const moveItem = useOutlineStore((s) => s.moveItem)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      // When editing, only handle Escape (cancel is handled in the input's onKeyDown)
      // Enter in editing mode is also handled in the input's onKeyDown
      if (isInInput) {
        return
      }

      // When NOT editing — global shortcuts
      if (editingId) return

      switch (e.key) {
        case 'j':
        case 'ArrowDown': {
          if (e.altKey && focusedId) {
            e.preventDefault()
            moveItem(focusedId, 'down')
          } else {
            e.preventDefault()
            moveFocus('down')
          }
          break
        }
        case 'k':
        case 'ArrowUp': {
          if (e.altKey && focusedId) {
            e.preventDefault()
            moveItem(focusedId, 'up')
          } else {
            e.preventDefault()
            moveFocus('up')
          }
          break
        }
        case ' ':
          e.preventDefault()
          if (focusedId) {
            toggleCollapse(focusedId)
          }
          break
        case 'Enter':
          e.preventDefault()
          if (focusedId) {
            if (e.shiftKey) {
              createChild(focusedId)
            } else {
              createSibling(focusedId)
            }
          }
          break
        case 'F2':
          e.preventDefault()
          if (focusedId) {
            startEditing(focusedId)
          }
          break
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          if (focusedId) {
            deleteItem(focusedId)
          }
          break
        case 'Tab':
          e.preventDefault()
          if (focusedId) {
            if (e.shiftKey) {
              outdentItem(focusedId)
            } else {
              indentItem(focusedId)
            }
          }
          break
        case 'x':
          e.preventDefault()
          if (focusedId) {
            toggleDone(focusedId)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    moveFocus,
    toggleCollapse,
    toggleDone,
    focusedId,
    editingId,
    startEditing,
    createSibling,
    createChild,
    deleteItem,
    indentItem,
    outdentItem,
    moveItem,
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <TopBar />
      <OutlineTree />
      <BottomBar />
    </div>
  )
}
