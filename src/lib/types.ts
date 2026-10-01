/**
 * A single Christmas market listing.
 *
 * `rank` and `tier` are optional in the source data files: raw records may
 * carry either a hand-assigned `tier` (germany.ts) or a `rank` used to derive
 * one (markets.js). `rank` is always populated after the merge in
 * `allMarkets`.
 */
export interface Market {
  name: string;
  flag: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  region: string;
  dates: string;
  food: string;
  note: string;
  /** Journey time from Munich, present only on the southern-Germany records. */
  trip?: string;
  /** Present only on the germany.ts records. */
  tier?: number;
  /** Final 1-based position, assigned after merging + de-duplicating. */
  rank?: number;
}

/** A market resolved for display: `tier` and `rank` are guaranteed present. */
export type ResolvedMarket = Market & { tier: number; rank: number };

export type SortBy = 'rank' | 'alpha' | 'region';
export type StatusFilter = 'all' | 'todo' | 'visited';
export type Tab = 'map' | 'calendar';

/** The subset of filter state persisted to localStorage. */
export interface SavedState {
  sortBy: SortBy;
  statusFilter: StatusFilter;
}