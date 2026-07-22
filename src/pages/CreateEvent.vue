<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../api'
import Card from '../components/Card.vue'
import LocationPicker from '../components/LocationPicker.vue'
import CaptchaInput from '../components/CaptchaInput.vue'
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
const captcha = ref()
const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')
const captcha_refresh_count = ref(0)
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
}


async function submitForm() {
  isSubmitting.value = true
  try {
    const response = await api('/api/createEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: first_name.value,
        lastName: last_name.value,
        email: email.value,
        address: address.value,
        latitude: lat.value,
        longitude: long_.value,
        eventPageUrl: window.location.origin + '/event',
        editPageUrl: window.location.origin + '/edit',
        datePicker: date.value,
        comments: comments.value,
        answer: captcha.value.value,
        captchaToken: captcha.value.token,
        eventName: event_name.value,
      }),
    })
    captcha_refresh_count.value++
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
    <p class="create-event__required-legend">{{ $t('createEvent.required') }}</p>

    <FormLayout :submitting="isSubmitting" @submit="submitForm">
      <div class="create-event__cards">
        <Card variant="borderless" class="create-event__form-card">
          <div class="create-event__row">
            <div class="create-event__field">
              <label for="event-name">{{ $t('createEvent.details.eventName') }} <span class="create-event__required">*</span></label>
              <input id="event-name" type="text" v-model="event_name" required />
            </div>

            <div class="create-event__field">
              <label for="date">{{ $t('createEvent.details.date') }} <span class="create-event__required">*</span></label>
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

            <div class="create-event__field">
              <label>{{ $t('common.captcha.title') }} <span class="create-event__required">*</span></label>
              <CaptchaInput
                ref="captcha"
                :title="t('common.captcha.title')"
                :placeholder="t('common.captcha.placeholder')"
                :refreshCount="captcha_refresh_count"
              />
            </div>
          </div>
        </Card>

        <Card variant="borderless" class="create-event__form-card">
          <LocationPicker
            :label="t('common.address.label')"
            :placeholder="t('common.address.placeholder')"
            :required=true
            :height="'350px'"
            @location-selected="onLocationSelected"
          />

          <input type="hidden" name="lat" :value="lat" />
          <input type="hidden" name="long" :value="long_" />

        </Card>

        <Card variant="borderless" class="create-event__form-card">
        </Card>
      </div>
    </FormLayout>
  </div>
</template>

<style scoped>
.create-event h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.create-event__required-legend {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--color-text-medium);
}

.create-event__required {
  color: #e53935;
}

.create-event__form-card :deep(.address-input label)::after {
  content: ' *';
  color: #e53935;
}

.create-event__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.create-event__form-card {
  flex: 1;
  min-width: 500px;
  overflow: visible;
  margin-top: 0;
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
