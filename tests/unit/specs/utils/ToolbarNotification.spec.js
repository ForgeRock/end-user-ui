import Vue from "vue";
import ToolbarNotification from "@/components/utils/ToolbarNotification";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import Sinon from "sinon";
import { expect } from "chai";

describe("ToolbarNotification.vue", () => {
  let sandbox = null;

  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  beforeEach(() => {
    sandbox = Sinon.sandbox.create();

    sandbox.stub(ToolbarNotification, "mounted").callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Toolbar Notification component loaded", () => {
    const wrapper = mount(ToolbarNotification, {
      i18n,
    });

    wrapper.setData({
      notifications: [
        {
          createDate: "2018-06-04T16:20:04.795",
          message: "Your profile has been updated",
          notificationSubtype: "",
          notificationType: "",
          receiverId: "a7c9f2ab-52c4-47bb-9ec9-bfeb78f56898",
          _id: "a4b8900c-d934-4a5f-962f-ee734728882c",
        },
      ],
    });

    expect(wrapper.name()).to.equal("Toolbar-Notification");
  });
});
