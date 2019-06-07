import Vue from 'vue';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('FloatingLabelInput.vue', () => {
    Vue.use(BootstrapVue);

    const v = new VeeValidate.Validator();

    it('Floating Label Input component loaded', () => {
        const wrapper = shallowMount(FloatingLabelInput, {
            provide: () => ({
                $validator: v
            }),
            propsData: {
                label: '',
                type: '',
                autofocus: '',
                fieldName: 'test'
            }
        });

        expect(wrapper.name()).to.equal('Floating-Label-Input');
    });

    it('Floating Label Input emits a change on value change', () => {
        const wrapper = shallowMount(FloatingLabelInput, {
            provide: () => ({
                $validator: v
            }),
            propsData: {
                label: '',
                type: '',
                autofocus: '',
                fieldName: 'test'
            }
        });

        // wrapper.vm.inputValue
        wrapper.vm.inputValue = 'test';
        expect(wrapper.emitted().input.length).to.equal(1);
    });

    it('Floating Label password reveal', () => {
        const wrapper = shallowMount(FloatingLabelInput, {
            provide: () => ({
                $validator: v
            }),
            propsData: {
                label: '',
                type: 'password',
                autofocus: '',
                fieldName: 'test',
                reveal: true
            }
        });

        expect(wrapper.findAll('.fa-eye').length).to.equal(1);

        wrapper.vm.revealText();

        expect(wrapper.findAll('.fa-eye-slash').length).to.equal(1);

        wrapper.vm.revealText();

        expect(wrapper.findAll('.fa-eye').length).to.equal(1);
    });
});
