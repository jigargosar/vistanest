import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { useOutlineStore } from './store/outline-store'

export function App() {
  const moveFocus = useOutlineStore((s) => s.moveFocus)
  const toggleCollapse = useOutlineStore((s) => s.toggleCollapse)
  const focusedId = useOutlineStore((s) => s.focusedId)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          moveFocus('down')
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          moveFocus('up')
          break
        case ' ':
          e.preventDefault()
          if (focusedId) {
            toggleCollapse(focusedId)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveFocus, toggleCollapse, focusedId])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <TopBar />
      <OutlineTree />
      <BottomBar />
    </div>
  )
}
