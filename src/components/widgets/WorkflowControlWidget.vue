<template>
    <div>
        <Processes :processes="processes" ref="processes" @startProcess="startProcess" @loadProcess="loadProcessDefinition"></Processes>
        <MyTasks :tasks="assignedTasks" @updateAssignment="updateAssignment" @completeTask="completeTask" @loadProcess="loadProcessDefinition"></MyTasks>
        <GroupTasks :tasks="availableTasks" @updateAssignment="updateAssignment" @loadProcess="loadProcessDefinition"></GroupTasks>
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
                assignedTasks: {},
                availableTasks: {},
                processes: {}
            };
        },
        created () {
            this.workflowService = this.getRequestService();
            this.loadData();
        },
        methods: {
            completeTask ({id, formData}) {
                /* istanbul ignore next */
                return this.workflowService.post(`/workflow/taskinstance/${id}?_action=complete`, formData, {
                    headers: {'Accept': 'application/json, text/javascript, */*; q=0.01'},
                    timeout: 2500
                })
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
            loadProcessDefinition (process) {
                /* istanbul ignore next */
                process.fetchProcessDefinition()
                    .then(({data}) => {
                        this.$set(process, 'processDefinition', data);
                    })
                    .catch((error) => {
                        this.displayNotification('error', error.reponse.data.message);
                    });
            },
            loadProcesses () {
                /* istanbul ignore next */
                return this.workflowService.get('/endpoint/getprocessesforuser')
                    // Grab the array of processes off the response object.
                    .then((processes) => processes.data.processes)
                    // Get the process definition for each process object
                    .then((processes) => {
                        return axios.all(processes.map((process) => {
                            let fetchProcessDefinition = () => this.workflowService.get(`/workflow/processdefinition/${process._id}`),
                                processDefinition = null;
                            return _.merge(process, { fetchProcessDefinition, processDefinition });
                        }));
                    })
                    // Use the built in `$set` function to reactively get the process definitions into component state
                    .then((processDefinitions) => {
                        processDefinitions.forEach((definition) => {
                            this.$set(this.processes, definition._id, definition);
                        });
                    });
            },
            getTaskParams (userId, groupName) {
                const params = {
                    _queryId: 'gettasksview',
                    userId
                };

                if (groupName === 'assignedTasks') {
                    params.viewType = 'assignee';
                }

                return params;
            },
            getTaskGroup (groupName) {
                return this[groupName];
            },
            toTasks (taskGroup, {data}) {
                // Filter out any empty results
                let [ tasks ] = _.reject(data.result, _.isEmpty);

                // Process each result
                _.each(tasks, (taskObj, id) => {
                    let name = taskObj.name,
                        task = _.first(taskObj.tasks),
                        process = this.processes[task.processDefinitionId],
                        fetchProcessDefinition = () => {
                            return this.workflowService.get(`/workflow/processdefinition/${task.processDefinitionId}`);
                        };

                    if (_.isUndefined(process)) {
                        process = { fetchProcessDefinition };
                    }

                    // Use $set to maintain reactivity
                    this.$set(taskGroup, id, { name, task, process });
                });
            },
            loadTasks (options = {groupName: 'availableTasks'}) {
                /* istanbul ignore next */
                return this.workflowService.get('/endpoint/gettasksview', {
                    params: this.getTaskParams(this.userDetails.userId, options.groupName)
                }).then((response) => {
                    this.toTasks(this.getTaskGroup(options.groupName), response);
                });
            },
            loadData () {
                /* istanbul ignore next */
                this.loadProcesses() // Need to load processes first so process definitions are available to tasks when loaded
                .then(() => axios.all([this.loadTasks({groupName: 'assignedTasks'}), this.loadTasks({groupName: 'availableTasks'})]))
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
            }
        }
    };
</script>

<style lang="scss" scoped></style>
