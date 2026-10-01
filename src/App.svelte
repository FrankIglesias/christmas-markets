<script lang="ts">
  import MapView from './lib/components/MapView.svelte'
  import Sidebar from './lib/components/Sidebar.svelte'
  import CalendarView from './lib/components/CalendarView.svelte'
  import DayModal from './lib/components/DayModal.svelte'
  import { ALL_MARKETS, filterMarkets, sortMarkets } from './lib/markets'
  import { loadState, loadVisited, saveState, saveVisited } from './lib/storage'
  import type { ResolvedMarket, SortBy, StatusFilter, Tab } from './lib/types'

  const initial = loadState()
  const initialVisited = loadVisited()

  let query = $state('')
  let statusFilter = $state<StatusFilter>(initial.statusFilter)
  let sortBy = $state<SortBy>(initial.sortBy)
  let visited = $state<Set<string>>(initialVisited)
  let activeTab = $state<Tab>('map')

  /** Bumped to force marker rebuilds (mirrors the original rebuildMarkers call). */
  let resetToken = $state(0)
  let focusRequest = $state<{ lat: number; lng: number; zoom: number; name?: string } | null>(null)
  let dayModal = $state<{
    month: number
    day: number
    markets: ResolvedMarket[]
  } | null>(null)

  let mapView: ReturnType<typeof MapView> | undefined = $state()

  const filtered = $derived(
    sortMarkets(filterMarkets(ALL_MARKETS, visited, statusFilter, query), sortBy),
  )

  const visitedCount = $derived(ALL_MARKETS.filter((m) => visited.has(m.name)).length)

  // Persist filter state whenever it changes.
  $effect(() => {
    saveState({ sortBy, statusFilter })
  })

  function toggleVisit(market: ResolvedMarket) {
    const next = new Set(visited)
    if (next.has(market.name)) next.delete(market.name)
    else next.add(market.name)
    visited = next
    saveVisited(next)
  }

  function handleQueryChange(value: string) {
    query = value
    // The original reset the viewport on every filter/search change.
    resetToken += 1
  }

  function handleFilterChange(filter: StatusFilter) {
    statusFilter = filter
    resetToken += 1
  }

  /** Jump to a market on the map, e.g. from the list or the calendar. */
  function selectMarket(market: ResolvedMarket) {
    activeTab = 'map'
    focusRequest = { lat: market.lat, lng: market.lng, zoom: 14, name: market.name }
  }

  /** Same, but also dismisses the day modal we were launched from. */
  function selectMarketFromCalendar(market: ResolvedMarket) {
    closeDay()
    selectMarket(market)
  }

  function selectByName(name: string) {
    const market = ALL_MARKETS.find((m) => m.name === name)
    if (market) toggleVisit(market)
  }

  function openDay(month: number, day: number, markets: ResolvedMarket[]) {
    dayModal = { month, day, markets }
  }

  function closeDay() {
    dayModal = null
  }

  // The original registered the visit handler directly on the map container.
  $effect(() => {
    mapView?.registerVisitHandler(selectByName)
  })

  function switchTab(tab: Tab) {
    activeTab = tab
    if (tab === 'map') {
      // Container was hidden; Leaflet needs a nudge once visible again.
      setTimeout(() => mapView?.invalidateSize(), 0)
    }
  }
</script>

<header>
  <div class="tree">🎄</div>
  <div>
    <h1>Europe's Best Christmas Markets</h1>
    <p>
      Open-source map (Leaflet + Esri dark canvas WITH city labels, no API key) · 90 Europe markets +
      17 Southern Germany, Season 2026/2027
    </p>
  </div>
</header>

<div class="app-tabs">
  <button class:active={activeTab === 'map'} onclick={() => switchTab('map')}>Map</button>
  <button class:active={activeTab === 'calendar'} onclick={() => switchTab('calendar')}>
    Calendar
  </button>
</div>

{#if dayModal}
  <DayModal day={dayModal} onClose={closeDay} onSelectMarket={selectMarketFromCalendar} />
{/if}

<main>
  {#if activeTab === 'map'}
    <Sidebar
      markets={filtered}
      total={ALL_MARKETS.length}
      {query}
      {statusFilter}
      {sortBy}
      {visited}
      {visitedCount}
      onQueryChange={handleQueryChange}
      onFilterChange={handleFilterChange}
      onSortChange={(value) => (sortBy = value)}
      onSelect={selectMarket}
    />
    <MapView
      bind:this={mapView}
      markets={filtered}
      {visited}
      {resetToken}
      {focusRequest}
    />
  {:else}
    <CalendarView
      markets={ALL_MARKETS}
      {visited}
      onSelectMarket={selectMarketFromCalendar}
      onOpenDay={openDay}
    />
  {/if}
</main>