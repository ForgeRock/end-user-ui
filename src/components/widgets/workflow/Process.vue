<template>
        <component :is="startForm" @submit="submit" @cancel="cancel" :processDefinition="processDefinition" ref="startFormComponent" :isTask="task"></component>
</template>

<script>
    export default {
        name: 'Workflow-Process',
        props: {
            processDefinition: {
                Object,
                required: true
            },
            task: Object
        },
        data () {
            return {
                startForm: null,
                processInfo: null
            };
        },
        methods: {
            cancel () {
                this.reset();
                this.$emit('cancel', this.processDefinition._id);
            },
            reset (id) {
                this.$refs.startFormComponent.resetForm();
            },
            submit (payload) {
                this.$emit('startProcess', payload);
            }
        },
        created () {
            const initializeForm = Function(`return ${this.processDefinition.formGenerationTemplate}`); // eslint-disable-line
            this.startForm = initializeForm();
        }
    };
</script>
