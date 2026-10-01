<script lang="ts">
  import { onMount } from 'svelte'
  import L from 'leaflet'
  import type { Market } from '../types'
  import { tierOf } from '../markets'

  interface Props {
    /** Markets to display as markers. */
    markets: Market[]
    visited: ReadonlySet<string>
    /** Restores the viewport to the default view whenever this changes. */
    resetToken: unknown
    /** Set by the parent to fly to a market and open its popup. */
    focusRequest: { lat: number; lng: number; zoom: number; name?: string } | null
  }

  let { markets, visited, resetToken, focusRequest }: Props = $props()

  const DEFAULT_CENTER: L.LatLngExpression = [49.5, 12.5]
  const DEFAULT_ZOOM = 5

  let container: HTMLDivElement
  let map: L.Map
  let layerGroup: L.LayerGroup
  let markers: Record<string, L.Marker> = {}
  let onToggleVisit: (name: string) => void = () => {}

  onMount(() => {
    map = L.map(container).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 16,
        attribution:
          'Tiles &copy; Esri &mdash; Esri, HERE, Garmin &copy; OpenStreetMap contributors',
      },
    ).addTo(map)

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16 },
    ).addTo(map)

    layerGroup = L.layerGroup().addTo(map)

    // The popup button lives outside Svelte's DOM, so delegate from the container.
    container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null
      const button = target?.closest<HTMLElement>('.visit-btn')
      if (button?.dataset.name) onToggleVisit(button.dataset.name)
    })

    return () => {
      map.remove()
    }
  })

  function iconFor(m: Market): L.DivIcon {
    const isVisited = visited.has(m.name)
    const color = tierOf(m).c
    const inner = isVisited ? '✓' : '🎄'
    return L.divIcon({
      className: '',
      html: `<div style="width:26px;height:26px;background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">
               <span style="transform:rotate(45deg);font-size:13px;color:#0b1220;">${inner}</span>
             </div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -24],
    })
  }

  function popupFor(m: Market): string {
    const isVisited = visited.has(m.name)
    return `
      <div class="p-name">${m.flag} ${m.name}${isVisited ? ' <span class="p-done">✔</span>' : ''}</div>
      <div class="p-sub">${m.city}, ${m.country} · ${m.region} · rank #${m.rank}</div>
      ${m.trip ? `<div class="p-trip">🚆 from Munich: ${m.trip}</div>` : ''}
      <div class="p-dates">📅 ${m.dates}</div>
      <div class="p-food">🍴 ${m.food}</div>
      <button class="visit-btn" data-name="${m.name}">${isVisited ? 'Remove from visited' : 'Mark as visited'}</button>
    `
  }

  /** Rebuild every marker from scratch. Cheap enough for ~90 markets. */
  function rebuild() {
    if (!map || !layerGroup) return
    layerGroup.clearLayers()
    markers = {}
    for (const m of markets) {
      const marker = L.marker([m.lat, m.lng], { icon: iconFor(m) }).bindPopup(popupFor(m))
      marker.addTo(layerGroup)
      markers[m.name] = marker
    }
  }

  // Markers depend on the filtered list, the visited set, and filter resets.
  $effect(() => {
    void resetToken
    rebuild()
  })

  // A market selected elsewhere (list click or calendar) flies to its popup.
  $effect(() => {
    const request = focusRequest
    if (!request || !map || !layerGroup) return
    map.setView([request.lat, request.lng], request.zoom)
    if (request.name && markers[request.name]) markers[request.name].openPopup()
  })

  /** Exposed so the parent can trigger a redraw when the tab becomes visible. */
  export function invalidateSize() {
    map?.invalidateSize()
  }

  export function resetView() {
    map?.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
  }

  export function registerVisitHandler(handler: (name: string) => void) {
    onToggleVisit = handler
  }
</script>

<div bind:this={container} class="map" id="map"></div>