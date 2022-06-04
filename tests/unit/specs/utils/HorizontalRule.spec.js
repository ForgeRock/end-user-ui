import Vue from "vue";
import HorizontalRule from "@/components/utils/HorizontalRule";
import BootstrapVue from "bootstrap-vue";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("HorizontalRule.vue", () => {
  Vue.use(BootstrapVue);

  it("Horizontal Rule component loaded", () => {
    const wrapper = mount(HorizontalRule, {
      propsData: {
        insert: "test",
      },
    });

    expect(wrapper.name()).to.equal("Horizontal-Rule");
  });

  it("Renders insert prop", () => {
    const wrapper = mount(HorizontalRule, {
      propsData: {
        insert: "test",
      },
    });

    expect(wrapper.find(".col-auto").text()).to.equal("test");
  });
});
