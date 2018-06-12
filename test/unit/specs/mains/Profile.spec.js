import Vue from 'vue';
import Profile from '@/components/mains/Profile';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';
import sinon from 'sinon';

Profile.components['fr-consent'] = sinon.stub();
Profile.components['fr-edit-personal-info'] = sinon.stub();

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
                    userName: '',
                    profile: sinon.stub()
                }
            },
            applicationStore = {
                state: {
                    workflow: false,
                    passwordReset: false,
                    usernameRecovery: false,
                    registration: false,
                    authHeaders: null,
                    authLogoutUrl: null,
                    amDataEndpoints: null
                }
            };

        const wrapper = shallow(Profile, {
            i18n,
            mocks: {
                userStore,
                applicationStore
            }
        });

        expect(wrapper.name()).to.equal('Profile');
    });
});
