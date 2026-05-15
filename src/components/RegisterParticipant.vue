<script setup lang="ts">
import { ref } from 'vue'
import Card from './Card.vue'
import LocationPicker from './LocationPicker.vue'
import PopUp from './PopUp.vue'
import { useI18n } from 'vue-i18n'

enum FormResponse {
  Error,
  Success,
  None,
}

const props = defineProps<{
  token: string
  eventPageUrl: string
  editParticipantPageUrl: string
}>()

const emit = defineEmits<{
  registered: []
}>()

const { t } = useI18n()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const mode = ref('passenger')
const hideEmail = ref(false)

const phoneNumber = ref('')
const comments = ref('')
const notifyMe = ref(false)
const lat = ref<number | null>(null)
const long_ = ref<number | null>(null)

const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')



function onLocationSelected(data: { address: string; lat: number; lng: number }) {
  lat.value = data.lat
  long_.value = data.lng
}

async function submitForm() {
  const body: any = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    mode: mode.value,
    showEmail: !hideEmail.value,
    token: props.token,

    eventPageUrl: props.eventPageUrl,
    editParticipantPageUrl: props.editParticipantPageUrl,
  }

  if (phoneNumber.value) body.phoneNumber = phoneNumber.value
  if (comments.value) body.comments = comments.value
  if (notifyMe.value) body.notifyMe = notifyMe.value
  if (lat.value !== null) body.latitude = lat.value
  if (long_ !== null) body.longitude = long_.value

  const response = await fetch('/api/registerParticipant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    form_resp.value = FormResponse.Error
    try {
      const resp = await response.json()
      form_resp_msg.value = resp.error || t('registerParticipant.popup.errorDefault')
    } catch {
      form_resp_msg.value = t('registerParticipant.popup.errorDefault')
    }
  } else {
    form_resp.value = FormResponse.Success
    form_resp_msg.value = t('registerParticipant.popup.successDesc')
    emit('registered')
  }
}

function onPopupClose() {
  form_resp.value = FormResponse.None
}
</script>

<template>
  <div v-if="form_resp == FormResponse.Error">
    <PopUp :title="t('registerParticipant.popup.errorTitle')" :message="form_resp_msg" type='error' @close='onPopupClose' />
  </div>
  <div v-if="form_resp == FormResponse.Success">
    <PopUp :title="t('registerParticipant.popup.successTitle')" :message="form_resp_msg" type='success' @close='onPopupClose' />
  </div>
  <div class="register-participant">
    <Card collapsible :default-expanded="false" :title="$t('registerParticipant.toggle')">
      <form @submit.prevent="submitForm" class="register-participant__form">
        <div class="register-participant__row">
          <div class="register-participant__field">
            <label for="reg-first-name">{{ $t('registerParticipant.contact.firstName') }}</label>
            <input id="reg-first-name" type="text" v-model="firstName" required />
          </div>

          <div class="register-participant__field">
            <label for="reg-last-name">{{ $t('registerParticipant.contact.lastName') }}</label>
            <input id="reg-last-name" type="text" v-model="lastName" required />
          </div>
        </div>

        <div class="register-participant__field">
          <label for="reg-email">{{ $t('registerParticipant.contact.email') }}</label>
          <input id="reg-email" type="email" v-model="email" required />
        </div>

        <h3 class="register-participant__section-title">{{ $t('registerParticipant.details.title') }}</h3>

        <div class="register-participant__field">
          <label for="reg-mode">{{ $t('registerParticipant.details.mode') }}</label>
          <select id="reg-mode" v-model="mode" required>
            <option value="driver">{{ $t('registerParticipant.details.driver') }}</option>
            <option value="passenger">{{ $t('registerParticipant.details.passenger') }}</option>
          </select>
        </div>

        <div class="register-participant__field">
          <label for="reg-phone">{{ $t('registerParticipant.details.phoneNumber') }}</label>
          <input id="reg-phone" type="tel" v-model="phoneNumber" />
        </div>

        <div class="register-participant__field">
          <label for="reg-comments">{{ $t('registerParticipant.details.comments') }}</label>
          <textarea id="reg-comments" v-model="comments" rows="3" :placeholder="$t('registerParticipant.details.commentsPlaceholder')"></textarea>
        </div>

        <LocationPicker
          :label="t('registerParticipant.details.location')"
          :placeholder="t('common.address.placeholder')"
          :mainMarkerLabel="t('registerParticipant.markerLabel')"
          @location-selected="onLocationSelected"
        />

        <input type="hidden" name="reg-lat" :value="lat" />
        <input type="hidden" name="reg-long" :value="long_" />

        <div class="register-participant__checkboxes">
          <label class="register-participant__checkbox">
            <input type="checkbox" v-model="hideEmail" />
            {{ $t('registerParticipant.details.hideEmail') }}
          </label>

          <label class="register-participant__checkbox">
            <input type="checkbox" v-model="notifyMe" />
            {{ $t('registerParticipant.details.notifyMe') }}
          </label>
        </div>

        <div class="register-participant__actions">
          <button type="submit" class="btn-primary">{{ $t('registerParticipant.submit') }}</button>
        </div>
      </form>
    </Card>
  </div>
</template>

<style scoped>
.register-participant {
  max-width: 650px;
  margin: 0 auto;
}

.register-participant__section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary-orange);
  color: var(--color-text-dark);
}

.register-participant__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-participant__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.register-participant__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.register-participant__field:last-child {
  margin-bottom: 0;
}

.register-participant__field label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-dark);
}

.register-participant__field input,
.register-participant__field textarea,
.register-participant__field select {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.register-participant__field input:focus,
.register-participant__field textarea:focus,
.register-participant__field select:focus {
  border-color: var(--color-primary-green);
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
}

.register-participant__checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.register-participant__checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  color: var(--color-text-dark);
  cursor: pointer;
}

.register-participant__actions {
  text-align: center;
  padding-top: 0.5rem;
}

.register-participant__actions .btn-primary {
  min-width: 200px;
}

@media (max-width: 600px) {
  .register-participant__row {
    grid-template-columns: 1fr;
  }
}
</style>
