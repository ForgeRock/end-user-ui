import Vue from 'vue';
import ProgressiveProfile from '@/components/mains/ProgressiveProfile';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';
import VueI18n from 'vue-i18n';
import Sinon from 'sinon';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount, shallow } from '@vue/test-utils';

describe('ProgressiveProfile.vue', () => {
    var sandbox = null,
        mountWrapper = () => {
            return mount(ProgressiveProfile, {
                i18n,
                stubs: {
                    'router-link': true
                },
                propsData: {
                    apiType: 'profile'
                }
            });
        };

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(ProgressiveProfile, 'mounted').callsFake(function () {
            this.selfServiceType = null;
            this.serviceDetails = null;
        });

        sandbox.stub(SelfserviceAPI.methods, 'advanceStage').callsFake(function () {
            return true;
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('ProgressiveProfile page loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Progressive-Profile');
    });

    it('ProgressiveProfile loading screen', () => {
        const wrapper = mountWrapper();

        wrapper.vm.showForm = true;

        expect(wrapper.contains('.v-spinner')).to.equal(true);
    });

    it('ProgressiveProfile properly sets child component to conditionaluser stage', () => {
        const wrapper = shallow(ProgressiveProfile, {
            i18n,
            stubs: {
                'router-link': true
            },
            propsData: {
                apiType: 'profile'
            }
        });

        wrapper.vm.setChildComponent('conditionaluser', {
            advanceStage: null,
            selfServiceDetails: null
        });

        expect(wrapper.vm.selfServiceType).to.equal('conditionaluser');
    });

    it('ProgressiveProfile setChildComponent properly sets displayName,purpose, and canSkip', () => {
        const wrapper = shallow(ProgressiveProfile, {
            i18n,
            stubs: {
                'router-link': true
            },
            propsData: {
                apiType: 'profile'
            }
        });

        wrapper.vm.setChildComponent('conditionaluser', {
            requirements: {
                uiConfig: {
                    displayName: 'TESTNAME',
                    purpose: 'TESTPURPOSE'
                },
                attributes: [
                    {
                        isRequired: true
                    }
                ]
            }
        });

        expect(wrapper.vm.displayName).to.equal('TESTNAME');
        expect(wrapper.vm.purpose).to.equal('TESTPURPOSE');
        expect(wrapper.vm.selfServiceDetails.canSkip).to.equal(false);
    });
});
