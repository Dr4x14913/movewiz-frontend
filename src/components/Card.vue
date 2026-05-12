<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  variant?: 'default' | 'elevated' | 'outlined'
}>(), {
  variant: 'default',
})

const variantClass = computed(() => ({
  'card--elevated': props.variant === 'elevated',
  'card--outlined': props.variant === 'outlined'
}))
</script>

<template>
  <div class="card" :class="variantClass">
    <h2 v-if="title" class="card__title">{{ title }}</h2>
    <slot />
  </div>
</template>

<style scoped>
.card {
  background-color: #ffffff;
  border: 2px solid var(--color-secondary-green);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: cardEnter 0.4s ease-out both;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.15);
}

/* Elevated: floating premium card — no border, strong shadow, gradient bg */
.card--elevated {
  border: none;
  border-radius: 24px;
  padding: 2rem;
  background: linear-gradient(135deg, #ffffff 0%, var(--color-bg-cream) 100%);
  box-shadow:
    0 8px 32px rgba(46, 125, 50, 0.18),
    0 2px 8px rgba(0, 0, 0, 0.06);
}

.card--elevated:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 40px rgba(46, 125, 50, 0.25),
    0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Outlined: minimal card — thick orange border, subtle bg tint, small radius */
.card--outlined {
  border: 2.5px solid var(--color-primary-orange);
  border-radius: 12px;
  background-color: #fffbf7;
  box-shadow: 0 2px 8px rgba(216, 108, 31, 0.08);
}

.card--outlined:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(216, 108, 31, 0.18);
}

.card__title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary-orange);
  color: var(--color-text-dark);
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
