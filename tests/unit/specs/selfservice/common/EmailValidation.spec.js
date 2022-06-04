import Vue from "vue";
import EmailValidation from "@/components/selfservice/common/EmailValidation";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("EmailValidation.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("EmailValidation component loaded", () => {
    const wrapper = mount(EmailValidation, {
      i18n,
      propsData: {
        apiType: "reset",
        advanceStage: null,
        selfServiceDetails: null,
      },
    });

    expect(wrapper.name()).to.equal("Email-Validation");
  });
});
