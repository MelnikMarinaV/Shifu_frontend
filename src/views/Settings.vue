<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppHeader from "@/components/AppHeader.vue";
import SideBar from "@/components/SideBar.vue";

const auth = useAuthStore();
const router = useRouter();

const username = ref("");
const email = ref("");
const selectedTheme = ref("light");

const avatarFile = ref(null);
const avatarPreview = ref(null);
const fileInput = ref(null);

const message = ref("");
const error = ref("");
const saving = ref(false);

const userInitials = computed(() => {
  return username.value?.charAt(0)?.toUpperCase() || "U";
});

const getAvatarUrl = (user) => {
  const avatar =
    user?.avatar ||
    user?.photo ||
    user?.profile_picture ||
    user?.image ||
    user?.picture;

  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;

  return `http://127.0.0.1:8000${avatar}`;
};

const avatarUrl = computed(() => {
  return avatarPreview.value || getAvatarUrl(auth.user);
});

const applyTheme = (theme) => {
  document.documentElement.classList.remove("theme-light", "theme-dark");
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem("theme", theme);
};

onMounted(() => {
  username.value = auth.user?.username || "";
  email.value = auth.user?.email || "";

  selectedTheme.value = localStorage.getItem("theme") || "light";
  applyTheme(selectedTheme.value);
});

watch(
  () => auth.user,
  (user) => {
    if (!user) return;
    username.value = user.username || "";
    email.value = user.email || "";
  },
  { immediate: true },
);

const chooseAvatar = () => {
  fileInput.value?.click();
};

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  message.value = "";
  error.value = "";

  if (!file.type.startsWith("image/")) {
    error.value = "Выберите изображение";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = "Размер файла не должен превышать 5MB";
    return;
  }

  avatarFile.value = file;

  if (avatarPreview.value) {
    URL.revokeObjectURL(avatarPreview.value);
  }

  avatarPreview.value = URL.createObjectURL(file);
};

const saveSettings = async () => {
  message.value = "";
  error.value = "";

  const newUsername = username.value.trim();
  const newEmail = email.value.trim();

  if (!newUsername) {
    error.value = "Имя пользователя не может быть пустым";
    return;
  }

  try {
    saving.value = true;

    const updatedUser = await auth.updateProfile({
      username: newUsername,
      email: newEmail,
      avatar: avatarFile.value,
    });

    auth.user = {
      ...auth.user,
      ...updatedUser,
      username: newUsername,
      email: newEmail,
    };

    await auth.fetchCurrentUser();

    auth.user = {
      ...auth.user,
      username: newUsername,
      email: newEmail,
    };

    username.value = auth.user.username;
    email.value = auth.user.email;

    applyTheme(selectedTheme.value);

    avatarFile.value = null;

    if (fileInput.value) {
      fileInput.value.value = "";
    }

    message.value = "Настройки сохранены";
  } catch (err) {
    console.error(err);

    if (err.response?.data?.username) {
      error.value = err.response.data.username[0];
    } else if (err.response?.data?.email) {
      error.value = err.response.data.email[0];
    } else if (err.response?.data?.detail) {
      error.value = err.response.data.detail;
    } else {
      error.value = "Не удалось сохранить изменения";
    }
  } finally {
    saving.value = false;
  }
};

const logout = async () => {
  auth.logout();
  await router.replace({ name: "login" });
};
</script>

<template>
  <div class="settings-layout">
    <SideBar />

    <main class="settings-content">
      <AppHeader
        :logoTo="{ name: 'lessons' }"
        :clickableNameTo="{ name: 'my-submissions' }"
      />

      <section class="settings-hero">
        <p class="hero-label">Профиль</p>
        <h1>Настройки</h1>
        <p>Измените аватар, имя пользователя и тему интерфейса.</p>
      </section>

      <section class="settings-card">
        <h2>Настройки профиля</h2>

        <div class="profile-row">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="handleAvatarChange"
          />

          <div class="avatar-wrapper" @click="chooseAvatar">
            <img
              v-if="avatarUrl"
              class="avatar"
              :src="avatarUrl"
              alt="avatar"
            />

            <div v-else class="avatar avatar-fallback">
              {{ userInitials }}
            </div>

            <div class="avatar-overlay">📷</div>
          </div>

          <div>
            <h3>{{ username || "Пользователь" }}</h3>
            <p>Нажмите на аватар, чтобы изменить фото</p>
          </div>
        </div>

        <div class="form">
          <div class="field">
            <label>Имя пользователя</label>
            <input v-model="username" type="text" />
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" />
          </div>

          <div class="field">
            <label>Тема интерфейса</label>

            <div class="theme-options">
              <button
                type="button"
                class="theme-btn"
                :class="{ active: selectedTheme === 'light' }"
                @click="selectedTheme = 'light'"
              >
                ☀️ Светлая
              </button>

              <button
                type="button"
                class="theme-btn"
                :class="{ active: selectedTheme === 'dark' }"
                @click="selectedTheme = 'dark'"
              >
                🌙 Тёмная
              </button>
            </div>
          </div>

          <p v-if="message" class="message">{{ message }}</p>
          <p v-if="error" class="error">{{ error }}</p>

          <div class="actions">
            <button class="save-btn" @click="saveSettings" :disabled="saving">
              {{ saving ? "Сохранение..." : "Сохранить изменения" }}
            </button>

            <button class="logout-btn" @click="logout">
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.settings-layout {
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

.settings-content {
  flex: 1;
  padding: 24px;
}

.settings-hero {
  margin-top: 20px;
  padding: 34px;
  border-radius: 30px;
  background:
    linear-gradient(rgba(248, 244, 239, 0.76), rgba(248, 244, 239, 0.84)),
    url("../pictures/login-background.png") right center / cover no-repeat;
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 18px 50px rgba(83, 61, 47, 0.08);
}

.hero-label {
  margin: 0 0 10px;
  color: #b05e43;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.settings-hero h1 {
  margin: 0 0 12px;
  font-size: 2.6rem;
  color: #2d2723;
}

.settings-hero p {
  margin: 0;
  color: #615852;
  font-size: 1.05rem;
}

.settings-card {
  margin-top: 24px;
  max-width: 100%;
  padding: 28px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(120, 96, 80, 0.08);
  box-shadow: 0 18px 50px rgba(83, 61, 47, 0.06);
}

.settings-card h2 {
  margin: 0 0 24px;
  color: #2d2723;
  font-size: 1.7rem;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px;
  border-radius: 24px;
  background: #fffaf7;
  border: 1px solid #efe2d8;
  margin-bottom: 24px;
}

.hidden-input {
  display: none;
}

.avatar-wrapper {
  position: relative;
  width: 82px;
  height: 82px;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 10px 24px rgba(83, 61, 47, 0.12);
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #c84d3e;
  color: white;
  font-size: 1.7rem;
  font-weight: 700;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(45, 39, 35, 0.4);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.profile-row h3 {
  margin: 0 0 6px;
  color: #2d2723;
}

.profile-row p {
  margin: 0;
  color: #7c726b;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  color: #544b44;
  font-weight: 600;
  font-size: 0.95rem;
}

.field input {
  height: 52px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #e7ddd4;
  background: rgba(255, 255, 255, 0.92);
  color: #2f2a26;
  font-size: 1rem;
}

.field input:focus {
  outline: none;
  border-color: #cf5d4c;
  box-shadow: 0 0 0 4px rgba(207, 93, 76, 0.12);
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-btn {
  height: 52px;
  padding: 0 18px;
  border-radius: 16px;
  border: 1px solid #e7ddd4;
  background: #fffaf7;
  color: #544b44;
  font-weight: 700;
  cursor: pointer;
}

.theme-btn:hover,
.theme-btn.active {
  border-color: #c84d3e;
  background: #fff1ec;
  color: #c84d3e;
}

.message {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f0f8ef;
  color: #497b50;
  border: 1px solid #cfe6d0;
}

.error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff1ef;
  color: #b34033;
  border: 1px solid #f0c8c2;
}

.actions {
  display: flex;
  gap: 14px;
  margin-top: 8px;
}

.save-btn,
.logout-btn {
  height: 52px;
  padding: 0 22px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
}

.save-btn {
  border: none;
  background: #c84d3e;
  color: white;
  box-shadow: 0 10px 24px rgba(200, 77, 62, 0.18);
}

.save-btn:hover {
  background: #b74234;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logout-btn {
  background: transparent;
  color: #c84d3e;
  border: 1.5px solid #e8b7aa;
}

.logout-btn:hover {
  background: #fff5f1;
}

@media (max-width: 980px) {
  .settings-layout {
    flex-direction: column;
  }

  .settings-content {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .profile-row,
  .actions,
  .theme-options {
    flex-direction: column;
    align-items: stretch;
  }

  .save-btn,
  .logout-btn,
  .theme-btn {
    width: 100%;
  }

  .settings-hero h1 {
    font-size: 2rem;
  }
}
</style>
