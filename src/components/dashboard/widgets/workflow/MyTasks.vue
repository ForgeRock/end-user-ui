<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.myTasks')">
            <template v-if="!isEmpty(tasks)">
                <transition-group name="fade" mode="out-in">
                    <fr-list-item v-for="(task, id) in tasks" :key="`myTask_${id}`" :ref="`collapse-${id}`" :collapsible="true" @shown="setShown(id)" @hidden="setHidden(id)">
                        <div slot="list-item-header" class="d-inline-flex w-100 media">
                            <div class="media-body align-self-center">
                                <h6>{{ task.name }}</h6>
                            </div>
                            <div v-if="!isEmpty(task.task.candidates.candidateGroups)" class="btn btn-sm btn-link float-right" @click.stop="requeue(id)">{{ $t('pages.workflow.requeue') }}</div>
                            <div class="d-flex ml-3 align-self-center">
                                <div :ref="`cancel-${id}`" class="btn btn-sm btn-link float-right btn-cancel">{{ $t('common.form.cancel') }}</div>
                                <div class="btn btn-sm btn-link float-right btn-edit">{{ $t('common.form.edit') }}</div>
                            </div>
                        </div>
                        <div slot="list-item-collapse-body" class="d-inline-flex w-100">
                            <fr-task :ref="id" :task-instance="task" @loadProcess="(process) => $emit('loadProcess', process)" @cancel="cancel" @completeTask="completeTask" />
                        </div>
                    </fr-list-item>
                </transition-group>
            </template>
            <fr-list-item v-else>
                <div slot="list-item-header" class="text-muted text-center w-100">
                    {{ $t('pages.workflow.noAssignedTasks') }}
                </div>
            </fr-list-item>
        </fr-list-group>
    </div>
</template>

<script>
import { difference, first, isEmpty, isFunction, isUndefined, keys } from "lodash";
import ListGroup from "../../../utils/ListGroup";
import ListItem from "../../../utils/ListItem";
import Task from "./Task";

/**
 * @description Dashboard widget that lists tasks currently assigned to the logged in user
 *
 */
export default {
    "name": "My-Tasks",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem,
        "fr-task": Task
    },
    data () {
        return { "onHidden": null, "panelShown": {} };
    },
    "methods": {
        cancel (id) {
            first(this.$refs[`cancel-${id}`]).click();
        },
        completeTask (payload) {
            this.update(payload.id, "completeTask", payload);
        },
        first,
        isEmpty,
        requeue (id) {
            const { task } = this.tasks[id],
                action = "updateAssignment",
                payload = { "assignee": null, id, task };

            this.update(id, action, payload);
        },
        setHidden (id) {
            this.$set(this.panelShown, id, false);

            if (isFunction(this.onHidden)) {
                this.onHidden();
                this.onHidden = null;
            }
        },
        setShown (id) {
            this.$set(this.panelShown, id, true);
        },
        update (id, action, payload) {
            const update = () => {
                this.$emit(action, payload);
            };

            if (this.panelShown[id]) {
                this.onHidden = update;
                this.cancel(id);
            } else {
                update();
            }
        }
    },
    "props": {
        "tasks": Object
    },
    "watch": {
        "tasks": {
            "deep": true,
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
