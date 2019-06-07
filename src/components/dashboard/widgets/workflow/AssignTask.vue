<template>
    <b-card-body class="pt-3">
        <b-row>
            <b-col lg="8" offset-lg="1">
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">{{$t('pages.workflow.assignTo')}}</label>
                    <div class="col-sm-10">
                        <div class="d-flex">
                            <b-form-select v-model="selected" :options="assigneeOptions" class="mb-3 mr-2" />
                            <b-button type="button" variant="primary" class="mb-3 d-flex align-self-end" @click="assignTask">{{$t('pages.workflow.assign')}}</b-button>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Details</label>
                    <div class="col-sm-10">
                        <b-card>
                            <dl class="row m-0">
                                <template v-for="(detail, index) in taskDetails">
                                    <dt :key="`taskname-${index}`" class="col-6">{{detail.name}}</dt>
                                    <dd :key="`taskvalue-${index}`" class="col-6">{{detail.value}} </dd>
                                </template>
                           </dl>
                        </b-card>
                    </div>
                </div>
            </b-col>
        </b-row>
    </b-card-body>
</template>

<script>
import _ from 'lodash';

/**
* @description Dashboard widget that allows a user to assign a task
*
**/
export default {
    name: 'Assign-Task',
    props: ['taskDefinition'],
    data () {
        return {
            workflowService: null,
            selected: this.$root.userStore.state.userName
        };
    },
    computed: {
        process () {
            return this.taskDefinition.process;
        },
        processDefinition () {
            if (this.process.processDefinition === null) {
                this.$emit('loadProcess', this.process);
            }
            return this.process.processDefinition;
        },
        formProperties () {
            return !_.isNull(this.processDefinition) ? this.processDefinition.formProperties : [];
        },
        task () {
            return this.taskDefinition.task;
        },
        id () {
            return this.task._id;
        },
        taskDetails () {
            return this.formProperties.reduce((acc, property) => {
                return acc.concat({ _id: property._id, name: property.name, value: this.task.variables[property._id] });
            }, []);
        },
        assigneeOptions () {
            let loggedUserName = this.$root.userStore.state.userName;
            if (!_.isEmpty(this.task.usersToAssign)) {
                return this.task.usersToAssign.map(({ username, displayableName }) => {
                    let value = username,
                        text = username === loggedUserName ? this.$t('pages.workflow.me') : displayableName;
                    return { value, text };
                });
            } else {
                return [{ value: loggedUserName, text: this.$t('pages.workflow.me') }];
            }
        }
    },
    methods: {
        assignTask () {
            this.$emit('assignTask', { id: this.id, assignee: this.selected });
        }
    }
};
</script>
