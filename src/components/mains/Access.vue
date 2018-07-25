<template>
    <b-container>
        <div class="card mt-4">
            <div class="card-header py-2">
                <b-row>
                    <b-col md="7" class="my-1">
                        <b-btn v-if="createProperties.length > 0" type="button" variant="primary" v-b-modal.createResourceModal><i class="fa fa-plus mr-3"></i>{{$t("common.form.new")}} {{this.name}}</b-btn>
                    </b-col>
                    <b-col md="5" class="my-1">
                        <div class="d-flex">
                            <b-input-group>
                                <b-input-group-prepend>
                                    <div class="input-group-text inset">
                                        <i class='fa fa-search'></i>
                                    </div>
                                </b-input-group-prepend>
                                <b-form-input v-model="filter" @keyup.native.enter="search" :placeholder="this.$t('pages.access.typeSearch')" class="inset-left inset-right"></b-form-input>
                                <b-input-group-append>
                                    <b-btn variant="outline-default" :disabled="!filter" @click="clear" class="inset clear"><i class="fa fa-times-circle"></i></b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </div>
                    </b-col>
                </b-row>
            </div>
            <b-table show-empty
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
                     @sort-changed="sortingChanged">
                     <!-- @row-clicked="onRowClicked" -->
            </b-table>
            <div class="card-footer py-2">
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
    import axios from 'axios';
    import CreateResource from '@/components/access/CreateResource';

    export default {
        name: 'Access',
        components: {
            'fr-create-resource': CreateResource
        },
        data () {
            return {
                name: this.$route.params.resourceName,
                resource: this.$route.params.resourceType,
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
                createProperties: []
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
                    idmInstance.get(`schema/${this.resource}/${this.name}`),
                    idmInstance.get(`privilege/${this.resource}/${this.name}`)]).then(axios.spread((schema, privilege) => {
                        // Generate columns for display and filtering for read/query
                        _.each(privilege.data.read, (readProp) => {
                            if (this.columns.length <= 3 && _.isUndefined(schema.data.properties[readProp.attribute].encryption)) {
                                this.columns.push({
                                    key: readProp.attribute,
                                    label: schema.data.properties[readProp.attribute].title,
                                    sortable: true,
                                    sortDirection: 'desc'
                                });

                                this.displayFields.push(readProp.attribute);
                            }
                        });

                        // Generate create list for create resource dialog
                        _.each(privilege.data.create, (createProp) => {
                            if (createProp.readOnly === false) {
                                if (schema.data.properties[createProp.attribute].type === 'string' || schema.data.properties[createProp.attribute].type === 'number' || schema.data.properties[createProp.attribute].type === 'boolean') {
                                    schema.data.properties[createProp.attribute].key = createProp.attribute;

                                    _.each(schema.data.required, (requiredKey) => {
                                        if (requiredKey === schema.data.properties[createProp.attribute].key) {
                                            schema.data.properties[createProp.attribute].required = true;
                                        }
                                    });

                                    this.createProperties.push(schema.data.properties[createProp.attribute]);
                                }
                            }
                        });

                        this.loadGrid('true', this.displayFields, null, 1);
                    }))
                    .catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
            },
            loadGrid (filter, fields, sortField, page) {
                const idmInstance = this.getRequestService();

                /* istanbul ignore next */
                idmInstance.get(this.buildGridUrl(filter, fields, sortField, page)).then((resourceData) => {
                    // this.totalRows = resourceData.data.totalPagedResults;
                    if (resourceData.data.pagedResultsCookie) {
                        this.lastPage = false;
                    } else {
                        this.lastPage = true;
                    }

                    this.gridData = resourceData.data.result;
                });
            },
            buildGridUrl (filter, fields, sortField, page) {
                let resourceUrl = `${this.resource}/${this.name}?_queryFilter=${filter}&_pageSize=10&_totalPagedResultsPolicy=EXACT`;

                if (!_.isNull(sortField)) {
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

                this.loadGrid(this.generateSearch(this.filter, this.displayFields), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), 1);
            },
            paginationChange (page) {
                /* istanbul ignore next */
                this.currentPage = page;
                this.loadGrid(this.generateSearch(this.filter, this.displayFields), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), page);
            },
            search () {
                this.sortBy = null;
                this.sortDesc = false;
                this.currentPage = 1;
                this.lastPage = false;

                this.loadGrid(this.generateSearch(this.filter, this.displayFields), this.displayFields, null, 1);
            },
            generateSearch (filter, displayFields) {
                let filterUrl = '';

                if (filter.length > 0) {
                    _.each(displayFields, (field, index) => {
                        if ((index + 1) < displayFields.length) {
                            filterUrl = `${filterUrl}${field}+sw+"${filter}"+OR+`;
                        } else {
                            filterUrl = `${filterUrl}${field}+sw+"${filter}"`;
                        }
                    });
                } else {
                    filterUrl = 'true';
                }

                return filterUrl;
            },
            clear () {
                this.filter = '';
                this.sortBy = null;
                this.sortDesc = false;
                this.currentPage = 1;

                this.loadGrid('true', this.displayFields, null, 1);
            }
        }
    };
</script>

<style lang="scss" scoped>
    /deep/ {
        .fr-resource-paginator {
            a[role="menuitemradio"] {
                display: none !important;
            }
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
