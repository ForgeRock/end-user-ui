import Vue from 'vue';
import Profile from '@/components/mains/Profile';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';

describe('Profile.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Profile page loaded', () => {
        let userStore = {
            state: {
                givenName: '',
                sn: '',
                email: '',
                userName: ''
            }
        };

        const wrapper = shallow(Profile, {
            i18n,
            mocks: {
                userStore
            }
        });

        expect(wrapper.name()).to.equal('Profile');
    });
});
