import Vue from 'vue';
import EmailValidation from '@/components/selfservice/registration/EmailValidation';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('EmailValidation.vue', () => {
    Vue.use(BootstrapVue);

    it('EmailValidation component loaded', () => {
        const wrapper = shallowMount(EmailValidation, {
            i18n,
            propsData: {}
        });

        expect(wrapper.name()).to.equal('Email-Validation');
    });
});
