import Vue from 'vue';
import UserDetails from '@/components/selfservice/registration/UserDetails';
import VueI18n from 'vue-i18n';
import VeeValidate from 'vee-validate';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('UserDetails.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('User Details component loaded', () => {
        const wrapper = mount(UserDetails, {
            i18n,
            propsData: {
                selfServiceDetails: {}
            }
        });

        expect(wrapper.name()).to.equal('User-Details');
    });

    it('User Details gather data', () => {
        let data;

        const wrapper = mount(UserDetails, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        registrationPreferences: {
                            test: {
                                description: 'Send me special offers and services'
                            }
                        },
                        registrationProperties: {
                            properties: {
                                sn: {
                                    description: 'Last Name',
                                    title: 'Last Name'
                                }
                            },
                            required: ['sn']
                        }
                    }
                }
            }
        });

        data = wrapper.vm.getData();

        expect(data.user.password).to.equal('');
    });
});
