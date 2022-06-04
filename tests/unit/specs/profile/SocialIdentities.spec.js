import Vue from "vue";
import VueI18n from "vue-i18n";
import SocialIdentities from "@/components/profile/SocialIdentities";
import { mount } from "@vue/test-utils";
import translations from "@/translations";
import Sinon from "sinon";
import { expect } from "chai";

describe("SocialIdentities.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();
    sandbox.stub(SocialIdentities, "mounted").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Social Identities loaded", () => {
    const wrapper = mount(SocialIdentities, {
      i18n,
    });

    expect(wrapper.name()).to.equal("Social-Identities");
  });

  it.skip("Social Identities shows and hides the disconnect modal", () => {
    const wrapper = mount(SocialIdentities, {
      i18n,
    });

    wrapper.setData({
      toDisconnect: {},
      providers: [
        { provider: "test", uiConfig: { buttonImage: "test" } },
        { provider: "test2", uiConfig: { buttonImage: "test2" } },
      ],
    });

    wrapper.vm.showModal("test");
    expect(wrapper.vm.toDisconnect.provider).to.equal("test");
    wrapper.vm.hideModal();
    expect(wrapper.vm.toDisconnect.provider).to.equal(undefined);
  });

  it("Social Identities merges provider objects", () => {
    const wrapper = mount(SocialIdentities, {
      i18n,
    });
    let providers = null;

    wrapper.setData({
      allAvailableProviders: [
        { provider: "facebook", uiConfig: { buttonImage: "test" } },
        { provider: "wordpress", uiConfig: { buttonImage: "test2" } },
        { provider: "google", uiConfig: { buttonImage: "test3" } },
        { provider: "linkedin", uiConfig: { buttonImage: "test4" } },
      ],
      connectedProviders: [
        {
          provider: "google",
          _refResourceCollection: "managed/google",
          uiConfig: { buttonImage: "test2" },
        },
        {
          provider: "facebook",
          _refResourceCollection: "managed/facebook",
          uiConfig: { buttonImage: "test3" },
        },
      ],
    });

    providers = wrapper.vm.setProviders();
    expect(providers[0]).to.have.property("_refResourceCollection");
    expect(providers[1]).to.not.have.property("_refResourceCollection");
    expect(providers[2]).to.have.property("_refResourceCollection");
    expect(providers[3]).to.not.have.property("_refResourceCollection");
  });
});
