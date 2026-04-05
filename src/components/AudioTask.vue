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
});

const show = ref(false);

let mediaRecorder = null;
let mediaStream = null;
const chunks = ref([]);
const recording = ref(false);

function showPinini() {
  show.value = !show.value;
}

// воспроизведение аудио диктора
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

// запись звука с микрофона пользователя
const toggleRecording = async () => {
  if (recording.value) {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach((track) => track.stop());
    recording.value = false;
    return;
  }

  try {
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
        const response = await api.post(
          `/api/tasks/${props.task_id}/upload-audio/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        console.log("Audio uploaded successfully", response.data);
      } catch (error) {
        console.error("Error uploading audio", error);
        alert("Не удалось загрузить запись.");
      } finally {
        chunks.value = [];
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
  <div class="task">
    <button id="play_audio" @click="playAudio">
      <img src="../pictures/play-button.png" alt="" />
    </button>

    <button id="show_pinini" @click="showPinini">
      <img src="../pictures/show-button.png" alt="" />
    </button>

    <p id="initial_text">{{ initial_text }}</p>

    <button id="record_button" @click="toggleRecording">
      <img src="../pictures/record-button.png" alt="" />
    </button>

    <br />
    <p v-show="show" id="pinini">{{ pinini }}</p>
  </div>
</template>

<style scoped>
.task {
  display: inline-block;
  text-align: center;
  margin-bottom: 40px;
}
#play_audio,
#show_pinini,
#record_button {
  background: none;
  border: none;
  width: 30px;
}
#play_audio:hover,
#show_pinini:hover,
#record_button:hover {
  opacity: 0.5;
}

#show_pinini {
  margin-right: 10px;
}

#initial_text {
  font-size: 40px;
  font-weight: bold;
}
button,
p {
  display: inline-block;
}

#pinini {
  font-size: 20px;
  margin-top: 10px;
  color: #cd071e;
}
</style>
