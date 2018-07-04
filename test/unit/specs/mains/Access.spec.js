import Vue from 'vue';
import Access from '@/components/mains/Access';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('Access.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        $route = {
            path: '/test',
            meta: {},
            params: {
                resourceName: 'test',
                resourceType: 'test'
            }
        };

    it('Access page loaded', () => {
        const wrapper = mount(Access, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        expect(wrapper.name()).to.equal('Access');
    });
});
