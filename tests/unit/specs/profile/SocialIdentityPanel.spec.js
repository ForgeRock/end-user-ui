import Vue from "vue";
import VueI18n from "vue-i18n";
import SocialIdentityPanel from "@/components/profile/SocialIdentityPanel";
import { mount } from "@vue/test-utils";
import translations from "@/translations";
import Sinon from "sinon";
import { expect } from "chai";

describe("Profile SocialIdentityPanel Component", () => {
  let sandbox = null,
    wrapper;

  Vue.use(VueI18n);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();
    sandbox.stub(SocialIdentityPanel, "created").callsFake(() => {});

    wrapper = mount(SocialIdentityPanel, {
      i18n,
      propsData: {
        provider: {
          name: "test name",
          picture: "test picture",
          mail: "test mail",
          scope: ["test scope"],
          _refResourceCollection: "component/test",
          propertyMap: [
            { source: "name", target: "displayName" },
            { source: "picture", target: "photoUrl" },
            { source: "mail", target: "email" },
          ],
        },
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  describe("mount", () => {
    it("should properly load", () => {
      expect(wrapper.name()).to.equal("Social-Identity-Panel");
    });

    it("should return an empty profile on load", () => {
      expect(wrapper.vm.profile).to.deep.equal({});
    });
  });

  describe("#getProfileRequestPayload", () => {
    it("should properly create the payload", () => {
      const payload = wrapper.vm.getProfileRequestPayload(),
        rawProfile = payload.rawProfile;

      expect(payload).to.be.an("object");
      expect(Object.keys(payload).length).to.equal(1);
      expect(payload).to.have.property("rawProfile");
      expect(rawProfile).to.be.an("object");
      expect(Object.keys(rawProfile).length).to.equal(4);
      expect(rawProfile)
        .to.have.property("_refResourceCollection")
        .that.equals("component/test");
      expect(rawProfile).to.have.property("name").that.equals("test name");
      expect(rawProfile).to.have.property("mail").that.equals("test mail");
      expect(rawProfile)
        .to.have.property("picture")
        .that.equals("test picture");
    });
  });

  describe("computed#photoUrl", () => {
    it('should be default value when no "profile"', () => {
      expect(wrapper.vm.photoUrl).to.equal("@/assets/images/profile-default.png");
    });
  });

  describe("computed#showAccountDetails", () => {
    it('should be "false" when profile is empty', () => {
      expect(Object.keys(wrapper.vm.profile).length).to.equal(0);
      expect(wrapper.vm.showAccountDetails).to.equal(false);
    });

    it('should be "false" when profile has only "photoUrl"', () => {
      wrapper.setData({ profile: { photoUrl: "test picture" } });
      expect(wrapper.vm.showAccountDetails).to.equal(false);
    });

    it('should be "true" when profile has either "displayName", "username" or "email"', () => {
      wrapper.setData({ profile: { displayName: "test name" } });
      expect(wrapper.vm.showAccountDetails).to.equal(true);

      wrapper.setData({ profile: { email: "test mail" } });
      expect(wrapper.vm.showAccountDetails).to.equal(true);

      wrapper.setData({ profile: { username: "test user name" } });
      expect(wrapper.vm.showAccountDetails).to.equal(true);
    });
  });

  describe("computed#accountDisplayName", () => {
    it("should default to email", () => {
      expect(wrapper.vm.accountDisplayName).to.equal(wrapper.vm.profile.email);
    });

    it("should be username when email not defined on profile", () => {
      wrapper.setData({ profile: { username: "test user name" } });
      expect(wrapper.vm.accountDisplayName).to.equal("test user name");
    });
  });
});
