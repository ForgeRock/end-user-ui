import Vue from "vue";
import NotFound from "@/components/NotFound";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("NotFound.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Not found page loaded", () => {
    const wrapper = mount(NotFound, {
      i18n,
      stubs: {
        "router-link": true,
      },
    });

    expect(wrapper.name()).to.equal("NotFound");
  });
});
