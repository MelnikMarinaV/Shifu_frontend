<script setup>
import { computed, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  logoTo: {
    type: Object,
    default: () => ({ name: "lessons" }),
  },
  clickableNameTo: {
    type: Object,
    default: null,
  },
});

const auth = useAuthStore();
const router = useRouter();

const imageError = ref(false);
const fileInput = ref(null);
const uploading = ref(false);

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

const handleLogout = async () => {
  auth.logout();
  await router.replace({ name: "login" });
};

const goByName = async () => {
  if (props.clickableNameTo) {
    await router.push(props.clickableNameTo);
  }
};

const handleAvatarClick = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Пожалуйста, выберите изображение");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Размер файла не должен превышать 5MB");
    return;
  }

  uploading.value = true;
  imageError.value = false;

  try {
    await auth.updateProfilePicture(file);

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
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <RouterLink :to="logoTo" class="brand-link">
        <div class="logo-shell">
          <img
            class="logo"
            src="../pictures/logo-no-background.png"
            alt="Shifu"
          />
        </div>

        <div class="brand-text">
          <h2>SHIFU</h2>
          <p>Твой путь к китайскому языку</p>
        </div>
      </RouterLink>
    </div>

    <div class="header-right">
      <div v-if="auth.user" class="user-panel">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden-file-input"
          @change="handleFileChange"
        />

        <div
          class="avatar-container"
          @click="handleAvatarClick"
          :class="{ uploading: uploading }"
          title="Изменить аватар"
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

          <div class="avatar-overlay">📷</div>
        </div>

        <div class="user-meta">
          <span class="welcome-text">Добро пожаловать!</span>
          <span
            class="user-name"
            :class="{ clickable: !!clickableNameTo }"
            @click="goByName"
          >
            {{ auth.user.username }}
          </span>
        </div>

        <button type="button" class="logout-btn" @click="handleLogout">
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.app-header {
  width: 100%;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(120, 96, 80, 0.08);
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(83, 61, 47, 0.08);
  backdrop-filter: blur(10px);
}

.header-left {
  min-width: 0;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
}

.logo-shell {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.brand-text h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  background: linear-gradient(180deg, #b05e43, #6c625a);
  -webkit-background-clip: text;
  color: transparent;
}

.brand-text p {
  margin: 4px 0 0;
  font-size: 0.92rem;
  color: #7c726b;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 10px 8px 8px;
  border-radius: 999px;
  background: #fffaf7;
  border: 1px solid #efe2d8;
}

.hidden-file-input {
  display: none;
}

.avatar-container {
  position: relative;
  width: 52px;
  height: 52px;
  cursor: pointer;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.avatar-container:hover {
  transform: scale(1.04);
}

.avatar-container.uploading {
  opacity: 0.7;
  cursor: wait;
}

.user-avatar,
.avatar-fallback {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.user-avatar {
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c84d3e;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(45, 39, 35, 0.38);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
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
    opacity: 0.45;
  }
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.welcome-text {
  font-size: 0.78rem;
  color: #9a8d84;
}

.user-name {
  font-size: 1rem;
  font-weight: 700;
  color: #2d2723;
  transition: 0.2s ease;
}

.user-name.clickable {
  cursor: pointer;
}

.user-name.clickable:hover {
  color: #c84d3e;
}

.logout-btn {
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #c84d3e;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 10px 24px rgba(200, 77, 62, 0.18);
}

.logout-btn:hover {
  background: #b74234;
  transform: translateY(-1px);
}

@media (max-width: 900px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-start;
  }

  .user-panel {
    width: 100%;
    border-radius: 24px;
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .brand-text h2 {
    font-size: 1.1rem;
    letter-spacing: 0.12em;
  }

  .brand-text p {
    font-size: 0.82rem;
  }

  .user-panel {
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
  }

  .user-meta {
    min-width: auto;
  }

  .logout-btn {
    width: 100%;
  }
}
</style>
