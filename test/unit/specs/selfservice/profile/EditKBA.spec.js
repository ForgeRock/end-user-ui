import _ from 'lodash';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import EditKBA from '@/components/selfservice/profile/EditKBA';
import BootstrapVue from 'bootstrap-vue';
import {mount} from '@vue/test-utils';
import Sinon from 'sinon';
import translations from '@/translations';

describe('EditKBA.vue', () => {
    let sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(EditKBA, 'mounted').callsFake(function () {
            _.noop();
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
        const wrapper = mount(EditKBA, {
            i18n
        });

        expect(wrapper.name()).to.equal('Edit-KBA');
    });

    it('creates fieldsets for the number of required questions', () => {
        const wrapper = mount(EditKBA, {
            i18n
        });

        wrapper.vm.initializeForm(3);
        expect(wrapper.vm.selected.length).to.equal(3);

        wrapper.vm.selected = [];
        wrapper.vm.initializeForm(5);
        expect(wrapper.vm.selected.length).to.equal(5);
    });

    it('creates select options based on defined kba questions', () => {
        const wrapper = mount(EditKBA, {
            i18n
        });

        // with no questions
        wrapper.vm.initializeForm(2);
        expect(wrapper.vm.selectOptions.length).to.equal(2);

        // with two questions added
        wrapper.setData({
            questions: {
                '1': {
                    'en': 'What\'s your favorite color?'
                },
                '2': {
                    'en': 'Who was your first employer?'
                }
            }
        });
        wrapper.vm.initializeForm(2);

        expect(wrapper.vm.selectOptions.length).to.equal(4);
    });
});
