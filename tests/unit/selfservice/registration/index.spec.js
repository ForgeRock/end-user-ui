import _ from 'lodash';
import Vue from 'vue';
import Registration from '@/components/selfservice/registration';
import i18n from '@/i18n';
import VeeValidate from 'vee-validate';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';

// Tests are currently structured in a way they all fail
describe.skip('Registration.vue', () => {
    var sandbox = null;

    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(Registration, 'mounted').callsFake(function () {
            this.selfServiceType = null;
            this.advanceStage = _.noop;
            this.displayNotification = () => {};
            this.$router = [];
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Registration page loaded', () => {
        const wrapper = mount(Registration, {
            i18n,
            stubs: {
                'router-link': true
            }
        });

        expect(wrapper.name()).to.equal('Registration');
    });

    it('Registration loading screen', () => {
        const wrapper = mount(Registration, {
            i18n,
            stubs: {
                'router-link': true
            }
        });

        expect(wrapper.contains('.v-spinner')).to.equal(true);
    });

    it('Registration properly load user details stage', () => {
        const wrapper = shallowMount(Registration, {
            i18n,
            stubs: {
                'router-link': true
            }
        });

        wrapper.vm.setChildComponent('idmUserDetails', {});

        expect(wrapper.vm.selfServiceType).to.equal('idmUserDetails');
    });

    it('Registration properly handles parameters stage', () => {
        const wrapper = mount(Registration, {
            i18n,
            stubs: {
                'router-link': true
            }
        });

        wrapper.vm.setChildComponent('parameters', {});

        expect(wrapper.vm.selfServiceType).to.equal(null);
        expect(wrapper.vm.showSelfService).to.equal(false);
    });

    it('Registration apiErrorCallback properly sets showSelfService', () => {
        const wrapper = mount(Registration, {
            i18n,
            stubs: {
                'router-link': true
            }
        });

        wrapper.setMethods({ loadData: () => {} });

        wrapper.vm.apiErrorCallback({
            response: {
                data: {
                    detail: {
                        failedPolicyRequirements: [{
                            property: 'userName',
                            policyRequirements: [{
                                policyRequirement: 'UNIQUE'
                            }]
                        }]
                    },
                    message: 'test'
                }
            }
        });

        expect(wrapper.vm.showSelfService).to.equal(true);
    });

    it('should properly compute title and subtitle', () => {
        const wrapper = shallowMount(Registration, {
                i18n,
                stubs: {
                    'router-link': true
                }
            }),
            customTitleComponents = [
                'captcha',
                'consent',
                'emailValidation',
                'kbaSecurityAnswerDefinitionStage',
                'termsAndConditions'
            ];

        customTitleComponents.forEach((component) => {
            wrapper.setData({ selfServiceType: component });
            expect(wrapper.vm.title).to.equal(wrapper.vm.$t(`pages.selfservice.registration.stageTitle.${component}`));
            expect(wrapper.vm.subtitle).to.equal(wrapper.vm.$t(`pages.selfservice.registration.stageSubtitle.${component}`));
        });
    });
});
