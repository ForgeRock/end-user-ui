<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pt-2">
    <div :class="{ 'border-bottom': isValidJSONString(listValues) && isValidField() }">
      <div>
        <div v-if="!listValues || !listValues.length"
          class="d-flex pt-3 pb-3 px-0 border-top align-items-center">
          <div class="text-muted text-left flex-grow-1">
            ({{ $t('common.form.none') }})
          </div>
          <button class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
            data-testid="list-objects-none-add"
            :disabled="disabled" @click.prevent="addObjectToList(-1)">
            <i class="fa fa-plus"></i>
          </button>
        </div>
        <template v-if="isValidJSONString(listValues) && isValidField()">
          <div v-for="(obj, index) in listValues"
            :key="obj.listUniqueIndex"
            class="d-flex pt-3 pb-2 px-0 border-top">
            <div class="flex-grow-1 pr-3 position-relative">
              <div class="form-row align-items-center">
                <div v-for="(objValue, key) in obj"
                  :key="key"
                  class="col-lg-4 pb-2">
                  <div v-if="key !== 'listUniqueIndex'"
                    class="position-relative">
                    <div v-if="properties[key].type === 'boolean'">
                      <BFormCheckbox v-model="obj[key]"
                        :disabled="disabled"
                        :name="key + '_' + index"
                        @change="emitInput(listValues)">
                        {{ properties[key].title || key }}
                      </BFormCheckbox>
                    </div>
                    <div v-else-if="properties[key].type === 'number'">
                      <label :for="properties[key].title">{{ properties[key].title || key }}</label>
                      <small v-if="!properties[key].required" class="text-muted ml-1">{{ $t('pages.profile.editProfile.optional') }}</small>
                        <b-input
                          v-model.trim="obj[key]"
                          :disabled="disabled"
                          type="number"
                          :name="key + '_' + index"
                          @input="emitInput(listValues)" />
                    </div>
                    <div v-else>
                      <label :for="properties[key].title">{{ properties[key].title || key }}</label>
                      <small v-if="!properties[key].required" class="text-muted ml-1">{{ $t('pages.profile.editProfile.optional') }}</small>
                        <b-input
                          v-model.trim="obj[key]"
                          :disabled="disabled"
                          type="text"
                          :name="key + '_' + index"
                          @input="emitInput(listValues)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="position-relative d-inline-flex justify-content-end" style="width: 128px;">
                <button :data-testid="`list-objects-remove-${index}`" class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  :disabled="disabled" @click.prevent="removeElementFromList(index)">
                  <i class="fa fa-minus"></i>
                </button>
                <button v-if="multiValued || listValues.length === 0" :data-testid="`list-objects-add-${index}`"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0" :disabled="disabled"
                  @click.prevent="addObjectToList(index)">
                  <i class="fa fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </template>
        <div v-else>
          <FrInlineJsonEditor v-on="$listeners" language="json" :line-count="lineCount" :read-only="false"
            :value="advancedValue" @update-field="$emit('input', $event)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { BFormCheckbox } from 'bootstrap-vue';
import FrInlineJsonEditor from '@/components/utils/InlineJsonEditor';
import ListsMixin from '@/components/utils/mixins/ListsMixin';

/**
 * @description Component that provides support for list of objects
 *
 * Attempts to render list of obects. If the object contains complex properties (i.e. nested arrays or objects)
 * or is the array is not valid JSON, displays array of objects in code editor
 */
export default {
    name: 'ListOfObjects',
    components: {
        BFormCheckbox,
        FrInlineJsonEditor
    },
    mixins: [
        ListsMixin
    ],
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: ''
        },
        multiValued: {
            type: Boolean,
            default: true
        },
        properties: {
            type: Object,
            default: () => ({})
        },
        required: {
            type: Boolean,
            default: false
        },
        value: {
            type: [Array, Object, String],
            default: () => []
        }
    },
    data () {
        return {
            listValues: [],
            listUniqueIndex: 0
        };
    },
    computed: {
        advancedValue () {
            return this.listValues.map((val) => {
                delete val.listUniqueIndex;
                return val;
            });
        },
        requiredAndEmpty () {
            const filteredListValues = this.checkEmptyValues(this.listValues);
            return ((this.validation && this.validation.required) || (this.validation && this.validation.includes('required'))) && !filteredListValues.length;
        },
        fieldTitle () {
            if ((this.validation && this.validation.required) || (this.validation && this.validation.includes('required'))) {
                return this.capitalizedDescription;
            }
            return this.$t('common.optionalFieldTitle', { fieldTitle: this.capitalizedDescription });
        }
    },
    mounted () {
        if (this.value) {
            let listValues = cloneDeep(this.value);
            if (!this.multiValued) {
                listValues = [listValues];
            }
            listValues.forEach((val) => {
                val.listUniqueIndex = this.getUniqueIndex();
            });
            this.listValues = listValues;
        }
    },
    methods: {
        /**
         * populate list of objects with new member.  Set defaults for boolean and number properties
         */
        addObjectToList (valueIndex) {
            const emptyObjectWithKeys = this.createObject(this.properties);
            this.listValues.splice(valueIndex + 1, 0, { ...emptyObjectWithKeys, listUniqueIndex: this.getUniqueIndex() });
            this.emitInput(this.listValues);
        },
        emitInput (value) {
            const emitValue = this.checkEmptyValues(value);

            if (emitValue.length === 0) {
                this.$emit('input', this.multiValued ? [] : {});
            } else {
                this.$emit('input', this.multiValued ? emitValue : emitValue[0]);
            }
        },
        /**
         * Check if all the values in our object are empty or null
         * If nothing is left, delete the obj. This helps ensure required fields
         * actually have values present.
         */
        checkEmptyValues (value) {
            const filteredArray = cloneDeep(value);
            filteredArray.forEach((obj, index) => {
                delete obj.listUniqueIndex;
                const filteredVals = Object.values(obj).filter((x) => x !== null && x !== '');
                if (!filteredVals.length) {
                    filteredArray.splice(index, 1);
                }
            });
            return filteredArray;
        },
        /**
         * Ensures our keys in v-if iteration have unique values
         *
         * @returns {number} New unique index
         */
        getUniqueIndex () {
            this.listUniqueIndex += 1;
            return this.listUniqueIndex;
        },
        /**
         * determine whether any properties of an object in the array
         * are too complex to render (i.e. objects with sub object or array properties)
         */
        isValidField () {
            const values = Object.values(this.properties) || [],
                results = [];

            values.forEach((val) => {
                if (val.type && (val.type === 'array' || val.type === 'object')) {
                    results.push(false);
                }
                results.push(true);
            });

            return !results.includes(false);
        },
        /**
         * remove element from list component at index
         */
        removeElementFromList (index) {
            this.listValues.splice(index, 1);
            this.emitInput(this.listValues);
        }
    }
};
</script>
<style lang="scss">
.b-form-tags-button {
  display: none;
}
</style>
