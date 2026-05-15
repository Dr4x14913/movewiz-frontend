<template>
  <div class="map-container">
    <div ref="mapContainer" class="map-container__map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface AdditionalMarker {
  lat: number
  lng: number
  tooltip: string
}

const { t } = useI18n()

const props = withDefaults(defineProps<{
  lat?: number
  lng?: number
  zoom?: number
  height?: string
  displayMainMarker?: boolean
  additionalMarkers?: AdditionalMarker[]
  fitMarkers?: boolean
  is_editable?: boolean
}>(), {
  lat: 46.603354,
  lng: 1.888334,
  zoom: 6,
  height: '300px',
  displayMainMarker: false,
  is_editable: true,
})

const emit = defineEmits<{
  'location-selected': [data: { lat: number; lng: number; address: string }]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null
let additionalMarkersLayer: L.LayerGroup | null = null
let legendControl: L.Control | null = null

// Custom green icon for additional markers
const greenIcon = L.divIcon({
  className: '',
  html: '<div style="background-color:var(--color-secondary-green);width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,0.4)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

// Orange icon for main event marker
const orangeIcon = L.divIcon({
  className: '',
  html: '<div style="background-color:var(--color-primary-orange);width:20px;height:20px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,0.4)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function updateMarker(latitude: number, longitude: number) {
  if (!map) return

  if (!props.fitMarkers)
    map.setView([latitude, longitude], 13)

  if (marker) {
    marker.setLatLng([latitude, longitude])
  } else {
    marker = L.marker([latitude, longitude], { draggable: props.is_editable, icon: orangeIcon }).addTo(map)

    marker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng()
      reverseGeocode(pos.lat, pos.lng)
    })
  }
}

async function reverseGeocode(latitude: number, longitude: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    )
    const data = await res.json()
    const address = data.display_name || ''
    emit('location-selected', { lat: latitude, lng: longitude, address })
  } catch (e) {
    console.error('Error reverse geocoding:', e)
  }
}

function updateLegend() {
  if (!map) return

  if (legendControl) {
    map.removeControl(legendControl)
    legendControl = null
  }

  const hasEvent = props.displayMainMarker
  const hasParticipants = props.additionalMarkers && props.additionalMarkers.length > 0

  if (!hasEvent && !hasParticipants) return

  const content = L.DomUtil.create('div', 'map-legend')
  
  if (hasEvent) {
    const item = L.DomUtil.create('div', 'map-legend__item', content)
    const dot = L.DomUtil.create('span', 'map-legend__dot map-legend__dot--orange', item)
    item.appendChild(document.createTextNode(t('eventPage.legend.event')))
  }

  if (hasParticipants) {
    const item = L.DomUtil.create('div', 'map-legend__item', content)
    const dot = L.DomUtil.create('span', 'map-legend__dot map-legend__dot--green', item)
    item.appendChild(document.createTextNode(t('eventPage.legend.participant')))
  }

  legendControl = new L.Control({ position: 'bottomright' })
  ;(legendControl as any).onAdd = () => content
  legendControl.addTo(map)
}

function updateAdditionalMarkers() {
  if (!map) return

  if (additionalMarkersLayer) {
    additionalMarkersLayer.clearLayers()
  } else {
    additionalMarkersLayer = L.layerGroup().addTo(map)
  }

  const allPoints: L.LatLngTuple[] = []

  // Include main event marker in fit bounds
  if (props.fitMarkers && props.displayMainMarker) {
    allPoints.push([props.lat, props.lng])
  }

  if (!props.additionalMarkers || props.additionalMarkers.length === 0) {
    if (props.fitMarkers && allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds.pad(0.1))
    }
    return
  }

  const markerLayer: L.Marker[] = []
  props.additionalMarkers.forEach((m) => {
    allPoints.push([m.lat, m.lng])
    const mk = L.marker([m.lat, m.lng], { icon: greenIcon })
      .bindTooltip(m.tooltip, { direction: 'top', offset: [0, -10] })
    additionalMarkersLayer?.addLayer(mk)
    markerLayer.push(mk)
  })

  if (props.fitMarkers && allPoints.length > 0) {
    const bounds = L.latLngBounds(allPoints)
    map.whenReady(() => {
      map?.fitBounds(bounds.pad(0.1))
    })
  }
}

function onMapClick(e: L.LeafletMouseEvent) {
  if (props.is_editable) {
    const { lat: latitude, lng: longitude } = e.latlng
    reverseGeocode(latitude, longitude)
    updateMarker(latitude, longitude)
  }
}

function initializeMap() {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([props.lat, props.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  map.on('click', onMapClick)

  if (props.displayMainMarker)
    updateMarker(props.lat, props.lng)

  updateAdditionalMarkers()
  updateLegend()
}

function cleanupMap() {
  if (map) {
    if (additionalMarkersLayer) {
      additionalMarkersLayer.clearLayers()
      additionalMarkersLayer = null
    }
    if (legendControl) {
      map.removeControl(legendControl)
      legendControl = null
    }
    map.remove()
    map = null
    marker = null
  }
}

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  cleanupMap()
})

watch(props, (new_val) => {
  if (new_val.displayMainMarker)
    updateMarker(props.lat, props.lng)
  updateAdditionalMarkers()
  updateLegend()
})
</script>

<style scoped>
.map-container {
  margin-top: 1rem;
  border: 2px solid var(--color-secondary-green);
  border-radius: 16px;
  overflow: hidden;
}

.map-container__map {
  height: v-bind(height);
  width: 100%;
}
</style>

<style>
.map-legend {
  background: var(--color-bg-cream);
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--color-text-dark);
}

.map-legend__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.map-legend__item:not(:last-child) {
  margin-bottom: 0.25rem;
}

.map-legend__dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.map-legend__dot--orange {
  background-color: var(--color-primary-orange);
}

.map-legend__dot--green {
  background-color: var(--color-secondary-green);
}
</style>
