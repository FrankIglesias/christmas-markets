<script lang="ts">
  import type { ResolvedMarket } from '../types'

  interface Props {
    day: { month: number; day: number; markets: ResolvedMarket[] }
    onClose: () => void
    onSelectMarket: (market: ResolvedMarket) => void
  }

  let { day, onClose, onSelectMarket }: Props = $props()

  const MONTH_NAMES: Record<number, string> = {
    11: 'November',
    12: 'December',
    1: 'January',
  }

  const title = $derived(
    `${MONTH_NAMES[day.month] ?? day.month} ${day.day} · ${day.markets.length} markets`,
  )

  // The first market is already shown on the calendar cell itself.
  const additional = $derived(day.markets.slice(1))

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose()
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="calendar-modal"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose()
  }}
  role="presentation"
>
  <div class="calendar-modal-card" role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title">
    <div class="calendar-modal-header">
      <h3 id="calendar-modal-title">{title}</h3>
      <button class="calendar-modal-close" aria-label="Close" onclick={onClose}>&times;</button>
    </div>

    <div id="calendar-modal-list">
      {#each additional as m (m.name)}
        <div
          class="calendar-modal-market"
          role="button"
          tabindex="0"
          onclick={() => onSelectMarket(m)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectMarket(m)
            }
          }}
        >
          {m.flag} {m.name}
          <small>{m.city}, {m.country} · {m.dates}</small>
        </div>
      {:else}
        <div class="market-meta">No additional markets</div>
      {/each}
    </div>
  </div>
</div>