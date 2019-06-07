import Vue from 'vue';
import Consent from '@/components/selfservice/registration/Consent';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('Consent.vue', () => {
    Vue.use(BootstrapVue);

    it('Consent component loaded', () => {
        const wrapper = shallowMount(Consent, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        consent: 'test'
                    }
                },
                inline: true
            }
        });

        expect(wrapper.name()).to.equal('Consent');
    });

    it('Consent save event emitted', () => {
        const wrapper = shallowMount(Consent, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        consent: 'test'
                    }
                },
                inline: true
            }
        });

        wrapper.vm.save();

        expect(wrapper.emitted().advanceStage.length).to.equal(1);
    });

    it('Consent validation', (done) => {
        const wrapper = shallowMount(Consent, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        consent: 'test'
                    }
                }
            }
        });

        wrapper.vm.isValid().then((response) => {
            expect(response).to.equal(true);

            done();
        });
    });

    it('Consent gather data', () => {
        var data;

        const wrapper = shallowMount(Consent, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        consent: 'test'
                    }
                }
            }
        });

        data = wrapper.vm.getData();

        expect(data.consentGiven).to.equal('true');
    });
});
