import Vue from 'vue';
import TermsAndConditions from '@/components/selfservice/registration/TermsAndConditions';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('TermsAndConditions.vue', () => {
    Vue.use(BootstrapVue);

    it('TermsAndConditions component loaded', () => {
        const wrapper = shallowMount(TermsAndConditions, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        terms: 'test'
                    }
                }
            }
        });

        expect(wrapper.name()).to.equal('Terms-And-Conditions');
    });

    it('TermsAndConditions gather data', () => {
        var data;

        const wrapper = shallowMount(TermsAndConditions, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        terms: 'test'
                    }
                }
            }
        });

        data = wrapper.vm.getData();

        expect(data.accept).to.equal('true');
    });

    it('TermsAndConditions validation', (done) => {
        const wrapper = shallowMount(TermsAndConditions, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        terms: 'test'
                    }
                }
            }
        });

        wrapper.vm.isValid().then((response) => {
            expect(response).to.equal(true);

            done();
        });
    });

    it('TermsAndConditions inline mode', () => {
        const wrapper = shallowMount(TermsAndConditions, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        terms: 'test'
                    }
                },
                inline: true
            }
        });

        expect(wrapper.contains('a')).to.equal(true);
    });

    it('TermsAndConditions save event emitted', () => {
        const wrapper = shallowMount(TermsAndConditions, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        terms: 'test'
                    }
                },
                inline: true
            }
        });

        wrapper.vm.save();

        expect(wrapper.emitted().advanceStage.length).to.equal(1);
    });
});
