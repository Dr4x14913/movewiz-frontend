
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from '../api'
import Spinner from './Spinner.vue'

const props = withDefaults(defineProps<{
  title: string
  placeholder: string
  inputId?: string
  endpoint?: string
  refreshCount?: number
}>(), {
  inputId: 'captcha',
  endpoint: '/generate-captcha',
  refreshCount: 0,
})

const image = ref('')
const token = ref('')
const value = ref('')

async function fetchCaptcha() {
  try {
    const res = await api(`${props.endpoint}?_t=${Date.now()}`, { cache: 'no-store' })
    const data = await res.json()
    token.value = data.token
    image.value = 'data:image/png;base64,' + data.image
  } catch (e) {
    console.error(e)
  }
}

function refresh() {
  value.value = ""
  fetchCaptcha()
}

onMounted(() => {
  fetchCaptcha()
})

watch(() => props.refreshCount, () => {
  refresh()
})

defineExpose({ token, value })
</script>

<template>
  <div class="captcha-input">
    <div class="captcha-input__captcha">
      <div class="captcha-input__row">
        <img
          v-if="image"
          :src="image"
          alt="Captcha image"
          class="captcha-input__captcha-img"
        />
        <p v-else class="captcha-input__captcha-loading">
          <Spinner :size="16" />
        </p>
        <button type="button" class="captcha-input__refresh" @click="refresh" :title="$t('common.captcha.refresh')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2v6h-6"/>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
            <path d="M3 22v-6h6"/>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
        </button>
      </div>
      <div class="captcha-input__actions">
        <input
          :id="inputId"
          type="text"
          v-model="value"
          :placeholder="placeholder"
        />
      </div>
    </div>
  </div>
</template>


<style scoped>
.captcha-input__captcha {
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 0.75rem;
}

.captcha-input__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.captcha-input__captcha-img {
  height: 48px;
  border-radius: 8px;
  border: 1px solid var(--color-input-border);
}

.captcha-input__captcha-loading {
  color: var(--color-text-medium);
  font-style: italic;
  display: flex;
  align-items: center;
}

.captcha-input__actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 280px;
}

.captcha-input__actions input {
  flex: 1;
}

.captcha-input__refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-input-border);
  border-radius: 8px;
  background: var(--color-input-bg);
  color: var(--color-text-medium);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
  flex-shrink: 0;
}

.captcha-input__refresh:hover {
  border-color: var(--color-primary-green);
  color: var(--color-primary-green);
  background-color: hsla(87, 47%, 56%, 0.08);
}
</style>
