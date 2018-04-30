import Vue from 'vue';
import PasswordReset from '@/components/mains/PasswordReset';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';
import VueI18n from 'vue-i18n';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

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

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

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

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
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
            advanceStage: null,
            selfServiceDetails: null
        });

        expect(wrapper.vm.selfServiceType).to.equal('resetStage');
    });

    it('PasswordReset properly sets selfServiceType to null when stage is "parameters"', () => {
        const wrapper = mountWrapper();
        wrapper.vm.setChildComponent('parameters', {
            advanceStage: null,
            selfServiceDetails: null
        });

        expect(wrapper.vm.selfServiceType).to.equal(null);
    });

    it('PasswordReset parseQueryParams returns correct value', () => {
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

    it('PasswordReset calls setChildComponent() on api error', (done) => {
        const wrapper = mountWrapper();

        // Trigger a save to verify after is valid promise
        wrapper.vm.apiErrorCallback({
            response: {
                data: {
                    message: 'testError'
                }
            }
        });

        expect(wrapper.vm.selfServiceType).to.equal('resetStage');
        expect(wrapper.vm.selfServiceDetails.error).to.equal('testError');
        done();
    });
});
