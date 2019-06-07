<template>
    <b-container>
        <b-row>
            <b-col>
                <template v-for="(field, key) in readOnlyFields">
                    <b-form-group :label="key | capitalize" label-for="field" horizontal :key="key">
                        <b-form-input horizontal
                                      type="text"
                                      :readonly="true"
                                      :plaintext="true"
                                      :value="field"
                        ></b-form-input>
                    </b-form-group>
                </template>

                <template v-for="(field, index) in formFields">
                    <b-form-group :label="field.name" label-for="field.key" horizontal :key="field.name +index" v-if="(field.type === 'string' || field.type === 'number')">
                        <b-form-input horizontal
                                      type="text"
                                      :plaintext="field.readOnly"
                                      :name="field.key"
                                      :value="formValues[field.key]"
                                      v-model="formValues[field.key]"></b-form-input>
                    </b-form-group>

                    <!-- For boolean values -->
                    <b-form-group :key="field.name +index" v-else-if="field.type === 'boolean'">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.name">{{field.name}}</label>

                            <div class="mr-auto">
                                <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                               :height="28"
                                               :width="56"
                                               :disabled="field.readOnly"
                                               :sync="true"
                                               :cssColors="true"
                                               :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                               v-model="formValues[field.key]"/>
                            </div>
                        </div>
                    </b-form-group>

                    <!-- For enum type -->
                    <b-form-group :key="field.name +index" v-else-if="field.type === 'enum'">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.name">{{field.name}}</label>

                            <div class="mr-auto">
                                <b-form-select v-model="formValues[field.key]" :options="field.options" class="mb-3" />
                            </div>
                        </div>
                    </b-form-group>
                </template>
            </b-col>
        </b-row>
        <div class="float-right mt-4">
            <b-btn type="button" @click="$emit('submit', formValues)" variant="primary">{{$t('common.form.save')}}</b-btn>
            <b-btn type="button" @click="$emit('cancel')" variant="primary">{{$t('common.form.cancel')}}</b-btn>
        </div>
    </b-container>
</template>

<script>
import _ from 'lodash';

/**
 * @description Widget that provides generic fallback for a workflow task
 *
 **/
export default {
    name: 'Generic-Task',
    props: ['variables', 'taskFields', 'processFields'],
    data () {
        let tempFormFields = [],
            tempFormValues = {},
            tempVariables = _.omit(_.clone(this.variables), ['approverId', 'initiatorId', 'openidmObjectId']);

        // Generate list of possible editable/none editable properties with values
        _.each(this.taskFields.formPropertyHandlers, (field, key) => {
            let tempField = {
                key: field._id,
                name: field.name,
                value: this.variables[field._id],
                type: field.type.name,
                readOnly: !field.writable
            };

            // Handel dropdown use case
            if (field.type.name === 'enum') {
                tempField.options = field.type.values;

                // If no variable value set default value to first option
                if (_.isUndefined(tempField.value) && field.type.values) {
                    tempField.value = Object.keys(field.type.values)[0];
                    tempFormValues[field._id] = tempField.value;
                }
            }

            // In the case of no enum set trackable input values to be bond by Vue
            if (_.isUndefined(tempFormValues[field._id])) {
                tempFormValues[field._id] = this.variables[field._id];
            }

            tempFormFields.push(tempField);

            delete tempVariables[field._id];
        });

        return {
            formFields: tempFormFields,
            readOnlyFields: tempVariables,
            formValues: tempFormValues
        };
    },
    filters: {
        capitalize (val) {
            return _.capitalize(val);
        }
    }
};
</script>
