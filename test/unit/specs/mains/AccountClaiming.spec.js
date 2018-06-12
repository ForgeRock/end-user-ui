import Vue from 'vue';
import AccountClaiming from '@/components/selfservice/registration/AccountClaiming';
import VueI18n from 'vue-i18n';
import translations from '@/translations';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('SocialButtons.vue', () => {
    var sandbox = null;

    Vue.use(VueI18n);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();
        sandbox.stub(AccountClaiming, 'mounted').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Account Claiming loads', () => {
        const wrapper = mount(AccountClaiming, {
            i18n
        });

        expect(wrapper.name()).to.equal('Account-Claiming');
    });
});
