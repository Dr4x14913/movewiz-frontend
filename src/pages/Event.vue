<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { router } from '../router.ts'
import { api } from '../api'
import Card from '../components/Card.vue'
import Map from '../components/Map.vue'
import RegisterParticipant from '../components/RegisterParticipant.vue'
import ParticipantTable from '../components/ParticipantTable.vue'

const { locale, t } = useI18n()

interface EventData {
  id: number
  eventName: string
  firstName: string
  lastName: string
  email: string
  datePicker: string
  address: string
  latitude: number
  longitude: number
  comments?: string
}

interface ParticipantData {
  latitude?: number
  longitude?: number
  firstName: string
  lastName: string
  mode: string
  phoneNumber?: string
  email?: string
  showEmail?: boolean
  contactToken?: string
  address?: string
}

const props = defineProps<{
  token?: string
}>()

const hasToken = ref(false)
const isErrored = ref(false)
const tokenValue = ref('')
const eventData = ref<EventData | null>(null)
const isLoading = ref(false)
const participants = ref<ParticipantData[]>([])
const filteredParticipants = ref<ParticipantData[]>([])
const eventPageUrl = window.location.origin + '/event'
const editParticipantPageUrl = window.location.origin + '/edit-participant'
const searchText = ref('')

const participantMarkers = computed(() => {
  return filteredParticipants.value
    .filter(p => p.latitude !== undefined && p.longitude !== undefined)
    .map(p => ({
      lat: p.latitude!,
      lng: p.longitude!,
      tooltip: `${p.firstName} ${p.lastName}`,
      color: p.mode == 'driver' ? '--color-secondary-green' : '--color-primary-green',
    }))
})

watch(hasToken, async (newVal) => {
  if (newVal) {
    isLoading.value = true
    isErrored.value = false
    eventData.value = null
    const result = await fetchEvent()
    isLoading.value = false
    if (result) {
      eventData.value = result
      await fetchParticipants()
    }
  }
})

if (props.token) {
  tokenValue.value = props.token as string
  hasToken.value = true
}

function redirectWithToken() {
  router.push({ path: '/event', query: { token: tokenValue.value } })
  hasToken.value = true
}

async function fetchEvent(): Promise<EventData | null> {
  try {
    const res = await api('/api/getEvent?token=' + tokenValue.value)
    const data = await res.json()
    if (!res.ok) {
      isErrored.value = true
      return null
    }
    return data.event
  } catch (err) {
    console.error(err)
    isErrored.value = true
    return null
  }
}

function goHome() {
  router.push('/')
}

async function fetchParticipants() {
  try {
    const res = await api('/api/getParticipants?token=' + tokenValue.value)
    const data = await res.json()
    if (res.ok && Array.isArray(data)) {
      const enriched = await Promise.all(data.map(async (p: ParticipantData) => {
        if (p.latitude && p.longitude) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.latitude}&lon=${p.longitude}`
            )
            const geoData = await geoRes.json()
            const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || ''
            const postcode = geoData.address?.postcode || ''
            p.address = city && postcode ? `${postcode} ${city}` : city || postcode || ''
          } catch {
            p.address = ''
          }
        }
        return p
      }))
      participants.value = enriched
      filteredParticipants.value = enriched
    }
  } catch (err) {
    console.error('Failed to fetch participants:', err)
  }
}

function onFiltered(p: ParticipantData[]) {
  filteredParticipants.value = p
}

function onParticipantClick(name: string) {
  searchText.value = name
}

function formatDate(dateStr: string): string {
  const dsLocale = locale.value === 'fr' ? 'fr-FR' : 'en-US'
  return new Date(dateStr).toLocaleDateString(dsLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="page event-page">
    <h1>{{ $t('eventPage.title') }}</h1>

    <Card v-if="!hasToken" variant="classic" :title="$t('eventPage.access.title')">
      <p class="event-page__token-desc">{{ $t('eventPage.access.desc') }}</p>
      <form @submit.prevent="redirectWithToken()" class="event-page__token-form">
        <input id="token-in" v-model="tokenValue" type="text" :placeholder="$t('eventPage.access.placeholder')" autocomplete="off" />
        <button type="submit" class="btn-primary">{{ $t('eventPage.access.btn') }}</button>
      </form>
    </Card>

    <div v-else class="event-page__content">
      <div v-if="isLoading" class="event-page__loading">
        <p>{{ $t('eventPage.loading') }}</p>
      </div>

      <Card v-else-if="isErrored" :title="$t('eventPage.notFound.title')">
        <p class="text-secondary">{{ $t('eventPage.notFound.desc') }}</p>
        <button class="btn-primary event-page__btn" @click="goHome()">{{ $t('eventPage.goHome') }}</button>
      </Card>

      <Card v-else-if="eventData" variant="borderless" :title="eventData.eventName">

        <div class="event-page__field">
          <span class="event-page__label">{{ $t('eventPage.fields.date') }}</span>
          <span>{{ formatDate(eventData.datePicker) }}</span>
        </div>

        <div class="event-page__field">
          <span class="event-page__label">{{ $t('eventPage.fields.contact') }}</span>
          <span>{{ eventData.firstName }} {{ eventData.lastName }}</span>
        </div>

        <div class="event-page__field">
          <span class="event-page__label">{{ $t('eventPage.fields.email') }}</span>
          <span>{{ eventData.email }}</span>
        </div>

        <div class="event-page__field">
          <span class="event-page__label">{{ $t('eventPage.fields.address') }}</span>
          <span>{{ eventData.address }}</span>
        </div>

        <div v-if="eventData.comments" class="event-page__field">
          <span class="event-page__label">{{ $t('eventPage.fields.comments') }}</span>
          <p class="event-page__comments">{{ eventData.comments }}</p>
        </div>

        <Map
          :lat="eventData.latitude"
          :lng="eventData.longitude"
          :zoom="10"
          :additional-markers="participantMarkers"
          :fit-markers="true"
          :displayMainMarker="true"
          :is_editable="false"
          height="350px"
          @marker-clicked="onParticipantClick"
        />
        <button v-if="searchText" @click="searchText = ''" class="event-page__clear">{{ $t('common.clear') }}</button>
      </Card>

      <Card v-if="!isErrored && eventData" collapsible default-expanded :title="$t('eventPage.participants.title')" variant="borderless">
        <ParticipantTable v-model="searchText" :participants="participants" @filtered="onFiltered" />
      </Card>

      <RegisterParticipant
        v-if="!isErrored && eventData"
        :token="tokenValue"
        :event-page-url="eventPageUrl"
        :edit-participant-page-url="editParticipantPageUrl"
        @registered="fetchParticipants"
      />
    </div>
  </div>
</template>

<style scoped>
/* .page class handles layout */

.event-page__token-desc {
  color: var(--color-text-medium);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.event-page__token-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-page__content {
  margin-top: 1.5rem;
}

.event-page__loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-medium);
}

.event-page__btn {
  margin-top: 1rem;
}

.event-page__field {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--color-input-border);
}

.event-page__field:last-child {
  border-bottom: none;
}

.event-page__label {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--color-text-medium);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.event-page__comments {
  text-align: right;
  max-width: 60%;
  color: var(--color-text-dark);
}

.event-page__clear {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--color-text-medium);
  color: white;
  border: none;
  border-radius: 50px;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  cursor: pointer;
}

.event-page__clear:hover {
  background: var(--color-text-dark);
}

@media (max-width: 600px) {
  .event-page__field {
    flex-direction: column;
    gap: 0.25rem;
  }

  .event-page__comments {
    max-width: 100%;
    text-align: left;
  }
}
</style>
