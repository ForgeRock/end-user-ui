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
});
