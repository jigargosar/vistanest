declare module 'tinykeys' {
  export function tinykeys(
    target: Window | HTMLElement,
    keybindingMap: Record<string, (event: KeyboardEvent) => void>,
    options?: { timeout?: number },
  ): () => void
}
