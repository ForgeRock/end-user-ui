<template>
    <b-form @keyup.enter="save" @submit.prevent v-if="selfServiceDetails.requirements.uiConfig">
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
            class="mb-4 bg-light p-3 border border-light rounded text-left tc-scrolling-display"></div>

        <fr-kba-update v-if="selfServiceDetails.requirements.definitions" :selfServiceDetails="selfServiceDetails" ref="kbaUpdate"></fr-kba-update>

        <b-button @click="save" :block="true" variant="primary" class="mt-1">
            {{selfServiceDetails.requirements.uiConfig.buttonText}}
        </b-button>
    </b-form>
</template>

<script>
import _ from 'lodash';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import KBAUpdate from './KBAUpdate';
/**
 * @description Selfservice stage for progressive profile, will auto generate fields based on the configuring for progressive profiling
 *
 **/
export default {
    name: 'Conditional-User',
    components: {
        'fr-floating-label-input': FloatingLabelInput,
        'fr-kba-update': KBAUpdate
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
        this.handleBooleanValues();
    },
    methods: {
        getData () {
            var details = _.clone(this.saveDetails);
            // loop over the form attributes and set empty strings to null
            _.each(details, (val, key) => {
                if (val === '') {
                    details[key] = null;
                }
            });

            return { attributes: details };
        },
        save (advanceEmpty) {
            if (advanceEmpty === true) {
                this.$emit('advanceStage', {}, true);
            } else if (_.has(this.selfServiceDetails, 'requirements.terms')) {
                this.$emit('advanceStage', { accept: 'true' }, true);
            } else if (_.has(this.selfServiceDetails, 'requirements.properties.kba')) {
                // If this is kbaUpdate we need to validate the inputs.
                /* istanbul ignore next */
                this.$refs.kbaUpdate.isValid().then((valid) => {
                    if (valid) {
                        this.$emit('advanceStage', this.$refs.kbaUpdate.getData(), true);
                    }
                });
            } else {
                this.$emit('advanceStage', this.getData(), true);
            }
        },
        handleBooleanValues () {
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
            } else {
                this.isSingleBooleanForm = false;
            }
            // Special handling here for existing boolean values
            _.each(this.selfServiceDetails.requirements.attributes, (property) => {
                if (this.isSingleBooleanForm) {
                    this.saveDetails[property.name] = true;
                } else if (property.schema.type === 'boolean') {
                    this.saveDetails[property.name] = property.value;
                }
            });
        }
    },
    watch: {
        selfServiceDetails: {
            handler (val) {
                /* When selfServiceDetails changes we know this is either
                       the first time this component is loaded or in the case
                       of multiple progressive profile forms it means we have
                       a new form and it needs to 're-initialize' itself */
                if (_.isEmpty(this.selfServiceDetails.requirements)) {
                    /* Empty requirements means we need to advance the stage with empty input.
                         to get back an actual set of requirements. This is needed to support multiple
                         progressiveProfile forms  */
                    this.save(true);
                } else {
                    this.saveDetails = {};
                    this.handleBooleanValues();
                }
            },
            deep: true
        }
    }
};
</script>
<style lang="scss" scoped>
    .tc-scrolling-display {
        overflow-y: scroll;
        height:310px;
    }
</style>
