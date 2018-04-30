import Vue from 'vue';
import ResetStage from '@/components/selfservice/passwordreset/ResetStage';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('ResetStage.vue', () => {
    var mountWrapper = () => {
        return mount(ResetStage, {
            i18n,
            propsData: {
                advanceStage: null,
                selfServiceDetails: {
                    tag: 'initial'
                },
                $route: {
                    params: null
                }
            }
        });
    };

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('ResetStage component loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Reset-Stage');
    });

    it('ResetStage getData() returns proper output', () => {
        var expectedResult = {
                password: 'testTest1'
            },
            actualResult;

        const wrapper = mountWrapper();

        wrapper.vm.password = 'testTest1';

        actualResult = wrapper.vm.getData();
        expect(JSON.stringify(actualResult)).to.equal(JSON.stringify(expectedResult));
    });

    it('ResetStage emits advanceStage() on save', (done) => {
        const wrapper = mountWrapper();

        // Trigger a save to verify after is valid promise
        wrapper.vm.save();

        expect(wrapper.emitted().advanceStage.length).to.equal(1);
        done();
    });
});
