<template>
    <b-modal id="createResourceModal" @shown="focusField" ref="createModal" cancel-variant="outline-secondary" @keydown.enter.native.prevent="saveForm">

        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{$t('common.form.new')}} {{resourceName}}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>
        <b-row>
            <b-col>
                <!-- Creating resource currently only supports String, Number and Boolean -->
                <b-form v-if="createProperties.length > 0" class="mb-3" name="edit-personal-form">
                    <template v-for="(field, index) in createProperties">
                        <b-form-group :key="'createResource' +index" v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                            <label v-if="field.title" class="float-left" :for="field.title">{{field.title}}</label>
                            <label v-else class="float-left" :for="field.key">{{field.key}}</label>

                            <input  :ref="index === 0 ? 'focusInput' : ''" v-if="field.type === 'string'" v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                   :name="field.key"
                                   type="text"
                                   :class="[{'is-invalid': errors.has(field.key)}, 'form-control']"
                                   :data-vv-as="field.title"
                                   :autocomplete="field.key"
                                   v-model.trim="formFields[field.key]">

                            <input :ref="index === 0 ? 'focusInput' : ''" v-else v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                   :name="field.key"
                                   type="number"
                                   :class="[{'is-invalid': errors.has(field.key)}, 'form-control']"
                                   :data-vv-as="field.title"
                                   :autocomplete="field.key"
                                   v-model.number="formFields[field.key]">
                            <fr-validation-error :validatorErrors="errors" :fieldName="field.key"></fr-validation-error>
                        </b-form-group>

                        <!-- for boolean values -->
                        <b-form-group :key="'createResource' +index" v-if="field.type === 'boolean'">
                            <div class="d-flex flex-column">
                                <label class="mr-auto" :for="field.title">{{field.title}}</label>

                                <div class="mr-auto">
                                    <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                                   :height="28"
                                                   :width="56"
                                                   :sync="true"
                                                   :cssColors="true"
                                                   :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                                   v-model="formFields[field.key]"/>
                                </div>
                            </div>
                        </b-form-group>
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
            </b-col>
        </b-row>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{$t('common.form.cancel')}}</b-btn>
                <b-btn type="button" variant="primary" @click="saveForm" :disabled="formFields.length === 0">{{$t('common.form.save')}}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
import _ from 'lodash';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';
import ValidationError from '@/components/utils/ValidationError';

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
        'fr-validation-error': ValidationError,
        'fr-password-policy-input': PolicyPasswordInput
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
    $_veeValidate: {
        validator: 'new'
    },
    data () {
        let tempFormFields = {},
            tempPasswordCheck = false;

        _.each(this.createProperties, (prop) => {
            if (prop.type === 'string' || prop.type === 'number') {
                tempFormFields[prop.key] = '';
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
            showPassword: true
        };
    },
    methods: {
        saveForm () {
            /* istanbul ignore next */
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            this.$validator.validateAll().then((valid) => {
                if (valid) {
                    let saveData = this.cleanData(_.clone(this.formFields));

                    idmInstance.post(`${this.resourceType}/${this.resourceName}?_action=create`, saveData).then(() => {
                        this.$emit('refreshGrid');
                        this.errors.clear();
                        this.hideModal();

                        this.displayNotification('success', this.$t('pages.access.successCreate', { resource: _.capitalize(this.resourceName) }));
                    },
                    (error) => {
                        let generatedErrors = this.findPolicyError(error.response, this.createProperties);

                        this.errors.clear();

                        if (generatedErrors.length > 0) {
                            _.each(generatedErrors, (generatedError) => {
                                if (generatedError.exists) {
                                    this.errors.add(generatedError);
                                }
                            });
                        } else {
                            this.displayNotification('error', this.$t('pages.access.invalidCreate'));
                        }
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
            this.errors.clear();

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
        }
    }
};
</script>
