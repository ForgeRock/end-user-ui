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

    let wrapper;

    beforeEach(() => {
        wrapper = mount(PolicyPanel, {
            i18n,
            propsData: {
                policies: [{name: 'test', params: { args: 'test args' }}],
                policyFailures: ['test']
            }
        });
    });

    describe('#translate', () => {
        it('should return a properly translated string', () => {
            const expectedString = 'Must be 1 characters long';

            expect(wrapper.vm.translate({name: 'MIN_LENGTH', params: { minLength: 1 }})).to.equal(expectedString);
        });
    });
});
