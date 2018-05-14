<template>
    <b-form @keyup.enter="save" @submit.prevent>
        <b-form-group class="mb-0" v-for="property in selfServiceDetails.requirements.attributes"  :key="property.name">
            <fr-floating-label-input
                v-if="property.schema.type !== 'boolean'"
                :fieldName="property.name"
                :label="property.schema.title"
                :validateRules="property.isRequired ? 'required' : ''"
                type="text"
                :defaultValue="property.value"
                v-model.trim="saveDetails[property.name]"></fr-floating-label-input>

            <template v-else>
                <div v-if="isSingleBooleanForm">
                    <input class="d-none" v-model="saveDetails[property.name]" type="checkbox">
                </div>
                <div class="custom-control custom-checkbox mb-2" v-else>
                    <input :ref="property.name" v-model="saveDetails[property.name]" type="checkbox" class="custom-control-input" :id="property.name">
                    <label class="custom-control-label" :for="property.name">{{property.schema.title || property.schema.description}}</label>
                </div>
            </template>
        </b-form-group>
        <div v-if="selfServiceDetails.requirements.terms"
            v-html="selfServiceDetails.requirements.terms"
            style="overflow-y: scroll; height:310px;"
            class="mb-4 bg-light p-3 border border-light rounded text-left"></div>

        <b-button @click="save" :block="true" variant="primary" class="mt-1">
            {{selfServiceDetails.requirements.uiConfig.buttonText}}
        </b-button>
    </b-form>
</template>

<script>
    import _ from 'lodash';
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';

    export default {
        name: 'Conditional-User',
        components: {
            'fr-floating-label-input': FloatingLabelInput
        },
        props: {
            selfServiceDetails: { required: true }
        },
        data () {
            return {
                saveDetails: {},
                isSingleBooleanForm: false
            };
        },
        mounted () {
            /* If there is only one attribute being collected and that attribute is boolean
                we will hide the single checkbox in the checked state so when the submit button
                is clicked the attribute will be saved as true. */
            if (
                _.has(this.selfServiceDetails, 'requirements.attributes') &&
                this.selfServiceDetails.requirements.attributes.length === 1 &&
                _.filter(this.selfServiceDetails.requirements.attributes, (prop) => {
                    return prop.schema.type === 'boolean';
                }).length === 1
            ) {
                this.isSingleBooleanForm = true;
            }

            // Special handling here for existing boolean values
            _.each(this.selfServiceDetails.requirements.attributes, (property) => {
                if (property.schema.type === 'boolean') {
                    this.$refs[property.name][0].checked = this.isSingleBooleanForm || property.value;
                    this.saveDetails[property.name] = this.isSingleBooleanForm || property.value;
                }
            });
        },
        methods: {
            getData () {
                var details = _.clone(this.saveDetails);

                if (_.has(this.selfServiceDetails, 'requirements.terms')) {
                    return {accept: 'true'};
                } else {
                    return {attributes: details};
                }
            },
            save () {
                this.$emit('advanceStage', this.getData());
            }
        }
    };
</script>
