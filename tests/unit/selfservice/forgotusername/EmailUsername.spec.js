import Vue from 'vue';
import EmailUsername from '@/components/selfservice/forgotusername/EmailUsername';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('EmailUsername.vue', () => {
    Vue.use(BootstrapVue);

    it('EmailUsername component loaded', () => {
        const wrapper = shallowMount(EmailUsername, {
            i18n,
            propsData: {
                apiType: 'username',
                advanceStage: null,
                selfServiceDetails: null
            }
        });

        expect(wrapper.name()).to.equal('Email-Username');
    });
});
