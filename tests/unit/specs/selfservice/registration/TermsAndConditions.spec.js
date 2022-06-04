import Vue from "vue";
import TermsAndConditions from "@/components/selfservice/registration/TermsAndConditions";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("TermsAndConditions.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("TermsAndConditions component loaded", () => {
    const wrapper = mount(TermsAndConditions, {
      i18n,
      propsData: {
        selfServiceDetails: {
          requirements: {
            terms: "test",
          },
        },
      },
    });

    expect(wrapper.name()).to.equal("Terms-And-Conditions");
  });

  it("TermsAndConditions gather data", () => {
    const wrapper = mount(TermsAndConditions, {
        i18n,
        propsData: {
          selfServiceDetails: {
            requirements: {
              terms: "test",
            },
          },
        },
      }),
      data = wrapper.vm.getData();

    expect(data.accept).to.equal("true");
  });

  it("TermsAndConditions validation", (done) => {
    const wrapper = mount(TermsAndConditions, {
      i18n,
      propsData: {
        selfServiceDetails: {
          requirements: {
            terms: "test",
          },
        },
      },
    });

    wrapper.vm.isValid().then((response) => {
      expect(response).to.equal(true);

      done();
    });
  });

  it("TermsAndConditions inline mode", () => {
    const wrapper = mount(TermsAndConditions, {
      i18n,
      propsData: {
        selfServiceDetails: {
          requirements: {
            terms: "test",
          },
        },
        inline: true,
      },
    });

    expect(wrapper.contains("a")).to.equal(true);
  });

  it("TermsAndConditions save event emitted", () => {
    const wrapper = mount(TermsAndConditions, {
      i18n,
      propsData: {
        selfServiceDetails: {
          requirements: {
            terms: "test",
          },
        },
        inline: true,
      },
    });

    wrapper.vm.save();

    expect(wrapper.emitted().advanceStage.length).to.equal(1);
  });
});
