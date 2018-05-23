import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Preferences from '@/components/profile/Preferences';
import BootstrapVue from 'bootstrap-vue';
import { shallow } from '@vue/test-utils';
import translations from '@/translations';

describe('Preferences.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const userStore = {
            state: {
                givenName: '',
                sn: '',
                email: '',
                userName: '',
                profile: {},
                schema: {
                    order: [],
                    properties: {
                        preferences: {
                            properties: {
                                'updates': {
                                    'description': 'Send me news and updates',
                                    'value': false
                                },
                                'marketing': {
                                    'description': 'Send me special offers and services',
                                    'value': true
                                }
                            }
                        }
                    },
                    required: []
                }
            }
        },
        i18n = new VueI18n({
            locale: 'en',
            messages: translations
        });

    it('Preferences page loaded', () => {
        const wrapper = shallow(Preferences, {
            i18n,
            mocks: {
                userStore
            }
        });

        expect(wrapper.name()).to.equal('Preferences');
    });

    describe('#loadData', () => {
        it('should load the preferences data', () => {
            const wrapper = shallow(Preferences, {
                i18n,
                mocks: {
                    userStore
                }
            });

            wrapper.vm.loadData();

            let { marketing, updates } = wrapper.vm.preferences;

            expect(marketing).to.have.property('description').that.equals('Send me special offers and services');
            expect(marketing).to.have.property('value').that.equals(true);
            expect(updates).to.have.property('description').that.equals('Send me news and updates');
            expect(updates).to.have.property('value').that.equals(false);
        });
    });

    describe('#generatePatch', () => {
        it('should generate a well formed patch payload', () => {
            const wrapper = shallow(Preferences, {
                    i18n,
                    mocks: {
                        userStore
                    }
                }), patch = wrapper.vm.generatePatch('test preference', 'test value');

            expect(patch).to.be.an('Array').with.property('length').that.equals(1);
            expect(patch[0]).to.have.property('field').that.equals('/preferences/test preference');
            expect(patch[0]).to.have.property('value').that.equals('test value');
        });
    });

    describe('#savePreferences', () => {
        it('should emit "updateProfile" with a payload', () => {
            const wrapper = shallow(Preferences, {
                i18n,
                mocks: {
                    userStore
                }
            });

            wrapper.vm.savePreferences('test preference', 'test value');

            let patchEventList = wrapper.emitted().updateProfile,
                firstPatchEvent = patchEventList[0],
                payload = firstPatchEvent[0];

            expect(patchEventList).to.be.an('Array').with.property('length').that.equals(1);
            expect(payload[0]).to.deep.equal(wrapper.vm.generatePatch('test preference', 'test value')[0]);
        });
    });
});
