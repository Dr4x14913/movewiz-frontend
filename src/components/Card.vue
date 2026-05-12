<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  variant?: 'default' | 'borderless' | 'classic'
}>(), {
  variant: 'default',
})

const variantClass = computed(() => ({
  'card--borderless': props.variant === 'borderless',
  'card--classic': props.variant === 'classic'
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
  background-color: var(--color-card-bg);
  border: 2px solid var(--color-secondary-green);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.15);
}

.card--borderless:hover {
  box-shadow: none;
}

.card--borderless {
  border: none;
  border-radius: 0;
  padding: 1.5rem;
  background: transparent;
  box-shadow: none;
  animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Classic: traditional professional card — squarish, clean lines, green border */
.card--classic {
  border: 2px solid var(--color-secondary-green);
  border-radius: 8px;
  padding: 1.25rem;
  background-color: var(--color-card-bg);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.card--classic:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.12);
  border-color: var(--color-primary-green);
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
    transform: translateX(-40vw);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}


</style>
