<script lang="ts">
  import type { ResolvedMarket } from '../types'
  import { marketsOpenOn } from '../markets'

  interface Props {
    markets: ResolvedMarket[]
    visited: ReadonlySet<string>
    onSelectMarket: (market: ResolvedMarket) => void
    onOpenDay: (month: number, day: number, markets: ResolvedMarket[]) => void
  }

  let { markets, visited, onSelectMarket, onOpenDay }: Props = $props()

  const MONTHS = [
    { key: 'november', label: 'November', number: 11, days: 30, year: 2026 },
    { key: 'december', label: 'December', number: 12, days: 31, year: 2026 },
    { key: 'january', label: 'January', number: 1, days: 31, year: 2027 },
  ] as const

  const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  /** Monday-first offset so day 1 lands under the correct column. */
  function leadingBlanks(month: (typeof MONTHS)[number]): number {
    return (new Date(month.year, month.number - 1, 1).getDay() + 6) % 7
  }

  function openOn(month: (typeof MONTHS)[number], day: number): ResolvedMarket[] {
    return marketsOpenOn(markets, visited, month.number, day)
  }
</script>

<section id="calendar">
  <div class="calendar-title">Christmas markets · Season 2026/2027</div>

  <div class="calendar-grid">
    {#each MONTHS as month (month.key)}
      <section class="calendar-month">
        <h3>{month.label}</h3>
        <div class="calendar-days">
          {#each WEEKDAYS as day (day)}
            <div class="calendar-weekday">{day}</div>
          {/each}

          {#each Array.from({ length: leadingBlanks(month) }) as _, i (i)}
            <div></div>
          {/each}

          {#each Array.from({ length: month.days }, (_, i) => i + 1) as day (day)}
            {@const open = openOn(month, day)}
            {@const visible = open[0]}
            {@const extra = open.slice(1)}
            <div
              class="calendar-day"
              class:has-markets={open.length > 0}
              role="button"
              aria-disabled={open.length === 0}
              tabindex={open.length > 0 ? 0 : undefined}
              onclick={() => open.length > 0 && onOpenDay(month.number, day, open)}
              onkeydown={(e) => {
                if (open.length > 0 && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onOpenDay(month.number, day, open)
                }
              }}
            >
              <div class="calendar-day-number">{day}</div>
              {#if visible}
                <div
                  class="calendar-market"
                  class:visited={visited.has(visible.name)}
                  role="button"
                  tabindex="0"
                  title={visible.name}
                  onclick={(e) => {
                    e.stopPropagation()
                    onSelectMarket(visible)
                  }}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      onSelectMarket(visible)
                    }
                  }}
                >
                  {visible.flag} {visible.city}
                </div>
              {/if}
              {#if extra.length > 0}
                <div class="calendar-more">+{extra.length}</div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/each}
  </div>
</section>