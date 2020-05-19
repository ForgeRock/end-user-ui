<template>
    <div class="card mt-3">
        <div v-show="!relationshipArrayProperty.isReadOnly" class="px-4 py-2">
            <b-row>
                <b-col md="7" class="my-1">
                    <b-btn
                        :id="'add_' + relationshipArrayProperty.key"
                        type="button"
                        variant="primary"
                        class="mr-1"
                        @click="openCreateModal"
                    >
                        <i class="fa fa-plus mr-3" />{{ $t("common.form.new") }} {{ relationshipArrayProperty.title }}
                    </b-btn>
                    <b-button
                        v-show="selected.length > 0"
                        :id="'delete_' + relationshipArrayProperty.key"
                        variant="outline-primary"
                        @click="$bvModal.show(removeModalId)"
                    >
                        <i class="fa fa-trash mr-3" />{{ $t("common.form.remove") }}
                    </b-button>
                </b-col>
            </b-row>
        </div>

        <b-table
            ref="relationshipArrayGrid"
            show-empty
            table-responsive
            stacked="lg"
            :fields="columns"
            :items="gridData"
            :per-page="0"
            :hover="tableHover"
            :no-local-sorting="true"
            class="mb-0"
            :selectable="!relationshipArrayProperty.isReadOnly"
            selected-variant="active"
            @row-selected="onRowSelected"
        >
            <template slot="HEAD_selected">
                <div
                    v-show="gridData.length > 0"
                    class="cursor-pointer"
                    @click="toggleSelectAll"
                >
                    <b-form-checkbox v-model="allRowsSelected" class="pl-4" disabled />
                </div>
            </template>
            <template v-slot:cell(selected)="data">
                <b-form-checkbox
                    :id="'rowSelectCheckbox_' + relationshipArrayProperty.key + data.index"
                    v-model="data.rowSelected"
                    class="pl-4"
                    disabled
                />
            </template>
            <template v-slot:cell(_relationshipDetails)="data">
                <div class="media cursor-pointer" @click="resourceClicked(data.item)">
                    <div class="media-body">
                        <div class="text-bold">{{ data.value[0] }}</div>
                        <div>
                            <span
                                v-for="(display, index) in data.value"
                                v-show="index !== 0"
                                :key="`displayField_${display}_${index}`"
                                class="pr-1 text-muted"
                            >
                                {{ display }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </b-table>

        <div v-show="gridData.length" class="card-footer py-2">
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
        <b-modal
            :id="createModalId"
            :ref="createModalId"
            :title="'Add ' + relationshipArrayProperty.title"
        >
            <fr-relationship-edit
                :parent-resource="parentResource"
                :relationship-property="relationshipArrayProperty"
                :index="0"
                :set-value="addNewRelationship"
            />

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn
                        variant="outline-secondary mr-2"
                        @click="$bvModal.hide(createModalId)"
                    >
                        {{ $t('common.form.cancel') }}
                    </b-btn>
                    <b-btn
                        :id="`save_new_${relationshipArrayProperty.key}`"
                        type="button"
                        variant="primary"
                        :disabled="newRelationships.length === 0"
                        @click="saveNewRelationships"
                    >
                        {{ $t('common.form.save') }}
                    </b-btn>
                </div>
            </div>
        </b-modal>

        <b-modal
            :id="removeModalId"
            :ref="removeModalId"
            :title="$t('pages.access.removeModalTitle')"
        >
            <div>
                {{ $t('pages.access.removeConfirm') }} {{ relationshipArrayProperty.title }}?
            </div>
            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn variant="btn-link text-danger mr-2" @click="$bvModal.hide(removeModalId)">{{ $t('common.form.cancel') }}</b-btn>
                    <b-btn type="button" variant="danger" @click="removeRelationships">{{ $t('common.form.remove') }}</b-btn>
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
    map
} from "lodash";
import pluralize from "pluralize";
import RelationshipEdit from "./RelationshipEdit";

export default {
    "name": "RelationshipArray",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-relationship-edit": RelationshipEdit
    },
    data () {
        return {
            "allRowsSelected": false,
            "columns": [],
            "createModalId": `create_${this.relationshipArrayProperty.propName}_modal`,
            "currentPage": 1,
            "gridData": [],
            "gridPageSize": 10,
            "lastPage": false,
            "newRelationships": [],
            "removeModalId": `delete_${this.relationshipArrayProperty.propName}_modal`,
            "selected": [],
            "tableHover": true
        };
    },
    "methods": {
        addNewRelationship (property, value) {
            if (value) {
                this.newRelationships.push(value);
            }
        },
        buildGridUrl (page) {
            let resourceUrl = `${this.parentResource}/${this.parentId}/${this.relationshipArrayProperty.propName}?_queryFilter=true&_pageSize=${this.gridPageSize}&_fields=`;

            if (page > 1) {
                // Pagination starts at 1 and we need to go back an additional one to get the previous page
                const offsetCalc = (page - 1) * this.gridPageSize;

                resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
            }

            return resourceUrl;
        },
        loadGrid (page) {
            const idmInstance = this.getRequestService();

            /* istanbul ignore next */
            idmInstance.get(this.buildGridUrl(page)).then((resourceData) => {
                this.lastPage = Boolean(!resourceData.data.pagedResultsCookie);

                if (!this.relationshipArrayProperty.isReadOnly) {
                    this.columns.push({
                        "class": "checkbox-column",
                        "key": "selected",
                        "label": ""
                    });
                }

                this.columns.push({
                    "key": "_relationshipDetails",
                    "label": pluralize.singular(this.relationshipArrayProperty.title)
                });

                this.gridData = [];
                this.setGridData(resourceData.data.result, this.relationshipArrayProperty);
            }).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        onRowSelected (items) {
            this.selected = items;

            this.allRowsSelected = items.length === this.gridPageSize;
        },
        openCreateModal () {
            this.$bvModal.show(this.createModalId);
            this.newRelationships = [];
        },
        paginationChange (page) {
            /* istanbul ignore next */
            this.currentPage = page;
            this.loadGrid(page);
        },
        removeRelationships () {
            const relationshipsToRemove = [],
                requiredProperties = ["_ref", "_refResourceCollection", "_refResourceId", "_refProperties"];

            this.selected.forEach((relationship) => {
                if (relationship) {
                    relationshipsToRemove.push(pick(relationship, requiredProperties));
                }
            });

            this.updateRelationship("remove", relationshipsToRemove);
        },
        resourceClicked (item) {
            this.$router.push({
                "name": "EditResource",
                "params": {
                    // eslint-disable-next-line no-underscore-dangle
                    "resourceId": item._refResourceId,
                    // eslint-disable-next-line no-underscore-dangle
                    "resourceName": item._refResourceCollection.split("/")[1],
                    // eslint-disable-next-line no-underscore-dangle
                    "resourceType": item._refResourceCollection.split("/")[0]
                }
            });
        },
        saveNewRelationships () {
            this.updateRelationship("add", this.newRelationships);
        },
        setGridData (relationships, schema) {
            relationships.forEach((relationship) => {
                // eslint-disable-next-line no-underscore-dangle
                const resourceCollectionSchema = find(schema.items.resourceCollection, { "path": relationship._refResourceCollection });

                // eslint-disable-next-line no-underscore-dangle
                relationship._relationshipDetails = toArray(pick(relationship, resourceCollectionSchema.query.fields));

                this.gridData.push(relationship);
            });
        },
        toggleSelectAll () {
            const grid = this.$refs.relationshipArrayGrid;

            this.allRowsSelected = !this.allRowsSelected;
            grid.selectedRows = this.allRowsSelected ? times(this.gridPageSize, () => true) : [];
        },
        updateRelationship (operation, items) {
            const patchArray = map(items, (item) => {
                    if (operation === "remove") {
                        return {
                            "field": `/${this.relationshipArrayProperty.propName}`,
                            "operation": "remove",
                            "value": item
                        };
                    }
                    return {
                        "field": `/${this.relationshipArrayProperty.propName}/-`,
                        "operation": "add",
                        "value": item
                    };
                }),
                translation = operation === "remove" ? "pages.access.successRemoved" : "pages.access.successAdded",
                // eslint-disable-next-line sort-vars
                idmInstance = this.getRequestService(),
                // eslint-disable-next-line sort-vars
                loadAndCloseModal = () => {
                    const modal = operation === "remove" ? this.removeModalId : this.createModalId;
                    this.loadGrid(1);
                    this.$bvModal.hide(modal);
                };

            /* istanbul ignore next */
            idmInstance.patch(`${this.parentResource}/${this.parentId}`, patchArray).then(() => {
                loadAndCloseModal();
                this.displayNotification("success", this.$t(translation, { "resource": this.relationshipArrayProperty.title }));
            }).
                catch((error) => {
                    loadAndCloseModal();
                    this.displayNotification("error", error.response.data.message);
                });
        }
    },
    mounted () {
        this.loadGrid(1);
    },
    "props": {
        "parentId": {
            "required": true,
            "type": String
        },
        "parentResource": {
            "required": true,
            "type": String
        },
        "relationshipArrayProperty": {
            "required": true,
            "type": Object
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

        .checkbox-column {
            width: 1px;
            padding-right: 0px;
            vertical-align: middle;
        }

        .cursor-pointer {
            cursor: pointer;
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
