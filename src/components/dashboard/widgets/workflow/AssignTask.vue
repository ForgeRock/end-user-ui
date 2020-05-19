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
                                <template v-for="(detail, index) in taskDetails">
                                    <dt :key="`taskname-${index}`" class="col-6">{{ detail.name }}</dt>
                                    <dd :key="`taskvalue-${index}`" class="col-6">{{ detail.value }} </dd>
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
import { isEmpty } from "lodash";

/**
 * @description Dashboard widget that allows a user to assign a task
 *
 */
export default {
    "name": "Assign-Task",
    // eslint-disable-next-line sort-keys
    "computed": {
        assigneeOptions () {
            const loggedUserName = this.$root.userStore.state.userName;
            if (!isEmpty(this.task.usersToAssign)) {
                return this.task.usersToAssign.map(({ username, displayableName }) => {
                    const text = username === loggedUserName ? this.$t("pages.workflow.me") : displayableName,
                        value = username;
                    return { text, value };
                });
            }
            return [{ "text": this.$t("pages.workflow.me"), "value": loggedUserName }];
        },
        formProperties () {
            if (this.processDefinition && this.processDefinition.formProperties) {
                return this.processDefinition.formProperties;
            }
            return [];
        },
        id () {
            // eslint-disable-next-line no-underscore-dangle
            return this.task._id;
        },
        process () {
            return this.taskDefinition.process;
        },
        processDefinition () {
            if (this.process.processDefinition === null) {
                this.$emit("loadProcess", this.process);
            }
            return this.process.processDefinition;
        },
        task () {
            return this.taskDefinition.task;
        },
        taskDetails () {
            if (this.formProperties) {
                return this.formProperties.reduce(
                    // eslint-disable-next-line no-underscore-dangle
                    (accumulator, property) => accumulator.concat({ "_id": property._id, "name": property.name, "value": this.task.variables[property._id] })
                    , []
                );
            }
            return [];
        }
    },
    data () {
        return {
            "selected": this.$root.userStore.state.userName,
            "workflowService": null
        };
    },
    "methods": {
        assignTask () {
            this.$emit("assignTask", { "assignee": this.selected, "id": this.id });
        }
    },
    "props": ["taskDefinition"]
};
</script>
