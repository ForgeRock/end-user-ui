<template>
    <transition name="fade" mode="out-in" duration="250">
        <component
                v-if="processDefinition !== null && startForm !== null"
                :is="startForm"
                @submit="submit"
                @cancel="cancel"
                :processDefinition="processDefinition"
                ref="startFormComponent"
                :isTask="task"></component>
        <GenericProcess v-else-if="processDefinition !== null"
                        @submit="submit"
                        @cancel="cancel"
                        :id="processDefinition._id"
                        :workflow-details="processDefinition.formProperties"
                        ref="startFormComponent"></GenericProcess>
        <clip-loader v-else class="m-auto" :color="loadingColor"></clip-loader>
    </transition>
</template>

<script>
import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min.js';
import styles from '@/scss/main.scss';
import GenericProcess from '@/components/dashboard/widgets/workflow/GenericProcess';

/**
* @description Dashboard widget that displays the details of a specific process
*
**/
export default {
    name: 'Workflow-Process',
    components: {
        'clip-loader': ClipLoader,
        GenericProcess
    },
    props: {
        processDefinition: {
            types: [ Object, null ],
            required: true
        },
        task: Object
    },
    data () {
        return {
            loadingColor: styles.baseColor
        };
    },
    computed: {
        startForm () {
            let initializeForm;

            // Fallback to generic component when no provided JS
            if (this.processDefinition.formGenerationTemplate) {
                    initializeForm = Function(`return ${this.processDefinition.formGenerationTemplate}`); // eslint-disable-line

                return initializeForm();
            } else {
                return null;
            }
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
