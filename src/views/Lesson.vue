<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import AudioTask from "../components/AudioTask.vue";
import CardTask from "../components/CardTask.vue";
import api from "@/api/http";
import AppHeader from "@/components/AppHeader.vue";

const route = useRoute();
const items = ref([]);
const description = ref("");
const title = ref("");

onMounted(async () => {
  try {
    const response = await api.get(`/api/tasks/${route.params.id}/`);
    const data = response.data;

    description.value = data.description; // теория урока
    title.value = data.title; // заголовок урока
    items.value = data.tasks; // задания к уроку
  } catch (error) {
    console.error("Error fetching items", error);
  }
});
</script>

<template>
  <div class="lesson-wrapper">
    <AppHeader
      :logoTo="{ name: 'lessons' }"
      :clickableNameTo="{ name: 'my-submissions' }"
    />
    <div class="heading">
      <h1>{{ title }}</h1>
    </div>

    <div v-html="description"></div>

    <div class="tasks">
      <p class="task_instruction">
        Постарайтесь прочитать иероглифы самостоятельно. Затем откройте пининь и
        перевод. Запишите выражения своим голосом.
      </p>

      <ul v-if="items.length">
        <li v-for="item in items" :key="item.id">
          <AudioTask
            :initial_text="item.title"
            :pinini="item.task_description"
            :task_id="item.id"
          />
        </li>
      </ul>

      <p class="task_instruction">Сопоставьте иероглифы с их переводом</p>
      <CardTask :items="items" />
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
}
.lesson-wrapper {
  min-height: 100vh;
  background: radial-gradient(
    circle,
    rgba(228, 228, 206, 0.7344071417629552) 30%,
    rgba(229, 220, 137, 0.6167600829394257) 64%,
    rgba(227, 226, 177, 0.695) 98%
  );
}

.heading {
  text-align: center;
  padding: 30px;
  font-size: 1.5rem;
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
.lesson {
  display: flex;
  justify-content: center;
  align-items: center;
}

.lesson-theory {
  width: 80%;
  padding-bottom: 5vh;
  font-size: 20px;
  color: rgba(0, 0, 0, 0.601);
}

.lesson-theory p {
  text-indent: 30px;
}

.lesson-theory h2 {
  text-align: center;
  font-size: 40px;
  background: linear-gradient(
    0deg,
    rgba(221, 229, 142, 1) 0%,
    rgb(221, 27, 27) 21%,
    rgba(226, 226, 69, 0.775) 100%
  );
  background-clip: text;
  color: transparent;
}
.characters {
  color: #cd071e;
  background-color: rgba(226, 164, 144, 0.595);
  padding: 2px 5px 2px 5px;
  border-radius: 10%;
}
.tasks {
  text-align: center;
}

ol li {
  font-size: 25px;
  letter-spacing: 5px;
  margin-bottom: 10px;
  color: #cd071e;
  font-weight: bold;
}

.task_instruction {
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: bold;
  background: linear-gradient(
    0deg,
    rgba(221, 229, 142, 1) 0%,
    rgb(221, 27, 27) 21%,
    rgba(226, 226, 69, 0.775) 100%
  );
  background-clip: text;
  color: transparent;
  text-align: center;
}
</style>
