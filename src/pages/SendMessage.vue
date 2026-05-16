<script setup lang="ts">
import { ref } from 'vue'
import Card from '../components/Card.vue'
import CaptchaInput from '../components/CaptchaInput.vue'
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

const senderEmail = ref('')
const message = ref('')
const captcha = ref(null)
const captcha_refresh_count = ref(0)
const form_resp = ref(FormResponse.None)
const form_resp_msg = ref('')
const isSubmitting = ref(false)

async function submitForm() {
  isSubmitting.value = true
  try {
    const response = await fetch('/api/contactParticipant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactToken: props.token,
        captchaToken: captcha.value?.token,
        answer: captcha.value?.value,
        senderEmail: senderEmail.value,
        message: message.value,
      }),
    })
    captcha_refresh_count.value++
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
    <p class="send-message__subtitle">{{ $t('sendMessage.subtitle') }}</p>

    <div class="send-message__form-wrapper">
      <div v-if="isSubmitting" class="send-message__spinner-overlay">
        <Spinner :size="48" />
      </div>
      <form @submit.prevent="submitForm" class="send-message__form" :class="{ 'send-message__form--disabled': isSubmitting }">
        <Card variant="classic" :title="$t('sendMessage.title')">
          <div class="send-message__field">
            <label for="sender-email">{{ $t('sendMessage.senderEmail') }}</label>
            <input id="sender-email" type="email" v-model="senderEmail" required />
          </div>

          <div class="send-message__field">
            <label for="message">{{ $t('sendMessage.message') }}</label>
            <textarea id="message" v-model="message" rows="5" required :placeholder="$t('sendMessage.messagePlaceholder')"></textarea>
          </div>
        </Card>

        <Card :title="$t('common.captcha.title')">
          <CaptchaInput
            ref="captcha"
            :title="t('common.captcha.title')"
            :placeholder="t('common.captcha.placeholder')"
            :refreshCount="captcha_refresh_count"
          />
        </Card>

        <div class="send-message__actions">
          <button type="button" class="btn-secondary" @click="goBack()">{{ $t('common.clear') }}</button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ $t('sendMessage.submit') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.send-message h1 {
  color: var(--color-primary-green);
  margin-bottom: 0.25rem;
}

.send-message__subtitle {
  color: var(--color-text-medium);
  margin-bottom: 2rem;
  font-size: 1rem;
}

.send-message__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.send-message__form-wrapper {
  position: relative;
}

.send-message__spinner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(253, 252, 245, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.send-message__form--disabled {
  pointer-events: none;
  opacity: 0.5;
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

  .send-message__actions .btn-primary,
  .send-message__actions .btn-secondary {
    min-width: auto;
    width: 100%;
  }
}
</style>
