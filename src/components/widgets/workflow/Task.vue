<template>
    <transition name="fade" mode="out-in" duration="250">
        <component v-if="processDefinition !== null" :is="taskForm" @submit="submit" @cancel="cancel" :processDefinition="processDefinition" :taskDefinition="task" :variables="variables"></component>
        <clip-loader v-else class="m-auto" :color="'#007bff'"></clip-loader>
    </transition>
</template>

<script>
    import _ from 'lodash';
    import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min.js';

    export default {
        name: 'Task',
        props: ['taskInstance'],
        data () {
            return {};
        },
        components: {
            'clip-loader': ClipLoader
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
                return this.processDefinition !== null ? this.processDefinition.formProperties : [];
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
                const initializeForm = Function(`return ${this.task.taskDefinition.formGenerationTemplate}`); // eslint-disable-line
                return initializeForm();
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
