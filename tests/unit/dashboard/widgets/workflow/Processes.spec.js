import Vue from 'vue';
import Processes from '@/components/dashboard/widgets/workflow/Processes';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import sinon from 'sinon';

Processes.components['fr-process'] = sinon.stub();

describe('Workflow Processes Widget Component', () => {
    Vue.use(BootstrapVue);

    it('should properly load and mount', () => {
        const wrapper = shallowMount(Processes, {
            i18n
        });

        expect(wrapper.name()).to.equal('Processes');
    });

    describe('#reset', () => {
        const wrapper = shallowMount(Processes, { i18n }),
            childResetFormSpy = sinon.spy();

        wrapper.vm.$refs.test = [{ reset: childResetFormSpy }];
        wrapper.vm.reset('test');

        it('should call #reset on child component', () => {
            expect(childResetFormSpy.called).to.equal(true);
        });

        it('should not call #reset if no child component', () => {
            wrapper.vm.reset('test2');
            expect(childResetFormSpy.calledOnce).to.equal(true);
        });
    });

    describe('#cancel', () => {
        const wrapper = shallowMount(Processes, { i18n }),
            clickSpy = sinon.spy(),
            resetFormSpy = sinon.spy();

        wrapper.vm.$refs['cancel-test'] = [{ click: clickSpy }];

        wrapper.setMethods({ reset: resetFormSpy });
        wrapper.vm.cancel('test');

        it('should call #reset', () => {
            expect(resetFormSpy.called).to.equal(true);
        });

        it('should click cancel button for process', () => {
            expect(clickSpy.called).to.equal(true);
        });

        it('should not click or call reset if button not found', () => {
            wrapper.vm.cancel('test1');
            expect(clickSpy.calledOnce).to.equal(true);
            expect(resetFormSpy.calledOnce).to.equal(true);
        });
    });
});
