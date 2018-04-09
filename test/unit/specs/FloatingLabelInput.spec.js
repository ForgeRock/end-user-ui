import Vue from 'vue';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import BootstrapVue from 'bootstrap-vue';
import { mount } from '@vue/test-utils';

describe('FloatingLabelInput.vue', () => {
    Vue.use(BootstrapVue);

    it('Floating Label Input component loaded', () => {
        const wrapper = mount(FloatingLabelInput, {
            propsData: {
                label: '',
                type: '',
                autofocus: '',
                fieldName: ''
            }
        });

        expect(wrapper.name()).to.equal('floating-label-input');
    });

    it('Floating Label Input emits a change on value change', () => {
        const wrapper = mount(FloatingLabelInput, {
            propsData: {
                label: '',
                type: '',
                autofocus: '',
                fieldName: ''
            }
        });

        // wrapper.vm.inputValue
        wrapper.vm.inputValue = 'test';
        expect(wrapper.emitted().input.length).to.equal(1);
    });
});
