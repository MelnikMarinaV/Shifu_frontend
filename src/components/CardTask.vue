<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  theme: {
    type: String,
    default: "light",
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

const progress = computed(() => {
  if (!props.items.length) return 0;
  return Math.round((matchedIds.value.length / props.items.length) * 100);
});
</script>

<template>
  <div
    class="card-task"
    :class="props.theme === 'dark' ? 'card-task-dark' : 'card-task-light'"
  >
    <div class="task-header">
      <div>
        <h3>Сопоставьте пары</h3>
        <p>Выберите иероглиф слева и подходящий перевод справа</p>
      </div>

      <div class="progress-pill">
        {{ matchedIds.length }}/{{ items.length }}
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="column-title">
          <span>汉</span>
          <h4>Иероглифы</h4>
        </div>

        <button
          v-for="item in chineseItems"
          :key="`zh-${item.id}`"
          class="match-card"
          :class="{
            selected: selectedChinese?.id === item.id,
            matched: matchedIds.includes(item.id),
            wrong: wrongPair && selectedChinese?.id === item.id,
          }"
          @click="selectChinese(item)"
        >
          <span class="card-text chinese-text">{{ item.text }}</span>
        </button>
      </div>

      <div class="column">
        <div class="column-title">
          <span>译</span>
          <h4>Перевод</h4>
        </div>

        <button
          v-for="item in translationItems"
          :key="`ru-${item.id}`"
          class="match-card"
          :class="{
            selected: selectedTranslation?.id === item.id,
            matched: matchedIds.includes(item.id),
            wrong: wrongPair && selectedTranslation?.id === item.id,
          }"
          @click="selectTranslation(item)"
        >
          <span class="card-text">{{ item.text }}</span>
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="wrongPair" class="feedback wrong-feedback">
        Пара не совпадает. Попробуйте ещё раз.
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isCompleted" class="feedback success-feedback">
        Отлично! Все пары найдены 🎉
      </div>
    </transition>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.card-task {
  width: 100%;
  padding: 4px;
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.task-header h3 {
  margin: 0 0 6px;
  color: #2d2723;
  font-size: 1.45rem;
}

.task-header p {
  margin: 0;
  color: #7c726b;
  line-height: 1.5;
}

.progress-pill {
  min-width: 72px;
  height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  background: #fff1ec;
  color: #c84d3e;
  border: 1px solid #f2d3c9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.progress-bar {
  width: 100%;
  height: 10px;
  margin-bottom: 24px;
  border-radius: 999px;
  background: #f1ddd6;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #c84d3e 0%, #e57a63 100%);
  transition: width 0.25s ease;
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.column {
  padding: 18px;
  border-radius: 24px;
  background: #fffdf9;
  border: 1px solid #efe2d8;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.column-title span {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #fff1ec;
  color: #c84d3e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.column-title h4 {
  margin: 0;
  color: #2d2723;
  font-size: 1.1rem;
}

.match-card {
  width: 100%;
  min-height: 72px;
  margin-bottom: 12px;
  padding: 14px 16px;

  border: 1px solid #efe2d8;
  border-radius: 18px;
  background: linear-gradient(180deg, #fffdfa 0%, #f8f4ef 100%);

  color: #2f2a26;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;

  cursor: pointer;
  transition: 0.22s ease;

  display: flex;
  align-items: center;
  justify-content: center;

  word-break: break-word;
  white-space: normal;
}

.match-card:last-child {
  margin-bottom: 0;
}

.match-card:hover:not(.matched) {
  transform: translateY(-2px);
  border-color: #e8b7aa;
  box-shadow: 0 12px 24px rgba(83, 61, 47, 0.08);
}

.match-card.selected {
  border-color: #c84d3e;
  background: #fff1ec;
  color: #c84d3e;
  box-shadow: 0 0 0 4px rgba(200, 77, 62, 0.12);
}

.match-card.matched {
  border-color: #cfe6d0;
  background: #f0f8ef;
  color: #497b50;
  cursor: default;
}

.match-card.wrong {
  border-color: #f0c8c2;
  background: #fff1ef;
  color: #b34033;
  animation: shake 0.25s ease;
}

.card-text {
  line-height: 1.45;
}

.chinese-text {
  font-size: 1.7rem;
  line-height: 1.2;
}

.feedback {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  text-align: center;
  font-weight: 700;
}

.success-feedback {
  background: #f0f8ef;
  color: #497b50;
  border: 1px solid #cfe6d0;
}

.wrong-feedback {
  background: #fff1ef;
  color: #b34033;
  border: 1px solid #f0c8c2;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  30% {
    transform: translateX(-4px);
  }

  60% {
    transform: translateX(4px);
  }

  100% {
    transform: translateX(0);
  }
}

@media (max-width: 760px) {
  .task-header {
    flex-direction: column;
  }

  .columns {
    grid-template-columns: 1fr;
  }

  .column {
    padding: 14px;
  }
}

.card-task-dark .task-header h3,
.card-task-dark .column-title h4 {
  color: #ffffff;
}

.card-task-dark .task-header p {
  color: rgba(255, 255, 255, 0.62);
}

.card-task-dark .progress-pill {
  background: rgba(205, 7, 30, 0.16);
  color: #ff4b5f;
  border: 1px solid rgba(255, 75, 95, 0.32);
}

.card-task-dark .progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

.card-task-dark .progress-fill {
  background: linear-gradient(90deg, #cd071e 0%, #ff4b5f 100%);
}

.card-task-dark .column {
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.card-task-dark .column-title span {
  background: rgba(205, 7, 30, 0.16);
  color: #ff4b5f;
}

.card-task-dark .match-card {
  background:
    radial-gradient(
      circle at top left,
      rgba(205, 7, 30, 0.08),
      transparent 36%
    ),
    linear-gradient(180deg, #17171d 0%, #101014 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #ffffff;
}

.card-task-dark .match-card:hover:not(.matched) {
  border-color: rgba(255, 75, 95, 0.42);
  box-shadow: 0 12px 24px rgba(205, 7, 30, 0.14);
}

.card-task-dark .match-card.selected {
  border-color: #ff4b5f;
  background: rgba(205, 7, 30, 0.18);
  color: #ff4b5f;
  box-shadow: 0 0 0 4px rgba(255, 75, 95, 0.14);
}

.card-task-dark .match-card.matched {
  border-color: rgba(143, 209, 139, 0.35);
  background: rgba(93, 145, 92, 0.16);
  color: #8fd18b;
}

.card-task-dark .match-card.wrong {
  border-color: rgba(255, 138, 150, 0.42);
  background: rgba(205, 7, 30, 0.16);
  color: #ff8a96;
}

.card-task-dark .success-feedback {
  background: rgba(93, 145, 92, 0.16);
  color: #8fd18b;
  border: 1px solid rgba(143, 209, 139, 0.35);
}

.card-task-dark .wrong-feedback {
  background: rgba(205, 7, 30, 0.16);
  color: #ff8a96;
  border: 1px solid rgba(255, 138, 150, 0.38);
}
</style>
