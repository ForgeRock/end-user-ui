import Vue from 'vue';
import AllInOneRegistration from '@/components/selfservice/registration/AllInOneRegistration';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('AllInOneRegistration.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('AllInOneRegistration component loaded', () => {
        const wrapper = mount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: []
                    }
                }
            },
            stubs: ['idmUserDetails', 'TermsAndConditions']
        });

        expect(wrapper.name()).to.equal('All-In-One-Registration');
    });

    it('AllInOneRegistration stage data configured', () => {
        const wrapper = mount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: ['idmUserDetails', 'TermsAndConditions']
                    }
                }
            },
            stubs: ['idmUserDetails', 'TermsAndConditions']
        });

        expect(wrapper.vm.stages.idmUserDetails).to.equal(true);
    });

    it('AllInOneRegistration gather child data', () => {
        const wrapper = mount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: []
                    }
                }
            },
            stubs: ['idmUserDetails', 'TermsAndConditions']
        });

        expect(wrapper.vm.getData()).to.be.a('object');
    });

    it('AllInOneRegistration gather policy information', (done) => {
        const wrapper = mount(AllInOneRegistration, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        stages: []
                    }
                }
            },
            stubs: ['idmUserDetails', 'TermsAndConditions']
        });

        wrapper.vm.isValid().then((result) => {
            expect(result.success).to.equal(true);
            done();
        });
    });
});
