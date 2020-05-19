<template>
    <transition name="fade" mode="out-in" duration="250">
        <component
            :is="startForm"
            v-if="processDefinition !== null && startForm !== null"
            ref="startFormComponent"
            :process-definition="processDefinition"
            :is-task="task"
            @submit="submit"
            @cancel="cancel"
        />
        <GenericProcess
            v-else-if="processDefinition !== null"
            :id="processDefinition._id"
            ref="startFormComponent"
            :workflow-details="processDefinition.formProperties"
            @submit="submit"
            @cancel="cancel"
        />
        <clip-loader v-else class="m-auto" :color="loadingColor" />
    </transition>
</template>

<script>
// eslint-disable-next-line import/extensions
import { ClipLoader } from "vue-spinner/dist/vue-spinner.min.js";
import styles from "../../../../scss/main.scss";
import GenericProcess from "./GenericProcess";

/**
 * @description Dashboard widget that displays the details of a specific process
 */
export default {
    "name": "Workflow-Process",
    // eslint-disable-next-line sort-keys
    "components": {
        GenericProcess,
        "clip-loader": ClipLoader
    },
    "computed": {
        startForm () {
            let initializeForm = null;

            // Fallback to generic component when no provided JS
            if (this.processDefinition.formGenerationTemplate) {
                initializeForm = `${this.processDefinition.formGenerationTemplate}`;

                return initializeForm();
            }
            return null;
        }
    },
    data () {
        return {
            "loadingColor": styles.baseColor
        };
    },
    "methods": {
        cancel () {
            this.reset();
            // eslint-disable-next-line no-underscore-dangle
            this.$emit("cancel", this.processDefinition._id);
        },
        reset (id) {
            this.$refs.startFormComponent.resetForm();
        },
        submit (payload) {
            this.$emit("startProcess", payload);
        }
    },
    "props": {
        "processDefinition": {
            "required": true,
            "types": [Object, null]
        },
        "task": Object
    }
};
</script>
