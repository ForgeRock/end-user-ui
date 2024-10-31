<!--
Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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
    render (createElement) {
        const renderStartForm = () => createElement(this.startForm, {
                ref: 'startFormComponent',
                props: { processDefinition: this.processDefinition, isTask: this.task },
                on: { submit: this.submit, cancel: this.cancel }
            }),
            renderGenericProcess = () => createElement(GenericProcess, {
                ref: 'startFormComponent',
                props: { id: this.processDefinition._id, workflowDetails: this.processDefinition.formProperties },
                on: { submit: this.submit, cancel: this.cancel }
            }),
            renderLoader = () => createElement(ClipLoader, { class: 'm-auto', props: { color: this.loadingColor } });

        return createElement('transition', { props: { name: 'fade', mode: 'out-in', duration: 250 } }, [
            this.processDefinition && this.startForm
                ? renderStartForm()
                : this.processDefinition
                    ? renderGenericProcess()
                    : renderLoader()
        ]);
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
