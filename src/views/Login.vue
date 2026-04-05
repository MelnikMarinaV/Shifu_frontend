<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const username = ref("");
const password = ref("");
const error = ref("");

const submit = async () => {
  error.value = "";
  try {
    await auth.login({ username: username.value, password: password.value });
    router.push({ name: "lessons" });
  } catch (e) {
    if (e.response?.status === 401) {
      error.value = "Неверное имя пользователя или пароль";
    } else {
      error.value = "Не удалось войти. Попробуйте ещё раз.";
      console.error(e);
    }
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="topnav">
      <img class="logo" src="../pictures/logo-no-background.png" alt="Shifu" />
    </div>

    <div class="login-container">
      <h1>SHIFU</h1>
      <p class="subtitle">Вход в личный кабинет</p>

      <form class="login-form" @submit.prevent="submit">
        <input
          v-model="username"
          type="text"
          placeholder="Имя пользователя"
          autocomplete="username"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          autocomplete="current-password"
        />

        <button type="submit">Войти</button>
        <p class="register-link">
          Нет аккаунта?
          <RouterLink :to="{ name: 'register' }">Зарегистрироваться</RouterLink>
        </p>

        <p v-if="error" class="error-message">
          {{ error }}
        </p>
      </form>
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

.login-wrapper {
  min-height: 100vh;
  background: #cd071e;
  display: flex;
  flex-direction: column;
}

.topnav {
  padding: 5vh;
  text-align: left;
}

.logo {
  width: 10%;
}

.login-container {
  margin: auto;
  width: 40%;
  min-width: 320px;
  max-width: 500px;
  background: radial-gradient(
    circle,
    rgba(209, 131, 117, 0.8744631641719187) 0%,
    rgba(235, 237, 210, 0.7232026599702381) 50%
  );
  border: 1px solid #cd071e;
  border-radius: 25px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

h1 {
  margin-bottom: 15px;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.5rem;
  font-family: "Times New Roman", Times, serif;
  background: linear-gradient(
    0deg,
    rgba(221, 229, 142, 1) 0%,
    rgba(224, 229, 177, 1) 21%,
    rgba(182, 181, 48, 0.8716620437237395) 100%
  );
  background-clip: text;
  color: transparent;
}

.subtitle {
  margin-bottom: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(
    0deg,
    rgba(221, 229, 142, 1) 0%,
    rgb(221, 27, 27) 21%,
    rgba(226, 226, 69, 0.775) 100%
  );
  background-clip: text;
  color: transparent;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-form input {
  width: 100%;
  padding: 16px 18px;
  border-radius: 15px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.85);
  color: #cd071e;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.login-form input:focus {
  border: 2px solid #cd071e;
  background: rgba(255, 255, 255, 1);
}

.login-form input::placeholder {
  color: rgba(205, 7, 30, 0.7);
}

.login-form button {
  padding: 15px 20px;
  background-color: rgba(205, 7, 30, 0.85);
  color: white;
  border: 2px solid white;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.login-form button:hover {
  background-color: rgba(205, 7, 30, 1);
  transform: scale(1.03);
}

.register-link {
  margin-top: 10px;
  font-size: 1rem;
  color: white;
}

.register-link a {
  color: #f3f1a0;
  font-weight: bold;
  text-decoration: underline;
}

.error-message {
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: rgba(205, 7, 30, 0.75);
  padding: 12px;
  border-radius: 12px;
  margin-top: 5px;
}

@media (max-width: 900px) {
  .login-container {
    width: 70%;
  }

  .logo {
    width: 20%;
  }
}

@media (max-width: 600px) {
  .login-container {
    width: 88%;
    padding: 30px 20px;
  }

  h1 {
    font-size: 2.2rem;
    letter-spacing: 0.25rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .logo {
    width: 30%;
  }
}
</style>
