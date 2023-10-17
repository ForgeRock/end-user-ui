<!--
Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-card>
        <ValidationObserver ref="observer" slim>
            <template v-for="(field, index) in displayProperties">
                <template v-if="!field.isReadOnly && !disableSaveButton">
                    <ValidationProvider v-if="field.type === 'string' || field.type === 'number' || field.type === 'boolean' || field.type === 'array' || field.type === 'relationship'"
                        :key="'editResource' +field.key"
                        :name="field.title"
                        :vid="field.key"
                        :rules="field.required ? 'required' : ''" v-slot="validationContext">
                        <b-form-group :label="field.title" label-for="field.key" horizontal v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                            <b-form-input v-if="field.type === 'string'" :ref="index === 0 ? 'focusInput' : ''"
                                :name="field.key"
                                type="text"
                                :state="getValidationState(validationContext)"
                                :autocomplete="field.key"
                                v-model.trim="formFields[field.key]"></b-form-input>

                            <b-form-input v-else horizontal :ref="index === 0 ? 'focusInput' : ''"
                                :name="field.key"
                                type="number"
                                :state="getValidationState(validationContext)"
                                :autocomplete="field.key"
                                v-model.number="formFields[field.key]"></b-form-input>
                            <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                        </b-form-group>

                        <FrRelationshipEdit v-else-if="field.type === 'relationship'"
                            :relationshipProperty='field'
                            :key="'editResource' + index"
                            :index="index"
                            :value="formFields[field.key]"
                            :setValue="setSingletonRelationshipValue" />

                        <!-- for boolean values -->
                        <b-form-group :key="'editResource' + index" v-if="field.type === 'boolean'">
                            <div class="form-row">
                                <label class="col-form-label col-sm-3" :for="field.title">{{field.title}}</label>
                                <b-form-checkbox
                                    switch
                                    size="lg"
                                    class="mt-1 fr-toggle-primary"
                                    v-model="formFields[field.key]">
                                    {{ formFields[field.key] ? $t('common.form.yes') : $t('common.form.no') }}
                                </b-form-checkbox>
                            </div>
                        </b-form-group>

                        <!-- for array values -->
                        <b-form-group :key="'editResource' + index" v-if="field.type === 'array' && field.items.type !== 'relationship'">
                            <div v-if="field.viewable" class="d-flex flex-column">
                                <label class="mr-auto" :for="field.title">{{ field.title || field.description }}</label>
                                <FrListField
                                    :value="formFields[field.key]"
                                    :description="field.description"
                                    :items="field.items"
                                    :label="field.title"
                                    :name="field.name"
                                    :required="field.required"
                                    :index="index"
                                    :disabled="!field.userEditable"
                                    v-on="$listeners"
                                    @input="updateField(field.key, $event)" />
                            </div>
                        </b-form-group>
                    </ValidationProvider>
                </template>
                <template v-else>
                    <b-form-group :label="field.title" label-for="field.key" horizontal :key="'readResource' +index" v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                        <b-form-input
                            :name="field.key"
                            type="text"
                            :disabled="true"
                            v-model="formFields[field.key]">
                        </b-form-input>
                    </b-form-group>

                    <!-- for boolean values -->
                    <b-form-group :key="'readResource' + index" v-if="field.type === 'boolean'">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.title">{{field.title}}</label>

                            <b-form-checkbox
                                switch
                                size="lg"
                                class="mt-1 fr-toggle-primary"
                                v-model="formFields[field.key]"
                                :disabled="true">
                                {{ formFields[field.key] ? $t('common.form.yes') : $t('common.form.no') }}
                            </b-form-checkbox>
                        </div>
                    </b-form-group>

                    <!-- for array values -->
                    <b-form-group :key="'readResource' + index" v-if="field.type === 'array' && field.items.type !== 'relationship'">
                        <div class="d-flex flex-column">
                            <label class="mr-auto" :for="field.title">{{ field.title }}</label>
                            <FrListField
                                :value="formFields[field.key]"
                                :description="field.description"
                                :items="field.items"
                                :label="field.title"
                                :name="field.name"
                                :required="field.required"
                                :index="index"
                                :disabled="true"
                                v-on="$listeners"
                                @input="updateField(field.key, $event)" />
                        </div>
                    </b-form-group>

                    <!-- for singletonRelationhip values -->
                    <b-form-group :key="'readResource' + index" v-if="field.type === 'relationship'">
                        <div class="form-row">
                            <label class="col-form-label col-sm-3" :for="field.title">{{field.title}}</label>
                            <div v-if="formFields[field.key]" class="media-body">
                                <!-- Using the first display field here "[0]"-->
                                <div class="text-bold pl-1">{{formFields[field.key][getRelationshipDisplayFields(field, formFields[field.key])[0]]}}</div>
                                <div>
                                    <!-- Loop over the rest of the display fields and print each in a span -->
                                    <span
                                        v-for="(displayField, displayFieldIndex) in getRelationshipDisplayFields(field, formFields[field.key])"
                                        :key="`displayField_${displayField}_${displayFieldIndex}`"
                                        v-show="displayFieldIndex !== 0"
                                        class="pl-1 pr-1 text-muted">
                                        {{formFields[field.key][displayField]}}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </b-form-group>
                </template>
            </template>
        </ValidationObserver>
        <div v-if="!disableSaveButton" class="float-right mt-4">
            <b-btn type="button" @click="saveResource" variant="primary">{{$t('common.form.save')}}</b-btn>
        </div>
    </b-card>
</template>

<script>

import _ from 'lodash';
import FrListField from '@/components/utils/ListField';
import FrRelationshipEdit from '@/components/access/RelationshipEdit';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

export default {
    name: 'ObjectTypeEditor',
    components: {
        FrListField,
        FrRelationshipEdit
    },
    props: {
        displayProperties: {
            type: Array,
            default: () => []
        },
        formFields: {
            type: Object,
            default: () => {}
        },
        resourcePath: {
            type: String,
            default: ''
        },
        disableSaveButton: {
            type: Boolean,
            default: false
        },
        isOpenidmAdmin: {
            type: Boolean,
            default: false
        },
        subPropertyName: {
            type: String,
            default: null,
            required: false
        }
    },
    mixins: [
        ResourceMixin
    ],
    data () {
        return {
            oldFormFields: {}
        };
    },
    methods: {
        getRelationshipDisplayFields (property, value) {
            return _.find(property.resourceCollection, { path: value._refResourceCollection }).query.fields;
        },
        setSingletonRelationshipValue (property, value) {
            this.formFields[property] = value;
        },
        saveResource () {
            this.$refs.observer.reset();
            const idmInstance = this.getRequestService();
            this.$refs.observer.validate().then((valid) => {
                if (valid) {
                    let saveData;

                    if (this.subPropertyName) {
                        const originalSubProp = {},
                            newSubProp = {};

                        originalSubProp[this.subPropertyName] = _.clone(this.oldFormFields);
                        newSubProp[this.subPropertyName] = _.clone(this.formFields);

                        saveData = this.generateUpdatePatch(originalSubProp, newSubProp);
                    } else {
                        saveData = this.generateUpdatePatch(_.clone(this.oldFormFields), _.clone(this.formFields));
                    }

                    idmInstance.patch(this.resourcePath, saveData).then(() => {
                        this.oldFormFields = _.clone(this.formFields);
                        this.displayNotification('success', this.$t('pages.access.successEdited', { resource: _.capitalize(this.name) }));
                    },
                    (error) => {
                        let generatedErrors = this.findPolicyError(error.response, this.displayProperties);

                        if (generatedErrors.length > 0) {
                            let tempDisplayErrors = {};

                            _.each(generatedErrors, (generatedError) => {
                                if (generatedError.exists) {
                                    if (tempDisplayErrors[generatedError.field] !== undefined) {
                                        tempDisplayErrors[generatedError.field].push(generatedError.msg);
                                    } else {
                                        tempDisplayErrors[generatedError.field] = [generatedError.msg];
                                    }
                                }
                            });
                            this.$refs.observer.setErrors(tempDisplayErrors);
                        } else {
                            this.displayNotification('error', this.$t('pages.access.invalidEdit'));
                        }
                    });
                } else {
                    this.displayNotification('error', this.$t('pages.access.invalidEdit'));
                }
            });
        },
        /**
         * Update form data model with a new value. Used for editing a list field
         *
         * @param {Number} index index of form field
         * @param {Array} newValue new value of form field
         */
        updateField (key, newValue) {
            this.formFields[key] = newValue;
            this.$forceUpdate();
        }
    },
    mounted () {
        // make sure display properties have a title
        this.displayProperties.forEach((displayProperty) => {
            const hasTitle = displayProperty.title && displayProperty.title.length > 0,
                hasDescription = displayProperty.description && displayProperty.description.length > 0;
            if (!hasTitle && hasDescription) {
                displayProperty.title = displayProperty.description;
            }
        });

        this.oldFormFields = _.clone(this.formFields);
    }
};
</script>
<style lang="scss">
.form-control:disabled, .b-form-tags.disabled {
        background-color: $gray-100;
    }
</style>
