import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useEventListener } from '@react-hooks-library/core'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { CommandPalette } from './components/CommandPalette'
import { handleGlobalShortcuts, handleOutlineKeys } from './lib/keyboard'

export const App = observer(function App() {
  const lastEPressRef = useRef(0)

  useEventListener('keydown', (e) => {
    if (handleGlobalShortcuts(e)) return
    handleOutlineKeys(e, lastEPressRef)
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
