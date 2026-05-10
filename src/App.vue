<script setup lang="ts">
import { router } from './router'
</script>

<template>
  <header>
  </header>
<nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/about">Go to About</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
