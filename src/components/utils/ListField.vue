<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div v-if="items && items.type && (items.type === 'string' || items.type === 'number' || items.type === 'boolean')"
      class="mb-4" :key="`managedResource${index}_bool`">
        <BFormTags
          v-bind="$attrs"
          v-on="$listeners"
          :disabled="disabled"
          :label="label"
          :value="value"
          placeholder=""
          tag-variant="primary">
        </BFormTags>
    </div>
    <div v-else-if="items && items.type && items.type === 'object'" class="mb-4" :key="`managedResource${index}_LoO`">
      <FrListOfObjects
        v-bind="$attrs"
        v-on="$listeners"
        :value="value"
        :disabled="disabled"
        :properties="items.properties"
        :label="label" />
    </div>
    <div v-else-if="items && items.type && items.type === 'array'" class="mb-4" :key="`managedResource${index}_LoL`">
      <FrListOfLists
        v-bind="$attrs"
        v-on="$listeners"
        :value="value"
        :disabled="disabled"
        :items="items"
        :label="label" />
    </div>
  </div>
</template>

<script>
import FrListOfLists from '@/components/utils/ListOfLists';
import FrListOfObjects from '@/components/utils/ListOfObjects';
import ListsMixin from '@/components/utils/mixins/ListsMixin';

export default {
    name: 'ListField',
    components: {
        FrListOfLists,
        FrListOfObjects
    },
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        index: {
            type: Number,
            default: () => 0
        },
        items: {
            type: [Array, Object],
            default: () => []
        },
        label: {
            type: String,
            default: ''
        },
        value: {
            type: [Array, String],
            default: () => []
        }
    },
    mixins: [
        ListsMixin
    ],
    computed: {
        inputValue () {
            if (this.$attrs.value === '') {
                return [];
            }
            return this.$attrs.value;
        }
    }
};
</script>
<style lang="scss">
  .b-form-tags-button {
    display: none;
  }
</style>
