import Vue from 'vue';
import WorkflowControl from '@/components/widgets/WorkflowControlWidget';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';
import Sinon from 'sinon';

describe('Workflow Control Widget Component', () => {
    var sandbox = null;

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

        sandbox.stub(WorkflowControl, 'created').callsFake(function () {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    describe('Load', () => {
        it('Workflow-Control-Widget', () => {
            const wrapper = shallow(WorkflowControl, {
                i18n
            });

            expect(wrapper.name()).to.equal('Workflow-Control-Widget');
        });
    });

    describe('#created', () => {
        it('should call "getRequestService" and "loadData"', () => {
            sandbox.restore();

            const requestServiceSpy = sinon.spy(),
                loadDataSpy = sinon.spy();

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
                .and.to.include({_queryId: 'gettasksview'})
                .and.to.include({userId: 'testUserId'});

            expect(WorkflowControl.methods.getTaskParams('testUserId', 'assignedTasks')).to.be.an('object')
                .and.to.include({_queryId: 'gettasksview'})
                .and.to.include({userId: 'testUserId'})
                .and.to.include({viewType: 'assignee'});
        });
    });

    describe('#getTaskGroup', () => {
        it('should return the specified task group', () => {
            const wrapper = shallow(WorkflowControl, {
                i18n
            });

            expect(wrapper.vm.getTaskGroup('assignedTasks')).to.equal(wrapper.vm.assignedTasks);
            expect(wrapper.vm.getTaskGroup('availableTasks')).to.equal(wrapper.vm.availableTasks);
        });
    });

    describe('toTasks', () => {
        it('should populate the correct task group', () => {
            const wrapper = shallow(WorkflowControl, {
                    i18n
                }),
                response = {
                    data: { result: [{ test: {
                        name: 'test name',
                        tasks: [{ processDefinitionId: 'test process' }]
                    } }] }
                };
            wrapper.setData({processes: {'test process': 'test process definition'}});

            expect(wrapper.vm.assignedTasks).to.be.an('object').and.to.deep.equal({});

            wrapper.vm.toTasks(wrapper.vm.assignedTasks, response);
            wrapper.vm.toTasks(wrapper.vm.availableTasks, response);

            expect(wrapper.vm.availableTasks).to.have.property('test')
                .that.includes({name: 'test name'})
                .and.includes({processDefinition: 'test process definition'});

            expect(wrapper.vm.assignedTasks).to.have.property('test')
                .that.includes({name: 'test name'})
                .and.includes({processDefinition: 'test process definition'});
        });
    });
});
