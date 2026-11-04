import { beforeEach, describe, expect, it } from 'vitest'
import { loadState, loadVisited, saveState, saveVisited } from '../src/lib/storage'

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads safe defaults when no state has been saved', () => {
    expect(loadState()).toEqual({ sortBy: 'rank', statusFilter: 'all' })
    expect(loadVisited()).toEqual(new Set())
  })

  it('round-trips valid state and visited markets', () => {
    saveState({ sortBy: 'region', statusFilter: 'visited' })
    saveVisited(new Set(['Nuremberg', 'Vienna']))

    expect(loadState()).toEqual({ sortBy: 'region', statusFilter: 'visited' })
    expect(loadVisited()).toEqual(new Set(['Nuremberg', 'Vienna']))
  })

  it('ignores malformed or unsupported persisted values', () => {
    localStorage.setItem('xmasState', JSON.stringify({ sortBy: 'bad', statusFilter: 'bad' }))
    localStorage.setItem('xmasVisited', JSON.stringify(['valid', 42, null]))

    expect(loadState()).toEqual({ sortBy: 'rank', statusFilter: 'all' })
    expect(loadVisited()).toEqual(new Set(['valid']))
  })
})
