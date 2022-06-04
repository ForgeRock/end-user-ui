import Vue from "vue";
import VueI18n from "vue-i18n";
import AccountSecurity from "@/components/profile/AccountSecurity";
import BootstrapVue from "bootstrap-vue";
import { shallowMount } from "@vue/test-utils";
import Sinon from "sinon";
import translations from "@/translations";
import { expect } from "chai";

describe("AccountSecurity.vue", () => {
  let testContext,
    sandbox = null;

  beforeEach(() => {
    testContext = {};
  });

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(AccountSecurity, "mounted").callsFake(() => {
      testContext.isOnKBA = true;
      testContext.kbaData = {};
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("AccountSecurity page loaded", () => {
    const userStore = {
        state: {
          internalUser: true,
        },
      },
      wrapper = shallowMount(AccountSecurity, {
        i18n,
        mocks: {
          userStore,
        },
      });

    expect(wrapper.name()).to.equal("Account-Security");
  });

  describe("#sendUpdateProfile", () => {
    it('should emit an "updateProfile" event with the payload and config', () => {
      let payload = null,
        config = null;

      const userStore = {
          state: {
            internalUser: true,
          },
        },
        wrapper = shallowMount(AccountSecurity, {
          i18n,
          mocks: {
            userStore,
          },
        });

      wrapper.vm.sendUpdateProfile("test payload", "test config");
      expect(wrapper.emitted().updateProfile.length).to.equal(1);

      [payload, config] = wrapper.emitted().updateProfile[0];

      expect(payload).to.equal("test payload");
      expect(config).to.equal("test config");
    });
  });
});
