import Vue from "vue";
import FloatingLabelInput from "@/components/utils/CenterCard";
import BootstrapVue from "bootstrap-vue";
import VueI18n from "vue-i18n";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("CenterCard.vue", () => {
  Vue.use(BootstrapVue);
  Vue.use(VueI18n);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Center Card component loaded without header images", () => {
    const wrapper = mount(FloatingLabelInput, { i18n });

    expect(wrapper.name()).to.equal("Center-Card");
    expect(wrapper.contains(".fr-logo")).to.equal(false);
  });

  it("Center Card component loaded with header images", () => {
    const wrapper = mount(FloatingLabelInput, {
      i18n,
      propsData: {
        showLogo: true,
      },
    });

    expect(wrapper.contains(".fr-logo")).to.equal(true);
  });
});
