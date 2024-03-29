<!--
Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-modal id="userDetailsModal" modal-class="fr-full-screen" ref="fsModal" cancel-variant="outline-secondary" @show="setModal" @keydown.enter.native.prevent="saveForm">

        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{title}}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>
        <!-- Editing profile currently only supports String, Number and Boolean-->
        <b-container>
            <b-row>
                <b-col sm="8" offset-sm="2">
                    <ValidationObserver ref="observer" slim>
                        <b-form style="flex-direction: column;" v-if="formFields.length > 0" class="mb-3 fr-edit-personal-form" name="edit-personal-form">
                        <template v-for="(field, index) in formFields">
                                <b-form-group style="min-width: 200px;" :key="index" v-if="(field.type === 'string' || field.type === 'number') && field.viewable">
                                    <label :for="field.title">{{field.title}}</label>
                                    <small v-if="!field.required" class="text-muted ml-1">{{$t('pages.profile.editProfile.optional')}}</small>
                                    <ValidationProvider :rules="`${field.required ? 'required' : ''}`"  :name="field.name" v-slot="validationContext">
                                        <b-select
                                            v-if="field.options.length"
                                            :name="field.name"
                                            :state="getValidationState(validationContext)"
                                            :options="field.options"
                                            v-model.trim="formFields[index].value"/>
                                        <b-input
                                            v-else
                                            :disabled="!field.userEditable"
                                            :name="field.name"
                                            :type="field.type === 'string' ? 'text' : field.type"
                                            :state="getValidationState(validationContext)"
                                            v-model.trim="formFields[index].value" />
                                        <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                    </ValidationProvider>
                                </b-form-group>

                                <!-- for boolean values -->
                                <b-form-group :key="index" v-if="field.type === 'boolean'">
                                    <div v-if="field.viewable" class="d-flex flex-column">
                                        <label class="mr-auto" :for="field.title">{{field.title}}<small v-if="!field.required" class="text-muted ml-1">{{$t('pages.profile.editProfile.optional')}}</small></label>
                                        <b-form-checkbox
                                            switch
                                            size="lg"
                                            class="fr-toggle-primary"
                                            :disabled="!field.userEditable"
                                            v-model="formFields[index].value">
                                            {{ formFields[index].value ? $t('common.form.yes') : $t('common.form.no') }}
                                        </b-form-checkbox>
                                    </div>
                                </b-form-group>

                                <!-- for array values -->
                                    <b-form-group :key="index" v-if="field.type === 'array' && field.items.type !== 'relationship'">
                                        <div v-if="field.viewable" class="d-flex flex-column">
                                            <label class="mr-auto" :for="field.title">{{ field.title }}
                                                <small v-if="!field.required" class="text-muted ml-1">{{ $t('pages.profile.editProfile.optional') }}</small>
                                            </label>
                                            <FrListField
                                                :value="formFields[index].value"
                                                :description="field.description"
                                                :items="field.items"
                                                :label="field.title"
                                                :name="field.name"
                                                :required="field.required"
                                                :index="index"
                                                :disabled="!field.userEditable"
                                                v-on="$listeners"
                                                @input="updateField(index, $event)" />
                                        </div>
                                    </b-form-group>
                            </template>
                        </b-form>
                        <template v-else>
                            <h3 class="text-center">{{$t('pages.profile.editProfile.noFields')}}</h3>
                        </template>
                    </ValidationObserver>
                </b-col>
            </b-row>
        </b-container>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{$t('common.form.cancel')}}</b-btn>
                <b-btn type="button" variant="primary" :disabled="$root.userStore.state.internalUser" @click="saveForm">{{$t('common.form.saveChanges')}}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
import _ from 'lodash';
import FrListField from '@/components/utils/ListField';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

/**
 * @description Displays a users profile, auto generates fields based off of resource schema. Currently only displays strings, numbers and booleans. In the case of a policy
 * save error it will highlight the appropriate field and display a policy error. For custom profile changes (e.g. adding a dropdown) this would be the primary file to add these
 * adjustments.
 *
 */
export default {
    name: 'Edit-Personal-Info',
    mixins: [
        ResourceMixin
    ],
    components: {
        FrListField
    },
    props: {
        schema: { type: Object, required: true },
        profile: { type: Object, required: true },
        autoOpen: { type: Boolean, required: false, default: false }
    },
    data () {
        return {
            formFields: [],
            originalFormFields: [],
            title: this.$t('pages.profile.editProfile.userDetailsTitle')
        };
    },
    mounted () {
        if (this.autoOpen) {
            this.$root.$emit('bv::show::modal', 'userDetailsModal');
        }
    },
    methods: {
        generateFormFields () {
            let { order, properties, required } = this.schema,
                filteredOrder = _.filter(order, (propName) => {
                    return properties[propName].viewable &&
                        properties[propName].type !== 'object';
                }),
                formFields = _.map(filteredOrder, (name) => {
                    return {
                        name: name,
                        key: name,
                        title: properties[name].title,
                        userEditable: properties[name].userEditable,
                        viewable: properties[name].viewable,
                        value: this.profile[name] || null,
                        type: properties[name].type,
                        required: _.includes(required, name),
                        items: properties[name].items,
                        options: this.PopulateSelectList(properties[name])
                    };
                });

            return formFields;
        },
        hideModal () {
            this.$refs.fsModal.hide();
        },
        setModal () {
            let formFields = this.generateFormFields();

            this.formFields = formFields;
            this.originalFormFields = _.cloneDeep(formFields);
        },
        saveForm () {
            /* istanbul ignore next */
            this.$refs.observer.validate().then((valid) => {
                if (valid) {
                    const idmInstance = this.getRequestService();
                    let policyFields = {};

                    _.each(this.formFields, (field) => {
                        if (field.value !== null) {
                            policyFields[field.name] = field.value;
                        }
                    });

                    idmInstance.post(`policy/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_action=validateObject`, policyFields).then((policyResult) => {
                        // reject any failedPolicyRequirements on properties that don't exist in this.formFields
                        policyResult.data.failedPolicyRequirements = _.remove(policyResult.data.failedPolicyRequirements, (policy) => !_.map(this.formFields, 'name').includes(policy.property));

                        if (policyResult.data.failedPolicyRequirements.length === 0) {
                            // remove empty array values when the original value is null as this causes incorrect patches to be created
                            let cleanFormFields = _.map(_.cloneDeep(this.formFields), (field, index) => {
                                if (field.type === 'array' && field.value) {
                                    if (this.originalFormFields[index].value === null && field.value.length === 0) {
                                        field.value = null;
                                    }
                                }
                                return field;
                            });
                            this.$emit('updateProfile', this.generateUpdatePatch(this.originalFormFields, cleanFormFields));
                            this.$refs.observer.reset();
                            this.hideModal();
                        } else {
                            let generatedErrors = this.findPolicyError({
                                data: {
                                    detail: {
                                        failedPolicyRequirements: policyResult.data.failedPolicyRequirements
                                    }
                                }
                            }, this.formFields);

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
                                this.displayNotification('error', this.$t('pages.profile.editProfile.failedProfileSave'));
                            }
                        }
                    });
                }
            });
        },
        /**
         * Update form data model with a new value. Used for editing a list field
         *
         * @param {Number} index index of form field
         * @param {Array} newValue new value of form field
         */
        updateField (index, newValue) {
            this.formFields[index].value = newValue;
            this.$forceUpdate();
        },
        /** @param { object } property Data from IDM managed user object schema
         * @return { Array<{ text: string, value: string }>} Data to render a select list
        */
        PopulateSelectList (property) {
            let selectList = [];
            if (property.enum && property.enum.length) {
                selectList = _.map(property.enum, (value, index) => {
                    // if no enum_titles are provided, 'value' will be substituted
                    return {
                        text: property.options && property.options.enum_titles
                            ? property.options.enum_titles[index] : value,
                        value: value
                    };
                });
            }

            return selectList;
        }
    }
};
</script>

<style lang="scss">
    @import '../../scss/full-screen-modal';

    _:-ms-fullscreen, :root {
        #userDetailsModal {
            .row {
                min-width: 900px;
            }
            .fr-edit-personal-form {
                min-width: 900px;
            }
        }
    }

    @media only screen and (max-width: 700px) {
        _:-ms-fullscreen, :root {
            #userDetailsModal {
                .row {
                    min-width: 200px;
                }
                .fr-edit-personal-form {
                    min-width: 200px;
                }
            }
        }

    }

    .form-control:disabled, .b-form-tags.disabled {
        background-color: $gray-100;
    }
</style>
