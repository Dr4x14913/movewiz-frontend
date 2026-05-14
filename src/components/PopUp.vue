<template>
  <Transition name="popup">
    <div v-if="show" class="popup-overlay" @click.self="onClose">
      <div class="popup" :class="`popup--${type}`">
        <div class="popup__icon">
          <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <h3 v-if="title" class="popup__title">{{ title }}</h3>
        <p v-if="html" class="popup__message" v-html="html"></p>
        <p v-else class="popup__message">{{ message }}</p>
        <button class="popup__close" @click="onClose" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue"
const props = withDefaults(defineProps<{
  message?: string
  title?: string
  html?: string
  type?: 'success' | 'error' | 'info'
  show?: boolean
}>(), {
  type: 'info',
  show: true,
  message: '',
  title: '',
  html: ''
})

const show = ref(props.show)

function onClose(){
  show.value = false
  emit('close')
}

const emit = defineEmits<{
  'close': []
}>()
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background: var(--color-bg-surface);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  border-top: 4px solid var(--color-text-medium);
}

.popup--success {
  border-top-color: var(--color-primary-green);
}

.popup--error {
  border-top-color: var(--color-primary-orange);
}

.popup--info {
  border-top-color: var(--color-text-medium);
}

.popup__icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup--success .popup__icon {
  color: var(--color-primary-green);
  background: var(--color-hover-bg);
}

.popup--error .popup__icon {
  color: var(--color-primary-orange);
  background: var(--color-hover-bg);
}

.popup--info .popup__icon {
  color: var(--color-text-medium);
  background: var(--color-hover-bg);
}

.popup__title {
  text-align: center;
  color: var(--color-text-dark);
  font-family: var(--font-heading);
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.popup__message {
  text-align: center;
  color: var(--color-text-dark);
  font-family: var(--font-body);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.popup__message a {
  color: var(--color-primary-green);
  text-decoration: underline;
}

.popup__message a:hover {
  color: var(--color-secondary-green);
}

.popup__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.popup__close:hover {
  background: var(--color-hover-bg);
  color: var(--color-text-dark);
}

.popup__close svg {
  width: 18px;
  height: 18px;
}

.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-active .popup,
.popup-leave-active .popup {
  transition: transform 0.3s ease;
}

.popup-enter-from .popup {
  transform: scale(0.9);
}

.popup-leave-to .popup {
  transform: scale(0.95);
}
</style>
