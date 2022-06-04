<template>
  <div>
    <fr-list-group
      class="mt-0"
      :title="this.$t('pages.workflow.unassignedTasks')"
    >
      <template v-if="!isEmpty(tasks)">
        <transition-group name="fade" mode="out-in">
          <fr-list-item
            :collapsible="true"
            v-for="(taskDefinition, id) in tasks"
            :key="`groupTask_${id}`"
            :ref="`collapse-${id}`"
            @shown="setShown(id)"
            @hidden="setHidden(id)"
          >
            <div slot="list-item-header" class="d-inline-flex w-100 media">
              <div class="media-body align-self-center">
                <h6 class="mb-1 mt-0">{{ taskDefinition.name }}</h6>
                <small class="text-muted d-block mb-2">{{
                  $t("pages.workflow.notAssigned")
                }}</small>
              </div>
              <div class="d-flex mb-3 align-self-center">
                <b-button
                  v-if="panelShown[id] === true"
                  variant="link"
                  size="sm"
                  class="btn-cancel mb-2"
                  :ref="`cancel-${id}`"
                  >{{ $t("common.form.cancel") }}</b-button
                >
                <b-button v-else variant="link" size="sm" class="btn-edit">{{
                  $t("pages.workflow.assign")
                }}</b-button>
              </div>
            </div>
            <div slot="list-item-collapse-body" class="d-inline-flex w-100">
              <fr-assign-task
                :shown="panelShown[id]"
                :taskDefinition="taskDefinition"
                @loadProcess="(process) => $emit('loadProcess', process)"
                @assignTask="assignTask"
              ></fr-assign-task>
            </div>
          </fr-list-item>
        </transition-group>
      </template>
      <fr-list-item v-else>
        <div slot="list-item-header" class="text-muted text-center w-100">
          {{ $t("pages.workflow.noGroupTasks") }}
        </div>
      </fr-list-item>
    </fr-list-group>
  </div>
</template>

<script>
import _ from "lodash";
import ListGroup from "@/components/utils/ListGroup";
import ListItem from "@/components/utils/ListItem";
import AssignTask from "./AssignTask";

/**
 * @description Dashboard widget that lists available group tasks that can be assigned
 *
 **/
export default {
  name: "Group-Tasks",
  props: {
    tasks: Object,
  },
  data() {
    return { panelShown: {}, onHidden: null };
  },
  components: {
    "fr-list-group": ListGroup,
    "fr-list-item": ListItem,
    "fr-assign-task": AssignTask,
  },
  methods: {
    isEmpty: _.isEmpty,
    first: _.first,
    setShown(id) {
      this.$set(this.panelShown, id, true);
    },
    setHidden(id) {
      this.$set(this.panelShown, id, false);

      if (_.isFunction(this.onHidden)) {
        this.onHidden();
        this.onHidden = null;
      }
    },
    cancel(id) {
      _.first(this.$refs[`cancel-${id}`]).click();
    },
    assignTask({ id, assignee }) {
      const task = this.tasks[id].task;

      this.onHidden = () => {
        this.$emit("updateAssignment", { assignee, id, task });
      };

      this.cancel(id);
    },
  },
  watch: {
    tasks: {
      /**
       * This function sets the state of panelShown. Anytime new tasks are added to the tasks prop,
       * the prop key is added to the panelShown object with an initial state of `false`.
       */
      handler(val, oldVal) {
        let newVals = _.difference(_.keys(val), _.keys(oldVal));

        if (_.isUndefined(this.panelShown)) {
          this.panelShown = {};
        }

        newVals.forEach((val) => {
          this.$set(this.panelShown, val, false);
        });
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped></style>
