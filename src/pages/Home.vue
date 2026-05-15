<script setup lang="ts">
import Card from '../components/Card.vue'
</script>

<template>
  <section class="hero">
    <h1 class="hero__title">{{ $t('hero.title') }}</h1>
    <p class="hero__tagline">{{ $t('hero.tagline') }}</p>
    <a href="#" class="btn-primary">{{ $t('hero.getStarted') }}</a>
  </section>

  <section class="features">
    <Card :title="$t('features.discover.title')">
      <p>{{ $t('features.discover.desc') }}</p>
      <a href="#" class="btn-secondary">{{ $t('features.discover.btn') }}</a>
    </Card>

    <Card :title="$t('features.create.title')">
      <p>{{ $t('features.create.desc') }}</p>
      <a href="/create" class="btn-accent">{{ $t('features.create.btn') }}</a>
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
