import Vue from "vue";
import FloatingLabelInput from "@/components/utils/FloatingLabelInput";
import BootstrapVue from "bootstrap-vue";
import { mount } from "@vue/test-utils";
import VeeValidate from "vee-validate";
import { expect } from "chai";

describe("FloatingLabelInput.vue", () => {
  Vue.use(BootstrapVue);
  Vue.use(VeeValidate);

  const v = new VeeValidate.Validator();

  it("Floating Label Input component loaded", () => {
    const wrapper = mount(FloatingLabelInput, {
      provide: () => ({
        $validator: v,
      }),
      propsData: {
        label: "",
        type: "",
        autofocus: "",
        fieldName: "test",
      },
    });

    expect(wrapper.name()).to.equal("Floating-Label-Input");
  });

  it.skip("Floating Label Input emits a change on value change", () => {
    const wrapper = mount(FloatingLabelInput, {
      provide: () => ({
        $validator: v,
      }),
      propsData: {
        label: "",
        type: "",
        autofocus: "",
        fieldName: "test",
      },
    });

    // wrapper.vm.inputValue
    wrapper.vm.inputValue = "test";
    expect(wrapper.emitted().input.length).to.equal(1);
  });

  it.skip("Floating Label password reveal", () => {
    const wrapper = mount(FloatingLabelInput, {
      provide: () => ({
        $validator: v,
      }),
      propsData: {
        label: "",
        type: "password",
        autofocus: "",
        fieldName: "test",
        reveal: true,
      },
    });

    expect(wrapper.findAll(".fa-eye").length).to.equal(1);

    wrapper.vm.revealText();

    expect(wrapper.findAll(".fa-eye-slash").length).to.equal(1);

    wrapper.vm.revealText();

    expect(wrapper.findAll(".fa-eye").length).to.equal(1);
  });
});
