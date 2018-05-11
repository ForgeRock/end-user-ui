import Vue from 'vue';
import PolicyPanel from '@/components/utils/PolicyPanel';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('PolicyPanel.vue', () => {
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    describe('proper render', () => {
        let wrapper = mount(PolicyPanel, {
            i18n,
            propsData: {
                policies: [{name: 'test', params: { args: 'test args' }}],
                policyFailures: ['test']
            }
        });

        it('should not show anything when "policyFailures" is loading', () => {
            wrapper.setProps({ policyFailures: 'loading' });

            expect(wrapper.contains('ul')).to.equal(false);
            expect(wrapper.contains('div.alert')).to.equal(false);
        });

        it('should show policy ul when "policyFailures" is non empty array', () => {
            wrapper.setProps({ policyFailures: ['test'] });

            expect(wrapper.contains('ul')).to.equal(true);
            expect(wrapper.contains('div.alert')).to.equal(false);
        });

        it('should show success alert when "policyFailures" is an empty array', () => {
            wrapper.setProps({ policyFailures: [] });

            expect(wrapper.contains('ul')).to.equal(false);
            expect(wrapper.contains('div.alert')).to.equal(true);
        });
    });

    describe('#translate', () => {
        let wrapper = mount(PolicyPanel, {
            i18n,
            propsData: {
                policies: [{name: 'test', params: { args: 'test args' }}],
                policyFailures: ['test']
            }
        });

        it('should return a properly translated string', () => {
            const expectedString = 'Must be 1 characters long';

            expect(wrapper.vm.translate({name: 'MIN_LENGTH', params: { minLength: 1 }})).to.equal(expectedString);
        });
    });
});
