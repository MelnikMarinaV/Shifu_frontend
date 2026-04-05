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
  <div class="topnav">
    <RouterLink :to="logoTo">
      <img class="logo" src="../pictures/logo-no-background.png" alt="" />
    </RouterLink>

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
</template>

<style scoped>
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
  color: white;
}

.user-name.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.user-name.clickable:hover {
  opacity: 0.8;
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
