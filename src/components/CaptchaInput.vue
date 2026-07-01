
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
    const res = await api(props.endpoint, { cache: 'no-store' })
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
      <img
        v-if="image"
        :src="image"
        alt="Captcha image"
        class="captcha-input__captcha-img"
      />
      <p v-else class="captcha-input__captcha-loading">
        <Spinner :size="20" />
      </p>
      <div class="captcha-input__captcha-actions">
        <input
          :id="inputId"
          type="text"
          v-model="value"
          :placeholder="placeholder"
        />
        <button type="button" class="btn-secondary" @click="refresh">
          {{ $t("common.captcha.refresh") }}
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.captcha-input__captcha {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.captcha-input__captcha-img {
  max-width: 200px;
  border-radius: 8px;
  border: 1px solid var(--color-input-border);
}

.captcha-input__captcha-loading {
  color: var(--color-text-medium);
  font-style: italic;
  display: flex;
  align-items: center;
}

.captcha-input__captcha-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  max-width: 300px;
}

.captcha-input__captcha-actions input {
  flex: 1;
}

@media (max-width: 600px) {
  .captcha-input__captcha-actions {
    flex-direction: column;
    max-width: 100%;
  }

  .captcha-input__captcha-actions .btn-secondary {
    width: 100%;
  }
}
</style>
