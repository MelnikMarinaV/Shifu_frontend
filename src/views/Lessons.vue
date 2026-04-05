<script setup>
import { RouterLink } from "vue-router"; //навигация по урокам
import { ref, onMounted } from "vue";
import api from "@/api/http";
import AppHeader from "@/components/AppHeader.vue";

const courses = ref([]);
const lessons = ref([]);

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
      <AppHeader
        :logoTo="{ name: 'lessons' }"
        :clickableNameTo="{ name: 'my-submissions' }"
      />
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
</style>
