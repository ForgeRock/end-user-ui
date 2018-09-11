<template>
    <transition name="fade" mode="out-in" duration="250">
        <component v-if="processDefinition !== null" :is="startForm" @submit="submit" @cancel="cancel" :processDefinition="processDefinition" ref="startFormComponent" :isTask="task"></component>
        <clip-loader v-else class="m-auto" :color="'#007bff'"></clip-loader>
    </transition>
</template>

<script>
    import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min.js';

    /**
     * @description Dashboard widget that displays the details of a specific process
     *
     **/
    export default {
        name: 'Workflow-Process',
        components: { 'clip-loader': ClipLoader },
        props: {
            processDefinition: {
                types: [ Object, null ],
                required: true
            },
            task: Object
        },
        data () {
            return {};
        },
        computed: {
            startForm () {
                const initializeForm = Function(`return ${this.processDefinition.formGenerationTemplate}`); // eslint-disable-line
                return initializeForm();
            }
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
        }
    };
</script>
