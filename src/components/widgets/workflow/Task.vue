<template>
        <component :is="taskForm" @submit="submit" @cancel="cancel" :processDefinition="processDefinition" :taskDefinition="task" :variables="variables"></component>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'Task',
        props: ['taskInstance'],
        data () {
            return {
                taskForm: null
            };
        },
        computed: {
            processDefinition () {
                return this.taskInstance.processDefinition;
            },
            task () {
                return this.taskInstance.task;
            },
            taskDetails () {
                return this.processDefinition.formProperties.reduce((acc, property) => {
                    return acc.concat({ _id: property._id, name: property.name, value: this.task.variables[property._id] });
                }, []);
            },
            variables () {
                return _.get(this, 'task.variables');
            }
        },
        mounted () {
            this.setTaskForm();
        },
        methods: {
            setTaskForm () {
                const initializeForm = Function(`return ${this.task.taskDefinition.formGenerationTemplate}`); // eslint-disable-line
                this.taskForm = initializeForm();
            },
            submit (formData) {
                this.$emit('completeTask', { id: this.task._id, formData });
            },
            cancel () {
                this.$emit('cancel', this.task._id);
            }
        }
    };
</script>
