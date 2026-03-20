import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { TopBar } from './components/TopBar'
import { OutlineTree } from './components/OutlineTree'
import { BottomBar } from './components/BottomBar'
import { CommandPalette } from './components/CommandPalette'
import { setupKeyboard } from './lib/keyboard'

export const App = observer(function App() {
  useEffect(() => setupKeyboard(), [])

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-deep)' }}>
      <TopBar />
      <OutlineTree />
      <BottomBar />
      <CommandPalette />
    </div>
  )
})
