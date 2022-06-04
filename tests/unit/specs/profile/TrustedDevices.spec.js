import Vue from "vue";
import TrustedDevices from "@/components/profile/TrustedDevices";
import VueI18n from "vue-i18n";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("TrustedDevices.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();
    sandbox.stub(TrustedDevices, "mounted").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Trusted Devices loads", () => {
    const wrapper = shallowMount(TrustedDevices, {
      i18n,
    });

    expect(wrapper.name()).to.equal("Trusted-Devices");
  });

  it("showConfirmationModal sets correct device values and shows modal", () => {
    const spy = Sinon.spy(),
      wrapper = shallowMount(TrustedDevices, {
        i18n,
      });
    wrapper.vm.$refs = { fsModal: { show: spy } };
    wrapper.vm.showConfirmationModal({ uuid: "12345", name: "test" });

    expect(wrapper.vm.confirmDevice.id).to.equal("12345");
    expect(wrapper.vm.confirmDevice.name).to.equal("test");
    expect(spy.called).to.equal(true);
  });
});
