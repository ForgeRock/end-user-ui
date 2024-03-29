<!--
Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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
                                <b-form-checkbox
                                    switch
                                    size="lg"
                                    class="fr-toggle-primary"
                                    v-model="formValues[field.key]">
                                    {{ formValues[field.key] ? $t('common.form.yes') : $t('common.form.no') }}
                                </b-form-checkbox>
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
                key: detail._id,
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
