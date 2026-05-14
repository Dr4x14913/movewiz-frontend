<script setup lang="ts">
import { ref } from 'vue'
import Card from './Card.vue'
import LocationPicker from './LocationPicker.vue'
import CaptchaInput from './CaptchaInput.vue'
import PopUp from './PopUp.vue'
import { useI18n } from 'vue-i18n'

enum FormResponse {
  Error,
  Success,
  None,
}
const { t } = useI18n()
const first_name = ref('John')
const last_name = ref('Doe')
const email = ref('john@toto.com')
const event_name = ref('Event Name')
const date = ref(new Date().toISOString().split('T')[0])
const address = ref('')
const lat = ref(46.603354)
const long_ = ref(1.888334)
const comments = ref('')
const captcha = ref()
const is_marker = ref(false)
const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')
const captcha_refresh_count = ref(0)

function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  address.value = data.address
  lat.value = data.lat
  long_.value = data.lng
}


async function submitForm() {
  const response = await fetch('/api/createEvent', {
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
      frontendOrigin: window.location.origin,
      datePicker: date.value,
      comments: comments.value,
      answer: captcha.value.value,
      captchaToken: captcha.value.token,
      eventName: event_name.value
    })
  })
  captcha_refresh_count.value ++
  if (!response.ok) {
    form_resp.value = FormResponse.Error
    if (response.status == 429) {
      form_resp_msg.value = "Too many requests, please try again later"
    } else {
      try {
        const resp = await response.json()
        form_resp_msg.value = JSON.stringify(resp)
      } catch {
        form_resp_msg.value = `Request failed with status ${response.status}`
      }
    }
  } else {
    form_resp.value = FormResponse.Success
    const resp = await response.json()
    form_resp_msg.value = JSON.stringify(resp)
  }
}

function onPopupClose() {
    form_resp.value = FormResponse.None
}
</script>

<template>
  <div v-if="form_resp == FormResponse.Error">
    <PopUp :message="form_resp_msg" type='error' @close='onPopupClose' />
  </div>
  <div v-if="form_resp == FormResponse.Success">
    <PopUp :message="form_resp_msg" type='success' @close='onPopupClose' />
  </div>
  <div class="create-event">
    <h1>{{ $t('createEvent.title') }}</h1>
    <p class="create-event__subtitle">{{ $t('createEvent.subtitle') }}</p>

    <form @submit.prevent="submitForm" class="create-event__form">
      <Card variant="classic" :title="$t('createEvent.contact.title')">
        <div class="create-event__row">
          <div class="create-event__field">
            <label for="first-name">{{ $t('createEvent.contact.firstName') }}</label>
            <input id="first-name" type="text" v-model="first_name" required />
          </div>

          <div class="create-event__field">
            <label for="last-name">{{ $t('createEvent.contact.lastName') }}</label>
            <input id="last-name" type="text" v-model="last_name" required />
          </div>
        </div>

        <div class="create-event__field">
          <label for="email">{{ $t('createEvent.contact.email') }}</label>
          <input id="email" type="email" v-model="email" required />
        </div>
      </Card>

      <Card variant="borderless" :title="$t('createEvent.details.title')">
        <div class="create-event__field">
          <label for="event-name">{{ $t('createEvent.details.eventName') }}</label>
          <input id="event-name" type="text" v-model="event_name" required />
        </div>

        <div class="create-event__field">
          <label for="date">{{ $t('createEvent.details.date') }}</label>
          <input id="date" type="date" v-model="date" required />
        </div>

        <LocationPicker
          :label="t('common.address.label')"
          :placeholder="t('common.address.placeholder')"
          :required=true
          @location-selected="onLocationSelected"
        />

        <input type="hidden" name="lat" :value="lat" />
        <input type="hidden" name="long" :value="long_" />

        <div class="create-event__field">
          <label for="comments">{{ $t('createEvent.details.comments') }}</label>
          <textarea id="comments" required v-model="comments" rows="3" :placeholder="$t('createEvent.details.commentsPlaceholder')"></textarea>
        </div>
      </Card>

      <Card :title="$t('createEvent.verification.title')">
        <CaptchaInput
          ref="captcha"
          :title="t('common.captcha.title')"
          :placeholder="t('common.captcha.placeholder')"
          :refreshCount="captcha_refresh_count"
        />
      </Card>
      <div class="create-event__actions">
        <button type="submit" class="btn-primary">{{ $t('createEvent.submit') }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-event {
  max-width: 650px;
  margin: 0 auto;
}

.create-event h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.create-event__subtitle {
  color: var(--color-text-medium);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.create-event__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.create-event__actions {
  text-align: center;
  padding-top: 0.5rem;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.create-event__actions .btn-primary {
  min-width: 200px;
  position: relative;
  overflow: hidden;
}

.create-event__actions .btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.create-event__actions .btn-primary:hover::after {
  transform: translateX(100%);
}

@media (max-width: 600px) {
  .create-event__row {
    grid-template-columns: 1fr;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
