import Vue from 'vue';
import EditPersonalInfo from '@/components/selfservice/profile/EditPersonalInfo';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';
import VeeValidate from 'vee-validate';

describe('EditPersonalInfo.vue', () => {
    let sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(EditPersonalInfo.methods, 'loadData').callsFake(function () {
            this.formFields = [];
            this.options = ['true', 'false'];
            this.title = 'Test Title';
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        v = new VeeValidate.Validator();

    it('EditPersonalInfo modal loaded', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n
        });

        expect(wrapper.name()).to.equal('Edit-Personal-Info');
        expect(wrapper.isVisible()).to.equal(true);
    });

    it('renders a title', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n
        });

        expect(wrapper.vm.title).to.equal('Test Title');
    });

    it('TermsAndConditions validation', (done) => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n
        });

        wrapper.vm.isValid().then((response) => {
            expect(response).to.equal(true);

            done();
        });
    });

    it('hides modal on close', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n
        });

        wrapper.vm.hideModal();

        Vue.nextTick(() => {
            expect(wrapper.find('#userDetailsModal').isVisible()).to.equal(false);
        });
    });
});
