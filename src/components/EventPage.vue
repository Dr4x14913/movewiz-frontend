<script setup lang="ts">
import { ref, watch } from 'vue'
import { router } from '../router.ts'
import Card from './Card.vue'

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

const props = defineProps<{
  token?: string
}>()

const hasToken = ref(false)
const isErrored = ref(false)
const tokenValue = ref('')
const eventData = ref<EventData | null>(null)
const isLoading = ref(false)

watch(hasToken, async (newVal) => {
  if (newVal) {
    isLoading.value = true
    isErrored.value = false
    eventData.value = null
    const result = await fetchEvent()
    isLoading.value = false
    if (result) {
      eventData.value = result
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
    const res = await fetch('/api/getEvent?token=' + tokenValue.value)
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="event-page">
    <h1>Event</h1>

    <Card v-if="!hasToken" variant="classic" title="Access Your Event">
      <p class="event-page__token-desc">Enter the token from your invitation link to view event details.</p>
      <form @submit.prevent="redirectWithToken()" class="event-page__token-form">
        <input id="token-in" v-model="tokenValue" type="text" placeholder="Paste your token here" autocomplete="off" />
        <button type="submit" class="btn-primary">View Event</button>
      </form>
    </Card>

    <div v-else class="event-page__content">
      <div v-if="isLoading" class="event-page__loading">
        <p>Loading event details...</p>
      </div>

      <Card v-else-if="isErrored" title="Event Not Found">
        <p class="text-secondary">This event could not be found or the token is invalid.</p>
        <button class="btn-primary event-page__btn" @click="goHome()">Go Home</button>
      </Card>

      <Card v-else-if="eventData" variant="borderless" :title="eventData.eventName">

        <div class="event-page__field">
          <span class="event-page__label">Date</span>
          <span>{{ formatDate(eventData.datePicker) }}</span>
        </div>

        <div class="event-page__field">
          <span class="event-page__label">Contact</span>
          <span>{{ eventData.firstName }} {{ eventData.lastName }}</span>
        </div>

        <div class="event-page__field">
          <span class="event-page__label">Email</span>
          <span>{{ eventData.email }}</span>
        </div>

        <div class="event-page__field">
          <span class="event-page__label">Address</span>
          <span>{{ eventData.address }}</span>
        </div>

        <div v-if="eventData.comments" class="event-page__field">
          <span class="event-page__label">Comments</span>
          <p class="event-page__comments">{{ eventData.comments }}</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.event-page {
  max-width: 600px;
  margin: 0 auto;
}

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
  border-bottom: 1px solid #f0f0f0;
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
</style>
