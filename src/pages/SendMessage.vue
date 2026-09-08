<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../api'
import Card from '../components/Card.vue'
import Turnstile from '../components/Turnstile.vue'
import PopUp from '../components/PopUp.vue'
import FormLayout from '../components/FormLayout.vue'
import { useI18n } from 'vue-i18n'
import { router } from '../router'

enum FormResponse {
  Error,
  Success,
  None,
}

const { t, locale } = useI18n()

const props = defineProps<{
  token?: string
}>()

const senderEmail = ref('')
const message = ref('')
const turnstileSiteKey: string = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const turnstileWidget = ref<InstanceType<typeof Turnstile> | null>(null)
const turnstileToken = ref('')
const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')
const isSubmitting = ref(false)

async function submitForm() {
  isSubmitting.value = true
  try {
    const response = await api('/api/contactParticipant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactToken: props.token,
        turnstileToken: turnstileToken.value || turnstileWidget.value?.getResponse() || '',
        senderEmail: senderEmail.value,
        message: message.value,
        language: locale.value,
      }),
    })
    if (!response.ok) {
      form_resp.value = FormResponse.Error
      if (response.status === 429) {
        form_resp_msg.value = t('sendMessage.popup.tooManyRequests')
      } else {
        try {
          const resp = await response.json()
          form_resp_msg.value = resp.error || t('sendMessage.popup.errorDefault')
        } catch {
          form_resp_msg.value = t('sendMessage.popup.errorDefault')
        }
      }
    } else {
      form_resp.value = FormResponse.Success
      form_resp_msg.value = t('sendMessage.popup.successDesc')
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

function goBack() {
  router.back()
}
</script>

<template>
  <div v-if="form_resp == FormResponse.Error">
    <PopUp :title="t('sendMessage.popup.errorTitle')" :message="form_resp_msg" type="error" @close="onPopupClose" />
  </div>
  <div v-if="form_resp == FormResponse.Success">
    <PopUp :title="t('sendMessage.popup.successTitle')" :message="form_resp_msg" type="success" @close="onPopupClose" />
  </div>
  <div class="page send-message">
    <h1>{{ $t('sendMessage.title') }}</h1>

    <FormLayout :submitting="isSubmitting" @submit="submitForm">
      <div class="send-message__cards">
        <Card variant="borderless"">
          <div class="send-message__row">
            <div class="send-message__field">
              <label for="sender-email">{{ $t('sendMessage.senderEmail') }}</label>
              <input id="sender-email" type="email" v-model="senderEmail" required />
            </div>

            <div class="send-message__field">
              <label for="message">{{ $t('sendMessage.message') }}</label>
              <textarea id="message" v-model="message" rows="5" required :placeholder="$t('sendMessage.messagePlaceholder')"></textarea>
            </div>

            <Turnstile
              ref="turnstileWidget"
              :sitekey="turnstileSiteKey"
              @token="turnstileToken = $event"
            />
          </div>
        </Card>
      </div>

      <template #actions>
        <div class="send-message__actions">
          <button type="button" class="btn-secondary" @click="goBack()">{{ $t('common.back') }}</button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ $t('sendMessage.submit') }}</button>
        </div>
      </template>
    </FormLayout>
  </div>
</template>

<style scoped>
.send-message h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.send-message__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  flex: 0 0 100%;
}

.send-message__form-card {
  flex: 1;
  min-width: 500px;
  overflow: visible;
  margin-top: 0;
}

.send-message__form input,
.send-message__form textarea {
  padding: 0.625rem 1rem;
}

.send-message__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.send-message__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.send-message__field:last-child {
  margin-bottom: 0;
}

.send-message__field label {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-dark);
}

.send-message__field input,
.send-message__field textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.send-message__field input:focus,
.send-message__field textarea:focus {
  border-color: var(--color-primary-green);
  box-shadow: 0 0 0 3px rgba(139, 195, 74, 0.2);
}

.send-message__actions {
  text-align: center;
  gap: 1rem;
  display: flex;
  justify-content: center;
}

.send-message__actions .btn-primary {
  min-width: 150px;
}

.send-message__actions .btn-secondary {
  min-width: 150px;
}

@media (max-width: 600px) {
  .send-message__actions {
    flex-direction: column;
  }

  .send-message__form-card {
    min-width: 100%;
  }
  .send-message__row {
    grid-template-columns: 1fr;
  }

  .send-message__actions .btn-primary,
  .send-message__actions .btn-secondary {
    min-width: auto;
    width: 100%;
  }
}
</style>
