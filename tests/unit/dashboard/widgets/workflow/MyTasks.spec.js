import Vue from 'vue';
import MyTasks from '@/components/dashboard/widgets/workflow/MyTasks';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import sinon from 'sinon';

describe('Workflow MyTasks Widget Component', () => {
    Vue.use(BootstrapVue);

    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(MyTasks, {
            i18n,
            propsData: {
                tasks: {
                    test1: {
                        task: {
                            _id: 'test task 1',
                            candidates: { candidateGroups: ['test-role'] }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        wrapper = null;
    });

    describe('load', () => {
        it('should properly load and mount', () => {
            expect(wrapper.name()).to.equal('My-Tasks');
        });
    });

    describe('#setShown', () => {
        it('should update "panelShown" with the passed id', () => {
            wrapper.vm.setShown('test1');
            expect(wrapper.vm.panelShown.test1).to.equal(true);
        });
    });

    describe('#setHidden', () => {
        beforeEach(() => {
            wrapper.vm.setShown('test1');
            expect(wrapper.vm.panelShown.test1).to.equal(true);
        });

        it('should update "panelShown" with the passed id', () => {
            wrapper.vm.setHidden('test1');
            expect(wrapper.vm.panelShown.test1).to.equal(false);
        });

        it('should call "onHidden" if it is a function', () => {
            const onHiddenSpy = sinon.spy();

            wrapper.setData({ onHidden: onHiddenSpy });
            wrapper.vm.setHidden('test1');

            expect(onHiddenSpy.called).to.equal(true);
        });
    });

    describe('#cancel', () => {
        it('should call "click" on the correct $ref component', () => {
            const clickSpy = sinon.spy();
            wrapper.vm.$refs = { 'cancel-test': [{ click: clickSpy }] };

            wrapper.vm.cancel('test');
            expect(clickSpy.called).to.equal(true);
        });
    });

    describe('#requeue', () => {
        it('should call "#update" with proper args', () => {
            const updateSpy = sinon.spy();
            let spyCall;

            wrapper.setMethods({ update: updateSpy });
            wrapper.vm.requeue('test1');

            expect(updateSpy.called).to.equal(true);

            spyCall = updateSpy.getCall(0);

            expect(spyCall.args[0]).to.equal('test1');
            expect(spyCall.args[1]).to.equal('updateAssignment');
            expect(spyCall.args[2]).to.deep.equal({
                id: 'test1',
                task: {
                    _id: 'test task 1',
                    candidates: { candidateGroups: ['test-role'] }
                },
                assignee: null
            });
        });
    });

    describe('#completeTask', () => {
        it('should call "#update" with proper args', () => {
            const updateSpy = sinon.spy();
            let spyCall;

            wrapper.setMethods({ update: updateSpy });
            wrapper.vm.completeTask({ id: 'test1' });

            expect(updateSpy.called).to.equal(true);

            spyCall = updateSpy.getCall(0);

            expect(spyCall.args[0]).to.equal('test1');
            expect(spyCall.args[1]).to.equal('completeTask');
            expect(spyCall.args[2]).to.deep.equal({ id: 'test1' });
        });
    });

    describe('#update', () => {
        let cancelSpy = null,
            action = 'updateTest';

        beforeEach(() => {
            cancelSpy = sinon.spy();
            wrapper.setMethods({ cancel: cancelSpy });
            wrapper.vm.setShown('test1');
            wrapper.vm.update('test1', action, 'test payload');
        });

        afterEach(() => {
            cancelSpy = null;
        });

        it('should set "onHidden" to emit passed action', () => {
            wrapper.vm.onHidden();

            expect(wrapper.emitted()[action]).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted()[action][0]).to.deep.equal([ 'test payload' ]);
        });

        it('should call cancel', () => {
            expect(cancelSpy.called).to.equal(true);
        });

        it('should will emit action and not cancel if panel not shown', () => {
            let cancelSpy2 = sinon.spy();
            wrapper.setMethods({ cancel: cancelSpy2 });
            wrapper.vm.update('test2', 'notShownTest', 'test payload');

            expect(wrapper.emitted().notShownTest).to.be.ok // eslint-disable-line
            expect(cancelSpy2.called).to.equal(false);
        });
    });

    describe('tasks watcher', () => {
        it('should set panelShown for new stuff', () => {
            const setSpy = sinon.spy();

            wrapper.vm.$set = setSpy;
            wrapper.setProps({
                tasks: {
                    test1: { task: { _id: 'test task 1', candidates: { candidateGroups: ['test-role'] } } },
                    test2: { task: { _id: 'test task 2', candidates: { candidateGroups: ['test-role'] } } }
                }
            });

            expect(setSpy.called).to.equal(true);
        });

        it('should create panelShown if it does not exist', () => {
            const setSpy = sinon.spy();

            wrapper.vm.$set = setSpy;
            wrapper.vm.panelShown = undefined;
            wrapper.setProps({
                tasks: {
                    test1: { task: { _id: 'test task 1', candidates: { candidateGroups: ['test-role'] } } },
                    test2: { task: { _id: 'test task 2', candidates: { candidateGroups: ['test-role'] } } }
                }
            });

            expect(setSpy.called).to.equal(true);
        });
    });
});
