import Vue from "vue";
import EmailUsername from "@/components/selfservice/forgotusername/EmailUsername";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("EmailUsername.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("EmailUsername component loaded", () => {
    const wrapper = mount(EmailUsername, {
      i18n,
      propsData: {
        apiType: "username",
        advanceStage: null,
        selfServiceDetails: null,
      },
    });

    expect(wrapper.name()).to.equal("Email-Username");
  });
});
