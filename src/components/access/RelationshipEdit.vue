<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <div>
        <b-form-group
            v-if="showResourceType"
            :label-cols="isRelationshipArray || newResource ? 11 : 0"
            :label="relationshipProperty.title + ' Type'"
            :label-for="'editResourceType' +index"
            horizontal>
                <Multiselect
                    :value="resourceCollection"
                    :options="rescourceCollectionTypes"
                    openDirection="below"
                    :show-labels="false"
                    label="label"
                    track-by="label"
                    @select="setResourceCollectionType">
                        <template
                            slot="option"
                            slot-scope="props">
                                {{ props.option.text }}
                        </template>
                </Multiselect>
        </b-form-group>

        <b-form-group
            :label-cols="isRelationshipArray || newResource ? 11 : 0"
            :label="relationshipProperty.title"
            label-for="relationshipProperty.key"
            horizontal>
                <Multiselect
                    v-model="selected"
                    :id="relationshipProperty.key + index"
                    :options="options"
                    :placeholder="searchPlaceholder"
                    openDirection="bottom"
                    :show-labels="false"
                    :searchable="true"
                    :loading="isLoading"
                    :internal-search="false"
                    :clear-on-select="false"
                    :multiple="isRelationshipArray"
                    :close-on-select="!isRelationshipArray"
                    :preserve-search="isRelationshipArray"
                    :options-limit="10"
                    :limit="10"
                    :max-height="600"
                    :show-no-results="false"
                    :hide-selected="true"
                    @search-change="debounceHandleSearchChange"
                    @select="setSelected"
                    @open="setSelected"
                    :show-no-options="false">
                        <template
                            slot="singleLabel"
                            slot-scope="props">
                                <div class="media">
                                    <div class="media-body">
                                        <div class="text-bold">{{props.option.resource[props.option.displayFields[0]]}}</div>
                                        <div>
                                            <span
                                                v-for="(displayField, index) in props.option.displayFields"
                                                :key="`displayField_${displayField}_${index}`"
                                                v-show="index !== 0"
                                                class="pr-1 text-muted">
                                                    {{props.option.resource[displayField]}}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </template>
                        <template
                            slot="tag"
                            slot-scope="props">
                                <div class="media">
                                    <div class="media-body p-1 border-bottom border-light">
                                        <div class="text-bold">{{props.option.resource[props.option.displayFields[0]]}}</div>
                                        <div>
                                            <span
                                                v-for="(displayField, index) in props.option.displayFields"
                                                :key="`displayField_${displayField}_${index}`"
                                                v-show="index !== 0"
                                                class="pr-1 text-muted">
                                                    {{props.option.resource[displayField]}}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </template>
                        <template
                            slot="option"
                            slot-scope="props">
                                <div class="media">
                                    <div class="media-body">
                                        <div class="text-bold">{{props.option.resource[props.option.displayFields[0]]}}</div>
                                        <div>
                                            <span
                                                v-for="(displayField, index) in props.option.displayFields"
                                                :key="`displayField_${displayField}_${index}`"
                                                v-show="index !== 0"
                                                class="pr-1 text-muted">
                                                    {{props.option.resource[displayField]}}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </template>
                </Multiselect>
        </b-form-group>
    </div>
</template>

<script>
import { map, each, find, has, debounce } from 'lodash';
import Multiselect from 'vue-multiselect';

export default {
    name: 'RelationshipEdit',
    components: {
        Multiselect
    },
    props: {
        relationshipProperty: {
            type: Object,
            required: true
        },
        value: {
            type: [Object, String],
            required: false
        },
        index: {
            type: Number,
            required: true
        },
        setValue: {
            type: Function,
            required: true
        },
        newResource: {
            type: Boolean,
            required: false
        }
    },
    data () {
        return {
            name: '',
            options: [],
            selected: null,
            showResourceType: false,
            resourceCollection: {},
            rescourceCollectionPath: '',
            rescourceCollectionTypes: [],
            isLoading: false,
            resourceCollections: [],
            isRelationshipArray: false,
            loading: true,
            debounceHandleSearchChange: debounce(this.handleSearchChange, 1000),
            queryThreshold: null
        };
    },
    mounted () {
        this.isRelationshipArray = has(this.relationshipProperty, 'items');

        this.allResourceCollections = this.isRelationshipArray ? this.relationshipProperty.items.resourceCollection : this.relationshipProperty.resourceCollection;

        this.rescourceCollectionTypes = map(this.allResourceCollections, (prop, index) => {
            return { value: prop.path, text: prop.label, index };
        });

        if (this.value) {
            const currentResourceCollectionType = find(this.rescourceCollectionTypes, { value: this.value._refResourceCollection });

            this.setResourceCollectionType(currentResourceCollectionType);
        } else {
            this.setResourceCollectionType();
        }
    },
    computed: {
        searchPlaceholder () {
            if (this.queryThreshold) {
                return this.$t('pages.access.typeAtLeastToSearchFor', { resource: this.resourceCollection.label, numChars: this.queryThreshold });
            }
            return this.$t('pages.access.typeToSearchFor', { resource: this.resourceCollection.label });
        }
    },
    methods: {
        setResourceCollectionType (rescourceCollectionType) {
            const managedObjectsSettings = this.$root.applicationStore.state.managedObjectsSettings;

            let index = 0,
                resourceCollectionObjectName;

            if (rescourceCollectionType) {
                index = rescourceCollectionType.index;
            }

            this.selected = null;

            // set the default resourceCollection to the first resourceCollection
            this.resourceCollection = this.allResourceCollections[index];

            this.showResourceType = this.allResourceCollections.length > 1;

            resourceCollectionObjectName = this.resourceCollection.path.split('/')[1];

            if (managedObjectsSettings && managedObjectsSettings[resourceCollectionObjectName]) {
                this.queryThreshold = managedObjectsSettings[resourceCollectionObjectName].minimumUIFilterLength;
            }

            /* istanbul ignore next */
            return this.getSchema(this.resourceCollection.path).then((schema) => {
                this.resourceCollection.schema = schema.data;
                this.setOptions();
            })
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
        },
        handleSearchChange (query) {
            this.setOptions(query);
        },
        setOptions (query) {
            const maxPageSize = 10,
                displayFields = this.resourceCollection.query.fields;
            let queryFilter = true;

            this.options = [];

            if (!query && !this.selected && this.value) {
                this.selected = { value: this.value._ref, resource: this.value, displayFields };
            }
            // send the request if there is a query and no queryThreshold or if the query's length is at least queryThreshold
            if ((query && !this.queryThreshold) || (query && query.length >= this.queryThreshold)) {
                this.isLoading = true;
                queryFilter = map(displayFields, (field) => { return `/${field} sw "${query}"`; }).join(' or ');

                const urlQuery = `?_sortKeys=${this.resourceCollection.query.fields[0]}&_pageSize=${maxPageSize}&_fields=${displayFields.join(',')}&_queryFilter=${queryFilter}`,
                    idmInstance = this.getRequestService();

                idmInstance.get(`${this.resourceCollection.path}${urlQuery}`).then((queryResults) => {
                    each(queryResults.data.result, (resource) => {
                        this.options.push({ value: this.resourceCollection.path + '/' + resource._id, resource, displayFields });
                    });
                    this.isLoading = false;
                })
                    .catch((error) => {
                        this.displayNotification('error', error.response.data.message);
                    });
            }
        },
        setSelected (selected) {
            if (selected.value) {
                this.selected = selected;

                this.setValue(this.relationshipProperty.key, { _ref: selected.value });
            } else {
                this.selected = null;
                this.setValue(this.relationshipProperty.key, null);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
@import "~vue-multiselect/dist/vue-multiselect.min";

::v-deep {
  .multiselect {
    color: $input-color;

    .multiselect__placeholder {
      position: relative;
      top: 5px;
      padding-top: 0;
    }

    .multiselect__tags {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .multiselect__select {
      top: 6px;
    }

    .multiselect__option--selected.multiselect__option--highlight {
      background-color: $primary;
    }

    .multiselect__option.multiselect__option--highlight {
      background-color: $light;
      color: $input-color;
    }

    .multiselect__single {
      position: relative;
      top: 4px;
    }

    .multiselect__input {
      position: relative;
      top: 3px;
    }

    .multiselect__spinner {
       margin-top: 8px;
    }

    .multiselect__spinner:after, .multiselect__spinner:before {
      border-top-color: $primary;
    }
  }
}
</style>
