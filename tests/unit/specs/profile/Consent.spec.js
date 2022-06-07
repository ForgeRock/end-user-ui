import Vue from "vue";
import VueI18n from "vue-i18n";
import Consent from "@/components/profile/Consent";
import BootstrapVue from "bootstrap-vue";
import { mount } from "@vue/test-utils";
import translations from "@/translations";
import sinon from "sinon";
import _ from "lodash";
import { expect } from "chai";

Consent.created = sinon.stub();

describe("Profile Consent Component", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    date = new Date().toISOString(),
    consentableMappings = [{ name: "test" }, { name: "test2" }];

  let wrapper;

  beforeEach(() => {
    wrapper = mount(Consent, {
      i18n,
      propsData: {
        consentedMappings: [{ mapping: "test", consentDate: date }],
      },
    });
  });

  afterEach(() => {
    wrapper = undefined;
  });

  describe("computed#mappings", () => {
    it("should return the mappings that are populated with user data", () => {
      wrapper.setData({ consentableMappings });

      const mappings = wrapper.vm.mappings,
        test = _.find(mappings, { name: "test" }),
        test2 = _.find(mappings, { name: "test2" });

      expect(mappings).to.be.an("array");
      expect(mappings.length).to.equal(2);
      expect(test).to.have.property("consented").that.equals(true);
      expect(test).to.have.property("consentDate").that.equals(date);
      expect(test2).to.have.property("consented").that.equals(false);
      expect(test2).to.not.have.property("consentDate");
    });
  });

  describe("#showModal", () => {
    it("should call show on the correctly referenced modal", () => {
      const spy = sinon.spy();

      wrapper.vm.$refs = { test: [{ show: spy }] };
      wrapper.vm.showModal("test");

      expect(spy.called).to.equal(true);
    });
  });

  describe("#hideModal", () => {
    it("call hide on the correctly referenced modal", () => {
      const spy = sinon.spy();

      wrapper.vm.$refs = { test: [{ hide: spy }] };
      wrapper.vm.hideModal("test");

      expect(spy.called).to.equal(true);
    });
  });

  describe("#toggleConsentAndHideModal", () => {
    it("should call #toggleConsent and #hideModal", () => {
      const hideSpy = sinon.spy(),
        toggleSpy = sinon.spy();

      wrapper.vm.hideModal = hideSpy;
      wrapper.vm.toggleConsent = toggleSpy;
      wrapper.vm.toggleConsentAndHideModal("test");

      expect(hideSpy.called).to.equal(true);
      expect(toggleSpy.called).to.equal(true);
    });
  });

  describe("#generatePatch", () => {
    it('should generate an "add" patch given an unconsented mapping', () => {
      const mapping = {
          name: "test",
          consented: false,
        },
        patch = wrapper.vm.generatePatch(mapping),
        addOp = _.first(patch);

      expect(patch).to.be.an("Array");
      expect(addOp).to.be.an("Object");
      expect(addOp)
        .to.have.property("field")
        .that.equals("/consentedMappings/-");
      expect(addOp).to.have.property("operation").that.equals("add");
      expect(addOp).to.have.property("value").that.is.an("Object");
      expect(addOp.value).to.have.property("mapping").that.equals("test");
      expect(addOp.value).to.have.property("consentDate").that.is.a("String");
    });

    it('should generate a "remove" patch given a consented mapping', () => {
      const mapping = {
          name: "test",
          consented: true,
          consentDate: new Date().toISOString(),
        },
        patch = wrapper.vm.generatePatch(mapping),
        addOp = _.first(patch);

      expect(patch).to.be.an("Array");
      expect(addOp).to.be.an("Object");
      expect(addOp).to.have.property("field").that.equals("/consentedMappings");
      expect(addOp).to.have.property("operation").that.equals("remove");
      expect(addOp).to.have.property("value").that.is.an("Object");
      expect(addOp.value).to.have.property("mapping").that.equals("test");
      expect(addOp.value)
        .to.have.property("consentDate")
        .that.is.a("String")
        .that.equals(mapping.consentDate);
    });
  });

  describe("#toggleConsent", () => {
    it('should emit "updateProfile" and call generatePatch', () => {
      const stub = sinon.stub();
      let payload = null;

      stub.returns("test payload");

      wrapper.setMethods({ generatePatch: stub });
      wrapper.vm.toggleConsent();

      expect(wrapper.emitted().updateProfile.length).to.equal(1);

      payload = wrapper.emitted().updateProfile[0][0];
      expect(payload).to.equal("test payload");
    });
  });
});
