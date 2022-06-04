import Vue from "vue";
import OAuthReturn from "@/components/OAuthReturn";
import VueI18n from "vue-i18n";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("OAuthReturn.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();
    sandbox.stub(OAuthReturn, "created").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("OAuth Return loaded", () => {
    const wrapper = mount(OAuthReturn, {
      i18n,
    });

    expect(wrapper.name()).to.equal("OAuth-Return");
  });
});
