<script setup>
import { RouterLink } from "vue-router";
import { ref, onMounted, computed } from "vue";
import api from "@/api/http";
import AppHeader from "@/components/AppHeader.vue";
import SideBar from "@/components/SideBar.vue";

const courses = ref([]);
const lessons = ref([]);
const loading = ref(true);
const error = ref("");

const searchQuery = ref("");
const selectedLevel = ref("all");

const lessonImages = ["🎋", "🏮", "🖌️", "🍵", "🪭", "🏯", "🐼", "🌸"];

const getLessonIcon = (index) => {
  return lessonImages[index % lessonImages.length];
};

const filteredLessons = computed(() => {
  return lessons.value.filter((lesson) => {
    const matchesSearch = lesson.title
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    return matchesSearch;
  });
});

onMounted(async () => {
  try {
    loading.value = true;

    const courseResponse = await api.get("/api/courses/");
    courses.value = courseResponse.data.courses || [];

    if (courses.value.length > 0) {
      const courseId = courses.value[0].id;
      const lessonsResponse = await api.get(`/api/lessons/${courseId}/`);
      lessons.value = lessonsResponse.data.lessons || [];
    }
  } catch (err) {
    console.error("Error fetching lessons", err);
    error.value = "Не удалось загрузить уроки";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="lessons-layout">
    <SideBar />

    <main class="lessons-content">
      <AppHeader
        :logoTo="{ name: 'lessons-page' }"
        :clickableNameTo="{ name: 'my-submissions' }"
      />

      <section class="page-title">
        <div>
          <h1>Уроки</h1>
          <p>Выбирайте урок и продолжайте обучение</p>
        </div>
      </section>

      <section class="hero-card">
        <div class="hero-text">
          <div class="hero-icon">📖</div>
          <h2>Продолжайте изучать китайский</h2>
          <p>Постоянство — ключ к успеху!</p>
        </div>
      </section>

      <section class="filters">
        <div class="search-box">
          <span>🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск уроков..."
          />
        </div>

        <select v-model="selectedLevel">
          <option value="all">Все уровни</option>
          <option value="hsk1">HSK 1</option>
          <option value="hsk2">HSK 2</option>
        </select>
      </section>

      <section v-if="loading" class="state-card">Загрузка уроков...</section>

      <section v-else-if="error" class="state-card error">
        {{ error }}
      </section>

      <section v-else-if="!filteredLessons.length" class="state-card">
        Уроки не найдены.
      </section>

      <section v-else class="lessons-grid">
        <RouterLink
          v-for="(lesson, index) in filteredLessons"
          :key="lesson.id"
          :to="`/lesson/${lesson.id}`"
          class="lesson-card"
        >
          <div class="lesson-top">
            <div class="lesson-image">
              {{ getLessonIcon(index) }}
            </div>

            <div class="lesson-info">
              <h3>{{ index + 1 }}. {{ lesson.title }}</h3>
              <span class="lesson-level">
                {{ index < 3 ? "Новичок" : "Базовый" }}
              </span>
            </div>
          </div>

          <div class="lesson-progress">
            <div class="progress-head">
              <span>Прогресс</span>
              <span>{{ index < 3 ? 80 - index * 20 : 0 }}%</span>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${index < 3 ? 80 - index * 20 : 0}%` }"
              ></div>
            </div>
          </div>

          <div class="lesson-button">
            {{ index < 3 ? "Продолжить" : "Начать урок" }}
          </div>
        </RouterLink>
      </section>

      <section class="bottom-note">
        <div>
          <strong>Учитесь регулярно и не забывайте повторять материал.</strong>
          <p>Удачи в изучении!</p>
        </div>

        <button>🏆 Мои достижения</button>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.lessons-layout {
  min-height: 100vh;
  display: flex;
  background:
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
}

.lessons-content {
  flex: 1;
  padding: 24px;
}

.page-title {
  margin: 28px 0 22px;
}

.page-title h1 {
  margin: 0 0 8px;
  font-size: 2.6rem;
  color: #2d2723;
}

.page-title p {
  margin: 0;
  color: #7c726b;
  font-size: 1.05rem;
}

.hero-card {
  min-height: 210px;
  padding: 34px;
  border-radius: 30px;
  background:
    linear-gradient(rgba(248, 244, 239, 0.66), rgba(248, 244, 239, 0.76)),
    url("../pictures/login-background.png") right center / cover no-repeat;
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 18px 50px rgba(83, 61, 47, 0.08);
  display: flex;
  align-items: center;
}

.hero-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff8f5;
  border: 1px solid #efd8cf;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 18px;
}

.hero-text h2 {
  margin: 0 0 10px;
  color: #2d2723;
  font-size: 1.9rem;
}

.hero-text p {
  margin: 0;
  color: #615852;
  font-size: 1.05rem;
}

.filters {
  margin: 28px 0 24px;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 18px;
}

.search-box {
  height: 58px;
  padding: 0 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid #e7ddd4;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #2f2a26;
  font-size: 1rem;
}

.search-box input::placeholder {
  color: #a59a92;
}

.filters select {
  height: 58px;
  padding: 0 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid #e7ddd4;
  color: #2f2a26;
  font-size: 1rem;
  outline: none;
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.lesson-card {
  padding: 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 16px 42px rgba(83, 61, 47, 0.06);
  text-decoration: none;
  color: inherit;
  transition: 0.25s ease;
}

.lesson-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 50px rgba(83, 61, 47, 0.12);
  border-color: #e8b7aa;
}

.lesson-top {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 26px;
}

.lesson-image {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: #f3eadc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  flex-shrink: 0;
}

.lesson-info h3 {
  margin: 0 0 12px;
  font-size: 1.3rem;
  line-height: 1.35;
  color: #2d2723;
}

.lesson-level {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eaf4e7;
  color: #4f8a55;
  font-size: 0.9rem;
  font-weight: 700;
}

.lesson-progress {
  margin-bottom: 18px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #5f5650;
  font-size: 0.95rem;
}

.progress-bar {
  height: 9px;
  border-radius: 999px;
  background: #f1ddd6;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #c84d3e;
}

.lesson-button {
  height: 46px;
  border-radius: 15px;
  border: 1.5px solid #e8b7aa;
  color: #c84d3e;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-card:hover .lesson-button {
  background: #c84d3e;
  color: #fff;
  border-color: #c84d3e;
}

.bottom-note {
  margin-top: 28px;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(120, 96, 80, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.bottom-note strong {
  color: #2d2723;
}

.bottom-note p {
  margin: 8px 0 0;
  color: #c84d3e;
  font-weight: 700;
}

.bottom-note button {
  height: 50px;
  padding: 0 24px;
  border-radius: 16px;
  border: 1.5px solid #e8b7aa;
  background: transparent;
  color: #c84d3e;
  font-weight: 700;
  cursor: pointer;
}

.state-card {
  padding: 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(120, 96, 80, 0.08);
  color: #5f5650;
}

.state-card.error {
  background: #fff1ef;
  color: #b34033;
}

@media (max-width: 1200px) {
  .lessons-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .lessons-layout {
    flex-direction: column;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .lessons-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .lessons-content {
    padding: 18px;
  }

  .page-title h1 {
    font-size: 2rem;
  }

  .bottom-note {
    flex-direction: column;
    align-items: stretch;
  }

  .bottom-note button {
    width: 100%;
  }
}
</style>
