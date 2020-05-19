<template>
    <b-container>
        <b-row>
            <b-col>
                <template v-for="(field, key) in readOnlyFields">
                    <b-form-group :key="key" :label="key | capitalize" label-for="field" horizontal>
                        <b-form-input
                            horizontal
                            type="text"
                            :readonly="true"
                            :plaintext="true"
                            :value="field"
                        />
                    </b-form-group>
                </template>

                <template v-for="(field, index) in formFields">
                    <b-form-group v-if="(field.type === 'string' || field.type === 'number')" :key="field.name +index" :label="field.name" label-for="field.key" horizontal>
                        <b-form-input
                            v-model="formValues[field.key]"
                            horizontal
                            type="text"
                            :plaintext="field.readOnly"
                            :name="field.key"
                            :value="formValues[field.key]"
                        />
                    </b-form-group>

                    <!-- For boolean values -->
                    <b-form-group v-else-if="field.type === 'boolean'" :key="field.name +index">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.name">{{ field.name }}</label>

                            <div class="mr-auto">
                                <toggle-button
                                    v-model="formValues[field.key]"
                                    class="mt-2 p-0 fr-toggle-primary"
                                    :height="28"
                                    :width="56"
                                    :disabled="field.readOnly"
                                    :sync="true"
                                    :css-colors="true"
                                    :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                />
                            </div>
                        </div>
                    </b-form-group>

                    <!-- For enum type -->
                    <b-form-group v-else-if="field.type === 'enum'" :key="field.name +index">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.name">{{ field.name }}</label>

                            <div class="mr-auto">
                                <b-form-select v-model="formValues[field.key]" :options="field.options" class="mb-3" />
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
import { capitalize, clone, each, isUndefined, omit } from "lodash";

/**
 * @description Widget that provides generic fallback for a workflow task
 *
 */
export default {
    "name": "Generic-Task",
    // eslint-disable-next-line sort-keys
    data () {
        const temporaryFormFields = [],
            temporaryFormValues = {},
            temporaryVariables = omit(clone(this.variables), ["approverId", "initiatorId", "openidmObjectId"]);

        // Generate list of possible editable/none editable properties with values
        each(this.taskFields.formPropertyHandlers, (field, key) => {
            const temporaryField = {
                // eslint-disable-next-line no-underscore-dangle
                "key": field._id,
                "name": field.name,
                "readOnly": !field.writable,
                "type": field.type.name,
                // eslint-disable-next-line no-underscore-dangle
                "value": this.variables[field._id]
            };

            // Handel dropdown use case
            if (field.type.name === "enum") {
                temporaryField.options = field.type.values;

                // If no variable value set default value to first option
                if (isUndefined(temporaryField.value) && field.type.values) {
                    // eslint-disable-next-line prefer-destructuring
                    temporaryField.value = Object.keys(field.type.values)[0];
                    // eslint-disable-next-line no-underscore-dangle
                    temporaryFormValues[field._id] = temporaryField.value;
                }
            }

            // In the case of no enum set trackable input values to be bond by Vue
            // eslint-disable-next-line no-underscore-dangle
            if (isUndefined(temporaryFormValues[field._id])) {
                // eslint-disable-next-line no-underscore-dangle
                temporaryFormValues[field._id] = this.variables[field._id];
            }

            temporaryFormFields.push(temporaryField);

            // eslint-disable-next-line no-underscore-dangle
            delete temporaryVariables[field._id];
        });

        return {
            "formFields": temporaryFormFields,
            "formValues": temporaryFormValues,
            "readOnlyFields": temporaryVariables
        };
    },
    "filters": {
        capitalize (value) {
            return capitalize(value);
        }
    },
    "props": ["variables", "taskFields", "processFields"]
};
</script>
