import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(createPinia());
app.use(router);
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.classList.add(`theme-${savedTheme}`);
app.mount("#app");
