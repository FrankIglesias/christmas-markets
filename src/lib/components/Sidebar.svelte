<script lang="ts">
  import type { ResolvedMarket, SortBy, StatusFilter } from '../types'
  import { tierOf } from '../markets'

  interface Props {
    markets: ResolvedMarket[]
    total: number
    query: string
    statusFilter: StatusFilter
    sortBy: SortBy
    visited: ReadonlySet<string>
    /** Visited count across the full dataset, not just the filtered list. */
    visitedCount: number
    onQueryChange: (query: string) => void
    onFilterChange: (filter: StatusFilter) => void
    onSortChange: (sort: SortBy) => void
    onSelect: (market: ResolvedMarket) => void
  }

  let {
    markets,
    total,
    query,
    statusFilter,
    sortBy,
    visited,
    visitedCount,
    onQueryChange,
    onFilterChange,
    onSortChange,
    onSelect,
  }: Props = $props()

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To visit' },
    { value: 'visited', label: 'Visited' },
  ]
</script>

<aside id="sidebar">
  <input
    type="text"
    placeholder="🔍  Search markets, countries, treats..."
    value={query}
    oninput={(e) => onQueryChange(e.currentTarget.value)}
  />

  <div class="filters">
    {#each FILTERS as filter (filter.value)}
      <button
        data-f={filter.value}
        class:active={statusFilter === filter.value}
        onclick={() => onFilterChange(filter.value)}
      >
        {filter.label}
      </button>
    {/each}
  </div>

  <div class="progress">
    <span id="prog">{visitedCount} / {total} visited</span>
    <div class="bar">
      <div id="bar" style="width:{total > 0 ? Math.round((visitedCount / total) * 100) : 0}%"></div>
    </div>
  </div>

  <div class="sort-row">
    <select
      id="sort"
      value={sortBy}
      onchange={(e) => onSortChange(e.currentTarget.value as SortBy)}
    >
      <option value="rank">Sort by rank (#)</option>
      <option value="alpha">Sort A–Z</option>
      <option value="region">Sort by region</option>
    </select>
  </div>

  <div class="count">{markets.length} of {total} markets shown</div>

  <div id="list">
    {#each markets as m (m.name)}
      {@const tier = tierOf(m)}
      {@const isVisited = visited.has(m.name)}
      <div
        class="market"
        class:visited={isVisited}
        role="button"
        tabindex="0"
        onclick={() => onSelect(m)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(m)
          }
        }}
      >
        <div class="name-row">
          <span class="rank-badge t{tier.n}">#{m.rank}</span>
          <div class="name">
            <span class="flag">{m.flag}</span>
            {m.name}{#if isVisited}<span class="v-tag">✓ visited</span>{/if}
          </div>
        </div>
        <div class="sub">
          {m.city}, {m.country} · {m.region}{#if m.trip} · 🚆 {m.trip}{/if}
        </div>
        <div class="dates">📅 {m.dates}</div>
      </div>
    {/each}
  </div>
</aside>