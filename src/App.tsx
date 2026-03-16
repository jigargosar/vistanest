import { observer } from 'mobx-react-lite'
import { useEventListener } from '@react-hooks-library/core'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { CommandPalette } from './components/CommandPalette'
import { createKeyHandler } from './lib/keyboard'

const handleKeyDown = createKeyHandler()

export const App = observer(function App() {
  useEventListener('keydown', handleKeyDown)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep)' }}>
      <TopBar />
      <OutlineTree />
      <BottomBar />
      <CommandPalette />
    </div>
  )
})
