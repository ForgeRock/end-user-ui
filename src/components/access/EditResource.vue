<template>
    <b-container>
        <b-row>
            <b-col>
                <div class="d-sm-flex my-4">
                    <div class="media">
                        <div class="rounded-circle fr-resource-circle text-light bg-primary mr-4">
                            <i :class="setIcon"/>
                        </div>
                        <div class="media-body">
                            <h1>{{displayName}}</h1>
                            <h6 class="text-muted">{{secondaryTitle}}</h6>
                        </div>
                    </div>
                    <div v-if="canChangePassword || canDelete" class="ml-auto my-4 my-sm-0 align-self-center align-self-end">
                        <b-dropdown id="resourceActions" text="Actions" right variant="primary" class="m-md-2">
                            <b-dropdown-item v-if="canChangePassword" v-b-modal.resetModal>{{$t('pages.access.resetPassword')}}</b-dropdown-item>
                            <b-dropdown-item v-if="canDelete" v-b-modal.deleteModal>{{$t("common.form.delete")}} {{this.name}}</b-dropdown-item>
                        </b-dropdown>
                    </div>
                </div>
            </b-col>
        </b-row>

        <b-tabs content-class="mt-4" flex-column flex-sm-row>
            <b-tab :title="this.$t('pages.access.details')" active>
                <b-card>
                    <template v-if="displayProperties.length > 0">
                        <template v-for="(field, index) in displayProperties">
                            <template v-if="!field.isReadOnly">
                                <b-form-group :label="field.title" label-for="field.key" horizontal :key="'editResource' +index" v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                                    <b-form-input  :ref="index === 0 ? 'focusInput' : ''" v-if="field.type === 'string'" v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                            :name="field.key"
                                            type="text"
                                            :class="[{'is-invalid': errors.has(`mainEdit.${field.key}`)}]"
                                            :data-vv-as="field.title"
                                            data-vv-scope="mainEdit"
                                            :autocomplete="field.key"
                                            v-model.trim="formFields[field.key]"></b-form-input>

                                    <b-form-input horizontal :ref="index === 0 ? 'focusInput' : ''" v-else v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                           :name="field.key"
                                           type="number"
                                           :class="[{'is-invalid': errors.has(`mainEdit.${field.key}`)}]"
                                           :data-vv-as="field.title"
                                           data-vv-scope="mainEdit"
                                           :autocomplete="field.key"
                                           v-model.number="formFields[field.key]"></b-form-input>
                                    <fr-validation-error :validatorErrors="errors" :fieldName="`mainEdit.${field.key}`"></fr-validation-error>
                                </b-form-group>

                                <!-- for boolean values -->
                                <b-form-group :key="'createResource' +index" v-if="field.type === 'boolean'">
                                    <div class="form-row">
                                        <label class="col-form-label col-sm-3" :for="field.title">{{field.title}}</label>

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
                            <template v-else>
                                <b-form-group :label="field.title" label-for="field.key" horizontal :key="'readResource' +index" v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined">
                                    <b-form-input horizontal
                                          type="text"
                                          plaintext
                                          v-model="formFields[field.key]"></b-form-input>
                                </b-form-group>

                                <!-- for boolean values -->
                                <b-form-group :key="'readResource' +index" v-if="field.type === 'boolean'">
                                    <div class="form-row">
                                        <label class="col-form-label col-sm-3" :for="field.title">{{field.title}}</label>

                                        <div class="mr-auto">
                                            <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                                           :height="28"
                                                           :width="56"
                                                           :disabled="true"
                                                           :sync="true"
                                                           :cssColors="true"
                                                           :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                                           v-model="formFields[field.key]"/>
                                        </div>
                                    </div>
                                </b-form-group>
                            </template>
                        </template>
                        <div v-if="!disableSaveButton" class="float-right mt-4">
                            <b-btn type="button" @click="saveResource" variant="primary">{{$t('common.form.save')}}</b-btn>
                        </div>
                    </template>
                    <span v-else>
                        {{$t('pages.access.noAvailableProperties')}}
                    </span>
                </b-card>
            </b-tab>
        </b-tabs>

        <b-modal v-if="canDelete" id="deleteModal"
                 ref="deleteModal"
                 :title="this.$t('pages.access.deleteModalTitle')">

            <div>
                {{$t('pages.access.deleteConfirm')}} {{this.name}}?
            </div>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn type="button" variant="danger" @click="deleteResource">{{$t('common.form.delete')}}</b-btn>
                </div>
            </div>
        </b-modal>

        <b-modal v-if="canChangePassword" id="resetModal"
                 ref="resetModal"
                 :title="this.$t('pages.access.resetPassword')">

            <fr-password-policy-input :policyApi="`${resource}/${name}/policyTest`" v-model="formFields['password']">
                <b-form-group class="mb-3" slot="custom-input">
                    <label for="updatePassword">{{$t('pages.access.password')}}</label>
                    <div class="form-label-password form-label-group mb-0">
                        <b-form-input id="updatePassword" autocomplete="password" :type="passwordInputType" v-model="formFields['password']" name="password" v-validate.initial="'required|policy'"></b-form-input>
                        <div class="input-group-append">
                            <button @click="revealNew" class="btn btn-secondary" type="button">
                                <i :class="[{'fa-eye-slash': !showPassword}, {'fa-eye': showPassword}, 'fa']"></i>
                            </button>
                        </div>
                    </div>
                </b-form-group>
            </fr-password-policy-input>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn type="button" variant="primary" @click="savePassword">{{$t('common.form.save')}}</b-btn>
                </div>
            </div>
        </b-modal>
    </b-container>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';
import ValidationError from '@/components/utils/ValidationError';

/**
 * @description Full page that provides view/edit of a specific resource for delegated admin. Auto generates fields based on backend return.
 * Currently generates string, number, boolean and password (not based on type, but on field name being passsword).
 *
 * @fires GET schema/type/name/ (e.g. schema/managed/user) - Schema for a resource
 * @fires GET privilege/type/name/id (e.g. privilege/managed/user/_id) - Privileges for a specific record of a resource
 * @fires GET type/name/id (e.g. managed/user/_id) - Resource details, in this context privileges will restrict the data return
 * @fires DELETE type/name/id (e.g. managed/user/_id) - Deletes resource record
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
    name: 'Edit-Resource',
    components: {
        'fr-validation-error': ValidationError,
        'fr-password-policy-input': PolicyPasswordInput
    },
    mixins: [
        ResourceMixin
    ],
    data () {
        return {
            name: this.$route.params.resourceName,
            resource: this.$route.params.resourceType,
            id: this.$route.params.resourceId,
            displayProperties: [],
            canDelete: false,
            canChangePassword: false,
            passwordInputType: 'password',
            showPassword: true,
            disableSaveButton: false,
            icon: '',
            displayNameField: '',
            displaySecondaryTitleField: '',
            formFields: {},
            oldFormFields: {}
        };
    },
    mounted () {
        this.loadData();
    },
    $_veeValidate: {
        validator: 'new'
    },
    methods: {
        loadData () {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            axios.all([
                idmInstance.get(`schema/${this.resource}/${this.name}`),
                idmInstance.get(`privilege/${this.resource}/${this.name}/${this.id}`),
                idmInstance.get(`${this.resource}/${this.name}/${this.id}`)]).then(axios.spread((schema, privilege, resourceDetails) => {
                this.generateDisplay(schema.data, privilege.data, resourceDetails.data);
            }))
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
        },
        generateDisplay (schema, privilege, resourceDetails) {
            this.oldFormFields = _.pick(resourceDetails, privilege.VIEW.properties);

            if (privilege.DELETE.allowed) {
                this.canDelete = true;
            }

            if (schema.icon) {
                this.icon = schema.icon;
            } else {
                this.icon = '';
            }

            // Add reactive form for changes
            _.each(this.oldFormFields, (value, key) => {
                this.$set(this.formFields, key, value);
            });

            if (privilege.VIEW.allowed) {
                // if there are no update properties disable the save button
                if (privilege.UPDATE.properties.length === 0) {
                    this.disableSaveButton = true;
                }
                _.each(this.mergePrivilegeProperties(privilege, schema), (createPriv) => {
                    let tempProp = schema.properties[createPriv.attribute];

                    if (_.indexOf(schema.required, createPriv.attribute) !== -1) {
                        tempProp.required = true;
                    }

                    if (createPriv.attribute === 'password' && !createPriv.readOnly) {
                        this.canChangePassword = true;
                    }

                    tempProp.key = createPriv.attribute;

                    // Try and do some primary detection for a display name
                    if ((_.toLower(createPriv.attribute) === 'username' || _.toLower(createPriv.attribute) === 'name') && this.displayNameField.length === 0) {
                        this.displayNameField = createPriv.attribute;
                    }

                    // Try and do some primary detection for a secondary title
                    if ((_.toLower(createPriv.attribute) === 'title' ||
                                _.toLower(createPriv.attribute) === 'email' ||
                                _.toLower(createPriv.attribute) === 'type' ||
                                _.toLower(createPriv.attribute) === 'mail') && this.displaySecondaryTitleField.length === 0) {
                        this.displaySecondaryTitleField = createPriv.attribute;
                    }

                    // Add fields that may not be set yet from reading the resource
                    if (_.isUndefined(this.formFields[createPriv.attribute])) {
                        if (tempProp.type === 'boolean') {
                            this.$set(this.formFields, createPriv.attribute, false);
                            this.oldFormFields[createPriv.attribute] = false;
                        } else {
                            this.$set(this.formFields, createPriv.attribute, '');
                            this.oldFormFields[createPriv.attribute] = '';
                        }
                    }

                    if (createPriv.readOnly) {
                        tempProp.isReadOnly = true;
                    }

                    this.displayProperties.push(tempProp);
                });
            }
        },
        deleteResource () {
            const idmInstance = this.getRequestService();

            this.$refs.deleteModal.hide();

            /* istanbul ignore next */
            idmInstance.delete(`${this.resource}/${this.name}/${this.id}`).then(() => {
                this.displayNotification('success', this.$t('pages.access.deleteResource'));

                this.$router.push({
                    name: 'ListResource',
                    params: {
                        resourceType: this.resource,
                        resourceName: this.name
                    }
                });
            })
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
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
        saveResource () {
            const idmInstance = this.getRequestService();

            this.errors.clear('mainEdit');

            /* istanbul ignore next */
            this.$validator.validate('mainEdit.*').then((valid) => {
                if (valid) {
                    let saveData = this.generateUpdatePatch(_.clone(this.oldFormFields), _.clone(this.formFields));

                    idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(() => {
                        this.displayNotification('success', this.$t('pages.access.successEdited', { resource: _.capitalize(this.name) }));
                    },
                    (error) => {
                        let generatedErrors = this.findPolicyError(error.response, this.displayProperties);

                        this.errors.clear();

                        if (generatedErrors.length > 0) {
                            _.each(generatedErrors, (generatedError) => {
                                if (generatedError.exists) {
                                    generatedError.scope = 'mainEdit';
                                    this.errors.add(generatedError);
                                }
                            });
                        } else {
                            this.displayNotification('error', this.$t('pages.access.invalidEdit'));
                        }
                    });
                } else {
                    this.displayNotification('error', this.$t('pages.access.invalidEdit'));
                }
            });
        },
        savePassword () {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            this.$validator.validate('*').then((valid) => {
                if (valid) {
                    let saveData = [{ operation: 'add', field: '/password', value: this.formFields['password'] }];

                    this.$refs.resetModal.hide();
                    this.formFields['password'] = '';

                    idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(() => {
                        this.displayNotification('success', this.$t('pages.access.successSavePassword'));
                    },
                    () => {
                        this.displayNotification('error', this.$t('pages.access.failedSavePassword'));
                    });
                } else {
                    this.displayNotification('error', this.$t('pages.access.invalidEdit'));
                }
            });
        },
        mergePrivilegeProperties (privilege, schema) {
            let properties = [];

            _.each(schema.order, (schemaPropName) => {
                let canView = _.indexOf(privilege.VIEW.properties, schemaPropName) > -1,
                    canUpdate = _.indexOf(privilege.UPDATE.properties, schemaPropName) > -1,
                    property = { attribute: schemaPropName };

                if (canUpdate) {
                    properties.push(property);
                } else if (canView) {
                    property.readOnly = true;
                    properties.push(property);
                }
            });

            return properties;
        }
    },
    computed: {
        secondaryTitle () {
            let tempDisplayName = `${this.resource} - ${this.name}`;

            if (this.displaySecondaryTitleField.length > 0) {
                tempDisplayName = this.formFields[this.displaySecondaryTitleField];
            }

            return tempDisplayName;
        },
        displayName () {
            let tempDisplayName = this.id;

            if (this.displayNameField.length > 0) {
                tempDisplayName = this.formFields[this.displayNameField];
            }

            return tempDisplayName;
        },
        setIcon () {
            let tempIcon = 'fa-cube';

            if (this.icon.length > 0) {
                tempIcon = this.icon;
            }

            return `fa fa-3x ${tempIcon}`;
        }
    }
};
</script>
