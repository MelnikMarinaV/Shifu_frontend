import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import AppHeader from "@/components/AppHeader.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),

  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    user: {
      username: "marina",
      email: "marina@example.com",
    },

    logout: vi.fn(),
    updateProfilePicture: vi.fn(),
  }),
}));

describe("AppHeader.vue", () => {
  it("отображает имя пользователя", () => {
    const wrapper = mount(AppHeader, {
      props: {
        theme: "light",
      },
    });

    expect(wrapper.text()).toContain("marina");
  });

  it("отображает fallback initials", () => {
    const wrapper = mount(AppHeader, {
      props: {
        theme: "light",
      },
    });

    expect(wrapper.text()).toContain("M");
  });

  it("применяет светлую тему", () => {
    const wrapper = mount(AppHeader, {
      props: {
        theme: "light",
      },
    });

    expect(wrapper.find("header").classes()).toContain("header-light");
  });

  it("применяет тёмную тему", () => {
    const wrapper = mount(AppHeader, {
      props: {
        theme: "dark",
      },
    });

    expect(wrapper.find("header").classes()).toContain("header-dark");
  });

  it("отображает кнопку выхода", () => {
    const wrapper = mount(AppHeader, {
      props: {
        theme: "light",
      },
    });

    expect(wrapper.text()).toContain("Выйти");
  });
});
