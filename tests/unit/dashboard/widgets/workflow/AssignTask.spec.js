import Vue from 'vue';
import AssignTask from '@/components/dashboard/widgets/workflow/AssignTask';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('AssignTask workflow widget component', () => {
    Vue.use(BootstrapVue);

    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(AssignTask, {
            i18n,
            propsData: {
                taskDefinition: {
                    task: {
                        _id: 'testId',
                        variables: { 'testVar': 'test value' },
                        usersToAssign: [ { username: 'testUser2', displayableName: 'Test User 2' } ]
                    },
                    process: {
                        processDefinition: { formProperties: [ { _id: 'testVar', name: 'test variable' } ] }
                    }
                }
            },
            mocks: {
                userStore: { state: { userName: 'testUser' } }
            }
        });
    });

    afterEach(() => {
        wrapper = null;
    });

    describe('load', () => {
        it('should have the correct name', () => {
            expect(wrapper.name()).to.equal('Assign-Task');
        });
    });

    describe('computed properties', () => {
        it('should have computed "processDefinition"', () => {
            expect(wrapper.vm.processDefinition).to.have.property('formProperties').that.is.an('array');
            expect(wrapper.vm.processDefinition.formProperties.length).to.equal(1);
        });

        it('should emit "loadProcess" when computing "processDefinition" and "process.processDefinition" is null', () => {
            wrapper.setProps({
                taskDefinition: {
                    task: {
                        _id: 'testId',
                        variables: { 'testVar': 'test value' }
                    },
                    process: {
                        processDefinition: null
                    }
                }
            });

            expect(wrapper.emitted().loadProcess).to.be.ok; // eslint-disable-line
        });

        it('should have computed "task"', () => {
            expect(wrapper.vm.task).to.be.an('object')
                .and.to.include({ _id: 'testId' })
                .and.to.have.property('variables').that.deep.equals({ 'testVar': 'test value' });
        });

        it('should have computed "id"', () => {
            expect(wrapper.vm.id).to.be.a('string')
                .and.to.equal('testId');
        });

        it('should have computed "taskDetails"', () => {
            expect(wrapper.vm.taskDetails).to.be.an('array')
                .and.to.deep.equal([{ _id: 'testVar', name: 'test variable', value: 'test value' }]);
        });

        it('should have computed "assigneeOptions"', () => {
            expect(wrapper.vm.assigneeOptions).to.be.an('array');
            expect(wrapper.vm.assigneeOptions.length).to.equal(1);
            expect(wrapper.vm.assigneeOptions[0]).to.include({ value: 'testUser2', text: 'Test User 2' });

            wrapper.setProps({
                taskDefinition: {
                    task: {
                        _id: 'testId',
                        variables: { 'testVar': 'test value' },
                        usersToAssign: [ { username: 'testUser', displayableName: 'Test User' } ]
                    },
                    process: {
                        processDefinition: null
                    }
                }
            });

            expect(wrapper.vm.assigneeOptions).to.be.an('array');
            expect(wrapper.vm.assigneeOptions.length).to.equal(1);
            expect(wrapper.vm.assigneeOptions[0]).to.include({ value: 'testUser', text: 'Me' });

            wrapper.setProps({
                taskDefinition: {
                    task: {
                        _id: 'testId',
                        variables: { 'testVar': 'test value' },
                        usersToAssign: []
                    },
                    process: {
                        processDefinition: null
                    }
                }
            });

            expect(wrapper.vm.assigneeOptions).to.be.an('array');
            expect(wrapper.vm.assigneeOptions.length).to.equal(1);
            expect(wrapper.vm.assigneeOptions[0]).to.include({ value: 'testUser', text: 'Me' });
        });
    });

    describe('#assignTask', () => {
        it('should emit "assignTask" with { id, assignee }', () => {
            wrapper.vm.assignTask();
            expect(wrapper.emitted().assignTask).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().assignTask[0]).to.deep.equal([{ id: 'testId', assignee: 'testUser' }]);
        });
    });
});
