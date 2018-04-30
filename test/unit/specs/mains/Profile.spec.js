import Vue from 'vue';
import Profile from '@/components/mains/Profile';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';
import Sinon from 'sinon';

describe('Profile.vue', () => {
    let sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(Profile.methods, 'loadData').callsFake(function () {
            this.usersName = 'Emma Enduser';
            this.email = 'emma.enduser@forgerock.com';
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Profile page loaded', () => {
        const wrapper = shallow(Profile, {
            i18n
        });

        expect(wrapper.name()).to.equal('Profile');
    });
});
