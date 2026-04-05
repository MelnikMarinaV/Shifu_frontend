<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

onMounted(() => {
  auth.bootstrap(); // refresh token + fetch user if a session exists
});
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>
