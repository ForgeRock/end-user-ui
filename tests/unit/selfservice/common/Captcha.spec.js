import Vue from 'vue';
import Captcha from '@/components/selfservice/common/Captcha';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('Captcha.vue', () => {
    var sandbox = null;

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(Captcha, 'mounted').callsFake(function () {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Captcha component loaded', () => {
        const wrapper = shallowMount(Captcha, {
            i18n,
            propsData: {
                apiType: 'username',
                selfServiceDetails: null,
                advanceStage: () => true
            }
        });

        expect(wrapper.name()).to.equal('Captcha');
    });

    it('Captcha handleCaptchaCallback sets proper value', () => {
        const wrapper = shallowMount(Captcha, {
            i18n,
            propsData: {
                apiType: 'username',
                selfServiceDetails: null,
                advanceStage: () => true
            }
        });

        wrapper.vm.handleCaptchaCallback('test');
        expect(wrapper.vm.recaptchaResponse).to.equal('test');
    });

    it('Captcha getData() returns proper output', () => {
        const wrapper = shallowMount(Captcha, {
            i18n,
            propsData: {
                apiType: 'username',
                selfServiceDetails: null,
                advanceStage: () => true
            }
        });

        var expectedResult = {
            response: 'test',
            'g-recaptcha-response': 'test'
        };

        wrapper.vm.handleCaptchaCallback('test');

        expect(JSON.stringify(wrapper.vm.getData())).to.equal(JSON.stringify(expectedResult));
    });
});
