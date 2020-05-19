<template>
    <b-container>
        <div class="card mt-4">
            <div class="card-header py-2">
                <b-row>
                    <b-col md="7" class="my-1">
                        <b-btn v-if="createProperties.length > 0" v-b-modal.createResourceModal type="button" variant="primary"><i class="fa fa-plus mr-3" />{{ $t("common.form.new") }} {{ name }}</b-btn>
                    </b-col>
                    <b-col md="5" class="my-1">
                        <div class="d-flex">
                            <b-input-group>
                                <b-input-group-prepend>
                                    <div class="input-group-text inset">
                                        <i class="fa fa-search" />
                                    </div>
                                </b-input-group-prepend>
                                <b-form-input v-model="filter" :placeholder="this.$t('pages.access.typeSearch')" class="inset-left inset-right" @keyup.native.enter="search" />
                                <b-input-group-append>
                                    <b-btn variant="outline-default" :disabled="!filter" class="inset clear" @click="clear"><i class="fa fa-times-circle" /></b-btn>
                                </b-input-group-append>
                            </b-input-group>
                        </div>
                    </b-col>
                </b-row>
            </div>
            <b-table
                show-empty
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
                :busy="isLoading"
                :class="[{'hide-header': isLoading }]"
                @row-clicked="resourceClicked"
                @sort-changed="sortingChanged"
            >
                <template v-slot:table-busy>
                    <div class="text-center p-5">
                        <b-spinner class="align-middle spinner-large text-primary my-4" />
                        <div>{{ $t("common.form.loading") }} {{ plural(name) }}...</div>
                    </div>
                </template>
            </b-table>
            <div v-if="!isLoading" class="card-footer py-2">
                <nav aria-label="Page navigation example">
                    <ul class="pagination justify-content-center mb-0">
                        <li :class="[{ disabled: currentPage === 1 }, 'page-item']" @click.prevent="currentPage === 1 ? '' : paginationChange(1)">
                            <a class="page-link" href="#"><i class="fa fa-angle-double-left" /></a>
                        </li>
                        <li :class="[{ disabled: currentPage === 1 }, 'page-item']" @click.prevent="currentPage === 1 ? '' : paginationChange(currentPage - 1)">
                            <a class="page-link" href="#"><i class="fa fa-angle-left" /></a>
                        </li>

                        <li :class="[{ disabled: lastPage }, 'page-item']" @click.prevent="lastPage ? '' : paginationChange(currentPage + 1)">
                            <a class="page-link" href="#"><i class="fa fa-angle-right" /></a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>

        <fr-create-resource v-if="createProperties.length > 0" :resource-name="name" :resource-type="resource" :create-properties="createProperties" @refreshGrid="clear" />
    </b-container>
</template>

<script>
import { each, includes, isNaN, isNull, isUndefined, toNumber } from "lodash";
import pluralize from "pluralize";
import axios from "axios";
import CreateResource from "./CreateResource";

/**
 * @description Controlling component for delegated admin, allows for listing available resources and connects to the create, delete and edit features.
 *
 * @fires GET schema/type/name/ (e.g. schema/managed/user) - Schema for a resource (e.g. managed/user schema)
 * @fires GET privilege/type/name/ (e.g. privilege/managed/user/) - Privileges for a resource (e.g. managed/user)
 * @fires GET resource/name?_queryFilter=filter&_pageSize=10 (e.g. managed/user?_queryFilter=true&_pageSize=10) -
 * List resource items, limited to 10 returned items and makes use of a query filter search if provided (defaults to queryFilter = true if none provided by the user).
 */
export default {
    "name": "Access",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-create-resource": CreateResource
    },
    data () {
        return {
            "columns": [],
            "createProperties": [],
            "currentPage": 1,
            "displayFields": [],
            "filter": "",
            "gridData": [],
            "isLoading": true,
            "isRowSelected": false,
            "lastPage": false,
            "name": this.$route.params.resourceName,
            "resource": this.$route.params.resourceType,
            "schemaProperties": {},
            "sortBy": null,
            "sortDesc": false,
            "sortDirection": "asc",
            "tableHover": true,
            "userCanUpdate": false
        };
    },
    "methods": {
        buildGridUrl (filter, fields, sortField, page) {
            let resourceUrl = `${this.resource}/${this.name}?_queryFilter=${filter}&_pageSize=10`;
            const sortBy = isNull(sortField) ? fields[0] : sortField;

            resourceUrl = `${resourceUrl}&_sortKeys=${sortBy}`;

            if (fields.length > 0) {
                resourceUrl = `${resourceUrl}&_fields=${fields.join(",")}`;
            }

            if (page > 1) {
                // Pagination starts at 1 and we need to go back an additional one to get the previous page
                const offsetCalc = (page - 1) * 10;

                resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
            }

            return resourceUrl;
        },
        calculateSort (sortDesc, sortBy) {
            let sortUrl = null;

            if (!isNull(sortBy)) {
                sortUrl = sortDesc ? `${sortBy}` : `-${sortBy}`;
            }

            return sortUrl;
        },
        clear () {
            this.filter = "";
            this.sortBy = null;
            this.sortDesc = false;
            this.currentPage = 1;

            this.loadGrid("true", this.displayFields, null, 1);
        },
        generateSearch (filter, displayFields, schemaProperties) {
            let filterEncoded = "",
                filterUrl = "";

            if (filter.length > 0) {
                filterEncoded = encodeURIComponent(filter);
                // eslint-disable-next-line max-statements
                each(displayFields, (field, index) => {
                    let type = "string";

                    if (!isUndefined(schemaProperties)) {
                        // eslint-disable-next-line prefer-destructuring
                        type = schemaProperties[field].type;
                    }

                    if (type === "number" && !isNaN(toNumber(filterEncoded))) {
                        // Search based on number and proper number value
                        if (index + 1 < displayFields.length) {
                            filterUrl = `${filterUrl}${field}+eq+ ${filterEncoded}+OR+`;
                        } else {
                            filterUrl = `${filterUrl}${field}+eq+ ${filterEncoded}`;
                        }
                    } else if (type === "boolean" && (filterEncoded === "true" || filterEncoded === "false")) {
                        // Search based on boolean and proper boolean true/false
                        if (index + 1 < displayFields.length) {
                            filterUrl = `${filterUrl}${field}+eq+ ${filterEncoded}+OR+`;
                        } else {
                            filterUrl = `${filterUrl}${field}+eq+ ${filterEncoded}`;
                        }
                        // Fallback to general string search if all other criteria fails
                    } else if (index + 1 < displayFields.length) {
                        filterUrl = `${filterUrl}${field}+sw+"${filterEncoded}"+OR+`;
                    } else {
                        filterUrl = `${filterUrl}${field}+sw+"${filterEncoded}"`;
                    }
                });
            } else {
                filterUrl = "true";
            }

            return filterUrl;
        },
        loadData () {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            axios.all([
                idmInstance.get(`schema/${this.resource}/${this.name}`),
                idmInstance.get(`privilege/${this.resource}/${this.name}`)
            ]).then(axios.spread((schema, privilege) => {
                if (privilege.data.VIEW.allowed) {
                    // Generate columns for display and filtering for read/query
                    each(privilege.data.VIEW.properties, (readProperty) => {
                        const propSchema = schema.data.properties[readProperty];
                        if (
                            this.columns.length <= 3 &&
                                    isUndefined(propSchema.encryption) &&
                                    includes(["string", "boolean", "number"], propSchema.type)
                        ) {
                            this.columns.push({
                                "key": readProperty,
                                "label": propSchema.title,
                                "sortDirection": "desc",
                                "sortable": true
                            });

                            this.displayFields.push(readProperty);
                        }
                    });
                }

                this.userCanUpdate = Boolean(privilege.data.UPDATE);
                this.schemaProperties = schema.data.properties;

                if (privilege.data.CREATE.allowed) {
                    // Generate create list for create resource dialog
                    each(privilege.data.CREATE.properties, (createProperty) => {
                        const propType = schema.data.properties[createProperty].type;
                        if (propType === "string" || propType === "number" || propType === "boolean" || propType === "relationship") {
                            schema.data.properties[createProperty].key = createProperty;

                            each(schema.data.required, (requiredKey) => {
                                if (requiredKey === schema.data.properties[createProperty].key) {
                                    schema.data.properties[createProperty].required = true;
                                }
                            });

                            this.createProperties.push(schema.data.properties[createProperty]);
                        }
                    });
                }

                this.loadGrid("true", this.displayFields, this.displayFields[0], 1);
            })).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        loadGrid (filter, fields, sortField, page) {
            const idmInstance = this.getRequestService();

            this.isLoading = true;

            /* istanbul ignore next */
            idmInstance.get(this.buildGridUrl(filter, fields, sortField, page)).then((resourceData) => {
                this.lastPage = Boolean(!resourceData.data.pagedResultsCookie);
                this.gridData = resourceData.data.result;
                this.isLoading = false;
            }).
                catch((error) => {
                    this.isLoading = false;
                    this.displayNotification("error", error.response.data.message);
                });
        },
        paginationChange (page) {
            /* istanbul ignore next */
            this.currentPage = page;
            this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), page);
        },
        plural (txt) {
            return pluralize(txt);
        },
        resourceClicked (item) {
            if (this.userCanUpdate) {
                this.$router.push({
                    "name": "EditResource",
                    "params": {
                        // eslint-disable-next-line no-underscore-dangle
                        "resourceId": item._id,
                        "resourceName": this.name,
                        "resourceType": this.resource
                    }
                });
            } else {
                this.displayNotification("error", this.$t("pages.access.unableToEditResource", { "resource": this.name }));
            }
        },
        search () {
            this.sortBy = null;
            this.sortDesc = false;
            this.currentPage = 1;
            this.lastPage = false;
            this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, null, 1);
        },
        sortingChanged (sort) {
            this.currentPage = 1;
            this.lastPage = false;

            this.loadGrid(this.generateSearch(this.filter, this.displayFields, this.schemaProperties), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), 1);
        }
    },
    mounted () {
        this.loadData();
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
