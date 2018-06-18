<template>
    <div>
        <Processes :processes="processes"></Processes>
        <MyTasks :tasks="assignedTasks"></MyTasks>
        <GroupTasks :tasks="availableTasks"></GroupTasks>
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
                assignedTasks: [],
                availableTasks: [],
                processes: []
            };
        },
        mounted () {
            this.loadData();
        },
        methods: {
            loadData () {
                let idmInstance = this.getRequestService();

                axios.all([
                    idmInstance.get(`/endpoint/gettasksview?_queryId=gettasksview&userId=${this.userDetails.userId}&viewType=assignee`),
                    idmInstance.get(`/endpoint/gettasksview?_queryId=gettasksview&userId=${this.userDetails.userId}`),
                    idmInstance.get('/endpoint/getprocessesforuser')]).then(axios.spread((assignedTasks, availableTasks, processes) => {
                        _.each(assignedTasks.data.result, (task) => {
                            if (!_.isEmpty(task)) {
                                this.assignedTasks.push(task);
                            }
                        });

                        _.each(availableTasks.data.result, (task) => {
                            if (!_.isEmpty(task)) {
                                this.availableTasks.push(task);
                            }
                        });

                        _.each(processes.data.processes, (process) => {
                            if (!_.isEmpty(process)) {
                                this.processes.push(process);
                            }
                        });
                    }))
                    .catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
            }
        }
    };
</script>

<style lang="scss" scoped></style>