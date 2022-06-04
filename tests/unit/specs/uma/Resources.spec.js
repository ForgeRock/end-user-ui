import Vue from "vue";
import Resources from "@/components/uma/Resources";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import { expect } from "chai";

describe("Sharing.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Resources page loaded", () => {
    const wrapper = shallowMount(Resources, {
      i18n,
    });

    expect(wrapper.name()).to.equal("Resources");
  });

  it('Emits "renderShareModal" event', () => {
    const wrapper = shallowMount(Resources, {
      i18n,
    });

    wrapper.vm.renderShareModal();

    Vue.nextTick(() => {
      expect(wrapper.emitted("renderShareModal").length).to.equal(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    const wrapper = shallowMount(Resources, {
      i18n,
    });

    wrapper.vm.renderUnshareModal();

    Vue.nextTick(() => {
      expect(wrapper.emitted("renderUnshareModal").length).to.equal(1);
    });
  });

  it("Toggles grid view", () => {
    const wrapper = shallowMount(Resources, {
      i18n,
      propsData: {
        viewgrid: false,
      },
    });
    expect(wrapper.vm.viewgrid).to.equal(false);

    wrapper.vm.toggleGrid();

    Vue.nextTick(() => {
      expect(wrapper.vm.viewgrid).to.equal(true);
    });
  });
});
