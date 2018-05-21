import _ from 'lodash';
import Vue from 'vue';
import Registration from '@/components/mains/Registration';
import VueI18n from 'vue-i18n';
import VeeValidate from 'vee-validate';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount, shallow } from '@vue/test-utils';

describe('Registration.vue', () => {
    var sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, {inject: false, fastExit: false});

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(Registration, 'mounted').callsFake(function () {
            this.selfServiceType = null;
            this.serviceDetails = null;
            this.advanceStage = _.noop;
            this.displayNotification = () => {};
            this.$router = [];
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Registration page loaded', () => {
        const wrapper = mount(Registration, {
            i18n
        });

        expect(wrapper.name()).to.equal('Registration');
    });

    it('Registration loading screen', () => {
        const wrapper = mount(Registration, {
            i18n
        });

        expect(wrapper.contains('.v-spinner')).to.equal(true);
    });

    it('Registration properly load user details stage', () => {
        const wrapper = shallow(Registration, {
            i18n
        });

        wrapper.vm.setChildComponent('idmUserDetails', {});

        expect(wrapper.vm.selfServiceType).to.equal('idmUserDetails');
    });

    it('Registration properly handles parameters stage', () => {
        const wrapper = mount(Registration, {
            i18n
        });

        wrapper.vm.setChildComponent('parameters', {});

        expect(wrapper.vm.selfServiceType).to.equal(null);
        expect(wrapper.vm.showSelfService).to.equal(false);
    });

    it('Registration apiErrorCallback properly sets showSelfService', () => {
        const wrapper = mount(Registration, {
            i18n
        });

        wrapper.setMethods({loadData: () => {}});

        wrapper.vm.apiErrorCallback({
            response: {
                data: {
                    message: 'test'
                }
            }
        });

        expect(wrapper.vm.showSelfService).to.equal(true);
    });
});
