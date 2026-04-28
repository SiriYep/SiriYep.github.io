import { useEffect, useState } from 'react'

const CACHE_KEY = 'gh-stars-cache-v1'
const TTL_MS = 24 * 60 * 60 * 1000

type CacheEntry = { stars: number; ts: number }
type Cache = Record<string, CacheEntry>

const parseRepo = (url?: string): { owner: string; repo: string } | null => {
  if (!url) return null
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!m) return null
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') }
}

const formatStars = (n: number): string => {
  if (n >= 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const readCache = (): Cache => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}

const writeCache = (c: Cache) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)) } catch { /* quota / private mode */ }
}

const inflight = new Map<string, Promise<number | null>>()

const fetchStars = (owner: string, repo: string): Promise<number | null> => {
  const key = `${owner}/${repo}`
  const existing = inflight.get(key)
  if (existing) return existing
  const p = fetch(`https://api.github.com/repos/${owner}/${repo}`)
    .then(r => r.ok ? r.json() : null)
    .then(data => (data && typeof data.stargazers_count === 'number') ? data.stargazers_count : null)
    .catch(() => null)
    .finally(() => { inflight.delete(key) })
  inflight.set(key, p)
  return p
}

export const useGitHubStars = (url?: string): string | null => {
  const repo = parseRepo(url)
  const key = repo ? `${repo.owner}/${repo.repo}` : ''

  const [formatted, setFormatted] = useState<string | null>(() => {
    if (!key) return null
    const cached = readCache()[key]
    if (cached && Date.now() - cached.ts < TTL_MS) return formatStars(cached.stars)
    return null
  })

  useEffect(() => {
    if (!repo) return
    const cache = readCache()
    const cached = cache[key]
    if (cached && Date.now() - cached.ts < TTL_MS) return

    fetchStars(repo.owner, repo.repo).then(n => {
      if (n === null) return
      const next = readCache()
      next[key] = { stars: n, ts: Date.now() }
      writeCache(next)
      setFormatted(formatStars(n))
    })
  }, [key])

  return formatted
}
