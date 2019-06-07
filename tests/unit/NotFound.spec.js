import Vue from 'vue';
import NotFound from '@/components/NotFound';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('NotFound.vue', () => {
    Vue.use(BootstrapVue);

    it('Not found page loaded', () => {
        const wrapper = shallowMount(NotFound, {
            i18n,
            stubs: {
                'router-link': true
            }
        });

        expect(wrapper.name()).to.equal('NotFound');
    });
});
