<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar__brand">
      <span class="navbar__brand-move">Move</span>
      <span class="navbar__brand-wiz">Wiz</span>
    </RouterLink>
    <div class="navbar__links">
      <RouterLink to="/" exact-active-class="active">Home</RouterLink>
      <RouterLink to="/about" exact-active-class="active">About</RouterLink>
      <RouterLink to="/create" exact-active-class="active">Create Event</RouterLink>
    </div>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--color-bg-cream);
  border-bottom: 2px solid var(--color-secondary-green);
  position: sticky;
  top: 0;
  z-index: 1100;
}

.navbar__brand {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 800;
  text-decoration: none;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
}

.navbar__brand:hover {
  opacity: 0.8;
}

.navbar__brand-move {
  color: var(--color-primary-orange);
}

.navbar__brand-wiz {
  color: var(--color-primary-green);
}

.navbar__links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.navbar__links a {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text-dark);
  text-decoration: none;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar__links a:hover {
  background-color: hsla(87, 47%, 56%, 0.15);
  color: var(--color-primary-green);
}

.navbar__links a.active {
  background-color: var(--color-primary-green);
  color: #ffffff;
}

@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }

  .navbar__links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
