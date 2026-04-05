<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/http";

const auth = useAuthStore();
const router = useRouter();
const submissions = ref([]);
const loading = ref(true);
const error = ref("");
const imageError = ref(false);

const handleLogout = () => {
  auth.logout();
  router.push({ name: "login" });
};

const getUserAvatar = (user) => {
  const avatar =
    user?.avatar ||
    user?.photo ||
    user?.profile_picture ||
    user?.image ||
    user?.picture;

  if (!avatar) return null;

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  return `http://127.0.0.1:8000${avatar}`;
};

const userAvatar = computed(() => getUserAvatar(auth.user));

const userInitials = computed(() => {
  return auth.user?.username?.charAt(0).toUpperCase() || "U";
});

const handleImageError = () => {
  imageError.value = true;
};

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
    <div class="topnav">
      <RouterLink :to="{ name: 'lessons' }">
        <img class="logo" src="../pictures/logo-no-background.png" alt="" />
      </RouterLink>

      <div class="user-info">
        <div class="user-details" v-if="auth.user">
          <div
            class="avatar-container"
            @click="handleAvatarClick"
            :class="{ uploading: uploading }"
          >
            <img
              v-if="userAvatar && !imageError && !uploading"
              class="user-avatar"
              :src="userAvatar"
              :alt="auth.user.username"
              @error="handleImageError"
            />
            <div v-else class="avatar-fallback">
              <span v-if="!uploading">{{ userInitials }}</span>
              <span v-else class="upload-spinner">...</span>
            </div>
          </div>
          <span class="user-name">{{ auth.user.username }}</span>
        </div>

        <button type="button" class="logout-btn" @click="handleLogout">
          Выйти
        </button>
      </div>
    </div>

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

.topnav {
  padding: 5vh;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  width: 10%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
}

.avatar-container {
  position: relative;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  background-color: rgba(255, 255, 255, 0.2);
  display: block;
}

.avatar-fallback {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0.1)
  );
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.user-name {
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
  color: white;
}

.logout-btn {
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
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

@media (max-width: 900px) {
  .logo {
    width: 20%;
  }
}

@media (max-width: 600px) {
  .logo {
    width: 30%;
  }
}
</style>
