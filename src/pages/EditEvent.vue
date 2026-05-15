<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
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

//const picker = ref<InstanceType<typeof import('./LocationPicker.vue')>['default'] | null>(null)
const picker = ref(null)
const first_name = ref('')
const last_name = ref('')
const email = ref('')
const event_name = ref('')
const date = ref('')
const address = ref('')
const lat = ref(0)
const long_ = ref(0)
const comments = ref('')

onMounted(async () => {
  if (!props.token) {
    isErrored.value = true
    isLoading.value = false
    return
  }
  await fetchEvent()
})

async function fetchEvent() {
  try {
    const res = await fetch('/api/getEvent?token=' + props.token + '&isEdit=true')
    const data = await res.json()
    if (!res.ok) {
      isErrored.value = true
      isLoading.value = false
      return
    }
    const event = data.event
    first_name.value = event.firstName
    last_name.value = event.lastName
    email.value = event.email
    event_name.value = event.eventName
    date.value = event.datePicker
    address.value = event.address
    lat.value = event.latitude
    long_.value = event.longitude
    comments.value = event.comments || ''
    isLoading.value = false
    await nextTick()
    picker.value?.setAddress(address.value, lat.value, long_.value)
  } catch (err) {
    console.error(err)
    isErrored.value = true
    isLoading.value = false
  }
}

function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  address.value = data.address
  lat.value = data.lat
  long_.value = data.lng
}

async function submitForm() {
  isSubmitting.value = true
  try {
    const response = await fetch('/api/editEvent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editToken: props.token,
        firstName: first_name.value,
        lastName: last_name.value,
        email: email.value,
        eventName: event_name.value,
        datePicker: date.value,
        address: address.value,
        latitude: lat.value,
        longitude: long_.value,
        comments: comments.value,
      }),
    })

    if (!response.ok) {
      form_resp.value = FormResponse.Error
      try {
        const resp = await response.json()
        form_resp_msg.value = resp.error || t('editEvent.popup.errorDefault')
      } catch {
        form_resp_msg.value = t('editEvent.popup.errorDefault')
      }
    } else {
      form_resp.value = FormResponse.Success
      form_resp_msg.value = t('editEvent.popup.successDesc')
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
    <PopUp :title="t('editEvent.popup.errorTitle')" :message="form_resp_msg" type="error" @close="onPopupClose" />
  </div>
  <div v-if="form_resp == FormResponse.Success">
    <PopUp :title="t('editEvent.popup.successTitle')" :message="form_resp_msg" type="success" @close="onPopupClose" />
  </div>
  <div class="edit-event">
    <h1>{{ $t('editEvent.title') }}</h1>
    <p class="edit-event__subtitle">{{ $t('editEvent.subtitle') }}</p>

    <div v-if="isLoading" class="edit-event__loading">
      <p>{{ $t('editEvent.loading') }}</p>
    </div>

    <div v-else-if="isErrored" class="edit-event__error">
      <Card :title="$t('editEvent.notFound.title')">
        <p class="text-secondary">{{ $t('editEvent.notFound.desc') }}</p>
        <button class="btn-primary edit-event__btn" @click="goHome()">{{ $t('eventPage.goHome') }}</button>
      </Card>
    </div>

    <div v-else class="edit-event__form-wrapper">
      <div v-if="isSubmitting" class="edit-event__spinner-overlay">
        <Spinner :size="48" />
      </div>
      <form @submit.prevent="submitForm" class="edit-event__form" :class="{ 'edit-event__form--disabled': isSubmitting }">
      <Card variant="classic" :title="$t('createEvent.contact.title')">
        <div class="edit-event__row">
          <div class="edit-event__field">
            <label for="first-name">{{ $t('createEvent.contact.firstName') }}</label>
            <input id="first-name" type="text" v-model="first_name" required />
          </div>

          <div class="edit-event__field">
            <label for="last-name">{{ $t('createEvent.contact.lastName') }}</label>
            <input id="last-name" type="text" v-model="last_name" required />
          </div>
        </div>

        <div class="edit-event__field">
          <label for="email">{{ $t('createEvent.contact.email') }}</label>
          <input id="email" type="email" v-model="email" required />
        </div>
      </Card>

      <Card variant="borderless" :title="$t('createEvent.details.title')">
        <div class="edit-event__field">
          <label for="event-name">{{ $t('createEvent.details.eventName') }}</label>
          <input id="event-name" type="text" v-model="event_name" required />
        </div>

        <div class="edit-event__field">
          <label for="date">{{ $t('createEvent.details.date') }}</label>
          <input id="date" type="date" v-model="date" required />
        </div>

        <LocationPicker
          ref="picker"
          :label="t('common.address.label')"
          :placeholder="t('common.address.placeholder')"
          :required="true"
          @location-selected="onLocationSelected"
        />

        <div class="edit-event__field">
          <label for="comments">{{ $t('createEvent.details.comments') }}</label>
          <textarea id="comments" v-model="comments" rows="3" :placeholder="$t('createEvent.details.commentsPlaceholder')"></textarea>
        </div>
      </Card>

      <div class="edit-event__actions">
        <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ $t('editEvent.submit') }}</button>
      </div>
        </form>
      </div>
    </div>
</template>

<style scoped>
.edit-event {
  max-width: 650px;
  margin: 0 auto;
}

.edit-event h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.edit-event__subtitle {
  color: var(--color-text-medium);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.edit-event__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-event__loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-medium);
}

.edit-event__error {
  margin-top: 1.5rem;
}

.edit-event__btn {
  margin-top: 1rem;
}

.edit-event__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.edit-event__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.edit-event__field:last-child {
  margin-bottom: 0;
}

.edit-event__field label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-dark);
  transition: color 0.2s ease;
}

.edit-event__field input,
.edit-event__field textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.edit-event__field input:focus,
.edit-event__field textarea:focus {
  border-color: var(--color-primary-green);
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
  transform: scale(1.01);
}

.edit-event__actions {
  text-align: center;
  padding-top: 0.5rem;
}

.edit-event__form-wrapper {
  position: relative;
}

.edit-event__spinner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(253, 252, 245, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.edit-event__form--disabled {
  pointer-events: none;
  opacity: 0.5;
}

.edit-event__actions .btn-primary {
  min-width: 200px;
}

@media (max-width: 600px) {
  .edit-event__row {
    grid-template-columns: 1fr;
  }
}
</style>
