<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/api/http";
import AppHeader from "@/components/AppHeader.vue";
import SideBar from "@/components/SideBar.vue";

const submissions = ref([]);
const loading = ref(true);
const error = ref("");
const checkingId = ref(null);
const searchQuery = ref("");

const fetchSubmissions = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await api.get("/api/my-submissions/");
    submissions.value = response.data.submissions || [];
  } catch (e) {
    error.value = "Не удалось загрузить ваши записи.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const checkSubmission = async (submissionId) => {
  try {
    checkingId.value = submissionId;
    await api.post(`/api/submissions/${submissionId}/check-ai/`);
    await fetchSubmissions();
  } catch (e) {
    console.error("AI check error", e);
    alert("Не удалось выполнить ИИ-проверку.");
  } finally {
    checkingId.value = null;
  }
};
const deletingId = ref(null);

const deleteSubmission = async (submissionId) => {
  const confirmed = confirm("Удалить эту запись?");

  if (!confirmed) return;

  try {
    deletingId.value = submissionId;

    await api.delete(`/api/submissions/${submissionId}/delete/`);

    submissions.value = submissions.value.filter(
      (submission) => submission.id !== submissionId,
    );
  } catch (e) {
    console.error("Delete submission error", e);
    alert("Не удалось удалить запись.");
  } finally {
    deletingId.value = null;
  }
};

const filteredSubmissions = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return submissions.value.filter((submission) => {
    return (
      submission.course_title?.toLowerCase().includes(query) ||
      submission.lesson_title?.toLowerCase().includes(query) ||
      submission.task_title?.toLowerCase().includes(query) ||
      submission.transcript?.toLowerCase().includes(query)
    );
  });
});

const approvedCount = computed(() => {
  return submissions.value.filter((item) => item.ai_score >= 80).length;
});

const checkingCount = computed(() => {
  return submissions.value.filter(
    (item) => item.ai_status && item.ai_score === null,
  ).length;
});

const needsWorkCount = computed(() => {
  return submissions.value.filter(
    (item) => item.ai_score !== null && item.ai_score < 80,
  ).length;
});

const getStatusLabel = (submission) => {
  if (submission.ai_score === null || submission.ai_score === undefined) {
    return "Не проверено";
  }

  if (submission.ai_score >= 80) {
    return "Одобрено";
  }

  return "Требует доработки";
};

const getStatusClass = (submission) => {
  if (submission.ai_score === null || submission.ai_score === undefined) {
    return "pending";
  }

  if (submission.ai_score >= 80) {
    return "approved";
  }

  return "rework";
};

const getProgressStyle = (score) => {
  if (score === null || score === undefined) {
    return { "--score": "0%" };
  }

  return { "--score": `${score}%` };
};

onMounted(fetchSubmissions);
</script>

<template>
  <div class="submissions-layout">
    <SideBar />

    <main class="submissions-content">
      <AppHeader
        :logoTo="{ name: 'lessons-page' }"
        :clickableNameTo="{ name: 'my-submissions' }"
      />

      <section class="page-title">
        <div>
          <h1>Мои записи</h1>
          <p>Здесь хранятся ваши выполненные задания и аудиоответы</p>
        </div>
      </section>

      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">📄</div>
          <div>
            <p>Всего записей</p>
            <h2>{{ submissions.length }}</h2>
            <span>записи</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon approved">✓</div>
          <div>
            <p>Одобрено</p>
            <h2>{{ approvedCount }}</h2>
            <span>записей</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">⌛</div>
          <div>
            <p>На проверке</p>
            <h2>{{ checkingCount }}</h2>
            <span>записи</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rework">×</div>
          <div>
            <p>Требует доработки</p>
            <h2>{{ needsWorkCount }}</h2>
            <span>записи</span>
          </div>
        </div>
      </section>

      <section class="filters">
        <div class="search-box">
          <span>🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по записям..."
          />
        </div>
      </section>

      <section v-if="loading" class="state-card">Загрузка записей...</section>

      <section v-else-if="error" class="state-card error">
        {{ error }}
      </section>

      <section v-else-if="!filteredSubmissions.length" class="state-card">
        У вас пока нет загруженных аудиоответов.
      </section>

      <section v-else class="submissions-list">
        <article
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="submission-card"
        >
          <div class="submission-image">
            <span>🎙️</span>
          </div>

          <div class="submission-main">
            <div class="submission-header">
              <div>
                <h3>{{ submission.lesson_title }}</h3>
                <p>
                  Курс: {{ submission.course_title }} · Задание:
                  {{ submission.task_title }}
                </p>
              </div>

              <span class="status-badge" :class="getStatusClass(submission)">
                {{ getStatusLabel(submission) }}
              </span>
            </div>

            <p v-if="submission.comment" class="feedback-text">
              💬 Комментарий: {{ submission.comment }}
            </p>

            <p v-if="submission.transcript" class="feedback-text">
              📝 Расшифровка: {{ submission.transcript }}
            </p>

            <p v-if="submission.ai_feedback" class="feedback-text">
              🤖 Проверка ИИ: {{ submission.ai_feedback }}
            </p>

            <audio
              v-if="submission.result_file"
              controls
              :src="`http://127.0.0.1:8000${submission.result_file}`"
              class="audio-player"
            ></audio>

            <p class="submission-date">
              Загружено:
              {{ new Date(submission.created_at).toLocaleString() }}
            </p>
          </div>

          <div class="submission-side">
            <div
              class="score-circle"
              :class="getStatusClass(submission)"
              :style="getProgressStyle(submission.ai_score)"
            >
              <span v-if="submission.ai_score !== null">
                {{ submission.ai_score }}
              </span>
              <span v-else>—</span>
            </div>

            <p class="score-text">/100</p>

            <button
              class="check-btn"
              @click="checkSubmission(submission.id)"
              :disabled="checkingId === submission.id"
            >
              {{
                checkingId === submission.id ? "Проверка..." : "Проверить ИИ"
              }}
            </button>
            <button
              class="delete-btn"
              @click="deleteSubmission(submission.id)"
              :disabled="deletingId === submission.id"
            >
              {{ deletingId === submission.id ? "Удаление..." : "Удалить" }}
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.submissions-layout {
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

.submissions-content {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 26px;
}

.stat-card {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 16px 42px rgba(83, 61, 47, 0.06);
  display: flex;
  align-items: center;
  gap: 18px;
}

.stat-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c84d3e;
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-icon.total {
  background: #fde7df;
}

.stat-icon.approved {
  background: #e7f2df;
  color: #5d915c;
}

.stat-icon.pending {
  background: #fff0cc;
  color: #c89125;
}

.stat-icon.rework {
  background: #ffe1da;
  color: #d94839;
}

.stat-card p {
  margin: 0 0 8px;
  color: #544b44;
  font-weight: 700;
}

.stat-card h2 {
  margin: 0;
  font-size: 2rem;
  color: #2d2723;
}

.stat-card span {
  color: #7c726b;
}

.filters {
  margin-bottom: 24px;
}

.search-box {
  width: 100%;
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

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 16px 42px rgba(83, 61, 47, 0.06);
  display: grid;
  grid-template-columns: 170px 1fr 190px;
  gap: 20px;
  align-items: center;
}

.submission-image {
  height: 130px;
  border-radius: 18px;
  background:
    linear-gradient(rgba(248, 244, 239, 0.55), rgba(248, 244, 239, 0.75)),
    url("../pictures/login-background.png") center / cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submission-image span {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 250, 247, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.submission-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.submission-header h3 {
  margin: 0 0 8px;
  color: #2d2723;
  font-size: 1.35rem;
}

.submission-header p {
  margin: 0;
  color: #7c726b;
}

.status-badge {
  height: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
}

.status-badge.approved {
  background: #eaf4e7;
  color: #4f8a55;
}

.status-badge.pending {
  background: #fff3d6;
  color: #c89125;
}

.status-badge.rework {
  background: #fff1ec;
  color: #d94839;
}

.feedback-text {
  margin: 8px 0;
  color: #5f5650;
  line-height: 1.5;
}

.audio-player {
  margin-top: 12px;
  width: 100%;
}

.submission-date {
  margin: 12px 0 0;
  color: #9a8d84;
  font-size: 0.9rem;
}

.submission-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  justify-self: end;
}

.score-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: conic-gradient(#c84d3e var(--score), #f1ddd6 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::after {
  content: "";
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #fffaf7;
}

.score-circle span {
  position: relative;
  z-index: 1;
  color: #2d2723;
  font-weight: 800;
  font-size: 1.2rem;
}

.score-circle.approved {
  background: conic-gradient(#5d915c var(--score), #e5ded8 0);
}

.score-circle.pending {
  background: conic-gradient(#c89125 var(--score), #e5ded8 0);
}

.score-circle.rework {
  background: conic-gradient(#d94839 var(--score), #e5ded8 0);
}

.score-text {
  margin: 0;
  color: #7c726b;
}

.check-btn {
  margin-top: 10px;
  height: 46px;
  padding: 0 18px;
  border-radius: 15px;
  border: 1.5px solid #e8b7aa;
  background: transparent;
  color: #c84d3e;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.check-btn:hover:not(:disabled) {
  background: #c84d3e;
  color: white;
}

.check-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}
.delete-btn {
  height: 46px;
  padding: 0 18px;
  border-radius: 15px;
  border: 1.5px solid #f0b8b0;
  background: #fff1ef;
  color: #b34033;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.delete-btn:hover:not(:disabled) {
  background: #b34033;
  color: white;
}

.delete-btn:disabled {
  opacity: 0.7;
  cursor: wait;
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
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .submission-card {
    grid-template-columns: 140px 1fr;
  }

  .submission-side {
    grid-column: 1 / -1;
    justify-self: stretch;
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 980px) {
  .submissions-layout {
    flex-direction: column;
  }

  .submissions-content {
    padding: 18px;
  }
}

@media (max-width: 700px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .submission-card {
    grid-template-columns: 1fr;
  }

  .submission-image {
    height: 160px;
  }

  .submission-header {
    flex-direction: column;
  }

  .submission-side {
    flex-direction: column;
  }

  .page-title h1 {
    font-size: 2rem;
  }
}
</style>
