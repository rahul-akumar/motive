import type { Ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import type { FleetVehicle, JammingEvent } from '@motive/shared'
import type { MMapControlsLayer } from '@motive/ui'
import { destinationPoint } from '~/composables/useSearchZoneGeometry'
import { isDarkTheme, useThemeObserver } from '~/composables/useTheme'
import {
  STATUS_COLORS,
  SEARCH_ZONE_STYLES,
  INCIDENT_HEX,
  speedToColor,
  createVehicleStatusIcon,
  createJammedIcon,
  createArrowIcon,
  createIncidentIcon,
  createContainedBadgeIcon,
} from '~/components/vehicle/vehicleMapMarkers'

/** Reactive security/vehicle inputs the live map renders from. */
export interface VehicleLiveMapInput {
  vehicle: Ref<FleetVehicle>
  isJammed: Ref<boolean>
  jammingEvent: Ref<JammingEvent | null>
  isZoneFrozen: Ref<boolean>
  searchRadiusMeters: Ref<number>
  sectorPoints: Ref<[number, number][]>
}

const INCIDENT_LABELS: Record<string, string> = {
  jamming: 'Jamming',
  'theft-attempt': 'Theft attempt',
  'unauthorized-movement': 'Unauthorized movement',
}

/**
 * Owns the Leaflet map for the vehicle live view: base tile layer (re-skinned
 * on theme change), the vehicle marker, and — when the vehicle is jammed — the
 * search zone, heading arrow, prior-incident markers, route trail, and the
 * signal/incident popovers (anchored to virtual DOM elements that track the
 * map). Returns the template-facing refs, the incident layer toggle state, and
 * the popover state/handlers.
 */
export function useVehicleLiveMap(input: VehicleLiveMapInput) {
  const { vehicle, isJammed, jammingEvent, isZoneFrozen, searchRadiusMeters, sectorPoints } = input

  const mapContainer = ref<HTMLElement | null>(null)
  let map: L.Map | null = null
  let marker: L.Marker | null = null
  let searchCircle: L.Circle | null = null
  let sectorPolygon: L.Polygon | null = null
  let headingLine: L.Polyline | null = null
  let headingArrow: L.Marker | null = null
  const incidentMarkers: Array<{ marker: L.Marker; type: string }> = []
  let lockBadge: L.Marker | null = null
  let routeSegments: L.Polyline[] = []

  const popoverOpen = ref(false)
  const popoverAnchorEl = ref<HTMLElement | null>(null)
  const popoverCompRef = ref<{ reposition: () => void } | null>(null)

  const incidentPopoverOpen = ref(false)
  const incidentPopoverAnchorEl = ref<HTMLElement | null>(null)
  const incidentPopoverRef = ref<{ reposition: () => void } | null>(null)
  const activeIncident = ref<{ type: string; date: Date } | null>(null)

  function getTileUrl(): string {
    return isDarkTheme()
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  }

  // Re-skin map tiles when the theme changes
  useThemeObserver(() => {
    if (!map) return
    map.eachLayer((layer) => {
      if ((layer as L.TileLayer).setUrl) {
        ;(layer as L.TileLayer).setUrl(getTileUrl())
      }
    })
  })

  function createVirtualAnchor(): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;'
    mapContainer.value!.appendChild(el)
    return el
  }

  function syncAnchorToMarker() {
    if (!map || !marker || !popoverAnchorEl.value) return
    const point = map.latLngToContainerPoint(marker.getLatLng())
    popoverAnchorEl.value.style.left = `${point.x}px`
    popoverAnchorEl.value.style.top = `${point.y}px`
  }

  function handleMarkIncident() {
    popoverOpen.value = false
  }

  function handleBroadcastIncident() {
    popoverOpen.value = false
  }

  function handleNotifyOnline() {
    popoverOpen.value = false
  }

  function handleRemobilize() {
    popoverOpen.value = false
  }

  function handleInformAuthorities() {
    popoverOpen.value = false
  }

  const incidentLayers: MMapControlsLayer[] = [
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      children: [
        {
          id: 'incidents:jamming',
          label: 'Jamming',
          icon: AlertTriangle,
          color: 'var(--mtv-color-status-warning)',
        },
        { id: 'incidents:theft', label: 'Theft', icon: AlertTriangle, color: '#f26040' },
        {
          id: 'incidents:unauthorized',
          label: 'Unauthorized',
          icon: AlertTriangle,
          color: 'var(--mtv-color-status-critical)',
        },
      ],
    },
  ]

  const LAYER_TO_TYPE: Record<string, string> = {
    'incidents:jamming': 'jamming',
    'incidents:theft': 'theft-attempt',
    'incidents:unauthorized': 'unauthorized-movement',
  }

  const activeLayerIds = ref<Set<string>>(
    new Set(['incidents:jamming', 'incidents:theft', 'incidents:unauthorized']),
  )

  function handleToggleLayer(id: string) {
    const next = new Set(activeLayerIds.value)
    if (id === 'incidents') {
      const childIds = incidentLayers[0]?.children?.map((c) => c.id) ?? []
      const allActive = childIds.every((cid) => next.has(cid))
      if (allActive) {
        childIds.forEach((cid) => next.delete(cid))
      } else {
        childIds.forEach((cid) => next.add(cid))
      }
    } else if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    activeLayerIds.value = next
    syncIncidentVisibility()
  }

  function isIncidentVisible(type: string): boolean {
    for (const [layerId, incType] of Object.entries(LAYER_TO_TYPE)) {
      if (incType === type) return activeLayerIds.value.has(layerId)
    }
    return true
  }

  function syncIncidentVisibility() {
    if (!map) return
    incidentMarkers.forEach(({ marker: m, type }) => {
      const el = m.getElement()
      if (el) el.style.display = isIncidentVisible(type) ? '' : 'none'
    })
  }

  function openIncidentPopover(markerEl: L.Marker, inc: { type: string; date: Date }) {
    if (!map) return
    if (!incidentPopoverAnchorEl.value) {
      incidentPopoverAnchorEl.value = createVirtualAnchor()
    }
    const point = map.latLngToContainerPoint(markerEl.getLatLng())
    incidentPopoverAnchorEl.value!.style.left = `${point.x}px`
    incidentPopoverAnchorEl.value!.style.top = `${point.y}px`
    activeIncident.value = inc
    incidentPopoverOpen.value = true
  }

  async function initMap() {
    if (!mapContainer.value) return

    const L = await import('leaflet')
    await import('leaflet/dist/leaflet.css')

    const center = isJammed.value
      ? jammingEvent.value!.lastKnownLocation
      : vehicle.value.currentLocation
    const { lat, lng } = center

    map = L.map(mapContainer.value, {
      center: [lat, lng],
      zoom: isJammed.value ? 12 : 13,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer(getTileUrl(), {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map)

    if (isJammed.value) {
      initJammingLayers(L)
    } else {
      initNormalMarker(L)
    }

    map.on('move', () => {
      if (popoverOpen.value) {
        syncAnchorToMarker()
        popoverCompRef.value?.reposition()
      }
      if (incidentPopoverOpen.value && incidentPopoverAnchorEl.value) {
        incidentPopoverRef.value?.reposition()
      }
    })

    map.on('zoomstart', () => {
      popoverOpen.value = false
      incidentPopoverOpen.value = false
    })
  }

  function initNormalMarker(L: typeof import('leaflet')) {
    const { lat, lng } = vehicle.value.currentLocation
    const color = STATUS_COLORS[vehicle.value.status]
    const icon = createVehicleStatusIcon(L, color)
    marker = L.marker([lat, lng], { icon }).addTo(map!)
  }

  function initJammingLayers(L: typeof import('leaflet')) {
    const event = jammingEvent.value!
    const { lat, lng } = event.lastKnownLocation
    const style = isZoneFrozen.value ? SEARCH_ZONE_STYLES.frozen : SEARCH_ZONE_STYLES.active

    // Outer probability circle
    searchCircle = L.circle([lat, lng], {
      radius: searchRadiusMeters.value,
      color: style.circleColor,
      fillColor: style.circleFill,
      fillOpacity: 1,
      weight: style.circleWeight,
      dashArray: style.circleDash,
    }).addTo(map!)

    // Directional sector polygon
    sectorPolygon = L.polygon(sectorPoints.value as L.LatLngExpression[], {
      color: style.sectorColor,
      fillColor: style.sectorFill,
      fillOpacity: 1,
      weight: 1,
    }).addTo(map!)

    // Heading arrow line
    const arrowEnd = destinationPoint(lat, lng, event.lastKnownHeading, 400)
    headingLine = L.polyline(
      [
        [lat, lng],
        [arrowEnd.lat, arrowEnd.lng],
      ],
      {
        color: '#fbbf24',
        weight: 3,
        opacity: 0.8,
      },
    ).addTo(map!)

    // Arrow tip marker
    headingArrow = L.marker([arrowEnd.lat, arrowEnd.lng], {
      icon: createArrowIcon(L, event.lastKnownHeading),
    }).addTo(map!)

    // Last known location marker (red pulsing)
    marker = L.marker([lat, lng], { icon: createJammedIcon(L) }).addTo(map!)
    marker.on('click', () => {
      if (!popoverAnchorEl.value) {
        popoverAnchorEl.value = createVirtualAnchor()
      }
      syncAnchorToMarker()
      popoverOpen.value = true
    })

    // Prior incident markers
    event.priorIncidents.forEach((inc) => {
      const hex = INCIDENT_HEX[inc.type] ?? '#fbbf24'
      const m = L.marker([inc.location.lat, inc.location.lng], {
        icon: createIncidentIcon(L, hex),
      }).addTo(map!)
      m.on('mouseover', () => openIncidentPopover(m, inc))
      m.on('mouseout', () => {
        incidentPopoverOpen.value = false
      })
      incidentMarkers.push({ marker: m, type: inc.type })
    })

    // Route trail — speed-colored segments
    if (event.routeTrail && event.routeTrail.length > 1) {
      const trail = event.routeTrail
      for (let i = 0; i < trail.length - 1; i++) {
        const a = trail[i]!
        const b = trail[i + 1]!
        const speed = a.speed ?? 0
        const seg = L.polyline(
          [
            [a.lat, a.lng],
            [b.lat, b.lng],
          ],
          {
            color: speedToColor(speed),
            weight: 3,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          },
        ).addTo(map!)
        routeSegments.push(seg)
      }
    }

    if (isZoneFrozen.value) {
      addLockBadge(L, event)
    }
  }

  function addLockBadge(L: typeof import('leaflet'), event: JammingEvent) {
    if (lockBadge) return
    const badgePos = destinationPoint(
      event.lastKnownLocation.lat,
      event.lastKnownLocation.lng,
      0,
      searchRadiusMeters.value,
    )
    lockBadge = L.marker([badgePos.lat, badgePos.lng], {
      icon: createContainedBadgeIcon(L),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map!)
  }

  // Update layers each second as radius grows
  watch(searchRadiusMeters, (radius) => {
    if (!isJammed.value || !map) return
    const event = jammingEvent.value!
    if (searchCircle) searchCircle.setRadius(radius)
    if (sectorPolygon) sectorPolygon.setLatLngs(sectorPoints.value as L.LatLngExpression[])

    // Update heading arrow to grow slightly with radius
    const arrowDist = Math.min(radius * 0.15, 800)
    const arrowEnd = destinationPoint(
      event.lastKnownLocation.lat,
      event.lastKnownLocation.lng,
      event.lastKnownHeading,
      arrowDist,
    )
    if (headingLine) {
      headingLine.setLatLngs([
        [event.lastKnownLocation.lat, event.lastKnownLocation.lng],
        [arrowEnd.lat, arrowEnd.lng],
      ])
    }
    if (headingArrow) headingArrow.setLatLng([arrowEnd.lat, arrowEnd.lng])
  })

  watch(isZoneFrozen, async (frozen) => {
    if (!frozen || !map) return
    const style = SEARCH_ZONE_STYLES.frozen
    if (searchCircle) {
      searchCircle.setStyle({
        color: style.circleColor,
        fillColor: style.circleFill,
        weight: style.circleWeight,
        dashArray: style.circleDash,
      })
    }
    if (sectorPolygon) {
      sectorPolygon.setStyle({
        color: style.sectorColor,
        fillColor: style.sectorFill,
      })
    }
    const L = await import('leaflet')
    addLockBadge(L, jammingEvent.value!)
  })

  onMounted(initMap)

  onUnmounted(() => {
    routeSegments.forEach((s) => s.remove())
    routeSegments = []
    if (lockBadge) {
      lockBadge.remove()
      lockBadge = null
    }
    if (popoverAnchorEl.value) {
      popoverAnchorEl.value.remove()
      popoverAnchorEl.value = null
    }
    if (incidentPopoverAnchorEl.value) {
      incidentPopoverAnchorEl.value.remove()
      incidentPopoverAnchorEl.value = null
    }
    if (map) {
      map.remove()
      map = null
    }
  })

  return {
    mapContainer,
    zoomIn: () => map?.zoomIn(),
    zoomOut: () => map?.zoomOut(),
    incidentLayers,
    activeLayerIds,
    handleToggleLayer,
    INCIDENT_LABELS,
    popoverOpen,
    popoverAnchorEl,
    popoverCompRef,
    incidentPopoverOpen,
    incidentPopoverAnchorEl,
    incidentPopoverRef,
    activeIncident,
    handleMarkIncident,
    handleBroadcastIncident,
    handleNotifyOnline,
    handleRemobilize,
    handleInformAuthorities,
  }
}
