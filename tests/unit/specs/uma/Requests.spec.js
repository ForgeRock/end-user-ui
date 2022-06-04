import Vue from "vue";
import Requests from "@/components/uma/Requests";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import sinon from "sinon";
import { expect } from "chai";

Requests.components["fr-fallback-image"] = sinon.stub();

const requests = [
  {
    _id: "be4cb21e-74a1-4498-aabd-310b6b5bb3415",
    user: "phil",
    resource: "Ultrasound",
    when: 1529937902420,
    allowed: false,
    decision: false,
    permissions: ["download"],
  },
  {
    _id: "7de54a3b-1446-4ada-a8a5-3cd00739180613",
    user: "steve",
    resource: "Ultrasound",
    when: 1529937934625,
    allowed: false,
    decision: false,
    permissions: ["download"],
  },
];

describe("UMA Requests Component", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Requests, {
      i18n,
      propsData: {
        requests: requests,
      },
    });
  });

  afterEach(() => {
    wrapper = undefined;
  });

  it.skip("should format as relative time difference for events that occured today", () => {
    const eventToday = new Date(),
      offset = eventToday.getHours() - 1;

    expect(
      wrapper.vm.$options.filters.formatTime(eventToday.setHours(offset))
    ).to.equal("an hour ago");
  });

  it("should use actual time for events on previous days", () => {
    const eventDifferentDay = new Date("2018-06-06"),
      formattedTime = wrapper.vm.$options.filters.formatTime(eventDifferentDay);

    // eslint-disable-next-line
        expect(formattedTime.match(/\d{1,2}:\d{1,2} [AP]M/)).to.be.ok;
  });

  it('should emit "finalizeResourceAccess" event', () => {
    wrapper.vm.finalizeAccess("12345", 0, "approve");

    expect(wrapper.emitted("finalizeResourceAccess").length).to.equal(1);
  });
});
