<template>
    <b-container>
        <div class="card mt-4">
            <div class="card-header py-2">
                <b-row>
                    <b-col md="7" class="my-1">
                        <b-btn type="button" variant="primary"><i class="fa fa-plus mr-3"></i>{{$t("common.form.new")}} {{this.name}}</b-btn>
                    </b-col>
                    <b-col md="5" class="my-1">
                        <div class="d-flex">
                            <b-input-group>
                                <b-input-group-prepend>
                                    <div class="input-group-text inset">
                                        <i class='fa fa-search'></i>
                                    </div>
                                </b-input-group-prepend>
                                <b-form-input v-model="filter" @keyup.native.enter="search" placeholder="Type to Search" class="inset-left inset-right"></b-form-input>
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
                <b-pagination :total-rows="totalRows"
                              :per-page="perPage"
                              :limit="perPage"
                              align="center"
                              prev-text="<i class='fa fa-angle-left'></i>"
                              next-text="<i class='fa fa-angle-right'></i>"
                              first-text="<i class='fa fa-angle-double-left'></i>"
                              last-text="<i class='fa fa-angle-double-right'></i>"
                              v-model="currentPage"
                              @change="paginationChange"
                              class="my-0" /></b-pagination>
            </div>
        </div>
    </b-container>
</template>

<script>
    import _ from 'lodash';
    import axios from 'axios';

    export default {
        name: 'Access',
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
                totalRows: 0,
                sortBy: null,
                sortDesc: false,
                sortDirection: 'asc',
                filter: '',
                perPage: 10
            };
        },
        mounted () {
            this.loadData();
        },
        methods: {
            loadData () {
                const idmInstance = this.getRequestService();

                // TODO Add privilage check for create / query / read
                /* istanbul ignore next */
                axios.all([
                    idmInstance.get(`schema/${this.resource}/${this.name}`)]).then(axios.spread((schema) => {
                        _.each(schema.data.order, (orderProp) => {
                            if (this.columns.length <= 3 && orderProp !== '_id' && _.isUndefined(schema.data.properties[orderProp].encryption)) {
                                this.columns.push({
                                    key: orderProp,
                                    label: schema.data.properties[orderProp].title,
                                    sortable: true,
                                    sortDirection: 'desc'
                                });

                                this.displayFields.push(orderProp);
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
                    this.totalRows = resourceData.data.totalPagedResults;
                    this.gridData = resourceData.data.result;
                });
            },
            buildGridUrl (filter, fields, sortField, page) {
                let resourceUrl = `${this.resource}/${this.name}?_queryFilter=${filter}&_pageSize=${this.perPage}&_totalPagedResultsPolicy=EXACT`;

                if (!_.isNull(sortField)) {
                    resourceUrl = `${resourceUrl}&_sortKeys=${sortField}`;
                }

                if (fields.length) {
                    resourceUrl = `${resourceUrl}&_fields=${fields.join(',')}`;
                }

                if (page > 1) {
                    // Pagination starts at 1 and we need to go back an additional one to get the previous page
                    let offsetCalc = (page - 1) * this.perPage;

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
                this.loadGrid(this.generateSearch(this.filter, this.displayFields), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), 1);
            },
            paginationChange (page) {
                /* istanbul ignore next */
                this.loadGrid(this.generateSearch(this.filter, this.displayFields), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), page);
            },
            search () {
                this.sortBy = null;
                this.sortDesc = false;
                this.currentPage = 1;

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

                this.loadGrid(this.generateSearch(this.filter, this.displayFields), this.displayFields, null, 1);
            }
        }
    };
</script>

<style lang="scss" scoped>
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
