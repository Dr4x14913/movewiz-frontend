<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { api } from '../api'
import Card from '../components/Card.vue'
import LocationPicker from '../components/LocationPicker.vue'
import PopUp from '../components/PopUp.vue'
import FormLayout from '../components/FormLayout.vue'
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

const picker = ref<{
  getLocation: () => { address: string; lat: number; lng: number }
  setAddress: (address: string, lat: number, lng: number) => void
} | null>(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const mode = ref('passenger')
const phoneNumber = ref('')
const comments = ref('')
const lat = ref(0)
const long_ = ref(0)
const address = ref('')
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
      // Prefill from the address stored by the frontend at registration /
      // previous edit time — no geocoding on the read path.
      address.value = participant.address || ''
      picker.value?.setAddress(participant.address || '', participant.latitude, participant.longitude)
    }
  } catch (err) {
    console.error(err)
    isErrored.value = true
    isLoading.value = false
  }
}

function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  lat.value = data.lat
  long_.value = data.lng
  address.value = data.address
}

async function submitForm() {
  isSubmitting.value = true
  try {
    // The address sent to the backend is the text currently in the address
    // field (the user may have edited it after the reverse geocode).
    const pickerLocation = picker.value?.getLocation()
    const effectiveAddress = pickerLocation ? pickerLocation.address : address.value
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
        address: effectiveAddress,
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

    <div v-if="isLoading" class="edit-participant__loading">
      <p>{{ $t('editParticipant.loading') }}</p>
    </div>

    <div v-else-if="isErrored" class="edit-participant__error">
      <Card :title="$t('editParticipant.notFound.title')">
        <p class="text-secondary">{{ $t('editParticipant.notFound.desc') }}</p>
        <button class="btn-primary edit-participant__btn" @click="goHome()">{{ $t('eventPage.goHome') }}</button>
      </Card>
    </div>

    <FormLayout v-else :submitting="isSubmitting" :submit-label="t('editParticipant.submit')" @submit="submitForm">
      <div class="edit-participant__cards">
        <Card variant="borderless" class="edit-participant__form-card">
          <div class="edit-participant__row">
            <div class="edit-participant__field">
              <label for="edit-first-name">{{ $t('registerParticipant.contact.firstName') }}</label>
              <input id="edit-first-name" type="text" v-model="firstName" required />
            </div>

            <div class="edit-participant__field">
              <label for="edit-last-name">{{ $t('registerParticipant.contact.lastName') }}</label>
              <input id="edit-last-name" type="text" v-model="lastName" required />
            </div>

            <div class="edit-participant__field">
              <label for="edit-email">{{ $t('registerParticipant.contact.email') }}</label>
              <input id="edit-email" type="email" v-model="email" disabled />
            </div>

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
          </div>
        </Card>

        <Card variant="borderless" class="edit-participant__form-card">
          <LocationPicker
            ref="picker"
            :label="t('registerParticipant.details.location')"
            :placeholder="t('common.address.placeholder')"
            :mainMarkerLabel="t('registerParticipant.markerLabel')"
            required
            :height="'350px'"
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
      </div>
    </FormLayout>
  </div>
</template>

<style scoped>

.edit-participant__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  flex: 0 0 100%;
}

.edit-participant__form-card {
  flex: 1;
  min-width: 500px;
  overflow: visible;
  margin-top: 0;
}

.edit-participant__form input,
.edit-participant__form textarea {
  padding: 0.625rem 1rem;
}

.edit-participant h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
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

/* Same grid as create event: minmax(0, 1fr) (not bare 1fr) so columns can
   shrink below their content width and never force the card wider. */
.edit-participant__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.edit-participant__field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
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
  /* No transform on focus: a transform rasterizes the input into a layer
     and the 1.01 scale made the typed text render blurred. */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.edit-participant__field input:focus,
.edit-participant__field textarea:focus,
.edit-participant__field select:focus {
  border-color: var(--color-primary-green);
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
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

@media (max-width: 600px) {
  .edit-participant__row {
    grid-template-columns: 1fr;
  }

  .edit-participant__form-card {
    min-width: 100%;
  }
}
</style>
