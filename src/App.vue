<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

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

<style>
:root.theme-light {
  --page-bg:
    radial-gradient(
      circle at top left,
      rgba(223, 164, 147, 0.18),
      transparent 30%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(186, 199, 182, 0.18),
      transparent 30%
    ),
    linear-gradient(180deg, #f7f3ee 0%, #f2eee8 100%);

  --card-bg: rgba(255, 255, 255, 0.76);
  --card-solid: #fffaf7;
  --inner-card: #fffdf9;
  --text-main: #2d2723;
  --text-muted: #7c726b;
  --border-soft: #efe2d8;
  --accent: #c84d3e;
  --accent-soft: #fff1ec;
}

:root.theme-dark {
  --page-bg:
    radial-gradient(
      circle at top left,
      rgba(200, 77, 62, 0.16),
      transparent 30%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(105, 130, 100, 0.12),
      transparent 30%
    ),
    linear-gradient(180deg, #161311 0%, #241f1c 100%);

  --card-bg: rgba(45, 39, 35, 0.88);
  --card-solid: #2f2925;
  --inner-card: #352e29;
  --text-main: #f7f0ea;
  --text-muted: #c7bab1;
  --border-soft: rgba(255, 255, 255, 0.09);
  --accent: #e46f5d;
  --accent-soft: rgba(228, 111, 93, 0.14);
}
</style>
