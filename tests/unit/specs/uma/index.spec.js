import Vue from "vue";
import Sharing from "@/components/uma";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("Sharing.vue", () => {
  let testContext,
    sandbox = null;

  beforeEach(() => {
    testContext = {};
  });

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(Sharing.methods, "getResources").callsFake(() => {
      testContext.resources = [];
    });

    sandbox.stub(Sharing.methods, "getActivity").callsFake(() => {
      testContext.activity = [];
    });

    sandbox.stub(Sharing.methods, "getRequests").callsFake(() => {
      testContext.requests = [];
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Sharing page loaded", () => {
    const wrapper = shallowMount(Sharing, {
      i18n,
    });

    expect(wrapper.name()).to.equal("Sharing");
  });

  it('Emits "renderShareModal" event', () => {
    const wrapper = shallowMount(Sharing, {
      i18n,
    });

    wrapper.vm.$emit("renderShareModal");

    expect(wrapper.emitted().renderShareModal.length).to.equal(1);

    wrapper.vm.renderShareModal();

    Vue.nextTick(() => {
      expect(wrapper.emitted("bv::show::modal").length).to.equal(1);
    });
  });

  it('Emits "renderUnshareModal" event', () => {
    const wrapper = shallowMount(Sharing, {
      i18n,
    });

    wrapper.vm.$emit("renderUnshareModal");

    expect(wrapper.emitted().renderUnshareModal.length).to.equal(1);

    wrapper.vm.renderUnshareModal();

    Vue.nextTick(() => {
      expect(wrapper.emitted("bv::show::modal").length).to.equal(1);
    });
  });
});
