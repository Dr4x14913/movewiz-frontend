<template>
  <div class="map-container">
    <div ref="mapContainer" class="map-container__map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = withDefaults(defineProps<{
  lat?: number
  lng?: number
  zoom?: number
  height?: string
  is_marker?: bool
}>(), {
  lat: 46.603354,
  lng: 1.888334,
  zoom: 6,
  height: '300px',
  is_marker: false,
})

const emit = defineEmits<{
  'location-selected': [data: { lat: number; lng: number; address: string }]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

function updateMarker(latitude: number, longitude: number) {
  if (!map) return

  map.setView([latitude, longitude], 13)

  if (marker) {
    marker.setLatLng([latitude, longitude])
  } else {
    marker = L.marker([latitude, longitude], { draggable: true }).addTo(map)

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

function onMapClick(e: L.LeafletMouseEvent) {
  const { lat: latitude, lng: longitude } = e.latlng
  reverseGeocode(latitude, longitude)
  updateMarker(latitude, longitude)
}

function initializeMap() {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([props.lat, props.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  map.on('click', onMapClick)

  if (props.is_marker)
    updateMarker(props.lat, props.lng)
}

function cleanupMap() {
  if (map) {
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
  if (new_val.is_marker)
    updateMarker(props.lat, props.lng)
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
