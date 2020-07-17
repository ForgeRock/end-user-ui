<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <b-row>
    <b-col
      v-for="i in numColumns"
      :key="`password_policy_${i}`">
      <small>
        <ul class="pl-4 text-left">
          <li
            v-for="(policy) in policyColumns[i-1]"
            :key="policy.policyId"
            :class="[{'fr-valid': !includes(policyFailures, policy.name)}, 'text-muted fr-policy-list-item']">
            {{ $t(`common.policyValidationMessages.${policy.name}`, policy.params) }}
          </li>
        </ul>
      </small>
    </b-col>
  </b-row>
</template>

<script>
import {
    includes
} from 'lodash';

/**
 * @description Part of the password policy component that displays the list of policy items required.
 * Shows failed policies in a normal text and passing policies in a light text.
 * */
export default {
    name: 'PolicyPanel',
    props: {
    /**
     * Number of columns to display. Policies are evenly distributed between columns.
     */
        numColumns: {
            type: Number,
            default: 1
        },
        /**
     * Array of policy objects [{ name: POLICYNAME, params: { PARAMNAME: VALUE } }, ...]
     */
        policies: {
            type: Array,
            default: () => []
        },
        /**
     * Array of failing policies. Must match a value for name in policies array. ['FAILED1', 'FAILED2', ...]
     */
        policyFailures: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            policyColumns: []
        };
    },
    computed: {
        numPolicies () {
            return this.policies.length;
        }
    },
    methods: {
        includes,
        /**
     * Given an array of policies and a number of columns, distribute policies evenly.
     * @param {Object[]} policyList policies to be split
     * @param {Number} numColumns number of columns to split into
     * @return {Object[][]} Array of arrays indicating the policies in each column
     */
        getPolicyColumns (policyList, numColumns) {
            const policyColumns = [],
                numPolicies = policyList.length,
                policiesPerColumn = Math.floor(numPolicies / numColumns),
                remaining = (numPolicies % numColumns);
            let curColumnIndex = 0;

            // Split policies between columns
            policyList.forEach((policy) => {
                if (typeof policyColumns[curColumnIndex] === 'undefined') {
                    policyColumns.push([]);
                }
                policyColumns[curColumnIndex].push({ name: policy.name, params: policy.params });
                const limit = curColumnIndex < remaining ? (policiesPerColumn + 1) : policiesPerColumn;
                if (policyColumns[curColumnIndex].length >= limit) {
                    curColumnIndex += 1;
                }
            });
            return policyColumns;
        }
    },
    watch: {
        policies: {
            handler (value) {
                this.policyColumns = this.getPolicyColumns(value, this.numColumns);
            },
            immediate: true
        }
    }
};
</script>

<style lang="scss" scoped>
.fr-valid {
  opacity: 0.5;
}
</style>
