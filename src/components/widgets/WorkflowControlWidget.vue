<template>
    <div>
        <Processes :processes="processes" ref="processes" @startProcess="startProcess"></Processes>
        <MyTasks :tasks="assignedTasks" @updateAssignment="updateAssignment" @completeTask="completeTask"></MyTasks>
        <GroupTasks :tasks="availableTasks" @updateAssignment="updateAssignment"></GroupTasks>
    </div>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';
    import MyTasks from '@/components/widgets/workflow/MyTasks';
    import GroupTasks from '@/components/widgets/workflow/GroupTasks';
    import Processes from '@/components/widgets/workflow/Processes';

    export default {
        name: 'Workflow-Control-Widget',
        components: {
            MyTasks,
            GroupTasks,
            Processes
        },
        props: ['userDetails', 'widgetDetails'],
        data () {
            return {
                workflowService: null,
                assignedTasks: [],
                availableTasks: [],
                processes: {}
            };
        },
        created () {
            this.workflowService = this.getRequestService();
            this.loadData();
        },
        methods: {
            completeTask ({id, formData}) {
                const data = _.omit(formData, '_processDefinitionId'),
                    config = {
                        headers: {'Accept': 'application/json, text/javascript, */*; q=0.01'},
                        timeout: 2500
                    };

                /* istanbul ignore next */
                return this.workflowService.post(`/workflow/taskinstance/${id}?_action=complete`, data, config)
                    .then((response) => {
                        this.displayNotification('success', this.$t('pages.workflow.taskSuccessfullyCompleted'));
                        this.$delete(this.assignedTasks, id);
                    })
                    .then(this.loadData)
                    .catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
            },
            updateAssignment ({id, task, assignee}) {
                /* istanbul ignore next */
                return this.workflowService.put(`/workflow/taskinstance/${task._id}`, { assignee }, { headers: {'If-Match': '"*"'} })
                    .then((response) => {
                        this.displayNotification('success', this.$t('pages.workflow.assignmentSuccess', {taskName: task.name, assignee}));
                        // Use $delete to remove the task from the list to get the proper transition
                        this.$delete(this.assignedTasks, id);
                        this.$delete(this.availableTasks, id);
                    })
                    .then(this.loadData)
                    .catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
            },
            startProcess (payload) {
                /* istanbul ignore next */
                return this.workflowService.post('/workflow/processinstance/?_action=create', payload)
                    .then((response) => {
                        this.displayNotification('success', this.$t('pages.workflow.processStartSuccessMessage'));
                        this.$refs.processes.cancel(payload._processDefinitionId);
                    })
                    .then(this.loadData)
                    .catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
            },
            loadProcesses () {
                /* istanbul ignore next */
                return this.workflowService.get('/endpoint/getprocessesforuser')
                    // Grab the array of processes off the response object.
                    .then((processes) => processes.data.processes)
                    // Get the process definition for each process object
                    .then((processes) => {
                        return axios.all(processes.map((process) => this.workflowService.get(`/workflow/processdefinition/${process._id}`)));
                    })
                    // Convert the array of responses to an array of the data from the previous request
                    .then((response) => response.map((res) => res.data))
                    // Use the built in `$set` function to reactively get the process definitions into component state
                    .then((processDefinitions) => {
                        processDefinitions.forEach((definition) => {
                            this.$set(this.processes, definition._id, definition);
                        });
                    });
            },
            loadTasks (options = {taskGroup: 'availableTasks'}) {
                const params = {
                    _queryId: 'gettasksview',
                    userId: this.userDetails.userId
                };

                let taskGroup = this[options.taskGroup];

                if (options.taskGroup === 'assignedTasks') {
                    params.viewType = 'assignee';
                }

                /* istanbul ignore next */
                return this.workflowService.get('/endpoint/gettasksview', { params })
                    // Filter out any empty results
                    .then(({data}) => _.reject(data.result, _.isEmpty))
                    .then(([tasks]) => {
                        _.each(tasks, (taskObj, id) => {
                            let name = taskObj.name,
                                task = _.first(taskObj.tasks),
                                processDefinition = this.processes[task.processDefinitionId];

                            // Use $set to maintain reactivity
                            this.$set(taskGroup, id, { name, task, processDefinition });
                        });
                    });
            },
            loadData () {
                /* istanbul ignore next */
                this.loadProcesses() // Need to load processes first so process definitions are available to tasks when loaded
                .then(() => axios.all([this.loadTasks({taskGroup: 'assignedTasks'}), this.loadTasks({taskGroup: 'availableTasks'})]))
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
            }
        }
    };
</script>

<style lang="scss" scoped></style>
