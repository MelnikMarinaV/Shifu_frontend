<script setup>
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const menuItems = [
  { label: "Главная", icon: "🏠", to: { name: "lessons" } },
  {
    label: "Уроки",
    icon: "📖",
    to: { name: "lessons-page" },
    activeOn: "lessons-page",
  },
  { label: "Записи", icon: "🎤", to: { name: "my-submissions" } },
  {
    label: "Настройки",
    icon: "⚙️",
    to: { name: "settings" },
    activeOn: "settings",
  },
];

const isActive = (item) => route.name === item.to.name;
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <RouterLink :to="{ name: 'lessons' }" class="brand">
        <div class="brand-logo-wrap">
          <img
            class="brand-logo"
            src="../pictures/logo-no-background.png"
            alt="Shifu"
          />
        </div>

        <div class="brand-text">
          <h2>SHIFU</h2>
          <p>Твой путь к китайскому</p>
        </div>
      </RouterLink>

      <nav class="menu">
        <RouterLink
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          class="menu-item"
          :class="{ active: isActive(item) }"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>

    <div class="motivation-card">
      <div class="motivation-text">
        <p>
          Учить китайский<br />
          это путешествие,<br />
          а не гонка.
        </p>
        <span>加油!</span>
      </div>

      <img class="panda-image" src="@/pictures/panda-card.png" alt="Панда" />
    </div>
  </aside>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.sidebar {
  width: 290px;
  min-width: 290px;
  min-height: 100vh;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  background: rgba(255, 255, 255, 0.72);
  border-right: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 6px 0 24px rgba(83, 61, 47, 0.04);
  backdrop-filter: blur(10px);
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-logo-wrap {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fff8f5;
  border: 1px solid #efd8cf;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.brand-text h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d2723;
}

.brand-text p {
  margin: 4px 0 0;
  font-size: 0.82rem;
  color: #7c726b;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  height: 50px;
  padding: 0 14px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: #433b35;
  transition: 0.22s ease;
}

.menu-item:hover {
  background: #faf3ef;
}

.menu-item.active {
  background: #f8e8e0;
  color: #c14b3d;
  font-weight: 700;
}

.menu-icon {
  width: 24px;
  display: inline-flex;
  justify-content: center;
  font-size: 1.1rem;
  line-height: 1;
}

.menu-label {
  font-size: 0.98rem;
}

.motivation-card {
  min-height: 150px;
  border-radius: 22px;
  background: #fefcf8;
  border: 1px solid #efe4db;
  box-shadow: 0 10px 28px rgba(83, 61, 47, 0.06);
  padding: 18px 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.motivation-text p {
  margin: 0 0 12px;
  font-size: 1rem;
  line-height: 1.5;
  color: #2f2a26;
}

.motivation-text span {
  font-size: 1.7rem;
  color: #c63f35;
  font-weight: 700;
}

.panda-image {
  width: 92px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}

@media (max-width: 980px) {
  .sidebar {
    width: 100%;
    min-width: 100%;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(120, 96, 80, 0.08);
  }
}
</style>
