import Vue from 'vue';
import ForgotUsername from '@/components/mains/forgotUsername';
import EmailUsername from '@/components/selfservice/forgotUsername/EmailUsername';
import VueI18n from 'vue-i18n';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('ForgotUsername.vue', () => {
    var sandbox = null,
        mountWrapper = () => {
            return mount(ForgotUsername, {
                i18n,
                propsData: {
                    apiType: 'username'
                }
            });
        };

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(ForgotUsername, 'mounted').callsFake(function () {
            this.selfServiceType = null;
            this.serviceDetails = null;
            this.subComponents = {
                emailUsername: EmailUsername
            };
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('ForgotUsername page loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Forgot-Username');
    });

    it('ForgotUsername loading screen', () => {
        const wrapper = mountWrapper();

        expect(wrapper.contains('.v-spinner')).to.equal(true);
    });

    it('ForgotUsername properly sets child component to emailUsername stage', () => {
        const wrapper = mountWrapper();
        wrapper.vm.setChildComponent('emailUsername', {
            advanceStage: null,
            selfServiceDetails: null
        });

        expect(wrapper.vm.selfServiceType).to.equal('emailUsername');
    });
});
