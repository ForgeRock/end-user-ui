import Vue from 'vue';
import AssignTask from '@/components/dashboard/widgets/workflow/AssignTask';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('AssignTask workflow widget component', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    let wrapper = null;

    beforeEach(() => {
        wrapper = mount(AssignTask, {
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

    describe('#assignTask', () => {
        it('should emit "assignTask" with { id, assignee }', () => {
            wrapper.vm.assignTask();
            expect(wrapper.emitted().assignTask).to.be.ok; // eslint-disable-line
            expect(wrapper.emitted().assignTask[0]).to.deep.equal([{ id: 'testId', assignee: 'testUser' }]);
        });
    });
});
