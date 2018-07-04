import Vue from 'vue';
import App from '@/App';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';

describe('Base App', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        $route = {
            path: '/test',
            meta: {}
        },
        userStore = {
            state: {
                userId: null
            }
        };

    it('Base App page loaded', () => {
        const wrapper = shallow(App, {
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
        const wrapper = shallow(App, {
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
        const wrapper = shallow(App, {
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
