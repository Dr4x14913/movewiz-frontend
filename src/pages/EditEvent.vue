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
    const res = await api('/api/getEvent?token=' + props.token + '&isEdit=true')
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
    const response = await api('/api/editEvent', {
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
  <div class="page edit-event">
    <h1>{{ $t('editEvent.title') }}</h1>

    <div v-if="isLoading" class="edit-event__loading">
      <p>{{ $t('editEvent.loading') }}</p>
    </div>

    <div v-else-if="isErrored" class="edit-event__error">
      <Card :title="$t('editEvent.notFound.title')">
        <p class="text-secondary">{{ $t('editEvent.notFound.desc') }}</p>
        <button class="btn-primary edit-event__btn" @click="goHome()">{{ $t('eventPage.goHome') }}</button>
      </Card>
    </div>

    <FormLayout v-else :submitting="isSubmitting" @submit="submitForm">
      <div class="edit-event__cards">
        <Card variant="borderless" class="edit-event__form-card">
          <div class="edit-event__row">
            <div class="edit-event__field">
              <label for="event-name">{{ $t('createEvent.details.eventName') }} <span class="edit-event__required">*</span></label>
              <input id="event-name" type="text" v-model="event_name" required />
            </div>

            <div class="edit-event__field">
              <label for="date">{{ $t('createEvent.details.date') }} <span class="edit-event__required">*</span></label>
              <input id="date" type="date" v-model="date" required />
            </div>

            <div class="edit-event__field">
              <label for="first-name">{{ $t('createEvent.contact.firstName') }}</label>
              <input id="first-name" type="text" v-model="first_name" />
            </div>

            <div class="edit-event__field">
              <label for="last-name">{{ $t('createEvent.contact.lastName') }}</label>
              <input id="last-name" type="text" v-model="last_name" />
            </div>

            <div class="edit-event__field">
              <label for="email">{{ $t('createEvent.contact.email') }}</label>
              <input id="email" type="email" v-model="email" />
            </div>

            <div class="edit-event__field">
              <label for="comments">{{ $t('createEvent.details.comments') }}</label>
              <textarea id="comments" v-model="comments" rows="4" :placeholder="$t('createEvent.details.commentsPlaceholder')"></textarea>
            </div>
          </div>
        </Card>

        <Card variant="borderless" class="edit-event__form-card">
          <LocationPicker
            ref="picker"
            :label="t('common.address.label')"
            :placeholder="t('common.address.placeholder')"
            :required="true"
            :height="'350px'"
            @location-selected="onLocationSelected"
          />

          <input type="hidden" name="lat" :value="lat" />
          <input type="hidden" name="long" :value="long_" />
        </Card>

        <Card variant="borderless" class="edit-event__form-card">
        </Card>
      </div>
    </FormLayout>
  </div>
</template>

<style scoped>
.edit-event h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.edit-event__required {
  color: #e53935;
}

.edit-event__form-card :deep(.address-input label)::after {
  content: ' *';
  color: #e53935;
}

.edit-event__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.edit-event__form-card {
  flex: 1;
  min-width: 500px;
  overflow: visible;
  margin-top: 0;
}

.edit-event__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.edit-event__field {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
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

.edit-event__form input,
.edit-event__form textarea {
  padding: 0.625rem 1rem;
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

@media (max-width: 600px) {
  .edit-event__row {
    grid-template-columns: 1fr;
  }

  .edit-event__form-card {
    min-width: 100%;
  }
}
</style>
