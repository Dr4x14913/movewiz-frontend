<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../api'
import Card from '../components/Card.vue'
import LocationPicker from '../components/LocationPicker.vue'
import Turnstile from '../components/Turnstile.vue'
import PopUp from '../components/PopUp.vue'
import FormLayout from '../components/FormLayout.vue'
import { useI18n } from 'vue-i18n'

enum FormResponse {
  Error,
  Success,
  None,
}
const { t } = useI18n()
const first_name = ref('')
const last_name = ref('')
const email = ref('')
const event_name = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const address = ref('')
const lat = ref(46.603354)
const long_ = ref(1.888334)
const comments = ref('')
const turnstileSiteKey: string = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const turnstileWidget = ref<InstanceType<typeof Turnstile> | null>(null)
const turnstileToken = ref('')
const locationPickerRef = ref<{
  getLocation: () => { address: string; lat: number; lng: number }
  resetLocation: () => void
  hasLocation: () => boolean
} | null>(null)
const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')
const isSubmitting = ref(false)

function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  address.value = data.address
  lat.value = data.lat
  long_.value = data.lng
}

function resetForm() {
  first_name.value = ''
  last_name.value = ''
  email.value = ''
  event_name.value = ''
  address.value = ''
  comments.value = ''
  lat.value = 46.603354
  long_.value = 1.888334
  locationPickerRef.value?.resetLocation()
}


async function submitForm() {
  // A typed address only has coordinates once the user picked it from the
  // suggestions or clicked the map — without that, the default map center
  // would be silently stored, so ask for a location selection instead.
  if (!locationPickerRef.value?.hasLocation()) {
    form_resp.value = FormResponse.Error
    form_resp_msg.value = t('createEvent.popup.errorMissingLocation')
    return
  }
  isSubmitting.value = true
  try {
    // The address sent to the backend is the text currently in the address
    // field (the user may have edited it after the reverse geocode).
    const pickerLocation = locationPickerRef.value?.getLocation()
    const effectiveAddress = pickerLocation ? pickerLocation.address : address.value
    const response = await api('/api/createEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: first_name.value,
        lastName: last_name.value,
        email: email.value,
        address: effectiveAddress,
        latitude: lat.value,
        longitude: long_.value,
        eventPageUrl: window.location.origin + '/event',
        editPageUrl: window.location.origin + '/edit',
        datePicker: date.value,
        comments: comments.value,
        turnstileToken: turnstileToken.value || turnstileWidget.value?.getResponse() || '',
        eventName: event_name.value,
      }),
    })
    if (!response.ok) {
      form_resp.value = FormResponse.Error
      if (response.status === 429) {
        form_resp_msg.value = t('createEvent.popup.tooManyRequests')
      } else {
        try {
          const resp = await response.json()
          form_resp_msg.value = resp.error || t('createEvent.popup.errorDefault')
        } catch {
          form_resp_msg.value = t('createEvent.popup.errorDefault')
        }
      }
    } else {
      resetForm()
      form_resp.value = FormResponse.Success
      const resp = await response.json()
      form_resp_msg.value = `${t('createEvent.popup.successDesc')}
        <a href="${resp.readUrl}" target="_blank" rel="noopener">${t('createEvent.popup.readLink')}</a> |
        <a href="${resp.writeUrl}" target="_blank" rel="noopener">${t('createEvent.popup.writeLink')}</a>`
    }
  } finally {
    isSubmitting.value = false
    // Turnstile tokens are single-use: reset the widget for the next attempt
    turnstileToken.value = ''
    turnstileWidget.value?.reset()
  }
}

function onPopupClose() {
    form_resp.value = FormResponse.None
}
</script>

<template>
  <div v-if="form_resp == FormResponse.Error">
    <PopUp :title="t('createEvent.popup.errorTitle')" :message="form_resp_msg" type='error' @close='onPopupClose' />
  </div>
  <div v-if="form_resp == FormResponse.Success">
    <PopUp :title="t('createEvent.popup.successTitle')" :html="form_resp_msg" type='success' @close='onPopupClose' />
  </div>
  <div class="page create-event">
    <h1>{{ $t('createEvent.title') }}</h1>
    <p class="form__required-legend">{{ $t('createEvent.required') }}</p>

    <FormLayout :submitting="isSubmitting" @submit="submitForm">
      <Card variant="borderless" class="create-event__form-card">
        <div class="create-event__row">
          <div class="create-event__field">
            <label for="event-name">{{ $t('createEvent.details.eventName') }} <span class="form__required">*</span></label>
            <input id="event-name" type="text" v-model="event_name" required />
          </div>

          <div class="create-event__field">
            <label for="date">{{ $t('createEvent.details.date') }} <span class="form__required">*</span></label>
            <input id="date" type="date" v-model="date" required />
          </div>

          <div class="create-event__field">
            <label for="first-name">{{ $t('createEvent.contact.firstName') }}</label>
            <input id="first-name" type="text" v-model="first_name" />
          </div>

          <div class="create-event__field">
            <label for="last-name">{{ $t('createEvent.contact.lastName') }}</label>
            <input id="last-name" type="text" v-model="last_name" />
          </div>

          <div class="create-event__field">
            <label for="email">{{ $t('createEvent.contact.email') }}</label>
            <input id="email" type="email" v-model="email"/>
          </div>

          <div class="create-event__field">
            <label for="comments">{{ $t('createEvent.details.comments') }}</label>
            <textarea id="comments" v-model="comments" rows="4" :placeholder="$t('createEvent.details.commentsPlaceholder')"></textarea>
          </div>

          <div v-if="turnstileSiteKey" class="create-event__field">
            <label>{{ $t('common.verification.title') }}</label>
            <Turnstile
              ref="turnstileWidget"
              :sitekey="turnstileSiteKey"
              @token="turnstileToken = $event"
            />
          </div>
        </div>
      </Card>

      <Card variant="borderless" class="create-event__form-card">
        <LocationPicker
          ref="locationPickerRef"
          :label="t('common.address.label')"
          :placeholder="t('common.address.placeholder')"
          :required=true
          :height="'350px'"
          @location-selected="onLocationSelected"
        />

        <input type="hidden" name="lat" :value="lat" />
        <input type="hidden" name="long" :value="long_" />

      </Card>

    </FormLayout>
  </div>
</template>

<style scoped>
.create-event h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.create-event__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.create-event__field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}

.create-event__field:last-child {
  margin-bottom: 0;
}

.create-event__field label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-dark);
  transition: color 0.2s ease;
}

.create-event__field input,
.create-event__field textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.create-event__field input:focus,
.create-event__field textarea:focus {
  border-color: var(--color-primary-green);
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
  transform: scale(1.01);
}

.create-event__form input,
.create-event__form textarea {
  padding: 0.625rem 1rem;
}

@media (max-width: 600px) {
  .create-event__row {
    grid-template-columns: 1fr;
  }

  .create-event__form-card {
    min-width: 100%;
  }
}
</style>
