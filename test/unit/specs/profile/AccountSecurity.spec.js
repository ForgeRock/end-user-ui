import Vue from 'vue';
import VueI18n from 'vue-i18n';
import AccountSecurity from '@/components/profile/AccountSecurity';
import BootstrapVue from 'bootstrap-vue';
import {mount} from '@vue/test-utils';
import Sinon from 'sinon';
import translations from '@/translations';

describe('AccountSecurity.vue', () => {
    let sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(AccountSecurity, 'mounted').callsFake(function () {
            this.isOnKBA = true;
            this.kbaData = {};
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('AccountSecurity page loaded', () => {
        const wrapper = mount(AccountSecurity, {
            i18n
        });

        expect(wrapper.name()).to.equal('Account-Security');
    });
});
