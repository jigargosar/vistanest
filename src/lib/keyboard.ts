import { hk, sq, register } from './hotkey'
import { outlineStore as store } from '../store-mobx/outline-store'

export function setupKeyboard() {
  return register([
    hk('Mod+Z',         store.undo),
    hk('Mod+K',         store.toggleCommandPalette),

    // focusDown
    hk('J',             store.focusDown),
    hk('ArrowDown',     store.focusDown),

    // focusUp
    hk('K',             store.focusUp),
    hk('ArrowUp',       store.focusUp),

    // moveItemDown
    hk('Alt+J',         store.moveItemDown),
    hk('Alt+ArrowDown', store.moveItemDown),

    // moveItemUp
    hk('Alt+K',         store.moveItemUp),
    hk('Alt+ArrowUp',   store.moveItemUp),

    hk('Space',         store.toggleCollapse),
    hk('Enter',         store.createSibling),
    hk('Shift+Enter',   store.createChild),

    // deleteItem
    hk('Delete',        store.deleteItem),
    hk('Backspace',     store.deleteItem),

    hk('Tab',           store.indentItem),
    hk('Shift+Tab',     store.outdentItem),
    hk('X',             store.toggleDone),
    hk('H',             store.toggleHideCompleted),

    hk('F2',            store.startEditing),
    sq(['E', 'E'],      store.startEditing),
  ], { ignoreInputs: true })
}
