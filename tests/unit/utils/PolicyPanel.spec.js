import Vue from 'vue';
import PolicyPanel from '@/components/utils/PolicyPanel';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('PolicyPanel.vue', () => {
    Vue.use(BootstrapVue);

    describe('proper render', () => {
        let wrapper = shallowMount(PolicyPanel, {
            i18n,
            propsData: {
                policies: [{ name: 'test', params: { args: 'test args' } }],
                policyFailures: ['test']
            }
        });

        it('should show policy ul when "policyFailures" is non empty array', () => {
            wrapper.setProps({ policyFailures: ['test'] });

            expect(wrapper.contains('ul')).to.equal(true);
            expect(wrapper.contains('div.alert')).to.equal(false);
        });
    });
});
