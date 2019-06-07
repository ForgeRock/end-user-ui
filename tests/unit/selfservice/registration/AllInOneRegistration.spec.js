import Vue from 'vue';
import AllInOneRegistration from '@/components/selfservice/registration/AllInOneRegistration';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('AllInOneRegistration.vue', () => {
    Vue.use(BootstrapVue);

    it('AllInOneRegistration component loaded', () => {
        const wrapper = shallowMount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: ['TermsAndConditions']
                    }
                }
            }
        });

        expect(wrapper.name()).to.equal('All-In-One-Registration');
    });

    it('AllInOneRegistration stage data configured', () => {
        const wrapper = shallowMount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: ['TermsAndConditions']
                    }
                }
            }
        });

        expect(wrapper.vm.stages.TermsAndConditions).to.equal(true);
    });

    it('AllInOneRegistration gather child data', () => {
        const wrapper = shallowMount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: ['TermsAndConditions'],
                        consentEnabled: true
                    }
                }
            }
        });

        expect(wrapper.vm.getData()).to.be.a('object');
    });

    it('AllInOneRegistration gather policy information and save event', (done) => {
        const wrapper = shallowMount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: ['TermsAndConditions']
                    }
                }
            }
        });

        // Trigger a save to verify after is valid promise
        wrapper.vm.saveCheck();

        wrapper.vm.isValid().then((result) => {
            expect(result.success).to.equal(true);
            expect(wrapper.emitted().advanceStage.length).to.equal(1);
            done();
        });
    });
});
