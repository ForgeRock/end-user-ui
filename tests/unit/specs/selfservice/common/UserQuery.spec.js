import Vue from "vue";
import UserQuery from "@/components/selfservice/common/UserQuery";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("UserQuery.vue", () => {
  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    mountWrapper = () => {
      return mount(UserQuery, {
        i18n,
        propsData: {
          apiType: "username",
          advanceStage: null,
          selfServiceDetails: null,
        },
      });
    };
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  it("UserQuery component loaded", () => {
    const wrapper = mountWrapper();

    expect(wrapper.name()).to.equal("User-Query");
  });

  it("UserQuery getData() returns proper output", () => {
    const expectedResult = {
        queryFilter: 'mail eq "test@test.com"',
      },
      wrapper = mountWrapper();

    wrapper.vm.mail = "test@test.com";

    expect(JSON.stringify(wrapper.vm.getData())).to.equal(
      JSON.stringify(expectedResult)
    );
  });
});
