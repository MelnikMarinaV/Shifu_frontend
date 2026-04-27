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

const currentCourse = computed(() => {
  return courses.value.length ? courses.value[0] : null;
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";

    const courseResponse = await api.get("/api/courses/");
    courses.value = courseResponse.data.courses || [];

    if (courses.value.length > 0) {
      const courseId = courses.value[0].id;
      const lessonsResponse = await api.get(`/api/lessons/${courseId}/`);
      lessons.value = lessonsResponse.data.lessons || [];
    }
  } catch (err) {
    console.error("Error fetching items", err);
    error.value = "Не удалось загрузить уроки. Попробуйте ещё раз.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page-layout">
    <SideBar />

    <main class="page-content">
      <AppHeader
        :logoTo="{ name: 'lessons' }"
        :clickableNameTo="{ name: 'my-submissions' }"
      />

      <section class="hero">
        <div class="hero-content">
          <p class="hero-label">Платформа для подготовки к HSK</p>

          <h1 class="hero-title">
            {{ currentCourse ? currentCourse.title : "Уроки китайского" }}
          </h1>

          <p class="hero-text">
            Выберите урок и продолжите обучение в удобном темпе. Последовательно
            изучайте материал и переходите к следующим темам.
          </p>
        </div>
      </section>

      <section class="lessons-section">
        <div class="section-header">
          <div>
            <h2>Список уроков</h2>
            <p>Все доступные уроки курса</p>
          </div>

          <div class="lessons-count">
            {{ lessons.length }} урок{{
              lessons.length === 1 ? "" : lessons.length < 5 ? "а" : "ов"
            }}
          </div>
        </div>

        <div v-if="loading" class="state-card">Загрузка уроков...</div>

        <div v-else-if="error" class="state-card error-state">
          {{ error }}
        </div>

        <div v-else-if="!lessons.length" class="state-card">
          Пока уроков нет.
        </div>

        <div v-else class="lessons-grid">
          <RouterLink
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            :to="`/lesson/${lesson.id}`"
            class="lesson-card"
          >
            <div class="lesson-card-top">
              <div class="lesson-number">
                {{ String(index + 1).padStart(2, "0") }}
              </div>
              <div class="lesson-chip">HSK</div>
            </div>

            <h3 class="lesson-title">{{ lesson.title }}</h3>

            <p class="lesson-description">
              Откройте урок, чтобы изучить новый материал и перейти к заданиям.
            </p>

            <div class="lesson-link">
              Перейти к уроку
              <span>→</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page-layout {
  display: flex;
  min-height: 100vh;
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

.page-content {
  flex: 1;
  padding: 24px;
  overflow-x: hidden;
}

.hero {
  margin-top: 20px;
  padding: 36px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background:
    linear-gradient(rgba(248, 244, 239, 0.75), rgba(248, 244, 239, 0.84)),
    url("../pictures/login-background.png") right center / cover no-repeat;
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 18px 50px rgba(83, 61, 47, 0.08);
}

.hero-content {
  max-width: 700px;
}

.hero-label {
  margin: 0 0 12px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #b05e43;
  font-weight: 700;
}

.hero-title {
  margin: 0 0 14px;
  font-size: 2.7rem;
  line-height: 1.1;
  color: #2d2723;
}

.hero-text {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.75;
  color: #615852;
  max-width: 620px;
}

.lessons-section {
  margin-top: 24px;
  padding: 28px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 18px 50px rgba(83, 61, 47, 0.06);
  backdrop-filter: blur(10px);
}

.section-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-header h2 {
  margin: 0 0 8px;
  font-size: 1.8rem;
  color: #2d2723;
}

.section-header p {
  margin: 0;
  color: #7c726b;
  font-size: 1rem;
}

.lessons-count {
  padding: 10px 16px;
  border-radius: 999px;
  background: #fff4f1;
  border: 1px solid #f0d4cc;
  color: #b05e43;
  font-weight: 700;
  white-space: nowrap;
}

.lessons-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.lesson-card {
  display: block;
  text-decoration: none;
  padding: 24px;
  border-radius: 24px;
  background: linear-gradient(180deg, #fffdfa 0%, #f8f4ef 100%);
  border: 1px solid #efe2d8;
  box-shadow: 0 12px 28px rgba(83, 61, 47, 0.06);
  transition: 0.25s ease;
}

.lesson-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(83, 61, 47, 0.1);
  border-color: #e6cabc;
}

.lesson-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.lesson-number {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c84d3e;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.lesson-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: #fff1ec;
  color: #c14b3d;
  border: 1px solid #f2d3c9;
  font-size: 0.85rem;
  font-weight: 700;
}

.lesson-title {
  margin: 0 0 12px;
  color: #2d2723;
  font-size: 1.35rem;
  line-height: 1.35;
}

.lesson-description {
  margin: 0 0 18px;
  color: #6c625a;
  line-height: 1.65;
  font-size: 0.98rem;
}

.lesson-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c14b3d;
  font-weight: 700;
}

.state-card {
  padding: 18px 20px;
  border-radius: 18px;
  background: #fff9f6;
  border: 1px solid #efe2d8;
  color: #5f5650;
}

.error-state {
  background: #fff1ef;
  border-color: #f0c8c2;
  color: #b34033;
}

@media (max-width: 1100px) {
  .lessons-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 980px) {
  .page-layout {
    flex-direction: column;
  }

  .page-content {
    padding: 18px;
  }

  .hero {
    margin-top: 18px;
    flex-direction: column;
    align-items: flex-start;
    padding: 26px;
  }

  .hero-title {
    font-size: 2.1rem;
  }

  .hero-badge {
    width: 82px;
    height: 82px;
    font-size: 2.2rem;
  }

  .lessons-section {
    padding: 20px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-text {
    font-size: 1rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .lesson-card {
    padding: 20px;
  }
}
</style>
