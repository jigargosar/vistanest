import { makeAutoObservable } from 'mobx'

// === Types ===

export interface ThemeColors {
  '--bg-deep': string
  '--bg-surface': string
  '--bg-raised': string
  '--bg-hover': string
  '--bg-focus': string

  '--border-subtle': string
  '--border-dim': string

  '--text-primary': string
  '--text-secondary': string
  '--text-tertiary': string
  '--text-ghost': string

  '--accent': string
  '--accent-dim': string
  '--accent-glow': string
  '--accent-border': string

  '--done-text': string
  '--done-line': string

  '--kbd-bg': string
  '--kbd-border': string
  '--kbd-text': string

  '--red-soft': string
  '--green-soft': string
  '--yellow-soft': string
}

export interface ThemeDef {
  name: string
  label: string
  colors: ThemeColors
  swatch: string
}

// === Theme Definitions ===

const midnight: ThemeDef = {
  name: 'midnight', label: 'Midnight', swatch: '#0c0c0e',
  colors: { '--bg-deep': '#0c0c0e', '--bg-surface': '#111114', '--bg-raised': '#18181c', '--bg-hover': '#1e1e24', '--bg-focus': '#1a1d26', '--border-subtle': '#222228', '--border-dim': '#2a2a32', '--text-primary': '#d8d8de', '--text-secondary': '#8888a0', '--text-tertiary': '#555568', '--text-ghost': '#3a3a4a', '--accent': '#5b8af0', '--accent-dim': '#3a5ca0', '--accent-glow': 'rgba(91, 138, 240, 0.08)', '--accent-border': 'rgba(91, 138, 240, 0.18)', '--done-text': '#4a4a5a', '--done-line': '#3a3a48', '--kbd-bg': '#1a1a22', '--kbd-border': '#2e2e3a', '--kbd-text': '#6a6a80', '--red-soft': '#c0544f', '--green-soft': '#5a9e6f', '--yellow-soft': '#b89840' },
}

const charcoal: ThemeDef = {
  name: 'charcoal', label: 'Charcoal', swatch: '#1a1816',
  colors: { '--bg-deep': '#1a1816', '--bg-surface': '#201e1b', '--bg-raised': '#282522', '--bg-hover': '#302c28', '--bg-focus': '#2a2620', '--border-subtle': '#332f2a', '--border-dim': '#3d3832', '--text-primary': '#ddd8d0', '--text-secondary': '#9e9688', '--text-tertiary': '#6b6358', '--text-ghost': '#4a4338', '--accent': '#d4935a', '--accent-dim': '#a06830', '--accent-glow': 'rgba(212, 147, 90, 0.08)', '--accent-border': 'rgba(212, 147, 90, 0.2)', '--done-text': '#564e44', '--done-line': '#443d34', '--kbd-bg': '#242120', '--kbd-border': '#3a3530', '--kbd-text': '#78706a', '--red-soft': '#c0544f', '--green-soft': '#5a9e6f', '--yellow-soft': '#b89840' },
}

const slate: ThemeDef = {
  name: 'slate', label: 'Slate', swatch: '#141618',
  colors: { '--bg-deep': '#141618', '--bg-surface': '#191b1e', '--bg-raised': '#1f2225', '--bg-hover': '#262a2e', '--bg-focus': '#1e2328', '--border-subtle': '#282c30', '--border-dim': '#32373c', '--text-primary': '#d4d8dc', '--text-secondary': '#868e96', '--text-tertiary': '#555d66', '--text-ghost': '#3a4048', '--accent': '#66b3e0', '--accent-dim': '#3a7aa0', '--accent-glow': 'rgba(102, 179, 224, 0.08)', '--accent-border': 'rgba(102, 179, 224, 0.18)', '--done-text': '#4a5058', '--done-line': '#383e44', '--kbd-bg': '#1c1f22', '--kbd-border': '#30353a', '--kbd-text': '#646c74', '--red-soft': '#c0544f', '--green-soft': '#5a9e6f', '--yellow-soft': '#b89840' },
}

const paper: ThemeDef = {
  name: 'paper', label: 'Paper', swatch: '#f5f0e8',
  colors: { '--bg-deep': '#f5f0e8', '--bg-surface': '#ebe6de', '--bg-raised': '#e2ddd4', '--bg-hover': '#dbd5cb', '--bg-focus': '#e8e2d8', '--border-subtle': '#d4cec4', '--border-dim': '#c8c2b8', '--text-primary': '#2c2820', '--text-secondary': '#6a6458', '--text-tertiary': '#948e82', '--text-ghost': '#b8b2a6', '--accent': '#3a72c0', '--accent-dim': '#5088d0', '--accent-glow': 'rgba(58, 114, 192, 0.06)', '--accent-border': 'rgba(58, 114, 192, 0.15)', '--done-text': '#a8a296', '--done-line': '#c0bab0', '--kbd-bg': '#e6e1d8', '--kbd-border': '#ccc6bc', '--kbd-text': '#8a8478', '--red-soft': '#b84440', '--green-soft': '#4a8a5c', '--yellow-soft': '#a08430' },
}

const phosphor: ThemeDef = {
  name: 'phosphor', label: 'Phosphor', swatch: '#0a0e16',
  colors: { '--bg-deep': '#0a0e16', '--bg-surface': '#0e1420', '--bg-raised': '#141c28', '--bg-hover': '#1a2434', '--bg-focus': '#162030', '--border-subtle': '#1e2838', '--border-dim': '#283444', '--text-primary': '#c8d4e4', '--text-secondary': '#7088a8', '--text-tertiary': '#485870', '--text-ghost': '#2e3e52', '--accent': '#40a0f0', '--accent-dim': '#2870b0', '--accent-glow': 'rgba(64, 160, 240, 0.08)', '--accent-border': 'rgba(64, 160, 240, 0.2)', '--done-text': '#3a4a5c', '--done-line': '#2e3e4e', '--kbd-bg': '#121a26', '--kbd-border': '#243040', '--kbd-text': '#506880', '--red-soft': '#c0544f', '--green-soft': '#5a9e6f', '--yellow-soft': '#b89840' },
}

export const themes: ThemeDef[] = [midnight, charcoal, slate, paper, phosphor]

// === Apply to DOM ===

function applyTheme(theme: ThemeDef) {
  const root = document.documentElement
  for (const [prop, value] of Object.entries(theme.colors)) {
    root.style.setProperty(prop, value)
  }
}

// === Store ===

applyTheme(midnight)

export const themeStore = makeAutoObservable({
  currentTheme: 'midnight',

  setTheme(name: string) {
    const theme = themes.find((t) => t.name === name)
    if (theme) {
      applyTheme(theme)
      this.currentTheme = name
    }
  },
})
