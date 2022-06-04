import Vue from "vue";
import ResetStage from "@/components/selfservice/passwordreset/ResetStage";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import sinon from "sinon";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("ResetStage.vue", () => {
  ResetStage.components["fr-policy-password-input"] = sinon.stub();

  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    mountWrapper = () => {
      return mount(ResetStage, {
        i18n,
        propsData: {
          advanceStage: null,
          selfServiceDetails: {
            tag: "initial",
          },
          $route: {
            params: null,
          },
        },
      });
    };

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  it.skip("ResetStage component loaded", () => {
    const wrapper = mountWrapper();

    expect(wrapper.name()).to.equal("Reset-Stage");
  });

  it.skip("ResetStage getData() returns proper output", () => {
    const expectedResult = {
        password: "testTest1",
      },
      wrapper = mountWrapper();
    let actualResult = null;

    wrapper.vm.password = "testTest1";

    actualResult = wrapper.vm.getData();
    expect(JSON.stringify(actualResult)).to.equal(
      JSON.stringify(expectedResult)
    );
  });

  it.skip("ResetStage emits advanceStage() on save", (done) => {
    const wrapper = mountWrapper();

    // Trigger a save to verify after is valid promise
    wrapper.vm.save();

    expect(wrapper.emitted().advanceStage.length).to.equal(1);
    done();
  });
});
