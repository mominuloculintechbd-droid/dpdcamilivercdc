<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-main class="pa-0">
      <RouterView />
    </v-main>
  </v-app>
</template>

<style>
html, body {
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 100vh;
}

.v-application {
  width: 100%;
}
</style>
