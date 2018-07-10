import Vue from 'vue';
import Process from '@/components/widgets/workflow/Process';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';
import sinon from 'sinon';

Process.created = sinon.stub();

describe('Workflow Process Component', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    describe('mount', () => {
        const wrapper = shallow(Process, {
            i18n,
            propsData: { processDefinition: {_id: 'test', name: 'Test process'} }
        });

        it('should have the correct name', () => {
            expect(wrapper.name()).to.equal('Workflow-Process');
        });

        it('should have the correct initial data', () => {
            expect(wrapper.vm.startForm).to.equal(null);
            expect(wrapper.vm.processInfo).to.equal(null);
        });
    });

    describe('#cancel', () => {
        const wrapper = shallow(Process, {
            i18n,
            propsData: { processDefinition: {_id: 'test', name: 'Test process'} }
        });

        let resetSpy = sinon.spy();

        wrapper.setMethods({reset: resetSpy});
        wrapper.vm.cancel();

        it('should call #reset', () => {
            expect(resetSpy.called).to.equal(true);
        });

        it('should emit "cancel" with the process id', () => {
            expect(wrapper.emitted().cancel).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().cancel[0]).to.deep.equal(['test']);
        });
    });

    describe('#submit', () => {
        const wrapper = shallow(Process, {
            i18n,
            propsData: { processDefinition: {_id: 'test', name: 'Test process'} }
        });

        wrapper.vm.submit({test: 'test'});

        it('should emit "startProcess" with the passed payload', () => {
            expect(wrapper.emitted().startProcess).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().startProcess[0]).to.deep.equal([{ test: 'test' }]);
        });
    });

    describe('#restForm', () => {
        const wrapper = shallow(Process, {
                i18n,
                propsData: {
                    processDefinition: { _id: 'test', name: 'Test process' }
                }
            }),
            childResetFormSpy = sinon.spy();

        wrapper.vm.$refs.startFormComponent = { resetForm: childResetFormSpy };
        wrapper.vm.reset();

        it('should call #resetForm on child component', () => {
            expect(childResetFormSpy.called).to.be.ok // eslint-disable-line
        });
    });
});
