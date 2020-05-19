<template>
    <b-container>
        <b-row>
            <b-col>
                <div class="d-sm-flex my-4">
                    <div class="media">
                        <div class="rounded-circle fr-resource-circle text-light bg-primary mr-4">
                            <i :class="setIcon" />
                        </div>
                        <div class="media-body">
                            <h1>{{ displayName }}</h1>
                            <h6 class="text-muted">{{ secondaryTitle }}</h6>
                        </div>
                    </div>
                    <div v-if="canChangePassword || canDelete" class="ml-auto my-4 my-sm-0 align-self-center align-self-end">
                        <b-dropdown id="resourceActions" text="Actions" right variant="primary" class="m-md-2">
                            <b-dropdown-item v-if="canChangePassword" v-b-modal.resetModal>{{ $t('pages.access.resetPassword') }}</b-dropdown-item>
                            <b-dropdown-item v-if="canDelete" v-b-modal.deleteModal>{{ $t("common.form.delete") }} {{ name }}</b-dropdown-item>
                        </b-dropdown>
                    </div>
                </div>
            </b-col>
        </b-row>

        <b-tabs content-class="mt-4" nav-class="nav-bar-border" flex-column flex-sm-row>
            <b-tab :title="this.$t('pages.access.details')" active>
                <b-card>
                    <template v-if="displayProperties.length > 0">
                        <template v-for="(field, index) in displayProperties">
                            <template v-if="!field.isReadOnly">
                                <b-form-group v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined" :key="'editResource' +index" :label="field.title" label-for="field.key" horizontal>
                                    <b-form-input
                                        v-if="field.type === 'string'"
                                        :ref="index === 0 ? 'focusInput' : ''"
                                        v-model.trim="formFields[field.key]"
                                        v-validate="field.required ? 'required' : ''"
                                        data-vv-validate-on="submit"
                                        :name="field.key"
                                        type="text"
                                        :class="[{'is-invalid': errors.has(`mainEdit.${field.key}`)}]"
                                        :data-vv-as="field.title"
                                        data-vv-scope="mainEdit"
                                        :autocomplete="field.key"
                                    />

                                    <b-form-input
                                        v-else
                                        :ref="index === 0 ? 'focusInput' : ''"
                                        v-model.number="formFields[field.key]"
                                        v-validate="field.required ? 'required' : ''"
                                        horizontal
                                        data-vv-validate-on="submit"
                                        :name="field.key"
                                        type="number"
                                        :class="[{'is-invalid': errors.has(`mainEdit.${field.key}`)}]"
                                        :data-vv-as="field.title"
                                        data-vv-scope="mainEdit"
                                        :autocomplete="field.key"
                                    />
                                    <fr-validation-error :validator-errors="errors" :field-name="`mainEdit.${field.key}`" />
                                </b-form-group>

                                <fr-relationship-edit
                                    v-else-if="field.type === 'relationship'"
                                    :key="'editResource' +index"
                                    :parent-resource="resource + &quot;/&quot; + name"
                                    :relationship-property="field"
                                    :index="index"
                                    :value="formFields[field.key]"
                                    :set-value="setSingletonRelationshipValue"
                                />

                                <!-- for boolean values -->
                                <b-form-group v-if="field.type === 'boolean'" :key="'editResource' +index">
                                    <div class="form-row">
                                        <label class="col-form-label col-sm-3" :for="field.title">{{ field.title }}</label>
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
                            </template>
                            <template v-else>
                                <b-form-group v-if="(field.type === 'string' || field.type === 'number') && field.encryption === undefined" :key="'readResource' +index" :label="field.title" label-for="field.key" horizontal>
                                    <b-form-input
                                        v-model="formFields[field.key]"
                                        horizontal
                                        type="text"
                                        plaintext
                                    />
                                </b-form-group>

                                <!-- for boolean values -->
                                <b-form-group v-if="field.type === 'boolean'" :key="'readResource' +index">
                                    <div class="form-row">
                                        <label class="col-form-label col-sm-3" :for="field.title">{{ field.title }}</label>
                                        <div class="mr-auto">
                                            <toggle-button
                                                v-model="formFields[field.key]"
                                                class="mt-2 p-0 fr-toggle-primary"
                                                :height="28"
                                                :width="56"
                                                :disabled="true"
                                                :sync="true"
                                                :css-colors="true"
                                                :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                            />
                                        </div>
                                    </div>
                                </b-form-group>

                                <!-- for singletonRelationhip values -->
                                <b-form-group
                                    v-if="field.type === 'relationship'"
                                    :key="'readResource' +index"
                                >
                                    <div class="form-row">
                                        <label class="col-form-label col-sm-3" :for="field.title">{{ field.title }}</label>
                                        <div v-if="formFields[field.key]" class="media-body">
                                            <!-- Using the first display field here "[0]"-->
                                            <div class="text-bold pl-1">{{ formFields[field.key][getRelationshipDisplayFields(field, formFields[field.key])[0]] }}</div>
                                            <div>
                                                <!-- Loop over the rest of the display fields and print each in a span -->
                                                <span
                                                    v-for="(displayField, displayFieldIndex) in getRelationshipDisplayFields(field, formFields[field.key])"
                                                    v-show="displayFieldIndex !== 0"
                                                    :key="`displayField_${displayField}_${displayFieldIndex}`"
                                                    class="pl-1 pr-1 text-muted"
                                                >
                                                    {{ formFields[field.key][displayField] }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </b-form-group>
                            </template>
                        </template>
                        <div v-if="!disableSaveButton" class="float-right mt-4">
                            <b-btn type="button" variant="primary" @click="saveResource">{{ $t('common.form.save') }}</b-btn>
                        </div>
                    </template>
                    <span v-else>
                        {{ $t('pages.access.noAvailableProperties') }}
                    </span>
                </b-card>
            </b-tab>
            <!-- Add a tab for each viewable/editable relationship array property -->
            <template v-for="(relationshipProperty) in relationshipProperties">
                <b-tab
                    v-if="relationshipProperty.type === 'array'"
                    :key="`${relationshipProperty.propName}_tab`"
                    :title="relationshipProperty.title"
                >
                    <fr-relationship-array :parent-resource="resource + &quot;/&quot; + name" :parent-id="id" :relationship-array-property="relationshipProperty" />
                </b-tab>
            </template>
        </b-tabs>

        <b-modal
            v-if="canDelete"
            id="deleteModal"
            ref="deleteModal"
            :title="this.$t('pages.access.deleteModalTitle')"
        >
            <div>
                {{ $t('pages.access.deleteConfirm') }} {{ name }}?
            </div>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn type="button" variant="danger" @click="deleteResource">{{ $t('common.form.delete') }}</b-btn>
                </div>
            </div>
        </b-modal>

        <b-modal
            v-if="canChangePassword"
            id="resetModal"
            ref="resetModal"
            :title="this.$t('pages.access.resetPassword')"
        >
            <fr-password-policy-input v-model="formFields['password']" :policy-api="`${resource}/${name}/policyTest`">
                <b-form-group slot="custom-input" class="mb-3">
                    <label for="updatePassword">{{ $t('pages.access.password') }}</label>
                    <div class="form-label-password form-label-group mb-0">
                        <b-form-input id="updatePassword" v-model="formFields['password']" v-validate.initial="'required|policy'" autocomplete="password" :type="passwordInputType" name="password" />
                        <div class="input-group-append">
                            <button class="btn btn-secondary" type="button" @click="revealNew">
                                <i :class="[{'fa-eye-slash': !showPassword}, {'fa-eye': showPassword}, 'fa']" />
                            </button>
                        </div>
                    </div>
                </b-form-group>
            </fr-password-policy-input>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn type="button" variant="primary" @click="savePassword">{{ $t('common.form.save') }}</b-btn>
                </div>
            </div>
        </b-modal>
    </b-container>
</template>

<script>
import { capitalize, clone, each, filter, find, indexOf, isUndefined, map, pick, pickBy, toLower } from "lodash";
import axios from "axios";
import PolicyPasswordInput from "../utils/PolicyPasswordInput";
import RelationshipArray from "./RelationshipArray";
import RelationshipEdit from "./RelationshipEdit";
import ResourceMixin from "../utils/mixins/ResourceMixin";
import ValidationError from "../utils/ValidationError";

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
    "name": "Edit-Resource",
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    "components": {
        "fr-password-policy-input": PolicyPasswordInput,
        "fr-relationship-array": RelationshipArray,
        "fr-relationship-edit": RelationshipEdit,
        "fr-validation-error": ValidationError
    },
    "computed": {
        displayName () {
            let temporaryDisplayName = this.id;

            if (this.displayNameField.length > 0) {
                temporaryDisplayName = this.formFields[this.displayNameField];
            }

            return temporaryDisplayName;
        },
        secondaryTitle () {
            let temporaryDisplayName = `${this.resource} - ${this.name}`;

            if (this.displaySecondaryTitleField.length > 0) {
                temporaryDisplayName = this.formFields[this.displaySecondaryTitleField];
            }

            return temporaryDisplayName;
        },
        setIcon () {
            let temporaryIcon = "fa-cube";

            if (this.icon.length > 0) {
                temporaryIcon = this.icon;
            }

            return `fa fa-3x ${temporaryIcon}`;
        }
    },
    data () {
        return {
            "canChangePassword": false,
            "canDelete": false,
            "disableSaveButton": false,
            "displayNameField": "",
            "displayProperties": [],
            "displaySecondaryTitleField": "",
            "formFields": {},
            "icon": "",
            "id": this.$route.params.resourceId,
            "name": this.$route.params.resourceName,
            "oldFormFields": {},
            "passwordInputType": "password",
            "relationshipProperties": [],
            "resource": this.$route.params.resourceType,
            "showPassword": true
        };
    },
    "methods": {
        buildResourceUrl () {
            let url = `${this.resource}/${this.name}/${this.id}?_fields=*`;
            const singletons = filter(this.relationshipProperties, { "type": "relationship" });

            if (singletons.length > 0) {
                url += `,${map(singletons, (prop) => `${prop.propName}/*`).join(",")}`;
            }

            return url;
        },
        deleteResource () {
            const idmInstance = this.getRequestService();

            this.$refs.deleteModal.hide();

            /* istanbul ignore next */
            idmInstance.delete(`${this.resource}/${this.name}/${this.id}`).then(() => {
                this.displayNotification("success", this.$t("pages.access.deleteResource"));

                this.$router.push({
                    "name": "ListResource",
                    "params": {
                        "resourceName": this.name,
                        "resourceType": this.resource
                    }
                });
            }).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        generateDisplay (schema, privilege, resourceDetails) {
            this.oldFormFields = pick(resourceDetails, privilege.VIEW.properties);
            this.canDelete = Boolean(privilege.DELETE.allowed);
            this.icon = schema.icon ? schema.icon : "";

            // Add reactive form for changes
            each(this.oldFormFields, (value, key) => {
                this.$set(this.formFields, key, value);
            });

            if (privilege.VIEW.allowed) {
                // If there are no update properties disable the save button
                this.disableSaveButton = privilege.UPDATE.properties.length === 0;

                // eslint-disable-next-line max-statements
                each(this.mergePrivilegeProperties(privilege, schema), (createPriv) => {
                    const temporaryProperty = schema.properties[createPriv.attribute];

                    if (indexOf(schema.required, createPriv.attribute) !== -1) {
                        temporaryProperty.required = true;
                    }

                    if (createPriv.attribute === "password" && !createPriv.readOnly) {
                        this.canChangePassword = true;
                    }

                    temporaryProperty.key = createPriv.attribute;

                    // Try and do some primary detection for a display name
                    if (createPriv.attrubute !== "_id" && this.displayNameField.length === 0) {
                        this.displayNameField = createPriv.attribute;
                    }

                    // Try and do some primary detection for a secondary title
                    if ((toLower(createPriv.attribute) === "title" ||
                                toLower(createPriv.attribute) === "email" ||
                                toLower(createPriv.attribute) === "type" ||
                                toLower(createPriv.attribute) === "mail") && this.displaySecondaryTitleField.length === 0) {
                        this.displaySecondaryTitleField = createPriv.attribute;
                    }

                    // Add fields that may not be set yet from reading the resource
                    if (isUndefined(this.formFields[createPriv.attribute])) {
                        if (temporaryProperty.type === "boolean") {
                            this.$set(this.formFields, createPriv.attribute, false);
                            this.oldFormFields[createPriv.attribute] = false;
                        } else {
                            this.$set(this.formFields, createPriv.attribute, "");
                            this.oldFormFields[createPriv.attribute] = "";
                        }
                    }

                    temporaryProperty.isReadOnly = Boolean(createPriv.readOnly);
                    this.displayProperties.push(temporaryProperty);
                });
            }
        },
        getRelationshipDisplayFields (property, value) {
            // eslint-disable-next-line no-underscore-dangle
            return find(property.resourceCollection, { "path": value._refResourceCollection }).query.fields;
        },
        getRelationshipProperties (schema, privilege) {
            return pickBy(schema.properties, (property, key) => {
                const hasPermission = privilege.VIEW.properties.includes(key) || privilege.UPDATE.properties.includes(key),
                    // eslint-disable-next-line no-extra-parens
                    isRelationship = property.type === "relationship" || (property.type === "array" && property.items.type === "relationship");

                property.propName = key;

                if (isRelationship) {
                    property.isReadOnly = !privilege.UPDATE.properties.includes(key);
                }

                return isRelationship && hasPermission;
            });
        },
        loadData () {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            axios.all([
                idmInstance.get(`schema/${this.resource}/${this.name}`),
                idmInstance.get(`privilege/${this.resource}/${this.name}/${this.id}`)
            ]).then(axios.spread((schema, privilege) => {
                let resourceUrl = "";

                this.relationshipProperties = this.getRelationshipProperties(schema.data, privilege.data);

                resourceUrl = this.buildResourceUrl();

                idmInstance.get(resourceUrl).then((resourceDetails) => {
                    this.generateDisplay(schema.data, privilege.data, resourceDetails.data);
                }).
                    catch((error) => {
                        this.displayNotification("error", error.response.data.message);
                    });
            })).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        mergePrivilegeProperties (privilege, schema) {
            const properties = [];

            each(schema.order, (schemaPropertyName) => {
                const canUpdate = indexOf(privilege.UPDATE.properties, schemaPropertyName) > -1,
                    canView = indexOf(privilege.VIEW.properties, schemaPropertyName) > -1,
                    property = { "attribute": schemaPropertyName };

                if (canUpdate) {
                    properties.push(property);
                } else if (canView) {
                    property.readOnly = true;
                    properties.push(property);
                }
            });

            return properties;
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
        savePassword () {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            this.$validator.validate("*").then((valid) => {
                if (valid) {
                    const saveData = [{ "field": "/password", "operation": "add", "value": this.formFields.password }];

                    this.$refs.resetModal.hide();
                    this.formFields.password = "";

                    idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(
                        () => {
                            this.displayNotification("success", this.$t("pages.access.successSavePassword"));
                        },
                        () => {
                            this.displayNotification("error", this.$t("pages.access.failedSavePassword"));
                        }
                    );
                } else {
                    this.displayNotification("error", this.$t("pages.access.invalidEdit"));
                }
            });
        },
        saveResource () {
            const idmInstance = this.getRequestService();

            this.errors.clear("mainEdit");

            /* istanbul ignore next */
            this.$validator.validate("mainEdit.*").then((valid) => {
                if (valid) {
                    const saveData = this.generateUpdatePatch(clone(this.oldFormFields), clone(this.formFields));

                    idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(
                        () => {
                            this.displayNotification("success", this.$t("pages.access.successEdited", { "resource": capitalize(this.name) }));
                        },
                        (error) => {
                            const generatedErrors = this.findPolicyError(error.response, this.displayProperties);

                            this.errors.clear();

                            if (generatedErrors.length > 0) {
                                each(generatedErrors, (generatedError) => {
                                    if (generatedError.exists) {
                                        generatedError.scope = "mainEdit";
                                        this.errors.add(generatedError);
                                    }
                                });
                            } else {
                                this.displayNotification("error", this.$t("pages.access.invalidEdit"));
                            }
                        }
                    );
                } else {
                    this.displayNotification("error", this.$t("pages.access.invalidEdit"));
                }
            });
        },
        setSingletonRelationshipValue (property, value) {
            this.formFields[property] = value;
        }
    },
    "mixins": [
        ResourceMixin
    ],
    mounted () {
        this.loadData();
    }
};
</script>

<style lang="scss" scoped>
    /deep/ {
        .nav-bar-border {
            border-bottom: 1px solid $gray-300;
        }
    }
</style>
