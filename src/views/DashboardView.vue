<script setup>
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
</script>

<template>
  <div>
    <p>Привет, {{ auth.user?.username }}</p>
    <button @click="auth.logout()">Выйти</button>
  </div>
</template>