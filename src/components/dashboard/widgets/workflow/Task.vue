<template>
    <transition name="fade" mode="out-in" duration="250">
        <component
            :is="taskForm"
            v-if="processDefinition !== null && taskForm !== null"
            :variables="variables"
            :process-definition="processDefinition"
            :task-definition="task"
            @submit="submit"
            @cancel="cancel"
        />
        <GenericTask
            v-else-if="processDefinition !== null"
            :variables="taskInstance.task.variables"
            :task-fields="taskInstance.task.taskDefinition.formProperties"
            :process-fields="taskInstance.task.formProperties"
            @submit="submit"
            @cancel="cancel"
        />
        <clip-loader v-else class="m-auto" :color="loadingColor" />
    </transition>
</template>

<script>
import { get, isNull } from "lodash";
// eslint-disable-next-line import/extensions
import { ClipLoader } from "vue-spinner/dist/vue-spinner.min.js";
import styles from "../../../../scss/main.scss";
import GenericTask from "./GenericTask";

/**
 * @description Dashboard widget that displays the specific details of a task
 */
export default {
    "name": "Task",
    // eslint-disable-next-line sort-keys
    "components": {
        GenericTask,
        "clip-loader": ClipLoader
    },
    "computed": {
        formProperties () {
            return this.processDefinition ? this.processDefinition.formProperties : [];
        },
        process () {
            return this.taskInstance.process;
        },
        processDefinition () {
            if (this.process.processDefinition === null) {
                this.$emit("loadProcess", this.process);
            }
            return this.process.processDefinition;
        },
        task () {
            return this.taskInstance.task;
        },
        taskDetails () {
            // eslint-disable-next-line no-underscore-dangle
            return this.formProperties.reduce((accumulator, property) => accumulator.concat({ "_id": property._id, "name": property.name, "value": this.task.variables[property._id] }), []);
        },
        taskForm () {
            const { formGenerationTemplate } = this.task.taskDefinition,
                // eslint-disable-next-line no-new-func
                initializeForm = formGenerationTemplate ? new Function(`return ${formGenerationTemplate}`) : null;

            return isNull(initializeForm) ? null : initializeForm();
        },
        variables () {
            return get(this, "task.variables");
        }
    },
    data () {
        return {
            "loadingColor": styles.baseColor
        };
    },
    "methods": {
        cancel () {
            // eslint-disable-next-line no-underscore-dangle
            this.$emit("cancel", this.task._id);
        },
        submit (formData) {
            // eslint-disable-next-line no-underscore-dangle
            this.$emit("completeTask", { formData, "id": this.task._id });
        }
    },
    "props": ["taskInstance"]
};
</script>
