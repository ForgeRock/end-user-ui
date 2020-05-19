<template>
    <div>
        <b-form-group
            v-if="showResourceType"
            :label-cols="isRelationshipArray || newResource ? 11 : 0"
            :label="relationshipProperty.title + ' Type'"
            :label-for="'editResourceType' +index"
            horizontal
        >
            <Multiselect
                :value="resourceCollection"
                :options="rescourceCollectionTypes"
                open-direction="below"
                :show-labels="false"
                label="label"
                track-by="label"
                @select="setResourceCollectionType"
            >
                <template
                    slot="option"
                    slot-scope="props"
                >
                    {{ props.option.text }}
                </template>
            </Multiselect>
        </b-form-group>

        <b-form-group
            :label-cols="isRelationshipArray || newResource ? 11 : 0"
            :label="relationshipProperty.title"
            label-for="relationshipProperty.key"
            horizontal
        >
            <Multiselect
                :id="relationshipProperty.key + index"
                v-model="selected"
                :options="options"
                :placeholder="'Type to search for ' + resourceCollection.label"
                open-direction="bottom"
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
                :show-no-options="false"
                @search-change="debounceHandleSearchChange"
                @select="setSelected"
                @open="setSelected"
            >
                <template
                    slot="singleLabel"
                    slot-scope="props"
                >
                    <div class="media">
                        <div class="media-body">
                            <div class="text-bold">{{ props.option.resource[props.option.displayFields[0]] }}</div>
                            <div>
                                <span
                                    v-for="(displayField, idx) in props.option.displayFields"
                                    v-show="idx !== 0"
                                    :key="`displayField_${displayField}_${idx}`"
                                    class="pr-1 text-muted"
                                >
                                    {{ props.option.resource[displayField] }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
                <template
                    slot="tag"
                    slot-scope="props"
                    class="mb-3"
                >
                    <div class="media">
                        <div class="media-body p-1 border-bottom border-light">
                            <div class="text-bold">{{ props.option.resource[props.option.displayFields[0]] }}</div>
                            <div>
                                <span
                                    v-for="(displayField, idx) in props.option.displayFields"
                                    v-show="idx !== 0"
                                    :key="`displayField_${displayField}_${idx}`"
                                    class="pr-1 text-muted"
                                >
                                    {{ props.option.resource[displayField] }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
                <template
                    slot="option"
                    slot-scope="props"
                >
                    <div class="media">
                        <div class="media-body">
                            <div class="text-bold">{{ props.option.resource[props.option.displayFields[0]] }}</div>
                            <div>
                                <span
                                    v-for="(displayField, idx) in props.option.displayFields"
                                    v-show="idx !== 0"
                                    :key="`displayField_${displayField}_${idx}`"
                                    class="pr-1 text-muted"
                                >
                                    {{ props.option.resource[displayField] }}
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
import { map, each, find, has, debounce } from "lodash";
import Multiselect from "vue-multiselect";

export default {
    "name": "RelationshipEdit",
    // eslint-disable-next-line sort-keys
    "components": {
        Multiselect
    },
    data () {
        return {
            "debounceHandleSearchChange": debounce(this.handleSearchChange, 1000),
            "isLoading": false,
            "isRelationshipArray": false,
            "loading": true,
            "name": "",
            "options": [],
            "rescourceCollectionPath": "",
            "rescourceCollectionTypes": [],
            "resourceCollection": {},
            "resourceCollections": [],
            "selected": null,
            "showResourceType": false
        };
    },
    "methods": {
        handleSearchChange (query) {
            this.setOptions(query);
        },
        setOptions (query) {
            const displayFields = this.resourceCollection.query.fields,
                maxPageSize = 10;
            let queryFilter = true;

            this.options = [];

            if (!query && !this.selected && this.value) {
                // eslint-disable-next-line no-underscore-dangle
                this.selected = { displayFields, "resource": this.value, "value": this.value._ref };
            }

            if (query) {
                this.isLoading = true;
                queryFilter = map(displayFields, (field) => `/${field} sw "${query}"`).join(" or ");

                const idmInstance = this.getRequestService(),
                    urlQuery = `?_sortKeys=${this.resourceCollection.query.fields[0]}&_pageSize=${maxPageSize}&_fields=${displayFields.join(",")}&_queryFilter=${queryFilter}`;

                idmInstance.get(`${this.resourceCollection.path}${urlQuery}`).then((queryResults) => {
                    each(queryResults.data.result, (resource) => {
                        // eslint-disable-next-line no-underscore-dangle
                        this.options.push({ displayFields, resource, "value": `${this.resourceCollection.path}/${resource._id}` });
                    });
                    this.isLoading = false;
                }).
                    catch((error) => {
                        this.displayNotification("error", error.response.data.message);
                    });
            }
        },
        setResourceCollectionType (rescourceCollectionType) {
            const idmInstance = this.getRequestService();

            let index = 0;

            if (rescourceCollectionType) {
                ({ index } = rescourceCollectionType);
            }

            this.selected = null;

            // Set the default resourceCollection to the first resourceCollection
            this.resourceCollection = this.allResourceCollections[index];

            this.showResourceType = this.allResourceCollections.length > 1;

            /* istanbul ignore next */
            return idmInstance.get(`schema/${this.resourceCollection.path}`).then((schema) => {
                this.resourceCollection.schema = schema.data;
                this.setOptions();
            }).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        setSelected (selected) {
            if (selected.value) {
                this.selected = selected;

                this.setValue(this.relationshipProperty.key, { "_ref": selected.value });
            } else {
                this.selected = null;
                this.setValue(this.relationshipProperty.key, null);
            }
        }
    },
    mounted () {
        this.isRelationshipArray = has(this.relationshipProperty, "items");
        this.allResourceCollections = this.isRelationshipArray ? this.relationshipProperty.items.resourceCollection : this.relationshipProperty.resourceCollection;
        this.rescourceCollectionTypes = map(this.allResourceCollections, (prop, index) => ({ index, "text": prop.label, "value": prop.path }));

        if (this.value) {
            // eslint-disable-next-line no-underscore-dangle
            const currentResourceCollectionType = find(this.rescourceCollectionTypes, { "value": this.value._refResourceCollection });

            this.setResourceCollectionType(currentResourceCollectionType);
        } else {
            this.setResourceCollectionType();
        }
    },
    "props": {
        "index": {
            "required": true,
            "type": Number
        },
        "newResource": {
            "required": false,
            "type": Boolean
        },
        "parentResource": {
            "required": true,
            "type": String
        },
        "relationshipProperty": {
            "required": true,
            "type": Object
        },
        "setValue": {
            "required": true,
            "type": Function
        },
        "value": {
            "required": false,
            "type": Object
        }
    }
};
</script>
<style lang="scss" scoped>
@import "~vue-multiselect/dist/vue-multiselect.min.css";

/deep/ {
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
