import Vue from 'vue';
import VueI18n from 'vue-i18n';
import EditPassword from '@/components/selfservice/profile/EditPassword';
import BootstrapVue from 'bootstrap-vue';
import {shallow} from '@vue/test-utils';
import translations from '@/translations';

describe('EditPassword.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('PasswordReset page loaded', () => {
        const wrapper = shallow(EditPassword, {
            i18n
        });

        expect(wrapper.name()).to.equal('Edit-Password');
    });

    it('PasswordReset page loaded', () => {
        const wrapper = shallow(EditPassword, {
            i18n
        });

        expect(wrapper.name()).to.equal('Edit-Password');
    });

    it('revealNew method changes input state', () => {
        const wrapper = shallow(EditPassword, {
            i18n
        });

        wrapper.vm.revealNew();

        expect(wrapper.vm.inputNew).to.equal('text');
        expect(wrapper.vm.showNew).to.equal(false);

        wrapper.vm.revealNew();

        expect(wrapper.vm.inputNew).to.equal('password');
        expect(wrapper.vm.showNew).to.equal(true);
    });
});
