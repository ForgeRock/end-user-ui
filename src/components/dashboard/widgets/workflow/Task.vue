<template>
    <transition name="fade" mode="out-in" duration="250">
        <component v-if="processDefinition !== null && taskForm !== null"
                   :is="taskForm"
                   @submit="submit"
                   @cancel="cancel"
                   :processDefinition="processDefinition"
                   :taskDefinition="task"
                   :variables="variables"></component>
        <GenericTask v-else-if="processDefinition !== null"
                     :variables="taskInstance.task.variables"
                     :task-fields="taskInstance.task.taskDefinition.formProperties"
                     :process-fields="taskInstance.task.formProperties"
                     @submit="submit"
                     @cancel="cancel"></GenericTask>
        <clip-loader v-else class="m-auto" :color="loadingColor"></clip-loader>
    </transition>
</template>

<script>
import _ from 'lodash';
import styles from '@/scss/main.scss';
import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min.js';
import GenericTask from '@/components/dashboard/widgets/workflow/GenericTask';

/**
* @description Dashboard widget that displays the specific details of a task
* @description Dashboard widget that displays the specific details of a task
*
**/
export default {
    name: 'Task',
    props: ['taskInstance'],
    data () {
        return {
            loadingColor: styles.baseColor
        };
    },
    components: {
        'clip-loader': ClipLoader,
        GenericTask
    },
    computed: {
        process () {
            return this.taskInstance.process;
        },
        processDefinition () {
            if (this.process.processDefinition === null) {
                this.$emit('loadProcess', this.process);
            }
            return this.process.processDefinition;
        },
        formProperties () {
            return this.processDefinition ? this.processDefinition.formProperties : [];
        },
        task () {
            return this.taskInstance.task;
        },
        taskDetails () {
            return this.formProperties.reduce((acc, property) => {
                return acc.concat({ _id: property._id, name: property.name, value: this.task.variables[property._id] });
            }, []);
        },
        variables () {
            return _.get(this, 'task.variables');
        },
        taskForm () {
            const formGenerationTemplate = this.task.taskDefinition.formGenerationTemplate,
                    initializeForm = formGenerationTemplate ? Function(`return ${formGenerationTemplate}`) : null // eslint-disable-line

            if (!_.isNull(initializeForm)) {
                return initializeForm();
            } else {
                return null;
            }
        }
    },
    methods: {
        submit (formData) {
            this.$emit('completeTask', { id: this.task._id, formData });
        },
        cancel () {
            this.$emit('cancel', this.task._id);
        }
    }
};
</script>
