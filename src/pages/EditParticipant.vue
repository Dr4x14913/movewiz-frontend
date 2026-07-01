<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { api } from '../api'
import Card from '../components/Card.vue'
import LocationPicker from '../components/LocationPicker.vue'
import PopUp from '../components/PopUp.vue'
import Spinner from '../components/Spinner.vue'
import { useI18n } from 'vue-i18n'
import { router } from '../router'

enum FormResponse {
  Error,
  Success,
  None,
}

const { t } = useI18n()

const props = defineProps<{
  token?: string
}>()

const isLoading = ref(true)
const isErrored = ref(false)
const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')
const isSubmitting = ref(false)

const picker = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const mode = ref('passenger')
const phoneNumber = ref('')
const comments = ref('')
const lat = ref(0)
const long_ = ref(0)
const notifyMe = ref(false)
const hideEmail = ref(false)

onMounted(async () => {
  if (!props.token) {
    isErrored.value = true
    isLoading.value = false
    return
  }
  await fetchParticipant()
})

async function fetchParticipant() {
  try {
    const res = await api('/api/getParticipant?token=' + props.token)
    const data = await res.json()
    if (!res.ok) {
      isErrored.value = true
      isLoading.value = false
      return
    }
    const participant = data.participant
    firstName.value = participant.firstName
    lastName.value = participant.lastName
    email.value = participant.email
    mode.value = participant.mode || 'passenger'
    phoneNumber.value = participant.phoneNumber || ''
    comments.value = participant.comments || ''
    lat.value = participant.latitude || 0
    long_.value = participant.longitude || 0
    notifyMe.value = participant.notifyMe || false
    hideEmail.value = !participant.showEmail
    isLoading.value = false
    await nextTick()
    if (participant.latitude && participant.longitude) {
      const address = await reverseGeocode(participant.latitude, participant.longitude)
      picker.value?.setAddress(address, participant.latitude, participant.longitude)
    }
  } catch (err) {
    console.error(err)
    isErrored.value = true
    isLoading.value = false
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
    const data = await res.json()
    return data.display_name || ''
  } catch (e) {
    console.error('Reverse geocode failed:', e)
    return ''
  }
}

function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  lat.value = data.lat
  long_.value = data.lng
}

async function submitForm() {
  isSubmitting.value = true
  try {
    const response = await api('/api/editParticipant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editToken: props.token,
        firstName: firstName.value,
        lastName: lastName.value,
        mode: mode.value,
        phoneNumber: phoneNumber.value,
        comments: comments.value,
        latitude: lat.value,
        longitude: long_.value,
        notifyMe: notifyMe.value,
        showEmail: !hideEmail.value,
      }),
    })

    if (!response.ok) {
      form_resp.value = FormResponse.Error
      try {
        const resp = await response.json()
        form_resp_msg.value = resp.error || t('editParticipant.popup.errorDefault')
      } catch {
        form_resp_msg.value = t('editParticipant.popup.errorDefault')
      }
    } else {
      form_resp.value = FormResponse.Success
      form_resp_msg.value = t('editParticipant.popup.successDesc')
    }
  } finally {
    isSubmitting.value = false
  }
}

function onPopupClose() {
  form_resp.value = FormResponse.None
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div v-if="form_resp == FormResponse.Error">
    <PopUp :title="t('editParticipant.popup.errorTitle')" :message="form_resp_msg" type="error" @close="onPopupClose" />
  </div>
  <div v-if="form_resp == FormResponse.Success">
    <PopUp :title="t('editParticipant.popup.successTitle')" :message="form_resp_msg" type="success" @close="onPopupClose" />
  </div>
  <div class="page edit-participant">
    <h1>{{ $t('editParticipant.title') }}</h1>
    <p class="edit-participant__subtitle">{{ $t('editParticipant.subtitle') }}</p>

    <div v-if="isLoading" class="edit-participant__loading">
      <p>{{ $t('editParticipant.loading') }}</p>
    </div>

    <div v-else-if="isErrored" class="edit-participant__error">
      <Card :title="$t('editParticipant.notFound.title')">
        <p class="text-secondary">{{ $t('editParticipant.notFound.desc') }}</p>
        <button class="btn-primary edit-participant__btn" @click="goHome()">{{ $t('eventPage.goHome') }}</button>
      </Card>
    </div>

    <div v-else class="edit-participant__form-wrapper">
      <div v-if="isSubmitting" class="edit-participant__spinner-overlay">
        <Spinner :size="48" />
      </div>
      <form @submit.prevent="submitForm" class="edit-participant__form" :class="{ 'edit-participant__form--disabled': isSubmitting }">
        <Card variant="classic" :title="$t('createEvent.contact.title')">
          <div class="edit-participant__row">
            <div class="edit-participant__field">
              <label for="edit-first-name">{{ $t('registerParticipant.contact.firstName') }}</label>
              <input id="edit-first-name" type="text" v-model="firstName" required />
            </div>

            <div class="edit-participant__field">
              <label for="edit-last-name">{{ $t('registerParticipant.contact.lastName') }}</label>
              <input id="edit-last-name" type="text" v-model="lastName" required />
            </div>
          </div>

          <div class="edit-participant__field">
            <label for="edit-email">{{ $t('registerParticipant.contact.email') }}</label>
            <input id="edit-email" type="email" v-model="email" disabled />
          </div>
        </Card>

        <Card variant="borderless" :title="$t('registerParticipant.details.title')">
          <div class="edit-participant__field">
            <label for="edit-mode">{{ $t('registerParticipant.details.mode') }}</label>
            <select id="edit-mode" v-model="mode" required>
              <option value="driver">{{ $t('registerParticipant.details.driver') }}</option>
              <option value="passenger">{{ $t('registerParticipant.details.passenger') }}</option>
            </select>
          </div>

          <div class="edit-participant__field">
            <label for="edit-phone">{{ $t('registerParticipant.details.phoneNumber') }}</label>
            <input id="edit-phone" type="tel" v-model="phoneNumber" required />
          </div>

          <div class="edit-participant__field">
            <label for="edit-comments">{{ $t('registerParticipant.details.comments') }}</label>
            <textarea id="edit-comments" v-model="comments" rows="3" :placeholder="$t('registerParticipant.details.commentsPlaceholder')"></textarea>
          </div>

          <LocationPicker
            ref="picker"
            :label="t('registerParticipant.details.location')"
            :placeholder="t('common.address.placeholder')"
            :mainMarkerLabel="t('registerParticipant.markerLabel')"
            @location-selected="onLocationSelected"
          />

          <div class="edit-participant__checkboxes">
            <label class="edit-participant__checkbox">
              <input type="checkbox" v-model="hideEmail" />
              {{ $t('registerParticipant.details.hideEmail') }}
            </label>

            <label class="edit-participant__checkbox">
              <input type="checkbox" v-model="notifyMe" />
              {{ $t('registerParticipant.details.notifyMe') }}
            </label>
          </div>
        </Card>

        <div class="edit-participant__actions">
          <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ $t('editParticipant.submit') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-participant h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.edit-participant__subtitle {
  color: var(--color-text-medium);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.edit-participant__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-participant__loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-medium);
}

.edit-participant__error {
  margin-top: 1.5rem;
}

.edit-participant__btn {
  margin-top: 1rem;
}

.edit-participant__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.edit-participant__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.edit-participant__field:last-child {
  margin-bottom: 0;
}

.edit-participant__field label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-dark);
  transition: color 0.2s ease;
}

.edit-participant__field input,
.edit-participant__field textarea,
.edit-participant__field select {
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.edit-participant__field input:focus,
.edit-participant__field textarea:focus,
.edit-participant__field select:focus {
  border-color: var(--color-primary-green);
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
  transform: scale(1.01);
}

.edit-participant__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.edit-participant__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  color: var(--color-text-dark);
  cursor: pointer;
}

.edit-participant__actions {
  text-align: center;
  padding-top: 0.5rem;
}

.edit-participant__form-wrapper {
  position: relative;
}

.edit-participant__spinner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(253, 252, 245, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.edit-participant__form--disabled {
  pointer-events: none;
  opacity: 0.5;
}

.edit-participant__actions .btn-primary {
  min-width: 200px;
}

@media (max-width: 600px) {
  .edit-participant__row {
    grid-template-columns: 1fr;
  }
}
</style>
