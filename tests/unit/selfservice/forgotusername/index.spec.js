import Vue from 'vue';
import ForgotUsername from '@/components/selfservice/forgotusername';
import i18n from '@/i18n';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';

describe('ForgotUsername.vue', () => {
    var sandbox = null,
        mountWrapper = () => {
            return mount(ForgotUsername, {
                i18n,
                stubs: {
                    'router-link': true
                },
                propsData: {
                    apiType: 'username'
                }
            });
        };

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(ForgotUsername, 'mounted').callsFake(function () {
            this.selfServiceType = null;
            this.serviceDetails = null;
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('forgotusername page loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Forgot-Username');
    });

    it('forgotusername loading screen', () => {
        const wrapper = mountWrapper();

        expect(wrapper.contains('.v-spinner')).to.equal(true);
    });

    it('forgotusername properly sets child component to emailUsername stage', () => {
        const wrapper = mountWrapper();
        wrapper.vm.setChildComponent('emailUsername', {
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
});
