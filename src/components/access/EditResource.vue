<!--
Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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

        <b-tabs content-class="mt-4" nav-class="nav-bar-border" flex-column flex-sm-row>
            <b-tab :title="this.$t('pages.access.details')" active>
                <fr-object-type-editor
                    v-if="displayProperties.length > 0"
                    :form-fields="formFields"
                    :display-properties="displayProperties"
                    :disable-save-button="disableSaveButton"
                    :resource-path="`${resource}/${name}/${id}`" />
                <span v-else>
                    {{$t('pages.access.noAvailableProperties')}}
                </span>
            </b-tab>
            <!-- Add a tab for each viewable/editable object type property -->
            <b-tab
                v-for="(objectTypeProperty) in objectTypeProperties"
                :title="objectTypeProperty.title"
                :key="`${objectTypeProperty.propName}_tab`">
                <fr-object-type-editor
                    :form-fields="formFields[objectTypeProperty.propName] || {}"
                    :sub-property-name="objectTypeProperty.propName"
                    :display-properties="getObjectTypeProperyDisplayProperties(objectTypeProperty)"
                    :disable-save-button="objectTypeProperty.readOnly"
                    :resource-path="`${resource}/${name}/${id}`" />
            </b-tab>
            <!-- Add a tab for each viewable/editable relationship array property -->
            <template v-for="(relationshipProperty) in relationshipProperties">
                <b-tab
                    v-if="relationshipProperty.type === 'array'"
                    :title="relationshipProperty.title"
                    :key="`${relationshipProperty.propName}_tab`">
                    <fr-relationship-array :parentResource='resource + "/" + name' :parentId='id' :relationshipArrayProperty='relationshipProperty'/>
                </b-tab>
            </template>
            <b-tab
                v-if="showLinkedToTab"
                key="linkedSystems_tab"
                :title="$t('pages.linkedSystems.tabName')">
                <b-form-select v-model="linkedSelect" :options="selectOptions"
                    v-on:change="filterSelect" class="mb-3 w-25" />
                <div
                    class='linked-system-card'
                    v-for="(linkedSystem, key) in filteredLinkedSystems" :key="key">
                        <h5 class='mt-4 ml-2 mb-2 text-muted'>{{ key }}</h5>
                        <fr-object-type-editor
                            :form-fields="linkedSystem"
                            :display-properties="linkedSystemsDisplayProperties[key]"
                            :disable-save-button="true"
                        />
                </div>
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
                        <b-form-input id="updatePassword" autocomplete="password" :type="passwordInputType" v-model="formFields['password']" name="password"></b-form-input>
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
import ObjectTypeEditor from '@/components/access/ObjectTypeEditor';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import RelationshipArray from '@/components/access/RelationshipArray';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

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
        'fr-object-type-editor': ObjectTypeEditor,
        'fr-password-policy-input': PolicyPasswordInput,
        'fr-relationship-array': RelationshipArray
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
            oldFormFields: {},
            objectTypeProperties: {},
            relationshipProperties: {},
            linkedSystems: {},
            filteredLinkedSystems: {},
            linkedSystemsDisplayProperties: {},
            showLinkedToTab: false,
            selectOptions: [ this.$t('pages.linkedSystems.defaultDropdown') ],
            linkedSelect: this.$t('pages.linkedSystems.defaultDropdown')
        };
    },
    mounted () {
        this.loadData();
    },
    methods: {
        loadData () {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            axios.all([
                this.getSchema(`${this.resource}/${this.name}`),
                idmInstance.get(`privilege/${this.resource}/${this.name}/${this.id}`)
            ]).then(axios.spread((schema, privilege) => {
                let resourceUrl = '';

                this.objectTypeProperties = this.getObjectTypeProperties(schema.data, privilege.data);
                this.relationshipProperties = this.getRelationshipProperties(schema.data, privilege.data);

                resourceUrl = this.buildResourceUrl();

                idmInstance.get(resourceUrl).then((resourceDetails) => {
                    this.generateDisplay(schema.data, privilege.data, resourceDetails.data);

                    // attempt to get linked resources
                    idmInstance.post(`sync?_action=getLinkedResources&resourceName=managed/${this.name}/${this.id}`).then((linkedResource) => {
                        this.getLinkedSystemProperties(linkedResource.data);
                    }).catch((error) => {
                        // if access to the linked resources endpoint is not configured - fail gracefully
                        if (error.response && error.response.status && error.response.status !== 403) {
                            this.displayNotification('error', error.response.data.message);
                        };
                    });
                }).catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
            })).catch((error) => {
                this.displayNotification('error', error.response.data.message);
            });
        },
        /** This method determines whether to display the linked system tab
         *  and creates the display properties array as this does not come from schema for linked systems
         **/
        getLinkedSystemProperties (linkedResourceData) {
            if (linkedResourceData.length) {
                this.showLinkedToTab = true;

                _.forEach(linkedResourceData, (linkedObj) => {
                    const name = linkedObj.resourceName.split('/')[1];

                    this.selectOptions.push(name);
                    this.linkedSystems[name] = linkedObj.content;
                    this.linkedSystemsDisplayProperties[name] = [];

                    _.forEach(Object.keys(this.linkedSystems[name]), (displayKey) => {
                        // we do not want to show the _id for any linked system
                        if (displayKey !== '_id') {
                            // convert all property values to strings.  These fields are not editable so type is not important
                            this.linkedSystems[name][displayKey] = _.toString(this.linkedSystems[name][displayKey]);
                            this.linkedSystemsDisplayProperties[name].push({
                                title: _.startCase(displayKey),
                                key: displayKey,
                                propName: displayKey,
                                readOnly: true,
                                type: 'string',
                                userEditable: false,
                                viewable: true
                            });
                        }
                    });

                    this.filteredLinkedSystems = this.linkedSystems;
                });
            }
        },
        // Filter linked systems data based on user selection - default is to show all
        filterSelect (systemName) {
            if (systemName === this.$t('pages.linkedSystems.defaultDropdown')) {
                this.filteredLinkedSystems = this.linkedSystems;
            } else {
                const newFilterObj = {};
                newFilterObj[systemName] = this.linkedSystems[systemName];
                this.filteredLinkedSystems = newFilterObj;
            }
        },
        buildResourceUrl () {
            let url = `${this.resource}/${this.name}/${this.id}?_fields=*`;
            const singletons = _.filter(this.relationshipProperties, { type: 'relationship' });

            if (singletons.length) {
                url += `,${_.map(singletons, (prop) => { return prop.propName + '/*'; }).join(',')}`;
            }

            return url;
        },
        getObjectTypeProperties (schema, privilege) {
            return _.pickBy(schema.properties, (property, key) => {
                const hasPermission = privilege.VIEW.properties.includes(key) || privilege.UPDATE.properties.includes(key),
                    isObjectTypeProperty = property.type === 'object' && property.viewable;

                property.propName = key;
                property.readOnly = !privilege.UPDATE.properties.includes(key);

                return isObjectTypeProperty && hasPermission;
            });
        },
        getObjectTypeProperyDisplayProperties (obj) {
            return _.map(obj.order, (propName) => {
                const property = obj.properties[propName];
                property.key = propName;
                property.value = this.formFields[obj.propName] ? this.formFields[obj.propName][propName] || null : null;
                if (obj.readOnly && !this.isOpenidmAdmin) {
                    property.disabled = true;
                } else {
                    property.disabled = false;
                }

                return obj.properties[propName];
            });
        },
        getRelationshipProperties (schema, privilege) {
            return _.pickBy(schema.properties, (property, key) => {
                const hasPermission = privilege.VIEW.properties.indexOf(key) > -1 || privilege.UPDATE.properties.indexOf(key) > -1,
                    isRelationship = property.type === 'relationship' || (property.type === 'array' && property.items.type === 'relationship');

                property.propName = key;

                if (isRelationship) {
                    property.isReadOnly = privilege.UPDATE.properties.indexOf(key) === -1;
                }

                return isRelationship && hasPermission;
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
                    if (createPriv.attribute !== '_id' && createPriv.attribute !== 'password' && this.displayNameField.length === 0) {
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
        savePassword () {
            const idmInstance = this.getRequestService();

            let saveData = [{ operation: 'add', field: '/password', value: this.formFields['password'] }];

            this.$refs.resetModal.hide();
            this.formFields['password'] = '';

            idmInstance.patch(`${this.resource}/${this.name}/${this.id}`, saveData).then(() => {
                this.displayNotification('success', this.$t('pages.access.successSavePassword'));
            },
            () => {
                this.displayNotification('error', this.$t('pages.access.failedSavePassword'));
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

<style lang="scss" scoped>
    ::v-deep {
        .nav-bar-border {
            border-bottom: 1px solid $gray-300;
        }
    }
</style>
