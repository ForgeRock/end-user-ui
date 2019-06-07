import Vue from 'vue';
import Dashboard from '@/components/dashboard';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import sinon from 'sinon';

describe('Dashboard.vue', () => {
    Vue.use(BootstrapVue);

    it('Dashboard page loaded', () => {
        let userStore = {
                getUserState () {
                    return {};
                }
            },
            applicationStore = {
                state: {
                    workflow: true
                }
            };

        const wrapper = shallowMount(Dashboard, {
            i18n,
            methods: { loadData: sinon.stub() },
            mocks: {
                userStore,
                applicationStore
            }
        });

        expect(wrapper.name()).to.equal('Dashboard');
    });
});
