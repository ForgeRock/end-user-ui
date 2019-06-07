import Vue from 'vue';
import UserDetails from '@/components/selfservice/registration/UserDetails';
import i18n from '@/i18n';
import VeeValidate from 'vee-validate';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

UserDetails.components['fr-policy-password-input'] = Sinon.stub();

describe('UserDetails.vue', () => {
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    it('User Details component loaded', () => {
        const wrapper = shallowMount(UserDetails, {
            i18n,
            propsData: {
                selfServiceDetails: {}
            }
        });

        expect(wrapper.name()).to.equal('User-Details');
    });

    it('User Details calculate validators', () => {
        const wrapper = shallowMount(UserDetails, {
                i18n,
                propsData: {
                    selfServiceDetails: {}
                }
            }),
            property = {
                required: true,
                policies: [{
                    policyId: 'valid-email-address-format'
                }]
            };

        expect(wrapper.vm.calculateValidation(property)).to.equal('required|email');
    });

    it('User Details gather data', () => {
        let data;

        const wrapper = shallowMount(UserDetails, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    tag: 'initial',
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
