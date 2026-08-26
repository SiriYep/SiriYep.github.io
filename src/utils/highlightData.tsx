import React from 'react'

/**
 * Syntax-highlight data points in prose text (rainbow code-like coloring).
 *
 * Patterns highlighted:
 *  - Numbers/versions with optional units → `num` color (gold)
 *  - ALL-CAPS acronyms (2+ chars)        → `kw`  color (blue)
 *  - Quoted strings ("…" / '…')          → `str` color (green)
 */
export function highlightData(
  text: string,
  c: { num: string; kw: string; str: string },
): React.ReactNode {
  if (!text) return null

  // numbers (incl. dotted v-prefixed versions, decimals, %, x, +) | quoted strings | technical acronyms.
  // Mixed-case suffixes keep method names such as AC-DiT together.
  const rx =
    /(\b[vV]\d+(?:\.\d+)+\b|\b\d+(?:[.,]\d+)*\s*(?:%|x|\+|K|M|k|GB|MB|TB|ms|s|px)?\b)|("[^"]+"|'[^']+')|(\b[A-Z][A-Z0-9_]{1,}(?:[-/][A-Za-z0-9]+)*\b)/g

  const parts: React.ReactNode[] = []
  let last = 0
  let key = 0
  let m: RegExpExecArray | null

  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))

    const color = m[1] ? c.num : m[2] ? c.str : c.kw
    const fw = m[1] ? 600 : 500
    parts.push(
      <span key={key++} style={{ color, fontWeight: fw }}>
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

/**
 * Highlight a small, curated set of semantic phrases in resume prose.
 *
 * Terms are exact, case-sensitive matches ordered by importance. Only the
 * first occurrence of each term is considered, and the highest-priority
 * non-overlapping terms are rendered when the limit is reached.
 */
export function highlightSemanticTerms(
  text: string,
  terms: readonly string[],
  color: string,
  maxTerms = 2,
): React.ReactNode {
  if (!text || terms.length === 0 || maxTerms <= 0) return text

  const matches: { start: number; end: number }[] = []
  const seen = new Set<string>()

  for (const rawTerm of terms) {
    const term = rawTerm.trim()
    if (!term || seen.has(term)) continue
    seen.add(term)

    let start = text.indexOf(term)
    while (
      start !== -1
      && matches.some(match => start < match.end && start + term.length > match.start)
    ) {
      start = text.indexOf(term, start + 1)
    }

    if (start !== -1) {
      matches.push({ start, end: start + term.length })
      if (matches.length === maxTerms) break
    }
  }

  if (matches.length === 0) return text
  matches.sort((a, b) => a.start - b.start)

  const parts: React.ReactNode[] = []
  let last = 0
  matches.forEach((match, index) => {
    if (match.start > last) parts.push(text.slice(last, match.start))
    parts.push(
      <span key={index} style={{ color, fontWeight: 500 }}>
        {text.slice(match.start, match.end)}
      </span>,
    )
    last = match.end
  })
  if (last < text.length) parts.push(text.slice(last))

  return <>{parts}</>
}
