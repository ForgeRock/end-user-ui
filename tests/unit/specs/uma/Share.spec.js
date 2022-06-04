import Vue from "vue";
import Share from "@/components/uma/Share";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { shallowMount } from "@vue/test-utils";
import sinon from "sinon";
import { expect } from "chai";

describe("Sharing.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    propsData = {
      resource: {
        _id: "12345",
        name: "test resource",
        resourceOwnerId: "alice",
        scopes: ["view", "comment", "download"],
        policy: {
          permissions: [
            {
              subject: "bob",
              scopes: ["download"],
            },
          ],
        },
      },
      newScopes: {},
      newShare: false,
    };

  it("Resources page loaded", () => {
    const wrapper = shallowMount(Share, {
      i18n,
      propsData: propsData,
    });

    expect(wrapper.name()).to.equal("Share");
  });

  it.skip('Emits "modifyResource" event', () => {
    const wrapper = shallowMount(Share, {
      i18n,
      propsData: propsData,
    });

    wrapper.vm.shareResource();

    Vue.nextTick(() => {
      expect(wrapper.emitted("modifyResource").length).to.equal(1);
    });
  });

  it('Emits "modifyResource" event', () => {
    const wrapper = shallowMount(Share, {
      i18n,
      propsData: propsData,
    });

    wrapper.vm.modifyResource("bob", "view");

    Vue.nextTick(() => {
      expect(wrapper.emitted("modifyResource").length).to.equal(1);
    });
  });

  it.skip('Emits "shareResource" event', () => {
    const propsData = {
        resource: {
          _id: "12345",
          name: "test resource",
          resourceOwnerId: "alice",
          scopes: ["view", "comment", "download"],
        },
        newScopes: {},
        newShare: false,
      },
      wrapper = shallowMount(Share, {
        i18n,
        propsData: propsData,
      });

    wrapper.vm.shareResource();

    Vue.nextTick(() => {
      expect(wrapper.emitted("shareResource").length).to.equal(1);
    });
  });

  it.skip('Emits "renderUnshareModal" event', () => {
    const wrapper = shallowMount(Share, {
      i18n,
      propsData: propsData,
    });

    wrapper.vm.unshareAll();

    Vue.nextTick(() => {
      expect(wrapper.emitted("renderUnshareModal").length).to.equal(1);
    });
  });

  it.skip('Emits "unshareOne" event', () => {
    const wrapper = shallowMount(Share, {
      i18n,
      propsData: propsData,
    });

    wrapper.vm.unshareOne("testUser");

    Vue.nextTick(() => {
      expect(wrapper.emitted("modifyResource").length).to.equal(1);
    });
  });

  it("Validates resource", () => {
    const wrapper = shallowMount(Share, {
        i18n,
        propsData: propsData,
      }),
      spy = sinon.spy();

    wrapper.setMethods({ resetModal: spy, displayNotification: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });

  it("Validates resource without policy", () => {
    const propsData = {
        resource: {
          _id: "12345",
          name: "test resource",
          resourceOwnerId: "alice",
          scopes: ["view", "comment", "download"],
        },
        newScopes: {},
        newShare: false,
      },
      wrapper = shallowMount(Share, {
        i18n,
        propsData: propsData,
      });

    wrapper.vm.validateResource();

    Vue.nextTick(() => {
      expect(wrapper.emitted()).to.be.an("object");
    });
  });

  it("Prevents sharing with same user", () => {
    const wrapper = shallowMount(Share, {
        i18n,
        propsData: propsData,
      }),
      spy = sinon.spy();

    wrapper.setData({ newShare: "bob" });
    wrapper.setMethods({ resetModal: spy, displayNotification: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });

  it('Calls "shareResource" if resource is valid', () => {
    const wrapper = shallowMount(Share, {
        i18n,
        propsData: propsData,
      }),
      spy = sinon.spy();

    wrapper.setData({ newShare: "steve" });
    wrapper.setMethods({ shareResource: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });

  it('Calls "shareResource" if resouce is shared for the first time', () => {
    const propsData = {
        resource: {
          _id: "12345",
          name: "test resource",
          resourceOwnerId: "alice",
          scopes: ["view", "comment", "download"],
        },
        newScopes: {},
        newShare: false,
      },
      wrapper = shallowMount(Share, {
        i18n,
        propsData: propsData,
      }),
      spy = sinon.spy();

    wrapper.setData({ newShare: "bob" });
    wrapper.setMethods({ shareResource: spy });
    wrapper.vm.validateResource();

    // eslint-disable-next-line
        expect(spy.called).to.be.ok;
  });
});
