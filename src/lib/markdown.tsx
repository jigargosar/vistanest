import { type ReactNode } from 'react'

/** Parse simple markdown: ## headings, **bold**, `code`, *italic* */
export function renderMarkdown(text: string): { element: ReactNode; isHeading: boolean } {
  const h3Match = text.match(/^###\s+(.+)$/)
  const h2Match = text.match(/^##\s+(.+)$/)
  const h1Match = text.match(/^#\s+(.+)$/)

  if (h3Match) return { element: <span className="md-h3">{inlineMarkdown(h3Match[1])}</span>, isHeading: true }
  if (h2Match) return { element: <span className="md-h2">{inlineMarkdown(h2Match[1])}</span>, isHeading: true }
  if (h1Match) return { element: <span className="md-h1">{inlineMarkdown(h1Match[1])}</span>, isHeading: true }

  return { element: inlineMarkdown(text), isHeading: false }
}

/** Parse inline markdown: **bold**, *italic*, `code` */
function inlineMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/)
    if (boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1])
      parts.push(<strong key={key++}>{boldMatch[2]}</strong>)
      remaining = boldMatch[3]
      continue
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)$/)
    if (italicMatch) {
      if (italicMatch[1]) parts.push(italicMatch[1])
      parts.push(<em key={key++}>{italicMatch[2]}</em>)
      remaining = italicMatch[3]
      continue
    }

    // Code: `text`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/)
    if (codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1])
      parts.push(<code key={key++} className="md-code">{codeMatch[2]}</code>)
      remaining = codeMatch[3]
      continue
    }

    // No more matches
    parts.push(remaining)
    break
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}
