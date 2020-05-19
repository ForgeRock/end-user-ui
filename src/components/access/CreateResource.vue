<template>
    <b-modal id="createResourceModal" ref="createModal" cancel-variant="outline-secondary" @shown="focusField" @keydown.enter.native.prevent="saveForm">
        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{ $t('common.form.new') }} {{ resourceName }}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times" /></button>
        </div>
        <b-row>
            <b-col>
                <!-- Creating resource currently only supports String, Number, Boolean, and singleton relationships -->
                <b-form v-if="createProperties.length > 0" class="mb-3" name="edit-personal-form">
                    <template v-for="(field, index) in createProperties">
                        <b-form-group v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined" :key="'createResource' +index">
                            <label v-if="field.title" class="float-left" :for="field.title">{{ field.title }}</label>
                            <label v-else class="float-left" :for="field.key">{{ field.key }}</label>

                            <input
                                v-if="field.type === 'string'"
                                :ref="index === 0 ? 'focusInput' : ''"
                                v-model.trim="formFields[field.key]"
                                v-validate="field.required ? 'required' : ''"
                                data-vv-validate-on="submit"
                                :name="field.key"
                                type="text"
                                :class="[{'is-invalid': errors.has(field.key)}, 'form-control']"
                                :data-vv-as="field.title"
                                :autocomplete="field.key"
                            >

                            <input
                                v-else
                                :ref="index === 0 ? 'focusInput' : ''"
                                v-model.number="formFields[field.key]"
                                v-validate="field.required ? 'required' : ''"
                                data-vv-validate-on="submit"
                                :name="field.key"
                                type="number"
                                :class="[{'is-invalid': errors.has(field.key)}, 'form-control']"
                                :data-vv-as="field.title"
                                :autocomplete="field.key"
                            >
                            <fr-validation-error :validator-errors="errors" :field-name="field.key" />
                        </b-form-group>

                        <!-- for boolean values -->
                        <b-form-group v-if="field.type === 'boolean'" :key="'createResource' +index">
                            <div class="d-flex flex-column">
                                <label class="mr-auto" :for="field.title">{{ field.title }}</label>

                                <div class="mr-auto">
                                    <toggle-button
                                        v-model="formFields[field.key]"
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

                        <!-- for singletonRelationhip values -->
                        <fr-relationship-edit
                            v-if="field.type === 'relationship'"
                            :key="'createResource' +index"
                            :parent-resource="resourceType + &quot;/&quot; + resourceName"
                            :relationship-property="field"
                            :index="index"
                            :set-value="setSingletonRelationshipValue"
                            :new-resource="true"
                        />
                    </template>

                    <!-- Special logic for password -->
                    <fr-password-policy-input v-if="passwordCheck" v-model="formFields['password']" :policy-api="`${resourceType}/${resourceName}/policyTest`">
                        <b-form-group slot="custom-input" class="mb-3">
                            <label for="createPassword">{{ $t('pages.access.password') }}</label>
                            <div class="form-label-password form-label-group mb-0">
                                <b-form-input id="createPassword" v-model="formFields['password']" v-validate.initial="'required|policy'" autocomplete="password" :type="passwordInputType" name="password" />
                                <div class="input-group-append">
                                    <button class="btn btn-secondary" type="button" @click="revealNew">
                                        <i :class="[{'fa-eye-slash': !showPassword}, {'fa-eye': showPassword}, 'fa']" />
                                    </button>
                                </div>
                            </div>
                        </b-form-group>
                    </fr-password-policy-input>
                </b-form>
                <template v-else>
                    <h3 class="text-center">{{ $t('pages.access.noFields') }}</h3>
                </template>
            </b-col>
        </b-row>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{ $t('common.form.cancel') }}</b-btn>
                <b-btn type="button" variant="primary" :disabled="formFields.length === 0" @click="saveForm">{{ $t('common.form.save') }}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
import { capitalize, clone, each, find, isArray, isNumber, isString } from "lodash";
import PolicyPasswordInput from "../utils/PolicyPasswordInput";
import RelationshipEdit from "./RelationshipEdit";
import ResourceMixin from "../utils/mixins/ResourceMixin";
import ValidationError from "../utils/ValidationError";

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
    "name": "Create-Resource",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-password-policy-input": PolicyPasswordInput,
        "fr-relationship-edit": RelationshipEdit,
        "fr-validation-error": ValidationError
    },
    "mixins": [
        ResourceMixin
    ],
    "props": {
        "createProperties": {
            "default": () => [],
            "required": true,
            "type": Array
        },
        "resourceName": {
            "required": true,
            "type": String
        },
        "resourceType": {
            "required": true,
            "type": String
        }
    },
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    data () {
        // eslint-disable-next-line prefer-const
        let temporaryFormFields = {},
            temporaryPasswordCheck = false;

        each(this.createProperties, (prop) => {
            if (prop.type === "string" || prop.type === "number") {
                temporaryFormFields[prop.key] = "";
            } else if (prop.type === "relationship") {
                temporaryFormFields[prop.key] = {};
            } else {
                temporaryFormFields[prop.key] = false;
            }

            // Special logic for password
            if (prop.key === "password") {
                temporaryPasswordCheck = true;
            }
        });

        return {
            "formFields": temporaryFormFields,
            "passwordCheck": temporaryPasswordCheck,
            "passwordInputType": "password",
            "showPassword": true
        };
    },
    "methods": {
        // Remove optional fields to not save with empty string
        cleanData (data) {
            each(data, (value, key) => {
                if (isString(value) && value.length === 0) {
                    delete data[key];
                }
            });

            return data;
        },
        focusField () {
            /* istanbul ignore next */
            if (isArray(this.$refs.focusInput)) {
                this.$refs.focusInput[0].focus();
            }
        },
        getRelationshipDisplayFields (property, value) {
            // eslint-disable-next-line no-underscore-dangle
            return find(property.resourceCollection, { "path": value._refResourceCollection }).query.fields;
        },
        hideModal () {
            this.resetDialog();

            this.$refs.createModal.hide();
        },
        // Clean dialog after closing/saving
        resetDialog () {
            this.errors.clear();

            this.passwordInputType = "password";
            this.showPassword = true;

            each(this.formFields, (value, key) => {
                if (isString(value) || isNumber(value)) {
                    this.formFields[key] = "";
                } else {
                    this.formFields[key] = false;
                }
            });
        },
        // Hide/show for special password field
        revealNew () {
            if (this.passwordInputType === "password") {
                this.passwordInputType = "text";
                this.showPassword = false;
            } else {
                this.passwordInputType = "password";
                this.showPassword = true;
            }
        },
        saveForm () {
            /* istanbul ignore next */
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            this.$validator.validateAll().then((valid) => {
                if (valid) {
                    const saveData = this.cleanData(clone(this.formFields));

                    idmInstance.post(`${this.resourceType}/${this.resourceName}?_action=create`, saveData).then(
                        () => {
                            this.$emit("refreshGrid");
                            this.errors.clear();
                            this.hideModal();

                            this.displayNotification("success", this.$t("pages.access.successCreate", { "resource": capitalize(this.resourceName) }));
                        },
                        (error) => {
                            const generatedErrors = this.findPolicyError(error.response, this.createProperties);

                            this.errors.clear();

                            if (generatedErrors.length > 0) {
                                each(generatedErrors, (generatedError) => {
                                    if (generatedError.exists) {
                                        this.errors.add(generatedError);
                                    }
                                });
                            } else {
                                this.displayNotification("error", this.$t("pages.access.invalidCreate"));
                            }
                        }
                    );
                } else {
                    this.displayNotification("error", this.$t("pages.access.invalidCreate"));
                }
            });
        },
        setSingletonRelationshipValue (property, value) {
            this.formFields[property] = value;
        }
    }
};
</script>
