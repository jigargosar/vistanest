import { getHotkeyManager, getSequenceManager } from '@tanstack/hotkeys'
import type { Hotkey, HotkeyOptions, SequenceOptions } from '@tanstack/hotkeys'

export const hk = (key: Hotkey, fn: () => void) => ({ k: key, fn })
export const sq = (seq: Hotkey[], fn: () => void) => ({ s: seq, fn })

type Binding = ReturnType<typeof hk> | ReturnType<typeof sq>

export function register(bindings: Binding[], opts: HotkeyOptions & SequenceOptions) {
  const hkm = getHotkeyManager()
  const sqm = getSequenceManager()

  const handles = bindings.map(b =>
    'k' in b
      ? hkm.register(b.k, () => b.fn(), opts)
      : sqm.register(b.s, () => b.fn(), opts)
  )

  return () => handles.forEach(h => h.unregister())
}
