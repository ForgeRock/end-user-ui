<template>
    <b-container>
        <b-row>
            <b-col>
                <template v-for="(field, index) in formFields">
                    <b-form-group v-if="(field.type === 'string' || field.type === 'number')" :key="field.name +index" :label="field.name" label-for="field.key" horizontal>
                        <b-form-input
                            v-model="formValues[field.key]"
                            horizontal
                            type="text"
                            :name="field.key"
                        />
                    </b-form-group>

                    <!-- for boolean values -->
                    <b-form-group v-if="field.type === 'boolean'" :key="field.name +index">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.name">{{ field.name }}</label>

                            <div class="mr-auto">
                                <toggle-button
                                    v-model="formValues[field.key]"
                                    class="mt-2 p-0 fr-toggle-primary"
                                    :height="28"
                                    :width="56"
                                    :sync="true"
                                    :css-colors="true"
                                    :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                />
                            </div>
                        </div>
                    </b-form-group>
                </template>
            </b-col>
        </b-row>
        <div class="float-right mt-4">
            <b-btn type="button" variant="primary" @click="$emit('submit', formValues)">{{ $t('common.form.save') }}</b-btn>
            <b-btn type="button" variant="primary" @click="$emit('cancel')">{{ $t('common.form.cancel') }}</b-btn>
        </div>
    </b-container>
</template>

<script>
import { each, isBoolean, isNumber, lowerCase } from "lodash";

/**
 * @description Widget that provides generic fallback for a workflow process
 *
 */
export default {
    "name": "Generic-Process",
    // eslint-disable-next-line sort-keys
    data () {
        const temporaryFormFields = [],
            temporaryFormValues = { "_processDefinitionId": this.id };

        // Establish type and default values
        each(this.workflowDetails, (detail) => {
            const detailKey = lowerCase(detail.name);

            temporaryFormFields.push({
                "key": detailKey,
                "name": detail.name,
                "type": detail.type.name,
                "value": detail.type.value
            });

            if (detail.type.name === "boolean") {
                temporaryFormValues[detailKey] = false;
            } else if (detail.type.name === "number") {
                temporaryFormValues[detailKey] = 0;
            } else if (detail.type.name === "string") {
                temporaryFormValues[detailKey] = "";
            }
        });

        return {
            "formFields": temporaryFormFields,
            "formValues": temporaryFormValues
        };
    },
    "methods": {
        resetForm () {
            each(this.formValues, (value, key) => {
                if (isNumber(value)) {
                    this.formValues[key] = 0;
                } else if (isBoolean(value)) {
                    this.formValues[key] = false;
                } else {
                    this.formValues[key] = "";
                }
            });
        }
    },
    "props": ["workflowDetails", "id"]
};
</script>
