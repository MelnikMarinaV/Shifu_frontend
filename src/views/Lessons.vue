<script setup>
import { RouterLink, useRouter } from "vue-router"; //навигация по урокам
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/api/http";

const auth = useAuthStore();
const router = useRouter();
const courses = ref([]);
const lessons = ref([]);
const imageError = ref(false);
const fileInput = ref(null);
const uploading = ref(false);

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

const handleAvatarClick = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("Пожалуйста, выберите изображение");
    return;
  }

  // Validate file size (e.g., max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Размер файла не должен превышать 5MB");
    return;
  }

  uploading.value = true;
  imageError.value = false;

  try {
    await auth.updateProfilePicture(file);
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  } catch (error) {
    console.error("Error uploading avatar:", error);
    alert("Не удалось загрузить изображение. Попробуйте ещё раз.");
  } finally {
    uploading.value = false;
  }
};

onMounted(async () => {
  try {
    const courseResponse = await api.get("/api/courses/");
    courses.value = courseResponse.data.courses;

    if (courses.value.length > 0) {
      const courseId = courses.value[0].id;
      const lessonsResponse = await api.get(`/api/lessons/${courseId}/`);
      lessons.value = lessonsResponse.data.lessons;
    }
  } catch (error) {
    console.error("Error fetching items", error);
  }
});
</script>

<template>
  <body>
    <div class="lessons-container">
      <div class="topnav">
        <img class="logo" src="../pictures/logo-no-background.png" alt="" />
        <div class="user-info">
          <div class="user-details" v-if="auth.user">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
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
            <span
              class="user-name clickable-name"
              @click="router.push({ name: 'my-submissions' })"
            >
              {{ auth.user.username }}
            </span>
          </div>
          <button class="logout-btn" @click="handleLogout">Выйти</button>
        </div>
      </div>
      <!-- Отображает заголовок h1 для каждого курса из массива courses: на данный момент-1 курс HSK-1 -->
      <h1 v-for="course in courses" :key="course.id">
        {{ course.title }}
      </h1>
      <div class="lessons">
        <ol v-if="lessons.length">
          <li v-for="lesson in lessons" :key="lesson.id">
            <!-- Создает ссылку на страницу урока с использованием RouterLink.  Атрибут :to  динамически формирует URL  на основе ID  урока -->
            <RouterLink :to="`/lesson/${lesson.id}`" class="router-link">{{
              lesson.title
            }}</RouterLink>
          </li>
        </ol>
      </div>
    </div>
  </body>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
}
.lessons-container {
  min-height: 100vh;
  margin: 0;
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
  cursor: pointer;
  transition: transform 0.2s ease;
}
.avatar-container:hover {
  transform: scale(1.1);
}
.avatar-container:hover::after {
  content: "📷";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-container.uploading {
  opacity: 0.7;
  cursor: wait;
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
.clickable-name {
  cursor: pointer;
  text-decoration: underline;
}

.clickable-name:hover {
  opacity: 0.8;
}
.upload-spinner {
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.user-name {
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
}
.user-email {
  font-size: 0.9rem;
  opacity: 0.9;
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
  margin-bottom: 20px;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  font-family: "Times New Roman", Times, serif;
  background: rgb(221, 229, 142);
  background: linear-gradient(
    0deg,
    rgba(221, 229, 142, 1) 0%,
    rgba(224, 229, 177, 1) 21%,
    rgba(182, 181, 48, 0.8716620437237395) 100%
  );
  background-clip: text;
  color: transparent;
}

.lessons {
  margin: auto;
  width: 70%;
  height: 80%;
}

ol {
  counter-reset: section;
  list-style-type: "HSK1 - ";
  list-style-position: inside;
  width: 100%;
  margin: 0 auto;
  color: #cd071e;
  text-align: center;
  font-size: 20px;
}

li::before {
  counter-increment: section;
  content: counters(section, ".") " ";
  color: #cd071e;
}

li {
  background: rgb(209, 131, 117);
  background: radial-gradient(
    circle,
    rgba(209, 131, 117, 0.8744631641719187) 0%,
    rgba(235, 237, 210, 0.7232026599702381) 50%
  );
  width: 100%;
  border: 1px solid #cd071e;
  border-radius: 25px;
  margin-bottom: 5px;
  padding: 10px 0 0 0;
}

li:hover {
  background-color: gold;
}

.router-link {
  display: block;
  text-decoration: none;
  color: #cd071e;
  padding: 20px;
  font-size: 30px;
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
