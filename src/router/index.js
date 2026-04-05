// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Login from "../views/Login.vue";
import Lessons from "../views/Lessons.vue";
import MySubmissions from "@/views/MySubmissions.vue";
import Register from "@/views/Register.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/lessons",
    name: "lessons",
    component: Lessons,
    meta: { requiresAuth: true },
  },
  {
    path: "/lesson/:id",
    name: "lesson-detail",
    component: () => import("../views/Lesson.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/my-submissions",
    name: "my-submissions",
    component: MySubmissions,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// navigation guard
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // If we have a refresh token but not the user yet (page load), bootstrap
  if (!auth.user && auth.refreshToken) {
    await auth.bootstrap();
  }

  // Redirect unauthenticated users away from protected routes
  if (to.meta.requiresAuth && !auth.user) {
    return { name: "login" };
  }

  // Prevent logged-in users from going back to the login page
  if (to.name === "login" && auth.user) {
    return { name: "lessons" };
  }
});

export default router;
