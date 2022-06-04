import Vue from "vue";
import PasswordReset from "@/components/selfservice/passwordreset";
import SelfserviceAPI from "@/components/selfservice/mixins/SelfserviceAPIMixin";
import VueI18n from "vue-i18n";
import Sinon from "sinon";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("PasswordReset.vue", () => {
  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    mountWrapper = () => {
      return mount(PasswordReset, {
        i18n,
        propsData: {
          apiType: "reset",
        },
      });
    };

  let testContext = null,
    sandbox = null;

  beforeEach(() => {
    testContext = {};
  });

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(PasswordReset, "mounted").callsFake(() => {
      testContext.selfServiceType = null;
      testContext.serviceDetails = null;
    });

    sandbox.stub(SelfserviceAPI.methods, "advanceStage").callsFake(() => {
      return true;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("PasswordReset page loaded", () => {
    const wrapper = mountWrapper();

    expect(wrapper.name()).to.equal("Password-Reset");
  });

  it("PasswordReset loading screen", () => {
    const wrapper = mountWrapper();

    expect(wrapper.contains(".v-spinner")).to.equal(true);
  });

  it("PasswordReset properly sets child component to resetStage stage", () => {
    const wrapper = mountWrapper();
    wrapper.vm.setChildComponent("resetStage", {
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

  it('PasswordReset properly sets selfServiceType to null when stage is "parameters"', () => {
    const wrapper = mountWrapper();
    wrapper.vm.setChildComponent("parameters", {
      advanceStage: null,
      selfServiceDetails: null,
    });

    expect(wrapper.vm.selfServiceType).to.equal(null);
  });

  it('PasswordReset parseQueryParams returns correct value without "returnParams"', () => {
    const input = "&token=MY_TOKEN&code=MY_CODE",
      expectedResult = {
        token: "MY_TOKEN",
        code: "MY_CODE",
      },
      wrapper = mountWrapper(),
      actualResult = wrapper.vm.parseQueryParams(input);

    expect(JSON.stringify(actualResult)).to.equal(
      JSON.stringify(expectedResult)
    );
  });

  it('PasswordReset parseQueryParams returns correct value with "returnParams"', () => {
    const input = "&returnParams=MYRETURNPARAMS",
      expectedResult = {
        returnParams: "MYRETURNPARAMS",
      },
      wrapper = mountWrapper();

    let actualResult = null;

    actualResult = wrapper.vm.parseQueryParams(input);

    expect(JSON.stringify(actualResult)).to.equal(
      JSON.stringify(expectedResult)
    );
  });

  it("PasswordReset calls setChildComponent() on api error", (done) => {
    const wrapper = mount(PasswordReset, {
      i18n,
      propsData: {
        apiType: "reset",
        selfServiceDetails: {
          requirements: {
            properties: {
              answer: {
                type: "boolean",
                description: "math",
              },
            },
          },
        },
      },
    });

    // Trigger a save to verify after is valid promise
    wrapper.vm.apiErrorCallback({
      response: {
        data: {
          message: "testError",
        },
      },
    });

    expect(wrapper.vm.selfServiceType).to.equal("GenericSelfService");
    expect(wrapper.vm.selfServiceDetails.error).to.equal("testError");
    done();
  });
});
