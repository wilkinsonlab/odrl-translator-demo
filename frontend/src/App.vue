<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

import IndexVue from "./components/Index.vue";
</script>

<template>
  <Suspense>
    <template #default><IndexVue /></template>
    <template #fallback>
      <span>Loading...</span>
    </template>
  </Suspense>
</template>

<style scoped></style>
