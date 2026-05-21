import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

import SideBar from "@/components/SideBar.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    name: "lessons",
  }),
  RouterLink: {
    template: "<a><slot /></a>",
  },
}));

describe("SideBar.vue", () => {
  it("отображает основные пункты меню", () => {
    const wrapper = mount(SideBar, {
      props: {
        theme: "light",
      },
    });

    expect(wrapper.text()).toContain("Главная");
    expect(wrapper.text()).toContain("Уроки");
    expect(wrapper.text()).toContain("Записи");
    expect(wrapper.text()).toContain("Настройки");
  });

  it("применяет светлую тему", () => {
    const wrapper = mount(SideBar, {
      props: {
        theme: "light",
      },
    });

    expect(wrapper.find("aside").classes()).toContain("sidebar-light");
  });

  it("применяет тёмную тему", () => {
    const wrapper = mount(SideBar, {
      props: {
        theme: "dark",
      },
    });

    expect(wrapper.find("aside").classes()).toContain("sidebar-dark");
  });

  it("открывает боковое меню при нажатии на кнопку бургер-меню", async () => {
    const wrapper = mount(SideBar, {
      props: {
        theme: "light",
      },
    });

    await wrapper.find(".burger-btn").trigger("click");

    expect(wrapper.find("aside").classes()).toContain("open");
  });

  it("закрывает боковое меню при нажатии на кнопку закрытия", async () => {
    const wrapper = mount(SideBar, {
      props: {
        theme: "light",
      },
    });

    await wrapper.find(".burger-btn").trigger("click");
    expect(wrapper.find("aside").classes()).toContain("open");

    await wrapper.find(".close-btn").trigger("click");
    expect(wrapper.find("aside").classes()).not.toContain("open");
  });
});
