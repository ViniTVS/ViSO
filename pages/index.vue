<script setup lang="ts">

useHead({
  title: 'Inicio - VisualSO'
});

const route = useRoute();
</script>

<template>
  <h1>Nuxt Routing set up successfully!</h1>
  <p>Current route: {{ route.path }}</p>
  <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a>
</template>
