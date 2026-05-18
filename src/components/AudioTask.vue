<script setup>
import { ref } from "vue";
import api from "@/api/http";

const props = defineProps({
  initial_text: {
    type: String,
    required: true,
  },
  pinini: {
    type: String,
    required: true,
  },
  task_id: {
    type: Number,
    required: true,
  },
  theme: {
    type: String,
    default: "light",
  },
});

const show = ref(false);
const recording = ref(false);
const uploading = ref(false);
const uploaded = ref(false);

let mediaRecorder = null;
let mediaStream = null;
const chunks = ref([]);

function showPinini() {
  show.value = !show.value;
}

async function playAudio() {
  try {
    const response = await api.get(`/api/tasks/${props.task_id}/audio/`, {
      responseType: "blob",
    });

    const audioBlob = response.data;
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await audio.play();
  } catch (error) {
    console.error("Ошибка при воспроизведении аудио:", error);
    alert("Не удалось воспроизвести аудио.");
  }
}

const toggleRecording = async () => {
  if (recording.value) {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach((track) => track.stop());
    recording.value = false;
    return;
  }

  try {
    uploaded.value = false;
    chunks.value = [];

    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.value.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const mimeType = chunks.value[0]?.type || "audio/webm";
      const extension = mimeType.includes("mpeg")
        ? "mp3"
        : mimeType.includes("ogg")
          ? "ogg"
          : "webm";

      const blob = new Blob(chunks.value, { type: mimeType });
      const formData = new FormData();
      formData.append("audio", blob, `recording.${extension}`);

      try {
        uploading.value = true;

        await api.post(`/api/tasks/${props.task_id}/upload-audio/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploaded.value = true;
      } catch (error) {
        console.error("Error uploading audio", error);
        alert("Не удалось загрузить запись.");
      } finally {
        chunks.value = [];
        uploading.value = false;
      }
    };

    mediaRecorder.start();
    recording.value = true;
  } catch (err) {
    console.error("Error accessing microphone", err);
    alert("Не удалось получить доступ к микрофону.");
  }
};
</script>

<template>
  <div
    class="audio-task"
    :class="props.theme === 'dark' ? 'audio-task-dark' : 'audio-task-light'"
  >
    <div class="task-main">
      <button class="icon-btn play-btn" type="button" @click="playAudio">
        ▶
      </button>

      <div class="phrase-block">
        <p class="hanzi">{{ initial_text }}</p>

        <transition name="fade">
          <p v-if="show" class="pinini">
            {{ pinini }}
          </p>
        </transition>
      </div>

      <button class="icon-btn show-btn" type="button" @click="showPinini">
        {{ show ? "隐藏" : "拼" }}
      </button>

      <button
        class="record-btn"
        type="button"
        :class="{ recording: recording }"
        @click="toggleRecording"
      >
        <span class="record-dot"></span>
        {{ recording ? "Остановить" : "Записать" }}
      </button>
    </div>

    <div class="task-status">
      <span v-if="recording" class="status recording-status">
        Идёт запись...
      </span>

      <span v-else-if="uploading" class="status uploading-status">
        Загрузка записи...
      </span>

      <span v-else-if="uploaded" class="status uploaded-status">
        Запись отправлена
      </span>

      <span v-else class="status default-status">
        Прослушайте фразу и повторите её своим голосом
      </span>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.audio-task {
  width: 100%;
  max-width: 760px;
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fffdfa 0%, #f8f4ef 100%);
  border: 1px solid #efe2d8;
  box-shadow: 0 12px 28px rgba(83, 61, 47, 0.05);
}

.task-main {
  display: grid;
  grid-template-columns: 52px 1fr 52px auto;
  align-items: center;
  gap: 14px;
}

.icon-btn {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  border: none;
  background: #fff1ec;
  color: #c84d3e;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.25s ease;
}

.icon-btn:hover {
  background: #c84d3e;
  color: white;
  transform: translateY(-1px);
}

.phrase-block {
  min-height: 74px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.hanzi {
  margin: 0;
  font-size: 2.6rem;
  line-height: 1.1;
  font-weight: 800;
  color: #2d2723;
}

.pinini {
  margin: 8px 0 0;
  font-size: 1.05rem;
  line-height: 1.5;
  color: #c84d3e;
  font-weight: 700;
}

.record-btn {
  height: 52px;
  padding: 0 18px;
  border-radius: 16px;
  border: none;
  background: #c84d3e;
  color: white;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  transition: 0.25s ease;
  box-shadow: 0 10px 24px rgba(200, 77, 62, 0.16);
}

.record-btn:hover {
  background: #b74234;
  transform: translateY(-1px);
}

.record-btn.recording {
  background: #2d2723;
}

.record-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
}

.recording .record-dot {
  animation: pulse 1s infinite;
}

.task-status {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #efe2d8;
  text-align: center;
}

.status {
  font-size: 0.95rem;
  font-weight: 600;
}

.default-status {
  color: #7c726b;
}

.recording-status {
  color: #c84d3e;
}

.uploading-status {
  color: #c89125;
}

.uploaded-status {
  color: #4f8a55;
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(1.35);
  }
}

@media (max-width: 760px) {
  .task-main {
    grid-template-columns: 1fr;
  }

  .icon-btn,
  .record-btn {
    width: 100%;
  }

  .phrase-block {
    order: -1;
  }

  .hanzi {
    font-size: 2.2rem;
  }
}

.audio-task-dark {
  background:
    radial-gradient(
      circle at top left,
      rgba(205, 7, 30, 0.14),
      transparent 36%
    ),
    linear-gradient(180deg, #17171d 0%, #101014 100%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.35);
}

.audio-task-dark .icon-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #ff4b5f;
}

.audio-task-dark .icon-btn:hover {
  background: linear-gradient(135deg, #cd071e, #ff4b5f);
  color: #ffffff;
}

.audio-task-dark .hanzi {
  color: #ffffff;
}

.audio-task-dark .pinini {
  color: #ff4b5f;
}

.audio-task-dark .record-btn {
  background: linear-gradient(135deg, #cd071e, #ff4b5f);
  box-shadow: 0 10px 24px rgba(205, 7, 30, 0.28);
}

.audio-task-dark .record-btn.recording {
  background: #ffffff;
  color: #121218;
}

.audio-task-dark .record-btn.recording .record-dot {
  background: #cd071e;
}

.audio-task-dark .task-status {
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.audio-task-dark .default-status {
  color: rgba(255, 255, 255, 0.58);
}

.audio-task-dark .recording-status {
  color: #ff4b5f;
}

.audio-task-dark .uploading-status {
  color: #ffd16a;
}

.audio-task-dark .uploaded-status {
  color: #8fd18b;
}
</style>
