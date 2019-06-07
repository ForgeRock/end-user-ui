import Vue from 'vue';
import Profile from '@/components/profile';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';

Profile.components['fr-consent'] = Sinon.stub();
Profile.components['fr-edit-personal-info'] = Sinon.stub();
Profile.components['fr-account-controls'] = Sinon.stub();
Profile.components['fr-account-security'] = Sinon.stub();

describe('Profile.vue', () => {
    Vue.use(BootstrapVue);

    it('Profile page loaded', () => {
        let userStore = {
                state: {
                    givenName: '',
                    sn: '',
                    email: '',
                    userName: '',
                    profile: Sinon.stub()
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

        const wrapper = mount(Profile, {
            i18n,
            mocks: {
                userStore,
                applicationStore
            }
        });

        expect(wrapper.name()).to.equal('Profile');
    });
});
