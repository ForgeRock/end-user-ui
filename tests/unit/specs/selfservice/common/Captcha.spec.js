import Vue from "vue";
import Captcha from "@/components/selfservice/common/Captcha";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("Captcha.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(Captcha, "mounted").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Captcha component loaded", () => {
    const wrapper = mount(Captcha, {
      i18n,
      propsData: {
        apiType: "username",
        selfServiceDetails: null,
        advanceStage: () => true,
      },
    });

    expect(wrapper.name()).to.equal("Captcha");
  });

  it("Captcha handleCaptchaCallback sets proper value", () => {
    const wrapper = mount(Captcha, {
      i18n,
      propsData: {
        apiType: "username",
        selfServiceDetails: null,
        advanceStage: () => true,
      },
    });

    wrapper.vm.handleCaptchaCallback("test");
    expect(wrapper.vm.recaptchaResponse).to.equal("test");
  });

  it("Captcha getData() returns proper output", () => {
    const wrapper = mount(Captcha, {
        i18n,
        propsData: {
          apiType: "username",
          selfServiceDetails: null,
          advanceStage: () => true,
        },
      }),
      expectedResult = {
        response: "test",
        "g-recaptcha-response": "test",
      };

    wrapper.vm.handleCaptchaCallback("test");

    expect(JSON.stringify(wrapper.vm.getData())).to.equal(
      JSON.stringify(expectedResult)
    );
  });
});
