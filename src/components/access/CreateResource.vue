<!--
Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-modal id="createResourceModal" @shown="focusField" ref="createModal" cancel-variant="outline-secondary" @keydown.enter.native.prevent="saveForm">

        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{$t('common.form.new')}} {{resourceName}}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>
        <b-row>
            <b-col>
                <!-- Creating resource currently only supports String, Number, Boolean, and singleton relationships -->
                <ValidationObserver ref="observer" slim>
                    <b-form v-if="createProperties.length > 0" class="mb-3" name="edit-personal-form">
                        <template v-for="(field, index) in createProperties">
                            <b-form-group :key="'createResource' +index" v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                                <label v-if="field.title" class="float-left" :for="'create-resource-' +field.key">{{field.title}}</label>
                                <label v-else class="float-left" :for="'create-resource-' +field.key">{{field.key}}</label>
                                <ValidationProvider :rules="`${field.required ? 'required' : ''}`" :name="field.title" :vid="field.key" v-slot="validationContext">
                                    <b-form-input
                                        :id="'create-resource-' +field.key"
                                        :type="field.type === 'string' ? 'text' : field.type"
                                        :state="getValidationState(validationContext)"
                                        v-model.trim="formFields[field.key]" />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </ValidationProvider>
                            </b-form-group>

                            <!-- for boolean values -->
                            <b-form-group :key="'createResource' +index" v-if="field.type === 'boolean'">
                                <div class="d-flex flex-column">
                                    <label class="mr-auto" :for="field.title">{{field.title}}</label>

                                    <b-form-checkbox
                                        switch
                                        size="lg"
                                        class="fr-toggle-primary"
                                        v-model="formFields[field.key]">
                                        {{ formFields[field.key] ? $t('common.form.yes') : $t('common.form.no') }}
                                    </b-form-checkbox>
                                </div>
                            </b-form-group>

                            <!-- for singletonRelationhip values -->
                            <fr-relationship-edit v-if="field.type === 'relationship'"
                                :relationshipProperty='field'
                                :index="index"
                                :key="'createResource' +index"
                                :setValue="setSingletonRelationshipValue"
                                :newResource="true" />
                        </template>

                        <!-- Special logic for password -->
                        <fr-password-policy-input v-if="passwordCheck" :policyApi="`${resourceType}/${resourceName}/policyTest`" v-model="formFields['password']">
                            <b-form-group class="mb-3" slot="custom-input">
                                <label for="createPassword">{{$t('pages.access.password')}}</label>
                                <div class="form-label-password form-label-group mb-0">
                                    <b-form-input id="createPassword" autocomplete="password" :type="passwordInputType" v-model="formFields['password']" name="password" v-validate.initial="'required|policy'"></b-form-input>
                                    <div class="input-group-append">
                                        <button @click="revealNew" class="btn btn-secondary" type="button">
                                            <i :class="[{'fa-eye-slash': !showPassword}, {'fa-eye': showPassword}, 'fa']"></i>
                                        </button>
                                    </div>
                                </div>
                            </b-form-group>

                        </fr-password-policy-input>
                    </b-form>
                    <template v-else>
                        <h3 class="text-center">{{$t('pages.access.noFields')}}</h3>
                    </template>
                </ValidationObserver>
            </b-col>
        </b-row>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{$t('common.form.cancel')}}</b-btn>
                <b-btn type="button" variant="primary" @click="saveForm" :disabled="disabled || formFields.length === 0">{{$t('common.form.save')}}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
import _ from 'lodash';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import RelationshipEdit from '@/components/access/RelationshipEdit';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

/**
 * @description Dialog used for managing the create portion of delegated admin. Auto generates fields based on backend return.
 * Currently generates string, number, boolean and password (not based on type, but on field name being passsword).
 *
 * @param {array} createProperties - Required list of objects used to generate the fields for creating a user
 * @param {string} resourceName - Required resource name
 * @param {string} resourceType - Required type of resource, currently only supports managed
 *
 * @mixin - utils/mixins/ResourceMixin.vue
 *
 * @fires POST type/name?_action=create (e.g. managed/user?_action=create) - Creates a record for the specified managed resource
 */
export default {
    name: 'Create-Resource',
    components: {
        'fr-password-policy-input': PolicyPasswordInput,
        'fr-relationship-edit': RelationshipEdit
    },
    mixins: [
        ResourceMixin
    ],
    props: {
        createProperties: {
            type: Array,
            required: true,
            default: () => { return []; }
        },
        resourceName: {
            type: String,
            required: true
        },
        resourceType: {
            type: String,
            required: true
        }
    },
    data () {
        let tempFormFields = {},
            tempPasswordCheck = false;

        _.each(this.createProperties, (prop) => {
            if (prop.type === 'string' || prop.type === 'number') {
                tempFormFields[prop.key] = '';
            } else if (prop.type === 'relationship') {
                tempFormFields[prop.key] = null;
            } else {
                tempFormFields[prop.key] = false;
            }

            // Special logic for password
            if (prop.key === 'password') {
                tempPasswordCheck = true;
            }
        });

        return {
            formFields: tempFormFields,
            passwordCheck: tempPasswordCheck,
            passwordInputType: 'password',
            showPassword: true,
            disabled: false
        };
    },
    methods: {
        saveForm () {
            /* istanbul ignore next */
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            this.$refs.observer.validate().then((valid) => {
                if (valid) {
                    let saveData = this.cleanData(_.clone(this.formFields));

                    this.disabled = true;
                    idmInstance.post(`${this.resourceType}/${this.resourceName}?_action=create`, saveData)
                        .then(() => {
                            this.$emit('refreshGrid');
                            this.$refs.observer.reset();
                            this.hideModal();

                            this.displayNotification('success', this.$t('pages.access.successCreate', { resource: _.capitalize(this.resourceName) }));
                        })
                        .catch((error) => {
                            let generatedErrors = this.findPolicyError(error.response, this.createProperties);

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
                                this.displayNotification('error', this.$t('pages.access.invalidCreate'));
                            }
                        })
                        .finally(() => {
                            this.disabled = false;
                        });
                } else {
                    this.displayNotification('error', this.$t('pages.access.invalidCreate'));
                }
            });
        },

        hideModal () {
            this.resetDialog();

            this.$refs.createModal.hide();
        },
        // Clean dialog after closing/saving
        resetDialog () {
            if (this.$refs.observer) {
                this.$refs.observer.reset();
            }

            this.passwordInputType = 'password';
            this.showPassword = true;

            _.each(this.formFields, (value, key) => {
                if (_.isString(value) || _.isNumber(value)) {
                    this.formFields[key] = '';
                } else {
                    this.formFields[key] = false;
                }
            });
        },
        // Hide/show for special password field
        revealNew () {
            if (this.passwordInputType === 'password') {
                this.passwordInputType = 'text';
                this.showPassword = false;
            } else {
                this.passwordInputType = 'password';
                this.showPassword = true;
            }
        },
        // Remove optional fields to not save with empty string
        cleanData (data) {
            _.each(data, (value, key) => {
                if (_.isString(value) && value.length === 0) {
                    delete data[key];
                }
            });

            return data;
        },
        focusField () {
            /* istanbul ignore next */
            if (_.isArray(this.$refs.focusInput)) {
                this.$refs.focusInput[0].focus();
            }
        },
        getRelationshipDisplayFields (property, value) {
            return _.find(property.resourceCollection, { path: value._refResourceCollection }).query.fields;
        },
        setSingletonRelationshipValue (property, value) {
            this.formFields[property] = value;
        }
    }
};
</script>
