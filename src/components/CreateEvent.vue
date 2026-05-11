<script setup lang="ts">
import { ref } from 'vue'
import AddressInput from './AddressInput.vue'
import Map from './Map.vue'

const first_name = ref('John')
const last_name = ref('Doe')
const email = ref('john@example.com')
const event_name = ref('Event Name')
const date = ref('')
const address = ref('')
const lat = ref(46.603354)
const long_ = ref(1.888334)
const comments = ref('')
const captcha_img = ref('')
const captcha_token = ref('')
const captcha_value = ref('')
const is_marker = ref(false)

async function fetchCaptcha() {
  try {
    const res = await fetch('/generate-captcha')
    const data = await res.json()
    captcha_token.value = data.captcha_token
    captcha_img.value = 'data:image/png;base64,' + data.image
  } catch (e) {
    console.error(e)
  }
}

fetchCaptcha()

function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  address.value = data.address
  lat.value = data.lat
  long_.value = data.lng
  is_marker.value = true
}

function onMapLocationSelected(data: { lat: number; lng: number; address: string }) {
  lat.value = data.lat
  long_.value = data.lng
  address.value = data.address
}

async function submitForm() {
  await fetchCaptcha()
  // TODO: submit event data
}
</script>

<template>
  <div class="create-event">
    <h1>Create an Event</h1>
    <p class="create-event__subtitle">Fill in the details below to organize your movie night.</p>

    <form @submit.prevent="submitForm" class="create-event__form">
      <div class="create-event__section">
        <h2>Contact Information</h2>

        <div class="create-event__row">
          <div class="create-event__field">
            <label for="first-name">First Name</label>
            <input id="first-name" type="text" v-model="first_name" required />
          </div>

          <div class="create-event__field">
            <label for="last-name">Last Name</label>
            <input id="last-name" type="text" v-model="last_name" required />
          </div>
        </div>

        <div class="create-event__field">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" required />
        </div>
      </div>

      <div class="create-event__section">
        <h2>Event Details</h2>

        <div class="create-event__field">
          <label for="event-name">Event Name</label>
          <input id="event-name" type="text" v-model="event_name" required />
        </div>

        <div class="create-event__field">
          <label for="date">Date</label>
          <input id="date" type="date" v-model="date" required />
        </div>

        <AddressInput
          v-model="address"
          @location-selected="onLocationSelected"
          required
        />

        <Map
          :lat="lat"
          :lng="long_"
          :is_marker="is_marker"
          @location-selected="onMapLocationSelected"
        />

        <input type="hidden" name="lat" :value="lat" />
        <input type="hidden" name="long" :value="long_" />

        <div class="create-event__field">
          <label for="comments">Comments</label>
          <textarea id="comments" v-model="comments" rows="3" placeholder="Optional notes about the event..."></textarea>
        </div>
      </div>

      <div class="create-event__section create-event__captcha-section">
        <h2>Verification</h2>
        <div class="create-event__captcha">
          <img v-if="captcha_img" :src="captcha_img" alt="Captcha image" class="create-event__captcha-img" />
          <p v-else class="create-event__captcha-loading">Loading captcha...</p>
          <div class="create-event__captcha-actions">
            <input id="captcha" type="text" v-model="captcha_value" placeholder="Enter captcha" />
            <button type="button" class="btn-secondary" @click="fetchCaptcha()">Refresh</button>
          </div>
        </div>
      </div>

      <div class="create-event__actions">
        <button type="submit" class="btn-primary">Create Event</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-event {
  max-width: 650px;
  margin: 0 auto;
}

.create-event__subtitle {
  color: var(--color-text-medium);
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.create-event__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.create-event__section {
  padding: 1.5rem;
  background-color: #ffffff;
  border: 2px solid var(--color-secondary-green);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
}

.create-event__section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.create-event__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.create-event__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.create-event__field:last-child {
  margin-bottom: 0;
}

.create-event__field label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-dark);
}

.create-event__captcha {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.create-event__captcha-img {
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.create-event__captcha-loading {
  color: var(--color-text-medium);
  font-style: italic;
}

.create-event__captcha-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  max-width: 300px;
}

.create-event__captcha-actions input {
  flex: 1;
}

.create-event__actions {
  text-align: center;
  padding-top: 1rem;
}

.create-event__actions .btn-primary {
  min-width: 200px;
}



@media (max-width: 600px) {
  .create-event__row {
    grid-template-columns: 1fr;
  }
}
</style>
