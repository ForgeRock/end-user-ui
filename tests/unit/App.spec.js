import Vue from 'vue';
import App from '@/App';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('Base App', () => {
    Vue.use(BootstrapVue);

    const $route = {
            path: '/test',
            meta: {}
        },
        userStore = {
            state: {
                userId: null
            }
        };

    it('Base App page loaded', () => {
        const wrapper = shallowMount(App, {
            i18n,
            stubs: ['router-link', 'router-view', 'notifications'],
            mocks: {
                $route,
                userStore
            }
        });

        expect(wrapper.name()).to.equal('App');
    });

    it('Side nav toggle', () => {
        const wrapper = shallowMount(App, {
            i18n,
            stubs: ['router-link', 'router-view', 'notifications'],
            mocks: {
                $route,
                userStore
            }
        });

        expect(wrapper.vm.toggled).to.equal(false);

        wrapper.vm.onToggle();

        expect(wrapper.vm.toggled).to.equal(true);
    });

    it('Access generated icons', () => {
        const wrapper = shallowMount(App, {
            i18n,
            stubs: ['router-link', 'router-view', 'notifications'],
            mocks: {
                $route,
                userStore
            }
        });

        expect(wrapper.vm.accessIcon('')).to.equal('fa fa-fw mr-3 fa-cube');
        expect(wrapper.vm.accessIcon('fa-test')).to.equal('fa fa-fw mr-3 fa-test');
    });
});
