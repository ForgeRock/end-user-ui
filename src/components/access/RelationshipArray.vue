<!--
Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <div class="card mt-3">
        <div v-show="!relationshipArrayProperty.isReadOnly" class="px-4 py-2">
            <b-row>
                <b-col md="7" class="my-1">
                    <b-btn
                        type="button"
                        variant="primary"
                        class="mr-1"
                        @click="openCreateModal"
                        :id="'add_' + relationshipArrayProperty.key">
                            <i class="fa fa-plus mr-3"></i>{{$t("common.form.new")}} {{relationshipArrayProperty.title}}
                    </b-btn>
                    <b-button
                        v-show="selected.length > 0"
                        variant="outline-primary"
                        @click="$bvModal.show(removeModalId)"
                        :id="'delete_' + relationshipArrayProperty.key">
                            <i class="fa fa-trash mr-3"></i>{{$t("common.form.remove")}}
                    </b-button>
                </b-col>
                <b-col v-if="showFilter" md="5" class="my-1">
                    <div class="d-flex">
                        <b-input-group>
                            <b-input-group-prepend>
                                <div class="input-group-text inset">
                                    <i class='fa fa-search'></i>
                                </div>
                            </b-input-group-prepend>
                            <b-form-input v-model="filter" @keyup.native.enter="search" :placeholder="this.$t('pages.access.typeAndEnterToSearch')" class="inset-left inset-right"></b-form-input>
                            <b-input-group-append>
                                <b-btn variant="outline-default" :disabled="!filter" @click="clear" class="inset clear"><i class="fa fa-times-circle"></i></b-btn>
                            </b-input-group-append>
                        </b-input-group>
                    </div>
                </b-col>
            </b-row>
        </div>

        <b-table
            show-empty
            ref="relationshipArrayGrid"
            table-responsive
            stacked="lg"
            :fields="columns"
            :items="gridData"
            :per-page="0"
            :hover="tableHover"
            :no-local-sorting="true"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :sort-direction="sortDirection"
            class="mb-0"
            :selectable="!relationshipArrayProperty.isReadOnly"
            selected-variant="active"
            @row-clicked="resourceClicked"
            @row-selected="onRowSelected"
            @sort-changed="sortingChanged"
            :class="[{'hide-header': !gridData.length }]">
                <template slot="HEAD_selected">
                    <div
                        v-show="gridData.length > 0"
                        class="cursor-pointer"
                        @click="toggleSelectAll">
                            <b-form-checkbox class="pl-4" disabled v-model="allRowsSelected"/>
                    </div>
                </template>
                <template v-slot:cell(selected)="data">
                    <b-form-checkbox
                        class="pl-4"
                        :id="'rowSelectCheckbox_' + relationshipArrayProperty.key + data.index"
                        @change="onCheckboxClicked(data)"
                        v-model="data.rowSelected"/>
                </template>
                <template v-slot:cell(_relationshipDetails)="data">
                    <div class="media cursor-pointer">
                        <div class="media-body">
                            <div class="text-bold">{{data.value[0]}}</div>
                            <div>
                                <span
                                    v-for="(display, index) in data.value"
                                    :key="`displayField_${display}_${index}`"
                                    v-show="index !== 0"
                                    class="pr-1 text-muted">
                                        {{display}}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
        </b-table>

        <div v-show="gridData.length" class="card-footer py-2">
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
        <b-modal
            :id="createModalId"
            :ref="createModalId"
            :title="'Add ' + relationshipArrayProperty.title">

            <fr-relationship-edit
                :relationshipProperty='relationshipArrayProperty'
                :index="0"
                :setValue="addNewRelationship" />

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn
                        variant="outline-secondary mr-2"
                        @click="$bvModal.hide(createModalId)">
                            {{$t('common.form.cancel')}}
                    </b-btn>
                    <b-btn
                        type="button"
                        variant="primary"
                        :id="`save_new_${relationshipArrayProperty.key}`"
                        @click="saveNewRelationships"
                        :disabled="newRelationships.length === 0">
                            {{$t('common.form.save')}}
                    </b-btn>
                </div>
            </div>
        </b-modal>

        <b-modal
            :id="removeModalId"
            :ref="removeModalId"
            :title="$t('pages.access.removeModalTitle')">
                <div>
                    {{$t('pages.access.removeConfirm')}} {{relationshipArrayProperty.title}}?
                </div>
                <div slot="modal-footer" class="w-100">
                    <div class="float-right">
                        <b-btn variant="btn-link text-danger mr-2" @click="$bvModal.hide(removeModalId)">{{$t('common.form.cancel')}}</b-btn>
                        <b-btn type="button" variant="danger" @click="removeRelationships">{{$t('common.form.remove')}}</b-btn>
                    </div>
                </div>
        </b-modal>
    </div>
</template>

<script>
import {
    find,
    toArray,
    pick,
    times,
    map,
    has,
    isNull
} from 'lodash';
import pluralize from 'pluralize';
import RelationshipEdit from '@/components/access/RelationshipEdit';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

export default {
    name: 'RelationshipArray',
    components: {
        'fr-relationship-edit': RelationshipEdit
    },
    mixins: [
        ResourceMixin
    ],
    props: {
        parentId: {
            type: String,
            required: true
        },
        relationshipArrayProperty: {
            type: Object,
            required: true
        },
        parentResource: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            gridPageSize: 10,
            allRowsSelected: false,
            tableHover: true,
            gridData: [],
            columns: [],
            currentPage: 1,
            sortBy: null,
            sortDesc: false,
            filter: '',
            lastPage: false,
            sortDirection: 'asc',
            createModalId: `create_${this.relationshipArrayProperty.propName}_modal`,
            removeModalId: `delete_${this.relationshipArrayProperty.propName}_modal`,
            newRelationships: [],
            selected: [],
            showFilter: false
        };
    },
    mounted () {
        this.loadGrid(1);
    },
    methods: {
        loadGrid (page) {
            const idmInstance = this.getRequestService(),
                doLoad = (resourceCollectionSchema) => {
                    /* istanbul ignore next */
                    idmInstance.get(this.buildGridUrl(page, resourceCollectionSchema)).then((resourceData) => {
                        if (resourceData.data.pagedResultsCookie) {
                            this.lastPage = false;
                        } else {
                            this.lastPage = true;
                        }

                        if (!this.relationshipArrayProperty.isReadOnly) {
                            this.columns.push({
                                key: 'selected',
                                label: '',
                                class: 'checkbox-column'
                            });
                        }

                        if (resourceCollectionSchema) {
                            this.relationshipArrayProperty.items.resourceCollection[0].query.fields.forEach((fieldName) => {
                                this.columns.push({
                                    key: fieldName,
                                    label: resourceCollectionSchema.properties[fieldName].title || pluralize.singular(fieldName),
                                    sortable: true,
                                    sortDirection: 'desc'
                                });
                            });
                        } else {
                            this.columns.push({
                                key: '_relationshipDetails',
                                label: pluralize.singular(this.relationshipArrayProperty.title)
                            });
                        }

                        this.gridData = [];
                        this.setGridData(resourceData.data.result, this.relationshipArrayProperty);
                    }).catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
                };

            if (has(this.relationshipArrayProperty, 'items.resourceCollection') && this.relationshipArrayProperty.items.resourceCollection.length === 1) {
                this.getSchema(this.relationshipArrayProperty.items.resourceCollection[0].path).then((response) => {
                    this.showFilter = true;
                    doLoad(response.data);
                });
            } else {
                doLoad();
            }
        },
        setGridData (relationships, schema) {
            relationships.forEach((relationship) => {
                let resourceCollectionSchema = find(schema.items.resourceCollection, { path: relationship._refResourceCollection });

                relationship._relationshipDetails = toArray(pick(relationship, resourceCollectionSchema.query.fields));

                this.gridData.push(relationship);
            });
        },
        buildGridUrl (page, resourceCollectionSchema) {
            let resourceUrl = `${this.parentResource}/${this.parentId}/${this.relationshipArrayProperty.propName}?_pageSize=${this.gridPageSize}&_fields=`;

            if (this.filter) {
                resourceUrl = `${resourceUrl}&_queryFilter=${this.generateSearch(this.filter, this.relationshipArrayProperty.items.resourceCollection[0].query.fields, resourceCollectionSchema.properties)}`;
            } else {
                resourceUrl = `${resourceUrl}&_queryFilter=true`;
            }

            if (page > 1) {
                // Pagination starts at 1 and we need to go back an additional one to get the previous page
                let offsetCalc = (page - 1) * this.gridPageSize;

                resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
            }

            if (this.sortBy) {
                let sortUrl = null;

                if (!isNull(this.sortBy)) {
                    if (this.sortDesc) {
                        sortUrl = `${this.sortBy}`;
                    } else {
                        sortUrl = `-${this.sortBy}`;
                    }
                }

                resourceUrl = `${resourceUrl}&_sortKeys=${sortUrl}`;
            }

            return resourceUrl;
        },
        paginationChange (page) {
            /* istanbul ignore next */
            this.currentPage = page;
            this.loadGrid(page);
        },
        resourceClicked (item) {
            this.$router.push({
                name: 'EditResource',
                params: {
                    resourceType: item._refResourceCollection.split('/')[0],
                    resourceName: item._refResourceCollection.split('/')[1],
                    resourceId: item._refResourceId
                }
            });
        },
        openCreateModal () {
            this.$bvModal.show(this.createModalId);
            this.newRelationships = [];
        },
        addNewRelationship (property, value) {
            if (value) {
                this.newRelationships.push(value);
            }
        },
        onRowSelected (items) {
            this.selected = items;

            this.allRowsSelected = items.length === this.gridPageSize;
        },
        toggleSelectAll () {
            const grid = this.$refs.relationshipArrayGrid;

            this.allRowsSelected = !this.allRowsSelected;

            if (!this.allRowsSelected) {
                grid.selectedRows = [];
            } else {
                grid.selectedRows = times(this.gridPageSize, () => { return true; });
            }
        },
        saveNewRelationships () {
            this.updateRelationship('add', this.newRelationships);
        },
        removeRelationships () {
            let relationshipsToRemove = [];
            const requiredProps = ['_ref', '_refResourceCollection', '_refResourceId', '_refProperties'];

            this.selected.forEach((relationship) => {
                if (relationship) {
                    relationshipsToRemove.push(pick(relationship, requiredProps));
                }
            });

            this.updateRelationship('remove', relationshipsToRemove);
        },
        updateRelationship (operation, items) {
            const patchArray = map(items, (item) => {
                    if (operation === 'remove') {
                        return {
                            operation: 'remove',
                            field: '/' + this.relationshipArrayProperty.propName,
                            value: item
                        };
                    } else {
                        return {
                            operation: 'add',
                            field: '/' + this.relationshipArrayProperty.propName + '/-',
                            value: item
                        };
                    }
                }),
                translation = operation === 'remove' ? 'pages.access.successRemoved' : 'pages.access.successAdded',
                idmInstance = this.getRequestService(),
                loadAndCloseModal = () => {
                    let modal = operation === 'remove' ? this.removeModalId : this.createModalId;
                    this.loadGrid(1);
                    this.$bvModal.hide(modal);
                };

            /* istanbul ignore next */
            idmInstance.patch(`${this.parentResource}/${this.parentId}`, patchArray).then(() => {
                loadAndCloseModal();
                this.displayNotification('success', this.$t(translation, { resource: this.relationshipArrayProperty.title }));
            })
                .catch((error) => {
                    loadAndCloseModal();
                    this.displayNotification('error', error.response.data.message);
                });
        },
        /**
         * Repulls data based on new sort, and returns table to first page
         *
         * @param {object} sort - Required object containing sort metadata
         */
        sortingChanged (sort) {
            this.currentPage = 1;
            this.sortBy = sort.sortBy;
            this.sortDesc = sort.sortDesc;

            this.loadGrid(1);
        },
        /**
         * Reloads data after search box filter text is cleared
         */
        clear () {
            this.filter = '';
            this.sortBy = null;
            this.sortDesc = false;
            this.currentPage = 1;

            this.loadGrid(1);
        },
        /**
         * Repulls data based on input search box text
         */
        search () {
            if (this.filter === '') {
                this.clear();
                return;
            }
            this.sortBy = null;
            this.sortDesc = false;
            this.currentPage = 1;

            this.loadGrid(1);
        },
        onCheckboxClicked (row) {
            if (!row.rowSelected) {
                this.$refs.relationshipArrayGrid.selectRow(row.index);
            } else {
                this.$refs.relationshipArrayGrid.unselectRow(row.index);
            }
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

        .checkbox-column {
            width: 1px;
            padding-right: 0px;
            vertical-align: middle;
        }

        .cursor-pointer {
            cursor: pointer;
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
