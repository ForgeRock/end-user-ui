import Vue from "vue";
import ForgotUsername from "@/components/selfservice/forgotusername";
import VueI18n from "vue-i18n";
import Sinon from "sinon";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("ForgotUsername.vue", () => {
  let testContext,
    sandbox = null;

  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    mountWrapper = () => {
      return mount(ForgotUsername, {
        i18n,
        stubs: {
          "router-link": true,
        },
        propsData: {
          apiType: "username",
        },
      });
    };

  beforeEach(() => {
    testContext = {};
  });

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(ForgotUsername, "mounted").callsFake(() => {
      testContext.selfServiceType = null;
      testContext.serviceDetails = null;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("forgotusername page loaded", () => {
    const wrapper = mountWrapper();

    expect(wrapper.name()).to.equal("Forgot-Username");
  });

  it("forgotusername loading screen", () => {
    const wrapper = mountWrapper();

    expect(wrapper.contains(".v-spinner")).to.equal(true);
  });

  it("forgotusername properly sets child component to emailUsername stage", () => {
    const wrapper = mountWrapper();
    wrapper.vm.setChildComponent("emailUsername", {
      requirements: {
        properties: {
          answer: {
            type: "boolean",
            description: "math",
          },
        },
      },
    });

    expect(wrapper.vm.selfServiceType).to.equal("GenericSelfService");
  });
});
