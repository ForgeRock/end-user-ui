import Vue from 'vue';
import PasswordReset from '@/components/selfservice/passwordreset';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';
import i18n from '@/i18n';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';

describe('PasswordReset.vue', () => {
    var sandbox = null,
        mountWrapper = () => {
            return mount(PasswordReset, {
                i18n,
                propsData: {
                    apiType: 'reset'
                }
            });
        };

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(PasswordReset, 'mounted').callsFake(function () {
            this.selfServiceType = null;
            this.serviceDetails = null;
        });

        sandbox.stub(SelfserviceAPI.methods, 'advanceStage').callsFake(function () {
            return true;
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('PasswordReset page loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Password-Reset');
    });

    it('PasswordReset loading screen', () => {
        const wrapper = mountWrapper();

        expect(wrapper.contains('.v-spinner')).to.equal(true);
    });

    it('PasswordReset properly sets child component to resetStage stage', () => {
        const wrapper = mountWrapper();
        wrapper.vm.setChildComponent('resetStage', {
            requirements: {
                properties: {
                    answer: {
                        type: 'boolean',
                        description: 'math'
                    }
                }
            }
        });

        expect(wrapper.vm.selfServiceType).to.equal('GenericSelfService');
    });

    it('PasswordReset properly sets selfServiceType to null when stage is "parameters"', () => {
        const wrapper = mountWrapper();
        wrapper.vm.setChildComponent('parameters', {
            advanceStage: null,
            selfServiceDetails: null
        });

        expect(wrapper.vm.selfServiceType).to.equal(null);
    });

    it('PasswordReset parseQueryParams returns correct value without "returnParams"', () => {
        let input = '&token=MY_TOKEN&code=MY_CODE',
            expectedResult = {
                token: 'MY_TOKEN',
                code: 'MY_CODE'
            },
            actualResult;

        const wrapper = mountWrapper();

        actualResult = wrapper.vm.parseQueryParams(input);

        expect(JSON.stringify(actualResult)).to.equal(JSON.stringify(expectedResult));
    });

    it('PasswordReset parseQueryParams returns correct value with "returnParams"', () => {
        let input = '&returnParams=MYRETURNPARAMS',
            expectedResult = {
                returnParams: 'MYRETURNPARAMS'
            },
            actualResult;

        const wrapper = mountWrapper();

        actualResult = wrapper.vm.parseQueryParams(input);

        expect(JSON.stringify(actualResult)).to.equal(JSON.stringify(expectedResult));
    });

    it('PasswordReset calls setChildComponent() on api error', (done) => {
        const wrapper = shallowMount(PasswordReset, {
            i18n,
            propsData: {
                apiType: 'reset',
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            answer: {
                                type: 'boolean',
                                description: 'math'
                            }
                        }
                    }
                }
            }
        });

        // Trigger a save to verify after is valid promise
        wrapper.vm.apiErrorCallback({
            response: {
                data: {
                    message: 'testError'
                }
            }
        });

        expect(wrapper.vm.selfServiceType).to.equal('GenericSelfService');
        expect(wrapper.vm.selfServiceDetails.error).to.equal('testError');
        done();
    });
});
