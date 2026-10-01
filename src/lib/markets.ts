import type { Market, ResolvedMarket, SortBy, StatusFilter } from './types'
import { MARKETS } from './data/markets'
import { GERM_MARKETS } from './data/germany'

export const TIER_COLORS = ['', '#fbbf24', '#34d399', '#60a5fa', '#94a3b8', '#64748b']

/** Tier number for a market: explicit `tier` if set, else derived from rank. */
export function tierOf(m: Market): { n: number; c: string } {
  if (m.tier) return { n: m.tier, c: TIER_COLORS[m.tier] }
  const rank = m.rank ?? 999
  const n = rank <= 5 ? 1 : rank <= 12 ? 2 : rank <= 19 ? 3 : rank <= 24 ? 4 : 5
  return { n, c: TIER_COLORS[n] }
}

/**
 * Merge the two datasets, dropping near-duplicate coordinates (within 0.01°)
 * in favour of the lower-tier record, then renumber ranks by tier order.
 */
export const ALL_MARKETS: ResolvedMarket[] = [...MARKETS, ...GERM_MARKETS]
  .reduce((markets, market) => {
    const duplicate = markets.findIndex(
      (candidate) =>
        Math.abs(candidate.lat - market.lat) < 0.01 && Math.abs(candidate.lng - market.lng) < 0.01,
    )
    if (duplicate === -1 || tierOf(market).n < tierOf(markets[duplicate]).n) {
      if (duplicate === -1) markets.push(market)
      else markets[duplicate] = market
    }
    return markets
  }, [] as Market[])
  .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999) || a.name.localeCompare(b.name))
  .map((market, index) => ({
    ...market,
    tier: tierOf(market).n,
    rank: index + 1,
  }))

/** Search across the text fields shown in the list and map popups. */
function matchesQuery(m: Market, query: string): boolean {
  if (!query) return true
  return [m.name, m.city, m.country, m.region, m.food, m.note]
    .join(' ')
    .toLowerCase()
    .includes(query)
}

export function filterMarkets(
  markets: ResolvedMarket[],
  visited: ReadonlySet<string>,
  statusFilter: StatusFilter,
  query: string,
): ResolvedMarket[] {
  const q = query.trim().toLowerCase()
  return markets.filter((m) => {
    const isVisited = visited.has(m.name)
    if (statusFilter === 'visited' && !isVisited) return false
    if (statusFilter === 'todo' && isVisited) return false
    return matchesQuery(m, q)
  })
}

export function sortMarkets(markets: ResolvedMarket[], sortBy: SortBy): ResolvedMarket[] {
  const sorted = [...markets]
  if (sortBy === 'alpha') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'region') {
    sorted.sort((a, b) => a.region.localeCompare(b.region) || (a.rank ?? 999) - (b.rank ?? 999))
  } else {
    sorted.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
  }
  return sorted
}

interface DateRange {
  start: { month: number; day: number }
  end: { month: number; day: number }
}

const MONTH_NUMBERS: Record<string, number> = { nov: 11, dec: 12, jan: 1 }

/**
 * Parse a human-readable date string ("27 Nov – 24 Dec 2026", "late Nov – 23 Dec
 * 2026", "3 – 27 Dec 2026") into a month/day range. Returns null when the string
 * has no recognisable month token.
 */
export function marketDates(m: Market): DateRange | null {
  const text = m.dates.toLowerCase()
  const matches = [...text.matchAll(/(?:(early|mid|late)\s+)?(\d{1,2})?\s*(nov|dec|jan)/g)]
  if (!matches.length) return null

  const endpoint = (match: RegExpMatchArray) => {
    const month = MONTH_NUMBERS[match[3]]
    const day =
      Number(match[2]) ||
      (match[1] === 'early' ? 7 : match[1] === 'mid' ? 15 : match[1] === 'late' ? 24 : 1)
    return { month, day }
  }

  const start = endpoint(matches[0])
  const end = endpoint(matches[matches.length - 1])
  if (matches.length === 1) {
    start.day = 1
    end.day = start.month === 11 ? 30 : 31
  }
  return { start, end }
}

/** Whether a market is open on a given day. Handles ranges that wrap Dec -> Jan. */
export function isMarketOpenOn(m: Market, month: number, day: number): boolean {
  const range = marketDates(m)
  if (!range) return false
  const value = month * 100 + day
  const start = range.start.month * 100 + range.start.day
  const end = range.end.month * 100 + range.end.day
  return start <= end ? value >= start && value <= end : value >= start || value <= end
}

/** Markets still to visit that are open on the given day, best rank first. */
export function marketsOpenOn(
  markets: ResolvedMarket[],
  visited: ReadonlySet<string>,
  month: number,
  day: number,
): ResolvedMarket[] {
  return markets
    .filter((m) => !visited.has(m.name) && isMarketOpenOn(m, month, day))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
}