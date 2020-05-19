<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.unassignedTasks')">
            <template v-if="!isEmpty(tasks)">
                <transition-group name="fade" mode="out-in">
                    <fr-list-item v-for="(taskDefinition, id) in tasks" :key="`groupTask_${id}`" :ref="`collapse-${id}`" :collapsible="true" @shown="setShown(id)" @hidden="setHidden(id)">
                        <div slot="list-item-header" class="d-inline-flex w-100 media">
                            <div class="media-body align-self-center">
                                <h6 class="mb-1 mt-2">{{ taskDefinition.name }}</h6>
                                <small class="text-muted d-block mb-2">{{ $t('pages.workflow.notAssigned') }}</small>
                            </div>
                            <div class="d-flex ml-3 align-self-center">
                                <div :ref="`cancel-${id}`" class="btn btn-sm btn-link float-right btn-cancel">{{ $t('common.form.cancel') }}</div>
                                <div class="btn btn-sm btn-link float-right btn-edit">{{ $t('pages.workflow.assign') }}</div>
                            </div>
                        </div>
                        <div slot="list-item-collapse-body" class="d-inline-flex w-100">
                            <fr-assign-task :task-definition="taskDefinition" @loadProcess="(process) => $emit('loadProcess', process)" @assignTask="assignTask" />
                        </div>
                    </fr-list-item>
                </transition-group>
            </template>
            <fr-list-item v-else>
                <div slot="list-item-header" class="text-muted text-center w-100">
                    {{ $t('pages.workflow.noGroupTasks') }}
                </div>
            </fr-list-item>
        </fr-list-group>
    </div>
</template>

<script>
import { difference, first, isEmpty, isFunction, isUndefined, keys } from "lodash";
import AssignTask from "./AssignTask";
import ListGroup from "../../../utils/ListGroup";
import ListItem from "../../../utils/ListItem";

/**
 * @description Dashboard widget that lists available group tasks that can be assigned
 *
 */
export default {
    "name": "Group-Tasks",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-assign-task": AssignTask,
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem
    },
    data () {
        return { "onHidden": null, "panelShown": {} };
    },
    "methods": {
        assignTask ({ id, assignee }) {
            const { task } = this.tasks[id];

            this.onHidden = () => {
                this.$emit("updateAssignment", { assignee, id, task });
            };

            this.cancel(id);
        },
        cancel (id) {
            first(this.$refs[`cancel-${id}`]).click();
        },
        first,
        isEmpty,
        setHidden (id) {
            this.$set(this.panelShown, id, false);

            if (isFunction(this.onHidden)) {
                this.onHidden();
                this.onHidden = null;
            }
        },
        setShown (id) {
            this.$set(this.panelShown, id, true);
        }
    },
    "props": {
        "tasks": Object
    },
    "watch": {
        "tasks": {
            "deep": true,
            // Sets the state of panelShown. Anytime new tasks are added to the tasks prop, the prop key is added to the panelShown object with an initial state of `false`.
            handler (value, oldValue) {
                const newVals = difference(keys(value), keys(oldValue));

                if (isUndefined(this.panelShown)) {
                    this.panelShown = {};
                }

                newVals.forEach((value_) => {
                    this.$set(this.panelShown, value_, false);
                });
            }
        }
    }
};
</script>

<style lang="scss" scoped></style>
