import type { SavedState, SortBy, StatusFilter } from './types'

const STATE_KEY = 'xmasState'
const VISITED_KEY = 'xmasVisited'

function loadJSON<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') as T | null
  } catch {
    return null
  }
}

const SORT_VALUES: SortBy[] = ['rank', 'alpha', 'region']
const FILTER_VALUES: StatusFilter[] = ['all', 'todo', 'visited']

/** Restore persisted filter state, ignoring anything unrecognised. */
export function loadState(): SavedState {
  const saved = loadJSON<Partial<SavedState>>(STATE_KEY) ?? {}
  return {
    sortBy: SORT_VALUES.includes(saved.sortBy as SortBy) ? (saved.sortBy as SortBy) : 'rank',
    statusFilter: FILTER_VALUES.includes(saved.statusFilter as StatusFilter)
      ? (saved.statusFilter as StatusFilter)
      : 'all',
  }
}

export function saveState(state: SavedState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private mode / quota) — filtering still works in-memory.
  }
}

export function loadVisited(): Set<string> {
  const saved = loadJSON<unknown>(VISITED_KEY)
  return new Set(Array.isArray(saved) ? saved.filter((n): n is string => typeof n === 'string') : [])
}

export function saveVisited(visited: ReadonlySet<string>): void {
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]))
  } catch {
    // Ignore write failures.
  }
}