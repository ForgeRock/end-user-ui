import Vue from 'vue';
import Task from '@/components/dashboard/widgets/workflow/Task';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import _ from 'lodash';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('Workflow Task Component', () => {
    Vue.use(BootstrapVue);

    const taskInstance = {
        task: {
            _id: 'testId',
            variables: { 'testVar': 'test value' },
            taskDefinition: {
                formGenerationTemplate: '{name: "test", template: "<div>hello</div>"}'
            }
        },
        process: {
            processDefinition: {
                _id: 'test',
                name: 'Test process',
                formProperties: [ { _id: 'testVar', name: 'test variable' } ]
            }
        }
    };

    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(Task, {
            i18n,
            propsData: { taskInstance }
        });
    });

    afterEach(() => {
        wrapper = null;
    });

    describe('mount', () => {
        it('should have the correct name', () => {
            expect(wrapper.name()).to.equal('Task');
        });

        it('should have the correct initial data', () => {
            expect(wrapper.vm.taskForm).to.be.an('object').and.to.have.property('name').that.equals('test');
        });
    });

    describe('computed properties', () => {
        it('should have computed "processDefinition"', () => {
            expect(wrapper.vm.processDefinition).to.have.property('formProperties').that.is.an('array');
            expect(wrapper.vm.processDefinition.formProperties.length).to.equal(1);
        });

        it('should emit "loadProcess" when computing "processDefinition" and "process.processDefinition" is null', () => {
            wrapper.setProps({
                taskInstance: {
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

        it('should have computed "taskDetails"', () => {
            expect(wrapper.vm.taskDetails).to.be.an('array')
                .and.to.deep.equal([{ _id: 'testVar', name: 'test variable', value: 'test value' }]);
        });

        it('should have computed "variables"', () => {
            expect(wrapper.vm.variables).to.be.an('object')
                .and.to.deep.equal({ testVar: 'test value' });
        });

        it('should have computed "formProperties"', () => {
            expect(wrapper.vm.formProperties).to.deep.equal([ { _id: 'testVar', name: 'test variable' } ]);
        });

        it('should have computed "taskForm"', () => {
            expect(wrapper.vm.taskForm).to.be.an('object');

            wrapper.setProps({
                taskInstance: {
                    task: {
                        _id: 'testId',
                        variables: { 'testVar': 'test value' },
                        taskDefinition: {}
                    },
                    process: {
                        processDefinition: null
                    }
                }
            });

            expect(_.isNull(wrapper.vm.taskForm)).to.equal(true);
        });

        it('should return `[]` for "formProperties" when processDefinition null', () => {
            wrapper.setProps({
                taskInstance: {
                    task: {
                        _id: 'testId',
                        variables: { 'testVar': 'test value' }
                    },
                    process: {
                        processDefinition: null
                    }
                }
            });

            expect(wrapper.vm.formProperties).to.deep.equal([]);
        });
    });

    describe('#cancel', () => {
        it('should emit "cancel" with the task id', () => {
            wrapper.vm.cancel();
            expect(wrapper.emitted().cancel).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().cancel[0]).to.deep.equal(['testId']);
        });
    });

    describe('#submit', () => {
        it('should emit "completeTask" with task id and passed formData', () => {
            wrapper.vm.submit({ test: 'test' });
            expect(wrapper.emitted().completeTask).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().completeTask[0]).to.deep.equal([{ id: 'testId', formData: { test: 'test' } }]);
        });
    });
});
