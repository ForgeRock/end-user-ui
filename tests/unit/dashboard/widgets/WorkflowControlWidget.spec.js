import Vue from 'vue';
import WorkflowControl from '@/components/dashboard/widgets/WorkflowControlWidget';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('Workflow Control Widget Component', () => {
    var sandbox = null;

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(WorkflowControl, 'created').callsFake(function () {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Load', () => {
        it('Workflow-Control-Widget', () => {
            const wrapper = shallowMount(WorkflowControl, {
                i18n
            });

            expect(wrapper.name()).to.equal('Workflow-Control-Widget');
        });
    });

    describe('#created', () => {
        it('should call "getRequestService" and "loadData"', () => {
            sandbox.restore();

            const requestServiceSpy = Sinon.spy(),
                loadDataSpy = Sinon.spy();

            WorkflowControl.getRequestService = requestServiceSpy;
            WorkflowControl.loadData = loadDataSpy;
            WorkflowControl.created();

            expect(requestServiceSpy.called).to.equal(true);
            expect(loadDataSpy.called).to.equal(true);
        });
    });

    describe('#getTaskParams', () => {
        it('should return the correct params object for task requests', () => {
            expect(WorkflowControl.methods.getTaskParams('testUserId')).to.be.an('object')
                .and.to.include({ _queryId: 'gettasksview' })
                .and.to.include({ userId: 'testUserId' });

            expect(WorkflowControl.methods.getTaskParams('testUserId', 'assignedTasks')).to.be.an('object')
                .and.to.include({ _queryId: 'gettasksview' })
                .and.to.include({ userId: 'testUserId' })
                .and.to.include({ viewType: 'assignee' });
        });
    });

    describe('#getTaskGroup', () => {
        it('should return the specified task group', () => {
            const wrapper = shallowMount(WorkflowControl, {
                i18n
            });

            expect(wrapper.vm.getTaskGroup('assignedTasks')).to.equal(wrapper.vm.assignedTasks);
            expect(wrapper.vm.getTaskGroup('availableTasks')).to.equal(wrapper.vm.availableTasks);
        });
    });

    describe('toTasks', () => {
        it('should populate the correct task group', () => {
            const wrapper = shallowMount(WorkflowControl, {
                    i18n
                }),
                response = {
                    data: { result: [{ test: {
                        name: 'test name',
                        tasks: [{ processDefinitionId: 'testProcess' }]
                    } }] }
                },
                testProcess = {
                    name: 'test process definition',
                    processDefinition: null
                };

            wrapper.setData({ processes: { testProcess } });

            expect(wrapper.vm.assignedTasks).to.be.an('object').and.to.deep.equal({});

            wrapper.vm.toTasks(wrapper.vm.assignedTasks, response);
            wrapper.vm.toTasks(wrapper.vm.availableTasks, response);

            expect(wrapper.vm.availableTasks).to.have.property('test')
                .that.includes({ name: 'test name' })
                .and.includes({ process: testProcess });

            expect(wrapper.vm.assignedTasks).to.have.property('test')
                .that.includes({ name: 'test name' })
                .and.includes({ process: testProcess });
        });

        it('should populate a method to fetch a process if no process defined', () => {
            const wrapper = shallowMount(WorkflowControl, {
                    i18n
                }),
                response = {
                    data: { result: [{ test: {
                        name: 'test name',
                        tasks: [{ processDefinitionId: 'testProcess' }]
                    } }] }
                },
                fetchSpy = Sinon.spy();

            wrapper.setData({ workflowService: { get: fetchSpy } });
            wrapper.vm.toTasks(wrapper.vm.assignedTasks, response);

            expect(wrapper.vm.assignedTasks).to.have.property('test')
                .that.includes({ name: 'test name' })
                .and.that.has.property('process').that.has.property('fetchProcessDefinition');

            wrapper.vm.assignedTasks.test.process.fetchProcessDefinition();

            expect(fetchSpy.called).to.equal(true);
        });
    });
});
