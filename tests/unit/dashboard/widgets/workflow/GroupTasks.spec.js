import Vue from 'vue';
import GroupTasks from '@/components/dashboard/widgets/workflow/GroupTasks';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import sinon from 'sinon';

describe('Workflow GroupTasks Widget Component', () => {
    Vue.use(BootstrapVue);

    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(GroupTasks, {
            i18n,
            propsData: {
                tasks: { test1: { task: 'test task 1' } }
            }
        });
    });

    afterEach(() => {
        wrapper = null;
    });

    describe('load', () => {
        it('should properly load and mount', () => {
            expect(wrapper.name()).to.equal('Group-Tasks');
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

    describe('#assignTask', () => {
        let cancelSpy = null;

        beforeEach(() => {
            cancelSpy = sinon.spy();
            wrapper.setMethods({ cancel: cancelSpy });
            wrapper.vm.assignTask({ id: 'test1', assignee: 'testUser' });
        });

        afterEach(() => {
            cancelSpy = null;
        });

        it('should set "onHidden" to emit "updateAssignment"', () => {
            wrapper.vm.onHidden();

            expect(wrapper.emitted().updateAssignment).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().updateAssignment[0]).to.deep.equal([{
                assignee: 'testUser',
                id: 'test1',
                task: 'test task 1'
            }]);
        });

        it('should call cancel', () => {
            expect(cancelSpy.called).to.equal(true);
        });
    });

    describe('tasks watcher', () => {
        it('should set panelShown for new stuff', () => {
            const setSpy = sinon.spy();

            wrapper.vm.$set = setSpy;
            wrapper.setProps({
                tasks: {
                    test1: { task: 'test task 1' },
                    test2: { task: 'test task 2' }
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
                    test1: { task: 'test task 1' },
                    test2: { task: 'test task 2' }
                }
            });

            expect(setSpy.called).to.equal(true);
        });
    });
});
