import Vue from "vue";
import ListItem from "@/components/utils/ListItem";
import BootstrapVue from "bootstrap-vue";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("ListItem.vue", () => {
  Vue.use(BootstrapVue);

  it("List Group component loaded", () => {
    const wrapper = mount(ListItem);

    expect(wrapper.name()).to.equal("List-Item");
  });
});
