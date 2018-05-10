import Vue from 'vue';
import VueI18n from 'vue-i18n';
import AccountControls from '@/components/selfservice/profile/AccountControls';
import BootstrapVue from 'bootstrap-vue';
import { mount } from '@vue/test-utils';
import translations from '@/translations';

describe('Preferences.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Account Controls page loaded', () => {
        const wrapper = mount(AccountControls, {
            i18n
        });

        expect(wrapper.name()).to.equal('Account-Controls');
    });

    it('Account Controls delete dialog open/close', () => {
        const wrapper = mount(AccountControls, {
            i18n
        });

        wrapper.vm.hideModal();

        Vue.nextTick(() => {
            expect(wrapper.find('#deleteAccountModal').isVisible()).to.equal(false);
        });
    });
});
