<!--
Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-container>
        <div class="card mt-4">
            <div class="card-header py-2">
                <b-row>
                    <b-col md="3" class="my-1">
                        <b-btn v-if="createProperties.length > 0" type="button" variant="primary" v-b-modal.createResourceModal><i class="fa fa-plus mr-3"></i>{{$t("common.form.new")}} {{this.name}}</b-btn>
                    </b-col>
                    <b-col md="9" class="my-1">
                        <div class="d-flex">
                            <b-input-group>
                                <b-input-group-prepend>
                                    <div class="input-group-text inset">
                                        <i class='fa fa-search'></i>
                                    </div>
                                </b-input-group-prepend>
                                <b-form-input v-model="filter" @keyup.native.enter="search" :placeholder="searchPlaceholder" class="inset-left inset-right"></b-form-input>
                                <b-input-group-append>
                                    <b-btn variant="outline-default" :disabled="!filter" @click="clear" class="inset clear"><i class="fa fa-times-circle"></i></b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </div>
                    </b-col>
                </b-row>
            </div>
            <div class="card-body">
                <b-table show-empty
                        table-responsive
                        stacked="lg"
                        :items="gridData"
                        :fields="columns"
                        :per-page="0"
                        :hover="tableHover"
                        :sort-by.sync="sortBy"
                        :sort-desc.sync="sortDesc"
                        :no-local-sorting="true"
                        class="mb-0"
                        :sort-direction="sortDirection"
                        @row-clicked="resourceClicked"
                        @sort-changed="sortingChanged"
                        :busy="isLoading"
                        :class="[{'hide-header': isLoading || !gridData.length }]">
                        <template v-slot:table-busy>
                            <div class="text-center p-5">
                            <b-spinner class="align-middle spinner-large text-primary my-4"></b-spinner>
                            <div>{{ $t("common.form.loading") }} {{ plural(name) }}...</div>
                            </div>
                        </template>
                </b-table>
            </div>
            <div v-if="!isLoading" class="card-footer py-2">
                <nav aria-label="Page navigation example">
                    <ul class="pagination justify-content-center mb-0">
                        <li @click.prevent="currentPage === 1 ? '' : paginationChange(1)" :class="[{ disabled: currentPage === 1 }, 'page-item']">
                            <a class="page-link" href="#"><i class='fa fa-angle-double-left'></i></a>
                        </li>
                        <li @click.prevent="currentPage === 1 ? '' : paginationChange(currentPage - 1)" :class="[{ disabled: currentPage === 1 }, 'page-item']">
                            <a class="page-link" href="#"><i class='fa fa-angle-left'></i></a>
                        </li>

                        <li  @click.prevent="lastPage ?  '' : paginationChange(currentPage + 1)" :class="[{ disabled: lastPage }, 'page-item']">
                            <a class="page-link" href="#"><i class='fa fa-angle-right'></i></a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <fr-create-resource v-if="createProperties.length > 0" @refreshGrid="clear" :resourceName="name" :resourceType="resource" :createProperties="createProperties"></fr-create-resource>
    </b-container>
</template>

<script>
import _ from 'lodash';
import pluralize from 'pluralize';
import axios from 'axios';
import CreateResource from '@/components/access/CreateResource';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

/**
 * @description Controlling component for delegated admin, allows for listing available resources and connects to the create, delete and edit features.
 *
 * @fires GET schema/type/name/ (e.g. schema/managed/user) - Schema for a resource (e.g. managed/user schema)
 * @fires GET privilege/type/name/ (e.g. privilege/managed/user/) - Privileges for a resource (e.g. managed/user)
 * @fires GET resource/name?_queryFilter=filter&_pageSize=10 (e.g. managed/user?_queryFilter=true&_pageSize=10) -
 * List resource items, limited to 10 returned items and makes use of a query filter search if provided (defaults to queryFilter = true if none provided by the user).
 */
export default {
    name: 'Access',
    components: {
        'fr-create-resource': CreateResource
    },
    mixins: [
        ResourceMixin
    ],
    data () {
        return {
            name: this.$route.params.resourceName,
            resource: this.$route.params.resourceType,
            schemaProperties: {},
            isRowSelected: false,
            tableHover: true,
            gridData: [],
            columns: [],
            displayFields: [],
            currentPage: 1,
            lastPage: false,
            sortBy: null,
            sortDesc: false,
            sortDirection: 'asc',
            filter: '',
            createProperties: [],
            userCanUpdate: false,
            isLoading: true,
            queryThreshold: null
        };
    },
    mounted () {
        this.loadData();
    },
    watch: {
        gridData () {
            // disallow sorting if there is a queryThreshold and the filter doesn't have at least the same number of chars as queryThreshold
            this.columns = this.columns.map((col) => {
                if (col.key !== 'actions') {
                    col.sortable = !this.queryThreshold || (this.filter.length >= this.queryThreshold);
                }

                return col;
            });
        }
    },
    computed: {
        searchPlaceholder () {
            if (this.queryThreshold) {
                return this.$t('pages.access.typeAtLeastAndEnterToSearch', { numChars: this.queryThreshold });
            }
            return this.$t('pages.access.typeAndEnterToSearch');
        }
    },
    methods: {
        loadData () {
            const idmInstance = this.getRequestService(),
                managedObjectsSettings = this.$root.applicationStore.state.managedObjectsSettings;

            if (managedObjectsSettings && managedObjectsSettings[this.name]) {
                this.queryThreshold = managedObjectsSettings[this.name].minimumUIFilterLength;
            }

            /* istanbul ignore next */
            axios.all([
                this.getSchema(`${this.resource}/${this.name}`),
                idmInstance.get(`privilege/${this.resource}/${this.name}`)]).then(axios.spread((schema, privilege) => {
                if (privilege.data.VIEW.allowed) {
                    // Generate columns for display and filtering for read/query
                    _.each(privilege.data.VIEW.properties, (readProp) => {
                        let propSchema = schema.data.properties[readProp];
                        if (
                            this.columns.length <= 3 &&
                                    _.isUndefined(propSchema.encryption) &&
                                    _.includes(['string', 'boolean', 'number'], propSchema.type)
                        ) {
                            this.columns.push({
                                key: readProp,
                                label: propSchema.title,
                                sortable: true,
                                sortDirection: 'desc'
                            });

                            this.displayFields.push(readProp);
                        }
                    });
                }

                if (privilege.data.UPDATE) {
                    this.userCanUpdate = true;
                }

                this.schemaProperties = schema.data.properties;

                if (privilege.data.CREATE.allowed) {
                    // Generate create list for create resource dialog
                    _.each(privilege.data.CREATE.properties, (createProp) => {
                        const propType = schema.data.properties[createProp].type;
                        if (propType === 'string' || propType === 'number' || propType === 'boolean' || propType === 'relationship' || (propType === 'array' && schema.data.properties[createProp].items.type === 'relationship')) {
                            schema.data.properties[createProp].key = createProp;

                            _.each(schema.data.required, (requiredKey) => {
                                if (requiredKey === schema.data.properties[createProp].key) {
                                    schema.data.properties[createProp].required = true;
                                }
                            });

                            this.createProperties.push(schema.data.properties[createProp]);
                        }
                    });
                }

                this.loadGrid('true', this.displayFields, this.displayFields[0], 1);
            }))
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
        },
        loadGrid (filter, fields, sortField, page) {
            const idmInstance = this.getRequestService();

            this.isLoading = true;

            /* istanbul ignore next */
            idmInstance.get(this.buildGridUrl(filter, fields, sortField, page)).then((resourceData) => {
                // this.totalRows = resourceData.data.totalPagedResults;
                if (resourceData.data.pagedResultsCookie) {
                    this.lastPage = false;
                } else {
                    this.lastPage = true;
                }

                this.gridData = resourceData.data.result;
                this.isLoading = false;
            }).catch((error) => {
                this.isLoading = false;
                this.displayNotification('error', error.response.data.message);
            });
        },
        buildGridUrl (filter, fields, sortField, page) {
            let resourceUrl = `${this.resource}/${this.name}?_queryFilter=${filter}&_pageSize=10`;

            if (_.isNull(sortField)) {
                // If there is no sortField default to sorting on the first column.
                sortField = fields[0];
            }
            // do not add _sortKeys when there is a queryThreshold and no filter
            if (!(this.queryThreshold && this.filter === '')) {
                resourceUrl = `${resourceUrl}&_sortKeys=${sortField}`;
            }

            if (fields.length) {
                resourceUrl = `${resourceUrl}&_fields=${fields.join(',')}`;
            }

            if (page > 1) {
                // Pagination starts at 1 and we need to go back an additional one to get the previous page
                let offsetCalc = (page - 1) * 10;

                resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
            }

            return resourceUrl;
        },
        calculateSort (sortDesc, sortBy) {
            let sortUrl = null;

            if (!_.isNull(sortBy)) {
                if (sortDesc) {
                    sortUrl = `${sortBy}`;
                } else {
                    sortUrl = `-${sortBy}`;
                }
            }

            return sortUrl;
        },
        sortingChanged (sort) {
            this.currentPage = 1;
            this.lastPage = false;

            this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), 1);
        },
        paginationChange (page) {
            /* istanbul ignore next */
            this.currentPage = page;
            this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), page);
        },
        search () {
            this.sortBy = null;
            this.sortDesc = false;
            this.currentPage = 1;
            this.lastPage = false;
            // only send search request if no queryThreshold is defined or the filter is empty or the filter has at least the same number of chars as queryThreshold
            if (!this.queryThreshold || !this.filter.length || this.filter.length >= this.queryThreshold) {
                this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, null, 1);
            }
        },
        clear () {
            this.filter = '';
            this.sortBy = null;
            this.sortDesc = false;
            this.currentPage = 1;

            this.loadGrid('true', this.displayFields, null, 1);
        },
        resourceClicked (item) {
            if (this.userCanUpdate) {
                this.$router.push({
                    name: 'EditResource',
                    params: {
                        resourceType: this.resource,
                        resourceName: this.name,
                        resourceId: item._id
                    }
                });
            } else {
                this.displayNotification('error', this.$t('pages.access.unableToEditResource', { resource: this.name }));
            }
        },
        plural (txt) {
            return pluralize(txt);
        }
    }
};
</script>

<style lang="scss" scoped>
    ::v-deep {
        .fr-resource-paginator {
            a[role="menuitemradio"] {
                display: none !important;
            }
        }

        .card-body {
            padding: 0;
            border-width: 0;
            overflow: auto;
        }

        .spinner-large {
            width: 10rem;
            height: 10rem;
        }

        .hide-header > thead {
            display:none !important;
        }
    }

    .input-group {
        & > .input-group-prepend {
            .input-group-text.inset,
            .btn.inset {
                border-right-color: transparent;
            }
        }

        & > .input-group-append {
            .input-group-text.inset,
            .btn.inset {
                border-left-color: transparent;
            }
        }

        & > .form-control {
            &.inset-left:not(:first-child) {
                border-left-color: transparent;
            }

            &.inset-right:not(:first-child) {
                border-right-color: transparent;
            }
        }

        .btn.clear {
            opacity: 1;
            color: $gray-500;
            background-color: $input-bg;

            &.disabled > i {
                color: transparent;
                border-width: 0;
            }
        }
    }
</style>
