import Vue from "vue";
import ConditionalUser from "@/components/selfservice/progressiveprofile/ConditionalUser";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import sinon from "sinon";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("ConditionalUser.vue", () => {
  ConditionalUser.components["fr-floating-label-input"] = sinon.stub();

  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    mountWrapper = () => {
      return mount(ConditionalUser, {
        i18n,
        propsData: {
          advanceStage: null,
          selfServiceDetails: {
            requirements: {
              uiConfig: {
                displayName: "TESTNAME",
                purpose: "TESTPURPOSE",
                buttonText: "TESTBUTTONTEXT",
              },
              attributes: [
                {
                  name: "aBooleanAttribute",
                  isRequired: true,
                  schema: {
                    type: "boolean",
                  },
                },
              ],
            },
          },
        },
      });
    };

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  it("ConditionalUser component loaded", () => {
    const wrapper = mountWrapper();

    expect(wrapper.name()).to.equal("Conditional-User");
  });

  it("ConditionalUser getData() returns proper output when attributes are collected", () => {
    const expectedResult = {
        attributes: {
          aBooleanAttribute: true,
          postalAddress: "TESTPOSTALADDRESS",
        },
      },
      wrapper = mountWrapper();
    let actualResult = null;

    wrapper.vm.saveDetails.postalAddress = "TESTPOSTALADDRESS";

    actualResult = wrapper.vm.getData();
    expect(JSON.stringify(actualResult)).to.equal(
      JSON.stringify(expectedResult)
    );
  });

  it("ConditionalUser getData() returns proper output when an attribute is set to empty string", () => {
    const expectedResult = {
        attributes: {
          aBooleanAttribute: true,
          postalAddress: null,
        },
      },
      wrapper = mountWrapper();
    let actualResult = null;

    wrapper.vm.saveDetails.postalAddress = "";

    actualResult = wrapper.vm.getData();
    expect(JSON.stringify(actualResult)).to.equal(
      JSON.stringify(expectedResult)
    );
  });

  it("ConditionalUser emits advanceStage() on save", () => {
    const wrapper = mountWrapper();

    // Trigger a save to verify after is valid promise
    wrapper.vm.save();

    expect(wrapper.emitted().advanceStage.length).to.equal(1);
  });

  it("ConditionalUser save() sends proper input to advanceStage when submit button is pressed", () => {
    const expectedResult = {
        attributes: {
          aBooleanAttribute: true,
        },
      },
      wrapper = mountWrapper();

    wrapper.vm.save({});

    expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(
      JSON.stringify([expectedResult, true])
    );
  });

  it("ConditionalUser save() sends proper input to advanceStage when there is an empty requirements object", () => {
    const expectedResult = {},
      wrapper = mountWrapper();

    wrapper.vm.save(true);

    expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(
      JSON.stringify([expectedResult, true])
    );
  });

  it("ConditionalUser save() sends proper input to advanceStage when terms are updated", () => {
    const expectedResult = {
        accept: "true",
      },
      wrapper = mountWrapper();

    wrapper.vm.selfServiceDetails.requirements.terms = "Some fake terms";

    wrapper.vm.save();

    expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(
      JSON.stringify([expectedResult, true])
    );
  });

  it("ConditionalUser sets isSingleBooleanForm properly", () => {
    const wrapper = mountWrapper();

    wrapper.vm.handleBooleanValues();

    expect(wrapper.vm.isSingleBooleanForm).to.equal(true);

    // add another boolean property
    wrapper.vm.selfServiceDetails.requirements.attributes.push({
      name: "anotherBooleanAttribute",
      isRequired: true,
      schema: {
        type: "boolean",
      },
    });

    wrapper.vm.handleBooleanValues();

    expect(wrapper.vm.isSingleBooleanForm).to.equal(false);
  });

  it.skip("ConditionalUser component tries to advance stage when selfServiceDetails is updated", () => {
    const wrapper = mountWrapper();

    wrapper.vm.selfServiceDetails.requirements = {};
    expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(
      JSON.stringify([{}, true])
    );
  });
});
