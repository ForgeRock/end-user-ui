import _ from "lodash";
import Vue from "vue";
import Registration from "@/components/selfservice/registration";
import VueI18n from "vue-i18n";
import VeeValidate from "vee-validate";
import Sinon from "sinon";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount, shallowMount } from "@vue/test-utils";
import { expect } from "chai";

describe("Registration.vue", () => {
  let testContext,
    sandbox = null;

  beforeEach(() => {
    testContext = {};
  });

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);
  Vue.use(VeeValidate);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(Registration, "mounted").callsFake(() => {
      testContext.selfServiceType = null;
      testContext.advanceStage = _.noop;
      testContext.displayNotification = () => {};
      testContext.$router = [];
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it.skip("Registration page loaded", () => {
    const wrapper = mount(Registration, {
      i18n,
      stubs: {
        "router-link": true,
      },
    });

    expect(wrapper.name()).to.equal("Registration");
  });

  it.skip("Registration loading screen", () => {
    const wrapper = mount(Registration, {
      i18n,
      stubs: {
        "router-link": true,
      },
    });

    expect(wrapper.contains(".v-spinner")).to.equal(true);
  });

  it.skip("Registration properly load user details stage", () => {
    const wrapper = shallowMount(Registration, {
      i18n,
      stubs: {
        "router-link": true,
      },
    });

    wrapper.vm.setChildComponent("idmUserDetails", {});

    expect(wrapper.vm.selfServiceType).to.equal("idmUserDetails");
  });

  it.skip("Registration properly handles parameters stage", () => {
    const wrapper = mount(Registration, {
      i18n,
      stubs: {
        "router-link": true,
      },
    });

    wrapper.vm.setChildComponent("parameters", {});

    expect(wrapper.vm.selfServiceType).to.equal(null);
    expect(wrapper.vm.showSelfService).to.equal(false);
  });

  it.skip("Registration apiErrorCallback properly sets showSelfService", () => {
    const wrapper = mount(Registration, {
      i18n,
      stubs: {
        "router-link": true,
      },
    });

    wrapper.setMethods({ loadData: () => {} });

    wrapper.vm.apiErrorCallback({
      response: {
        data: {
          detail: {
            failedPolicyRequirements: [
              {
                property: "userName",
                policyRequirements: [
                  {
                    policyRequirement: "UNIQUE",
                  },
                ],
              },
            ],
          },
          message: "test",
        },
      },
    });

    expect(wrapper.vm.showSelfService).to.equal(true);
  });

  it.skip("should properly compute title and subtitle", () => {
    const wrapper = shallowMount(Registration, {
        i18n,
        stubs: {
          "router-link": true,
        },
      }),
      customTitleComponents = [
        "captcha",
        "consent",
        "emailValidation",
        "kbaSecurityAnswerDefinitionStage",
        "termsAndConditions",
      ];

    customTitleComponents.forEach((component) => {
      wrapper.setData({ selfServiceType: component });
      expect(wrapper.vm.title).to.equal(
        wrapper.vm.$t(`pages.selfservice.registration.stageTitle.${component}`)
      );
      expect(wrapper.vm.subtitle).to.equal(
        wrapper.vm.$t(
          `pages.selfservice.registration.stageSubtitle.${component}`
        )
      );
    });
  });
});
