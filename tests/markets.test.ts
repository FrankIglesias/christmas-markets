import { describe, expect, it } from 'vitest'
import {
  filterMarkets,
  isMarketOpenOn,
  marketDates,
  marketsOpenOn,
  sortMarkets,
} from '../src/lib/markets'
import type { ResolvedMarket } from '../src/lib/types'

const makeMarket = (overrides: Partial<ResolvedMarket> = {}): ResolvedMarket => ({
  name: 'Test Market',
  flag: '🎄',
  country: 'Germany',
  city: 'Munich',
  lat: 48.1,
  lng: 11.5,
  region: 'Bavaria',
  dates: '27 Nov – 24 Dec 2026',
  food: 'Roasted almonds',
  note: 'Test note',
  tier: 1,
  rank: 1,
  ...overrides,
})

describe('market helpers', () => {
  it('parses ranges and handles ranges that cross December into January', () => {
    const market = makeMarket({ dates: '29 Nov – 6 Jan 2027' })

    expect(marketDates(market)).toEqual({
      start: { month: 11, day: 29 },
      end: { month: 1, day: 6 },
    })
    expect(isMarketOpenOn(market, 12, 25)).toBe(true)
    expect(isMarketOpenOn(market, 1, 6)).toBe(true)
    expect(isMarketOpenOn(market, 1, 7)).toBe(false)
  })

  it('filters by query and visited status without mutating the input', () => {
    const markets = [
      makeMarket({ name: 'Munich Market', rank: 1 }),
      makeMarket({ name: 'Cologne Market', city: 'Cologne', rank: 2 }),
    ]
    const visited = new Set(['Munich Market'])

    expect(filterMarkets(markets, visited, 'todo', 'cologne').map((m) => m.name)).toEqual([
      'Cologne Market',
    ])
    expect(markets.map((m) => m.name)).toEqual(['Munich Market', 'Cologne Market'])
  })

  it('sorts by alpha and region while preserving the source array', () => {
    const markets = [
      makeMarket({ name: 'Zulu', region: 'Bavaria', rank: 2 }),
      makeMarket({ name: 'Alpha', region: 'Saxony', rank: 1 }),
    ]

    expect(sortMarkets(markets, 'alpha').map((m) => m.name)).toEqual(['Alpha', 'Zulu'])
    expect(sortMarkets(markets, 'region').map((m) => m.name)).toEqual(['Zulu', 'Alpha'])
    expect(markets.map((m) => m.name)).toEqual(['Zulu', 'Alpha'])
  })

  it('returns unvisited markets open on a date in rank order', () => {
    const markets = [
      makeMarket({ name: 'Later', rank: 3, dates: '1 Dec – 24 Dec 2026' }),
      makeMarket({ name: 'First', rank: 1, dates: '1 Dec – 24 Dec 2026' }),
      makeMarket({ name: 'Closed', rank: 2, dates: '1 Nov – 20 Nov 2026' }),
    ]

    expect(marketsOpenOn(markets, new Set(['Later']), 12, 10).map((m) => m.name)).toEqual([
      'First',
    ])
  })
})

