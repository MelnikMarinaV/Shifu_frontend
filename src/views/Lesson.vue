<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AudioTask from "@/components/AudioTask.vue";
import CardTask from "@/components/CardTask.vue";
import api from "@/api/http";
import AppHeader from "@/components/AppHeader.vue";
import SideBar from "@/components/SideBar.vue";

const route = useRoute();
const router = useRouter();

const items = ref([]);
const description = ref("");
const title = ref("");
const loading = ref(true);
const error = ref("");
const submissions = ref([]);

const lessons = ref([]);

const currentLessonId = computed(() => Number(route.params.id));

const currentLessonIndex = computed(() => {
  return lessons.value.findIndex(
    (lesson) => lesson.id === currentLessonId.value,
  );
});

const lessonId = computed(() => {
  return currentLessonIndex.value >= 0
    ? currentLessonIndex.value + 1
    : currentLessonId.value;
});

const nextLesson = computed(() => {
  return lessons.value[currentLessonIndex.value + 1] || null;
});

const previousLesson = computed(() => {
  return lessons.value[currentLessonIndex.value - 1] || null;
});

const completedTasks = computed(() => {
  return items.value.filter((task) =>
    submissions.value.some((submission) => submission.task === task.id),
  ).length;
});

const progress = computed(() => {
  if (!items.value.length) return 0;
  return Math.round((completedTasks.value / items.value.length) * 100);
});

const loadLessonsList = async () => {
  const courseResponse = await api.get("/api/courses/");
  const courses = courseResponse.data.courses || [];

  if (!courses.length) return;

  const courseId = courses[0].id;
  const lessonsResponse = await api.get(`/api/lessons/${courseId}/`);
  lessons.value = lessonsResponse.data.lessons || [];
};

const loadLesson = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get(`/api/tasks/${route.params.id}/`);
    const data = response.data;

    description.value = data.description || "";
    title.value = data.title || "Урок";
    items.value = data.tasks || [];
  } catch (err) {
    console.error("Error fetching items", err);
    error.value = "Не удалось загрузить урок.";
  } finally {
    loading.value = false;
  }
};

const loadSubmissions = async () => {
  try {
    const response = await api.get("/api/my-submissions/", {
      params: { t: Date.now() },
    });

    submissions.value = response.data.submissions || [];
  } catch (err) {
    console.error("Error fetching submissions", err);
  }
};

const goPrevious = () => {
  if (!previousLesson.value) return;

  router.push({
    name: "lesson-detail",
    params: { id: previousLesson.value.id },
  });
};

const goNext = () => {
  if (!nextLesson.value) return;

  router.push({
    name: "lesson-detail",
    params: { id: nextLesson.value.id },
  });
};

onMounted(async () => {
  await loadLessonsList();
  await loadLesson();
  await loadSubmissions();
});

watch(
  () => route.params.id,
  async () => {
    await loadLesson();
    await loadSubmissions();
  },
);
</script>

<template>
  <div class="lesson-layout">
    <SideBar />

    <main class="lesson-content">
      <AppHeader
        :logoTo="{ name: 'lessons-page' }"
        :clickableNameTo="{ name: 'my-submissions' }"
      />

      <div class="breadcrumbs">
        <RouterLink :to="{ name: 'lessons-page' }">Уроки</RouterLink>
        <span>›</span>
        <span>HSK 1</span>
        <span>›</span>
        <span>Урок {{ lessonId }}</span>
      </div>

      <section class="lesson-top">
        <div>
          <h1>{{ lessonId }}. {{ title }}</h1>
          <p>Изучите теорию и выполните задания</p>
        </div>

        <div class="progress-widget">
          <span>
            Ваш прогресс<br />
            <small>{{ completedTasks }} из {{ items.length }} заданий</small>
          </span>

          <div class="progress-circle">{{ progress }}%</div>
        </div>
      </section>

      <div v-if="loading" class="state-card">Загрузка урока...</div>

      <div v-else-if="error" class="state-card error">
        {{ error }}
      </div>

      <template v-else>
        <section class="content-card theory-card">
          <div class="card-title">
            <span class="title-icon red">📖</span>
            <div>
              <h2>Теория</h2>
              <p>Прочитайте материал урока и обратите внимание на примеры.</p>
            </div>
          </div>

          <div class="theory-inner">
            <div class="lesson-theory" v-html="description"></div>

            <div v-if="items.length" class="example-box">
              <p class="example-title">Примеры из урока:</p>

              <ul>
                <li v-for="item in items.slice(0, 3)" :key="item.id">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.task_description }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section class="content-card audio-card">
          <div class="card-title">
            <span class="title-icon green">🎧</span>
            <div>
              <h2>Аудиозадание</h2>
              <p>
                Прослушайте фразу и повторите её. Затем запишите свой ответ.
              </p>
            </div>
          </div>

          <div class="audio-list" v-if="items.length">
            <div v-for="item in items" :key="item.id" class="audio-task-shell">
              <AudioTask
                :initial_text="item.title"
                :pinini="item.task_description"
                :task_id="item.id"
              />
            </div>
          </div>

          <div class="tip-box">
            💡 Совет: произносите чётко и с правильной интонацией.
          </div>
        </section>

        <section class="content-card drag-card">
          <div class="card-title">
            <span class="title-icon grey">🧩</span>
            <div>
              <h2>Задание: сопоставьте карточки</h2>
              <p>Соотнесите китайские выражения с их переводом.</p>
            </div>
          </div>

          <div class="card-task-wrapper">
            <CardTask :items="items" />
          </div>

          <div class="success-box">
            ✅ Найдите все пары, чтобы закрепить материал.
          </div>
        </section>

        <div class="lesson-navigation">
          <button
            class="nav-btn secondary"
            :disabled="!previousLesson"
            @click="goPrevious"
          >
            ← Назад
          </button>

          <button
            class="nav-btn primary"
            :disabled="!nextLesson"
            @click="goNext"
          >
            Далее →
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.lesson-layout {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(
      circle at top left,
      rgba(223, 164, 147, 0.16),
      transparent 30%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(186, 199, 182, 0.14),
      transparent 30%
    ),
    linear-gradient(180deg, #f7f3ee 0%, #f2eee8 100%);
}

.lesson-content {
  flex: 1;
  min-width: 0;
  padding: 24px;
}

.breadcrumbs {
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7c726b;
  font-size: 0.95rem;
}

.breadcrumbs a {
  color: #5f5650;
  text-decoration: none;
  font-weight: 600;
}

.breadcrumbs a:hover {
  color: #c84d3e;
}

.lesson-top {
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.lesson-top h1 {
  margin: 0 0 10px;
  font-size: 2.6rem;
  color: #2d2723;
}

.lesson-top p {
  margin: 0;
  color: #7c726b;
  font-size: 1.05rem;
}

.progress-widget {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #544b44;
  font-weight: 600;
}

.progress-widget small {
  color: #7c726b;
  font-weight: 500;
}

.progress-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 6px solid #6ca06d;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fffaf7;
  color: #2d2723;
  font-weight: 800;
}

.content-card,
.state-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 18px 50px rgba(83, 61, 47, 0.07);
  border-radius: 30px;
}

.content-card {
  padding: 26px;
  margin-bottom: 24px;
}

.state-card {
  padding: 24px;
  color: #5f5650;
}

.state-card.error {
  background: #fff1ef;
  color: #b34033;
}

.card-title {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.card-title h2 {
  margin: 0;
  color: #2d2723;
  font-size: 1.55rem;
}

.card-title p {
  margin: 6px 0 0;
  color: #7c726b;
  line-height: 1.5;
}

.title-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.title-icon.red {
  background: #fff1ec;
  color: #c84d3e;
}

.title-icon.green {
  background: #eaf4e7;
  color: #5d915c;
}

.title-icon.grey {
  background: #f1eee9;
  color: #5f5650;
}

.theory-card {
  width: 100%;
}

.theory-inner {
  width: 100%;
  padding: 26px;
  border-radius: 24px;
  border: 1px solid #efe2d8;
  background: #fffdf9;
}

.lesson-theory {
  width: 100%;
  max-width: none;
  color: #4f4741;
  line-height: 1.8;
  font-size: 1.05rem;
}

.lesson-theory :deep(p) {
  margin: 0 0 14px;
}

.lesson-theory :deep(h2),
.lesson-theory :deep(h3) {
  color: #2d2723;
  margin: 16px 0 10px;
}

.lesson-theory :deep(.characters) {
  color: #c84d3e;
  background: #fff1ec;
  padding: 2px 8px;
  border-radius: 10px;
}

.example-box {
  width: 100%;
  margin-top: 22px;
  padding: 18px;
  border-radius: 18px;
  background: #f7f7eb;
  border: 1px solid #e4e4d0;
}

.example-title {
  margin: 0 0 12px;
  color: #4f8a55;
  font-weight: 700;
}

.example-box ul {
  margin: 0;
  padding-left: 20px;
  color: #4f4741;
}

.example-box li {
  margin-bottom: 10px;
  line-height: 1.5;
}

.example-box strong {
  margin-right: 10px;
  color: #2d2723;
}

.audio-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audio-task-shell {
  display: flex;
  justify-content: center;
  padding: 18px;
  border-radius: 22px;
  background: #fffdf9;
  border: 1px solid #efe2d8;
}

.tip-box {
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #fff8e9;
  border: 1px solid #f0dfb7;
  color: #5f5650;
}

.card-task-wrapper {
  padding: 20px;
  border-radius: 24px;
  background: #fffdf9;
  border: 1px solid #efe2d8;
}

.success-box {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #edf7eb;
  border: 1px solid #d2e8ce;
  color: #4f8a55;
  font-weight: 600;
}

.lesson-navigation {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.nav-btn {
  height: 58px;
  min-width: 170px;
  padding: 0 28px;
  border-radius: 18px;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.25s ease;
}

.nav-btn.secondary {
  background: transparent;
  color: #c84d3e;
  border: 1.5px solid #e8b7aa;
}

.nav-btn.secondary:hover {
  background: #fff5f1;
}

.nav-btn.primary {
  background: #c84d3e;
  color: white;
  border: none;
  box-shadow: 0 10px 24px rgba(200, 77, 62, 0.2);
}

.nav-btn.primary:hover {
  background: #b74234;
  transform: translateY(-1px);
}
.nav-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 980px) {
  .lesson-layout {
    flex-direction: column;
  }

  .lesson-content {
    padding: 18px;
  }

  .lesson-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .lesson-top h1 {
    font-size: 2rem;
  }
}

@media (max-width: 640px) {
  .content-card {
    padding: 18px;
    border-radius: 24px;
  }

  .theory-inner {
    padding: 18px;
  }

  .lesson-navigation {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
  }
}
</style>
