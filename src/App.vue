<script setup lang="ts">
import { router } from './router'
</script>

<template>
  <header>
  </header>
<nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/about">Go to About</RouterLink>
    <RouterLink to="/create">Create an Event</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
