import Vue from "vue";
import Dashboard from "@/components/dashboard";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import sinon from "sinon";
import { expect } from "chai";

describe("Dashboard.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Dashboard page loaded", () => {
    const userStore = {
        getUserState() {
          return {};
        },
      },
      applicationStore = {
        state: {
          workflow: true,
        },
      },
      wrapper = shallowMount(Dashboard, {
        i18n,
        methods: { loadData: sinon.stub() },
        mocks: {
          userStore,
          applicationStore,
        },
      });

    expect(wrapper.name()).to.equal("Dashboard");
  });
});
