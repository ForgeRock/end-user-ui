<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-card-body class="pt-3">
        <b-row>
            <b-col lg="8" offset-lg="1">
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">{{ $t('pages.workflow.assignTo') }}</label>
                    <div class="col-sm-10">
                        <div class="d-flex">
                            <b-form-select v-model="selected" :options="assigneeOptions" class="mb-3 mr-2" />
                            <b-button type="button" variant="primary" class="mb-3 d-flex align-self-end" @click="assignTask">{{ $t('pages.workflow.assign') }}</b-button>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-sm-2 col-form-label">Details</label>
                    <div class="col-sm-10">
                        <b-card>
                            <dl class="row m-0">
                                <template v-for="(detail, index) in taskDetailsList">
                                    <dt :key="`taskname-${index}-${uniqueId}`" class="col-6">{{ detail.name }}</dt>
                                    <dd :key="`taskvalue-${index}-${uniqueId}`" class="col-6 text-muted">{{ detail.value || 'n/a' }} </dd>
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
    props: ['taskDefinition', 'shown'],
    data () {
        return {
            taskDetailsList: [],
            workflowService: null,
            selected: this.$root.userStore.state.userName,
            uniqueId: null
        };
    },
    mounted () {
        this.uniqueId = this._uid;
    },
    computed: {
        assigneeOptions () {
            let loggedUserName = this.$root.userStore.state.userName;

            if (!_.isEmpty(this.taskDefinition.task.usersToAssign)) {
                return this.taskDefinition.task.usersToAssign.map(({ username, displayableName }) => {
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
            this.$emit('assignTask', { id: this.taskDefinition.task._id, assignee: this.selected });
        },
        generateDisplayDetails (formProperties, variables) {
            return formProperties.reduce((acc, property) => {
                return acc.concat({ _id: property._id, name: property.name, value: variables[property._id] });
            }, []);
        }
    },
    watch: {
        shown (val) {
            if (val &&
                (_.isNull(this.taskDefinition.process.processDefinition) || _.isUndefined(this.taskDefinition.process.processDefinition)) &&
                this.taskDetailsList.length === 0) {
                this.getRequestService().get(`/workflow/processdefinition/${this.taskDefinition.task.processDefinitionId}`).then((processDetails) => {
                    this.taskDetailsList = this.generateDisplayDetails(processDetails.data.formProperties, this.taskDefinition.task.variables);
                });
            } else if (this.taskDetailsList.length === 0) {
                this.taskDetailsList = this.generateDisplayDetails(this.taskDefinition.process.processDefinition.formProperties, this.taskDefinition.task.variables);
            }
        }
    }
};
</script>
