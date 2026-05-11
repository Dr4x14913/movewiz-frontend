<script setup lang="ts">
import { ref } from 'vue'

const tagline = ref('Find and organize movie nights near you')
</script>

<template>
  <section class="hero">
    <h1 class="hero__title">MovieWiz</h1>
    <p class="hero__tagline">{{ tagline }}</p>
    <a href="#" class="btn-primary">Get Started</a>
  </section>

  <section class="features">
    <div class="feature-card">
      <h2 class="feature-card__title">Discover Events</h2>
      <p class="feature-card__desc">Find movie screenings and gatherings in your area.</p>
      <a href="#" class="btn-secondary">Learn More</a>
    </div>

    <div class="feature-card">
      <h2 class="feature-card__title">Create Events</h2>
      <p class="feature-card__desc">Organize your own movie night with friends.</p>
      <a href="/create" class="btn-accent">Create Now</a>
    </div>
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

.feature-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid var(--color-secondary-green);
  text-align: center;
  max-width: 350px;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
}

.feature-card__title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin-bottom: 0.5rem;
}

.feature-card__desc {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-medium);
  margin-bottom: 1.5rem;
}
</style>
