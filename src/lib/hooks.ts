/**
 * Callback ref that scrolls the element into view.
 * Pass as ref to the selected/focused item in any scrollable list.
 * React calls this when the ref attaches to a new element.
 */
export function scrollIntoViewRef(el: HTMLElement | null) {
  el?.scrollIntoView({ block: 'nearest' })
}
