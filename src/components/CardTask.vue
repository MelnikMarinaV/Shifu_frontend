<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const selectedChinese = ref(null);
const selectedTranslation = ref(null);
const matchedIds = ref([]);
const wrongPair = ref(false);

const chineseItems = computed(() => {
  return props.items.map((item) => ({
    id: item.id,
    text: item.title,
  }));
});

const translationItems = computed(() => {
  const arr = props.items.map((item) => ({
    id: item.id,
    text: item.task_description,
  }));

  return [...arr].sort(() => Math.random() - 0.5);
});

const selectChinese = (item) => {
  if (matchedIds.value.includes(item.id)) return;
  selectedChinese.value = item;
  checkPair();
};

const selectTranslation = (item) => {
  if (matchedIds.value.includes(item.id)) return;
  selectedTranslation.value = item;
  checkPair();
};

const checkPair = () => {
  if (!selectedChinese.value || !selectedTranslation.value) return;

  if (selectedChinese.value.id === selectedTranslation.value.id) {
    matchedIds.value.push(selectedChinese.value.id);
    selectedChinese.value = null;
    selectedTranslation.value = null;
    wrongPair.value = false;
  } else {
    wrongPair.value = true;
    setTimeout(() => {
      selectedChinese.value = null;
      selectedTranslation.value = null;
      wrongPair.value = false;
    }, 700);
  }
};

const isCompleted = computed(() => {
  return (
    props.items.length > 0 && matchedIds.value.length === props.items.length
  );
});
</script>

<template>
  <div class="card-task">
    <div class="columns">
      <div class="column">
        <h3>Иероглифы</h3>
        <button
          v-for="item in chineseItems"
          :key="`zh-${item.id}`"
          class="card"
          :class="{
            selected: selectedChinese?.id === item.id,
            matched: matchedIds.includes(item.id),
            wrong: wrongPair && selectedChinese?.id === item.id,
          }"
          @click="selectChinese(item)"
        >
          {{ item.text }}
        </button>
      </div>

      <div class="column">
        <h3>Перевод</h3>
        <button
          v-for="item in translationItems"
          :key="`ru-${item.id}`"
          class="card"
          :class="{
            selected: selectedTranslation?.id === item.id,
            matched: matchedIds.includes(item.id),
            wrong: wrongPair && selectedTranslation?.id === item.id,
          }"
          @click="selectTranslation(item)"
        >
          {{ item.text }}
        </button>
      </div>
    </div>

    <p v-if="isCompleted" class="success-message">
      Отлично! Все пары найдены 🎉
    </p>
  </div>
</template>

<style scoped>
.card-task {
  margin-top: 30px;
  padding-bottom: 40px;
}

.columns {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.column {
  width: 320px;
  display: flex;
  flex-direction: column;
}

.column h3 {
  margin-bottom: 20px;
  font-size: 24px;
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

.card {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 80px; /* вместо height */
  padding: 10px;

  margin-bottom: 12px;

  border-radius: 20px;
  cursor: pointer;

  font-size: 24px;
  font-weight: bold;
  text-align: center;

  color: #cd071e;
  background: radial-gradient(
    circle,
    rgba(209, 131, 117, 0.8744631641719187) 0%,
    rgba(235, 237, 210, 0.7232026599702381) 50%
  );

  border: 1px solid #cd071e;
  transition: all 0.2s ease;

  /* 👇 ВАЖНО */
  word-break: break-word;
  white-space: normal;
}

.card:hover {
  transform: scale(1.03);
}

.card.selected {
  outline: 3px solid gold;
}

.card.matched {
  background: rgba(130, 214, 130, 0.9);
  color: #124d12;
}

.card.wrong {
  background: rgba(255, 120, 120, 0.9);
  color: #7a1111;
}

.success-message {
  margin-top: 25px;
  font-size: 22px;
  font-weight: bold;
  color: #cd071e;
}
</style>
