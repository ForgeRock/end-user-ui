import Vue from 'vue';
import VueI18n from 'vue-i18n';
import AccountSecurity from '@/components/profile/AccountSecurity';
import BootstrapVue from 'bootstrap-vue';
import {shallow} from '@vue/test-utils';
import Sinon from 'sinon';
import translations from '@/translations';

describe('AccountSecurity.vue', () => {
    let sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(AccountSecurity, 'mounted').callsFake(function () {
            this.isOnKBA = true;
            this.kbaData = {};
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('AccountSecurity page loaded', () => {
        const userStore = {
                state: {
                    internalUser: true
                }
            },
            applicationStore = {
                state: {
                    platformMode: false
                }
            },
            wrapper = shallow(AccountSecurity, {
                i18n,
                mocks: {
                    userStore,
                    applicationStore
                }
            });

        expect(wrapper.name()).to.equal('Account-Security');
    });

    describe('#sendUpdateProfile', () => {
        it('should emit an "updateProfile" event with the payload and config', () => {
            const userStore = {
                    state: {
                        internalUser: true
                    }
                },
                applicationStore = {
                    state: {
                        platformMode: false
                    }
                },
                wrapper = shallow(AccountSecurity, {
                    i18n,
                    mocks: {
                        userStore,
                        applicationStore
                    }
                });

            wrapper.vm.sendUpdateProfile('test payload', 'test config');
            expect(wrapper.emitted().updateProfile.length).to.equal(1);

            let [payload, config] = wrapper.emitted().updateProfile[0];

            expect(payload).to.equal('test payload');
            expect(config).to.equal('test config');
        });
    });
});
