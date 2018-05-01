import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Preferences from '@/components/selfservice/profile/Preferences';
import BootstrapVue from 'bootstrap-vue';
import { shallow } from '@vue/test-utils';
import Sinon from 'sinon';
import translations from '@/translations';

describe('Preferences.vue', () => {
    let sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(Preferences.methods, 'loadData').callsFake(function () {
            this.preferences = {
                'updates': {
                    'description': 'Send me news and updates',
                    'value': false
                },
                'marketing': {
                    'description': 'Send me special offers and services',
                    'value': true
                }
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

    it('Preferences page loaded', () => {
        const wrapper = shallow(Preferences, {
            i18n
        });

        expect(wrapper.name()).to.equal('Preferences');
    });
});
