import { tinykeys } from 'tinykeys'
import { outlineStore as store } from '../store-mobx/outline-store'

export function setupKeyboard() {
  return tinykeys(window, {
    '$mod+z':           () => store.undo(),
    '$mod+k':           () => store.toggleCommandPalette(),
    'j':                () => store.moveFocus('down'),
    'ArrowDown':        () => store.moveFocus('down'),
    'k':                () => store.moveFocus('up'),
    'ArrowUp':          () => store.moveFocus('up'),
    'Alt+j':            () => store.moveItem('down'),
    'Alt+ArrowDown':    () => store.moveItem('down'),
    'Alt+k':            () => store.moveItem('up'),
    'Alt+ArrowUp':      () => store.moveItem('up'),
    'Space':            () => store.toggleCollapse(),
    'Enter':            () => store.createSibling(),
    'Shift+Enter':      () => store.createChild(),
    'e e':              () => store.startEditing(),
    'F2':               () => store.startEditing(),
    'Delete':           () => store.deleteItem(),
    'Backspace':        () => store.deleteItem(),
    'Tab':              () => store.indentItem(),
    'Shift+Tab':        () => store.outdentItem(),
    'x':                () => store.toggleDone(),
  }, { timeout: 1000 })
}
