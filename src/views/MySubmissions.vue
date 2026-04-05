<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/http";
import AppHeader from "@/components/AppHeader.vue";

const submissions = ref([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const response = await api.get("/api/my-submissions/");
    submissions.value = response.data.submissions;
  } catch (e) {
    error.value = "Не удалось загрузить ваши записи.";
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="submissions-container">
    <AppHeader :logoTo="{ name: 'lessons' }" />

    <h1>Мои записи</h1>

    <div v-if="loading" class="message">Загрузка...</div>
    <div v-else-if="error" class="message">{{ error }}</div>

    <div v-else class="submissions-list">
      <div v-if="!submissions.length" class="message">
        У вас пока нет загруженных аудиоответов.
      </div>

      <div
        v-for="submission in submissions"
        :key="submission.id"
        class="submission-card"
      >
        <p class="submission-course">Курс: {{ submission.course_title }}</p>
        <p class="submission-lesson">Урок: {{ submission.lesson_title }}</p>
        <p class="submission-task">Задание: {{ submission.task_title }}</p>

        <p v-if="submission.comment" class="submission-comment">
          Комментарий: {{ submission.comment }}
        </p>

        <audio
          v-if="submission.result_file"
          controls
          :src="`http://127.0.0.1:8000${submission.result_file}`"
          class="audio-player"
        ></audio>

        <p class="submission-date">
          Загружено: {{ new Date(submission.created_at).toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  box-sizing: border-box;
}

.submissions-container {
  min-height: 100vh;
  background: #cd071e;
  text-align: center;
  padding-bottom: 50px;
}

h1 {
  margin-bottom: 30px;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  font-family: "Times New Roman", Times, serif;
  background: linear-gradient(
    0deg,
    rgba(221, 229, 142, 1) 0%,
    rgba(224, 229, 177, 1) 21%,
    rgba(182, 181, 48, 0.87) 100%
  );
  background-clip: text;
  color: transparent;
}

.submissions-list {
  width: 75%;
  margin: 0 auto;
}

.submission-card {
  background: radial-gradient(
    circle,
    rgba(209, 131, 117, 0.874) 0%,
    rgba(235, 237, 210, 0.723) 50%
  );
  border: 1px solid #cd071e;
  border-radius: 25px;
  margin-bottom: 20px;
  padding: 20px;
  color: #cd071e;
  font-size: 20px;
}

.submission-course,
.submission-lesson,
.submission-task,
.submission-comment,
.submission-date {
  margin-bottom: 10px;
  font-weight: bold;
}

.audio-player {
  margin: 15px 0;
  width: 100%;
  max-width: 500px;
}

.message {
  color: white;
  font-size: 1.2rem;
  margin-top: 30px;
}
</style>
