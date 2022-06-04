import Vue from "vue";
import SocialButtons from "@/components/utils/SocialButtons";
import VueI18n from "vue-i18n";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("SocialButtons.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();
    sandbox.stub(SocialButtons, "mounted").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Social Buttons loaded", () => {
    const wrapper = mount(SocialButtons, {
      i18n,
    });

    expect(wrapper.name()).to.equal("Social-Buttons");
  });

  it.skip("Displays a buttons", () => {
    const wrapper = mount(SocialButtons, {
      i18n,
    });

    wrapper.setData({
      providers: [
        {
          provider: "wordpress",
          uiConfig: {
            iconBackground: "#0095cc",
            iconClass: "fa-wordpress",
            iconFontColor: "white",
            buttonClass: "fa-wordpress",
            buttonDisplayName: "WordPress",
            buttonCustomStyle:
              "background-color: #0095cc; border-color: #0095cc; color:white;",
            buttonCustomStyleHover:
              "background-color: #0095cc; border-color: #0095cc; color:white;",
          },
        },
      ],
    });

    wrapper.vm.hover(0, "test");
    expect(wrapper.contains(".btn")).to.equal(true);
  });
});
