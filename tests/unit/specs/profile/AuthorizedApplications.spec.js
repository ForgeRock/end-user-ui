import Vue from "vue";
import AuthorizedApplications from "@/components/profile/AuthorizedApplications";
import VueI18n from "vue-i18n";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("AuthorizedApplications.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();
    sandbox.stub(AuthorizedApplications, "mounted").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Authorized Applications loads", () => {
    const wrapper = shallowMount(AuthorizedApplications, {
      i18n,
    });

    expect(wrapper.name()).to.equal("Authorized-Applications");
  });

  it("showConfirmationModal sets correct application values and shows modal", () => {
    const spy = Sinon.spy(),
      wrapper = shallowMount(AuthorizedApplications, {
        i18n,
      });
    wrapper.vm.$refs = { fsModal: { show: spy } };
    wrapper.vm.showConfirmationModal({ _id: "12345" });

    expect(wrapper.vm.confirmApplication.id).to.equal("12345");
    expect(spy.called).to.equal(true);
  });
});
