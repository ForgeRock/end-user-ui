import Vue from 'vue';
import ResetStage from '@/components/selfservice/passwordreset/ResetStage';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

// Seems to have loading issues
describe.skip('ResetStage.vue', () => {
    ResetStage.components['fr-policy-password-input'] = sinon.stub();

    var mountWrapper = () => {
        return shallowMount(ResetStage, {
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

    Vue.use(BootstrapVue);

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
