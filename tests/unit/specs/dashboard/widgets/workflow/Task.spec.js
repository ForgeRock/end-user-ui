import Vue from "vue";
import Task from "@/components/dashboard/widgets/workflow/Task";
import VueI18n from "vue-i18n";
import BootstrapVue from "bootstrap-vue";
import translations from "@/translations";
import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";

describe("Workflow Task Component", () => {
  Vue.use(VueI18n);
  Vue.use(BootstrapVue);

  const i18n = new VueI18n({
      locale: "en",
      messages: translations,
    }),
    taskInstance = {
      task: {
        _id: "testId",
        variables: { testVar: "test value" },
        taskDefinition: {
          formGenerationTemplate:
            '{name: "test", template: "<div>hello</div>"}',
        },
      },
      process: {
        processDefinition: {
          _id: "test",
          name: "Test process",
          formProperties: [{ _id: "testVar", name: "test variable" }],
        },
      },
    };

  let wrapper = null;

  beforeEach(() => {
    wrapper = shallowMount(Task, {
      i18n,
      propsData: { taskInstance, shown: false },
    });
  });

  afterEach(() => {
    wrapper = null;
  });

  describe("mount", () => {
    it("should have the correct name", () => {
      expect(wrapper.name()).to.equal("Task");
    });

    it("should have the correct initial data", () => {
      expect(wrapper.vm.taskForm)
        .to.be.an("object")
        .and.to.have.property("name")
        .that.equals("test");
    });
  });

  describe("#cancel", () => {
    it('should emit "cancel" with the task id', () => {
      wrapper.vm.cancel();
            expect(wrapper.emitted().cancel).to.be.ok; // eslint-disable-line
      expect(wrapper.emitted().cancel[0]).to.deep.equal(["testId"]);
    });
  });

  describe("#submit", () => {
    it('should emit "completeTask" with task id and passed formData', () => {
      wrapper.vm.submit({ test: "test" });
            expect(wrapper.emitted().completeTask).to.be.ok; // eslint-disable-line
      expect(wrapper.emitted().completeTask[0]).to.deep.equal([
        { id: "testId", formData: { test: "test" } },
      ]);
    });
  });
});
