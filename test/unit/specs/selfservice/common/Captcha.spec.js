import Vue from 'vue';
import Captcha from '@/components/selfservice/common/Captcha';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('Captcha.vue', () => {
    var mountWrapper = () => {
        return mount(Captcha, {
            i18n,
            propsData: {
                apiType: 'username',
                selfServiceDetails: null,
                advanceStage: () => true
            }
        });
    };

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Captcha component loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Captcha');
    });

    it('Captcha handleCaptchaCallback sets proper value', () => {
        const wrapper = mountWrapper();

        wrapper.vm.handleCaptchaCallback('test');
        expect(wrapper.vm.recaptchaResponse).to.equal('test');
    });

    it('Captcha getData() returns proper output', () => {
        var expectedResult = {
            response: 'test',
            'g-recaptcha-response': 'test'
        };
        const wrapper = mountWrapper();

        wrapper.vm.handleCaptchaCallback('test');

        expect(JSON.stringify(wrapper.vm.getData())).to.equal(JSON.stringify(expectedResult));
    });
});
