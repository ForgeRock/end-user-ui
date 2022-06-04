import Vue from "vue";
import GenericTask from "@/components/dashboard/widgets/workflow/GenericTask";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { mount } from "@vue/test-utils";
import { expect } from "chai";

describe("GenericTask.vue", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
    locale: "en",
    messages: translations,
  });

  it("Generic task widget loaded", () => {
    const wrapper = mount(GenericTask, {
      i18n,
      propsData: {
        variables: {
          request: "test",
          test: "test",
        },
        taskFields: {
          formPropertyHandlers: [
            {
              id: "justification",
              name: "justification",
              readable: true,
              required: true,
              type: {
                mimeType: "text/plain",
                name: "number",
              },
              variableExpression: null,
              variableName: null,
              writable: true,
            },
            {
              id: "request",
              name: "request",
              readable: true,
              required: true,
              type: {
                mimeType: "text/plain",
                name: "number",
              },
              variableExpression: null,
              variableName: null,
              writable: true,
            },
          ],
        },
        processFields: [
          {
            justification: "test",
          },
        ],
      },
    });

    expect(wrapper.name()).to.equal("Generic-Task");
  });
});
