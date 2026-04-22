<script setup>
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const password_confirm = ref("");
const error = ref("");
const isLoading = ref(false);

const submit = async () => {
  error.value = "";

  if (!username.value || !password.value || !password_confirm.value) {
    error.value = "Заполните обязательные поля";
    return;
  }

  if (password.value !== password_confirm.value) {
    error.value = "Пароли не совпадают";
    return;
  }

  try {
    isLoading.value = true;

    await auth.register({
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirm: password_confirm.value,
    });

    router.push({ name: "lessons" });
  } catch (e) {
    if (e.response?.data?.username) {
      error.value = e.response.data.username[0];
    } else if (e.response?.data?.password_confirm) {
      error.value = e.response.data.password_confirm[0];
    } else if (e.response?.data?.detail) {
      error.value = e.response.data.detail;
    } else {
      error.value = "Не удалось зарегистрироваться. Попробуйте ещё раз.";
    }

    console.error(e);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-shell">
      <!-- Левая часть -->
      <div class="auth-visual">
        <div class="brand">
          <img
            class="brand-logo"
            src="../pictures/logo-no-background.png"
            alt="Shifu"
          />

          <div class="brand-text">
            <h2 class="brand-title">SHIFU</h2>
            <p class="brand-subtitle">Твой путь к китайскому языку</p>
          </div>
        </div>

        <div class="visual-content">
          <h1 class="visual-title">Создайте аккаунт</h1>

          <p class="visual-description">
            Начните своё путешествие в мир китайского языка, уроков, иероглифов
            и практики.
          </p>
        </div>
      </div>

      <!-- Правая часть -->
      <div class="auth-form-side">
        <div class="form-box">
          <div class="form-header">
            <h3>Регистрация</h3>
            <p>Заполните данные, чтобы начать обучение</p>
          </div>

          <form class="register-form" @submit.prevent="submit">
            <div class="field">
              <label for="username">Имя пользователя</label>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="Введите имя пользователя"
                autocomplete="username"
              />
            </div>

            <div class="field">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="Введите email"
                autocomplete="email"
              />
            </div>

            <div class="field">
              <label for="password">Пароль</label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Создайте пароль"
                autocomplete="new-password"
              />
            </div>

            <div class="field">
              <label for="password_confirm">Подтвердите пароль</label>
              <input
                id="password_confirm"
                v-model="password_confirm"
                type="password"
                placeholder="Повторите пароль"
                autocomplete="new-password"
              />
            </div>

            <p v-if="error" class="error-message">
              {{ error }}
            </p>

            <button type="submit" :disabled="isLoading" class="submit-btn">
              {{ isLoading ? "Регистрация..." : "Зарегистрироваться" }}
            </button>

            <p class="login-link">
              Уже есть аккаунт?
              <RouterLink :to="{ name: 'login' }">Войти</RouterLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-page {
  min-height: 100vh;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.auth-shell {
  width: 100%;
  max-width: 1180px;
  min-height: 720px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(120, 96, 80, 0.1);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(83, 61, 47, 0.12);
  backdrop-filter: blur(10px);
}

.auth-visual {
  position: relative;
  padding: 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    linear-gradient(rgba(248, 244, 239, 0.72), rgba(248, 244, 239, 0.78)),
    url("../pictures/login-background.png") right center/cover no-repeat;
}

.auth-visual::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(217, 104, 79, 0.16),
      transparent 12%
    ),
    radial-gradient(
      circle at 70% 75%,
      rgba(125, 155, 127, 0.14),
      transparent 18%
    );
  pointer-events: none;
}

.brand {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: #2d2a26;
  width: fit-content;
}

.brand-logo {
  width: 62px;
  height: 62px;
  object-fit: contain;
}

.brand-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.25em;

  background: linear-gradient(180deg, #b05e43, #f6f5f5);
  -webkit-background-clip: text;
  color: transparent;
}

.brand-subtitle {
  margin-top: 6px;
  font-size: 0.95rem;
  color: #7c726b;
  letter-spacing: 0.03em;
}

.brand-text h2 {
  margin: 0;
  font-size: 1.35rem;
  letter-spacing: 0.08em;
}

.brand-text p {
  margin: 4px 0 0;
  font-size: 0.95rem;
  color: #6c625a;
}

.visual-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
}

.visual-content h1 {
  margin: 0 0 14px;
  font-size: 2.5rem;
  line-height: 1.1;
  background: linear-gradient(180deg, #b05e43, #f6f5f5);
  -webkit-background-clip: text;
  color: transparent;
}

.visual-content p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #5f5650;
}

.auth-form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.72);
}

.form-box {
  width: 100%;
  max-width: 430px;
}

.form-header {
  margin-bottom: 28px;
}

.form-header h3 {
  margin: 0 0 10px;
  font-size: 2rem;
  color: #2d2723;
}

.form-header p {
  margin: 0;
  color: #7c726b;
  font-size: 1rem;
}

.register-form {
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
  font-size: 0.95rem;
  font-weight: 600;
  color: #544b44;
}

.field input {
  width: 100%;
  height: 54px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #e7ddd4;
  background: rgba(255, 255, 255, 0.92);
  color: #2f2a26;
  font-size: 1rem;
  transition: 0.25s ease;
}

.field input::placeholder {
  color: #a59a92;
}

.field input:focus {
  border-color: #cf5d4c;
  box-shadow: 0 0 0 4px rgba(207, 93, 76, 0.12);
  background: #fff;
}

.submit-btn {
  margin-top: 8px;
  height: 54px;
  border: none;
  border-radius: 14px;
  background: #c84d3e;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0 10px 24px rgba(200, 77, 62, 0.22);
}

.submit-btn:hover:not(:disabled) {
  background: #b74234;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  padding: 14px 16px;
  border-radius: 14px;
  background: #fff1ef;
  border: 1px solid #f0c8c2;
  color: #b34033;
  font-size: 0.95rem;
  line-height: 1.4;
}

.login-link {
  text-align: center;
  margin-top: 6px;
  font-size: 0.98rem;
  color: #6a6059;
}

.login-link a {
  color: #c84d3e;
  font-weight: 700;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 980px) {
  .auth-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .auth-visual {
    min-height: 280px;
    padding: 28px;
  }

  .visual-content h1 {
    font-size: 2rem;
  }

  .auth-form-side {
    padding: 28px;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 16px;
  }

  .auth-shell {
    border-radius: 24px;
  }

  .auth-visual,
  .auth-form-side {
    padding: 20px;
  }

  .brand-logo {
    width: 52px;
    height: 52px;
  }

  .visual-content h1 {
    font-size: 1.7rem;
  }

  .form-header h3 {
    font-size: 1.6rem;
  }

  .field input,
  .submit-btn {
    height: 50px;
  }
}
</style>
