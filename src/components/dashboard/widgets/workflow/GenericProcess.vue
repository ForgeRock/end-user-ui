<template>
    <b-container>
        <b-row>
            <b-col>
                <template v-for="(field, index) in formFields">
                    <b-form-group :label="field.name" label-for="field.key" horizontal :key="field.name +index" v-if="(field.type === 'string' || field.type === 'number')">
                        <b-form-input horizontal
                                      type="text"
                                      :name="field.key"
                                      v-model="formValues[field.key]"></b-form-input>
                    </b-form-group>

                    <!-- for boolean values -->
                    <b-form-group :key="field.name +index" v-if="field.type === 'boolean'">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.name">{{field.name}}</label>

                            <div class="mr-auto">
                                <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                               :height="28"
                                               :width="56"
                                               :sync="true"
                                               :cssColors="true"
                                               :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                               v-model="formValues[field.key]"/>
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
 * @description Widget that provides generic fallback for a workflow process
 *
 **/
export default {
    name: 'Generic-Process',
    props: ['workflowDetails', 'id'],
    data () {
        let tempFormFields = [],
            tempFormValues = {
                _processDefinitionId: this.id
            };

        // Establish type and default values
        _.each(this.workflowDetails, (detail) => {
            let detailKey = _.lowerCase(detail.name);

            tempFormFields.push({
                name: detail.name,
                key: detailKey,
                type: detail.type.name,
                value: detail.type.value
            });

            if (detail.type.name === 'boolean') {
                tempFormValues[detailKey] = false;
            } else if (detail.type.name === 'number') {
                tempFormValues[detailKey] = 0;
            } else if (detail.type.name === 'string') {
                tempFormValues[detailKey] = '';
            }
        });

        return {
            formFields: tempFormFields,
            formValues: tempFormValues
        };
    },
    methods: {
        resetForm () {
            _.each(this.formValues, (value, key) => {
                if (_.isNumber(value)) {
                    this.formValues[key] = 0;
                } else if (_.isBoolean(value)) {
                    this.formValues[key] = false;
                } else {
                    this.formValues[key] = '';
                }
            });
        }
    }
};
</script>
