import Vue from 'vue';
import WelcomeWidget from '@/components/dashboard/widgets/WelcomeWidget';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('Dashboard.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Welcome widget loaded', () => {
        const wrapper = mount(WelcomeWidget, {
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
