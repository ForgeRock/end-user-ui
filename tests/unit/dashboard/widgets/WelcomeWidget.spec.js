import Vue from 'vue';
import WelcomeWidget from '@/components/dashboard/widgets/WelcomeWidget';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('Dashboard.vue', () => {
    Vue.use(BootstrapVue);

    it('Welcome widget loaded', () => {
        const wrapper = shallowMount(WelcomeWidget, {
            i18n,
            propsData: {
                userDetails: {
                    givenName: 'test',
                    sn: 'test'
                }
            }
        });

        expect(wrapper.name()).to.equal('Welcome-Widget');
    });
});
