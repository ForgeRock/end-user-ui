<template>
    <b-form v-if="selfServiceDetails.requirements.uiConfig" @keyup.enter="save" @submit.prevent>
        <b-form-group v-for="property in selfServiceDetails.requirements.attributes" :key="property.name" class="mb-0">
            <fr-floating-label-input
                v-if="property.schema.type !== 'boolean'"
                v-model.trim="saveDetails[property.name]"
                :field-name="property.name"
                :label="property.schema.title"
                :validate-rules="property.isRequired ? 'required' : ''"
                type="text"
                :default-value="property.value"
            />

            <template v-else>
                <div v-if="isSingleBooleanForm">
                    <input v-model="saveDetails[property.name]" class="d-none" type="checkbox">
                </div>
                <div v-else class="custom-control custom-checkbox mb-2">
                    <input :id="property.name" :ref="property.name" v-model="saveDetails[property.name]" type="checkbox" class="custom-control-input">
                    <label class="custom-control-label" :for="property.name">{{ property.schema.title || property.schema.description }}</label>
                </div>
            </template>
        </b-form-group>

        <div
            v-if="selfServiceDetails.requirements.terms"
            class="mb-4 bg-light p-3 border border-light rounded text-left tc-scrolling-display"
            v-html="selfServiceDetails.requirements.terms"
        />

        <fr-kba-update v-if="selfServiceDetails.requirements.definitions" ref="kbaUpdate" :self-service-details="selfServiceDetails" />

        <b-button :block="true" variant="primary" class="mt-1" @click="save">
            {{ selfServiceDetails.requirements.uiConfig.buttonText }}
        </b-button>
    </b-form>
</template>

<script>
import { clone, each, has, filter, isEmpty } from "lodash";
import FloatingLabelInput from "../../utils/FloatingLabelInput";
import KBAUpdate from "./KBAUpdate";

/**
 * @description Selfservice stage for progressive profile, will auto generate fields based on the configuring for progressive profiling
 *
 */
export default {
    "name": "Conditional-User",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-floating-label-input": FloatingLabelInput,
        "fr-kba-update": KBAUpdate
    },
    data () {
        return {
            "isSingleBooleanForm": false,
            "saveDetails": {}
        };
    },
    "methods": {
        getData () {
            const details = clone(this.saveDetails);
            // Loop over the form attributes and set empty strings to null
            each(details, (value, key) => {
                if (value === "") {
                    details[key] = null;
                }
            });

            return { "attributes": details };
        },
        // eslint-disable-next-line padded-blocks
        handleBooleanValues () {

            /*
             * If there is only one attribute being collected and that attribute is boolean
             *      we will hide the single checkbox in the checked state so when the submit button
             *      is clicked the attribute will be saved as true.
             */
            if (
                has(this.selfServiceDetails, "requirements.attributes") &&
                    this.selfServiceDetails.requirements.attributes.length === 1 &&
                    filter(this.selfServiceDetails.requirements.attributes, (prop) => prop.schema.type === "boolean").length === 1
            ) {
                this.isSingleBooleanForm = true;
            } else {
                this.isSingleBooleanForm = false;
            }
            // Special handling here for existing boolean values
            each(this.selfServiceDetails.requirements.attributes, (property) => {
                if (this.isSingleBooleanForm) {
                    this.saveDetails[property.name] = true;
                } else if (property.schema.type === "boolean") {
                    this.saveDetails[property.name] = property.value;
                }
            });
        },
        save (advanceEmpty) {
            if (advanceEmpty === true) {
                this.$emit("advanceStage", {}, true);
            } else if (has(this.selfServiceDetails, "requirements.terms")) {
                this.$emit("advanceStage", { "accept": "true" }, true);
            } else if (has(this.selfServiceDetails, "requirements.properties.kba")) {
                // If this is kbaUpdate we need to validate the inputs.
                /* istanbul ignore next */
                this.$refs.kbaUpdate.isValid().then((valid) => {
                    if (valid) {
                        this.$emit("advanceStage", this.$refs.kbaUpdate.getData(), true);
                    }
                });
            } else {
                this.$emit("advanceStage", this.getData(), true);
            }
        }
    },
    mounted () {
        this.handleBooleanValues();
    },
    "props": {
        "selfServiceDetails": { "required": true }
    },
    "watch": {
        "selfServiceDetails": {
            "deep": true,
            // eslint-disable-next-line padded-blocks
            handler (value) {

                /*
                 * When selfServiceDetails changes we know this is either
                 *     the first time this component is loaded or in the case
                 *     of multiple progressive profile forms it means we have
                 *     a new form and it needs to 're-initialize' itself
                 */
                // eslint-disable-next-line padded-blocks
                if (isEmpty(this.selfServiceDetails.requirements)) {

                    /*
                     * Empty requirements means we need to advance the stage with empty input.
                     *   to get back an actual set of requirements. This is needed to support multiple
                     *   progressiveProfile forms
                     */
                    this.save(true);
                } else {
                    this.saveDetails = {};
                    this.handleBooleanValues();
                }
            }
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
