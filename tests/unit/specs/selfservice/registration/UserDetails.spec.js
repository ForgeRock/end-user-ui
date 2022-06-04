import Vue from "vue";
import UserDetails from "@/components/selfservice/registration/UserDetails";
import VueI18n from "vue-i18n";
import VeeValidate from "vee-validate";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import sinon from "sinon";
import { expect } from "chai";

UserDetails.components["fr-policy-password-input"] = sinon.stub();

describe("UserDetails.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);
  Vue.use(VeeValidate, { inject: false, fastExit: false });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("User Details component loaded", () => {
    const wrapper = shallowMount(UserDetails, {
      i18n,
      propsData: {
        selfServiceDetails: {},
      },
    });

    expect(wrapper.name()).to.equal("User-Details");
  });

  it("User Details calculate validators", () => {
    const wrapper = shallowMount(UserDetails, {
        i18n,
        propsData: {
          selfServiceDetails: {},
        },
      }),
      property = {
        required: true,
        policies: [
          {
            policyId: "valid-email-address-format",
          },
        ],
      };

    expect(wrapper.vm.calculateValidation(property)).to.equal("required|email");
  });

  it("User Details gather data", () => {
    const wrapper = shallowMount(UserDetails, {
        i18n,
        propsData: {
          selfServiceDetails: {
            tag: "initial",
            requirements: {
              registrationPreferences: {
                test: {
                  description: "Send me special offers and services",
                },
              },
              registrationProperties: {
                properties: {
                  sn: {
                    description: "Last Name",
                    title: "Last Name",
                  },
                },
                required: ["sn"],
              },
            },
          },
        },
      }),
      data = wrapper.vm.getData();

    expect(data.user.password).to.equal("");
  });
});
