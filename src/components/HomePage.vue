<script setup lang="ts">
import { ref } from 'vue'
import Card from './Card.vue'

const tagline = ref('Find and organize movie nights near you')
</script>

<template>
  <section class="hero">
    <h1 class="hero__title">MovieWiz</h1>
    <p class="hero__tagline">{{ tagline }}</p>
    <a href="#" class="btn-primary">Get Started</a>
  </section>

  <section class="features">
    <Card title="Discover Events">
      <p>Find movie screenings and gatherings in your area.</p>
      <a href="#" class="btn-secondary">Learn More</a>
    </Card>

    <Card title="Create Events">
      <p>Organize your own movie night with friends.</p>
      <a href="/create" class="btn-accent">Create Now</a>
    </Card>
  </section>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--color-bg-cream);
}

.hero__title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-primary-green);
  margin-bottom: 1rem;
}

.hero__tagline {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--color-text-medium);
  margin-bottom: 2rem;
}

.features {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 2rem;
  flex-wrap: wrap;
}


</style>
