<template>
    <div class="card border-0 mt-3">
        <transition name="fade" mode="out-in" :duration="150">
            <template v-if="!isLoading">
                <ul v-if="!isValid" class="text-left pl-3">
                    <li
                        v-for="policy in policies"
                        :key="policy.policyId"
                        :class="[{'fr-valid': !includes(policyFailures, policy.name)}, 'text-primary fr-policy-list-item']"
                    >
                        <small class="text-body">{{ translate(policy) }}</small>
                    </li>
                </ul>
                <div v-else class="alert alert-success mt-1" role="alert">
                    <i class="fa fa-check-circle" /> {{ $t('common.policyValidationMessages.successMessages.password') }}
                </div>
            </template>
        </transition>
    </div>
</template>

<script>
import { includes, isArray, isEmpty } from "lodash";

/**
 * @description Part of the password policy component to display the list of policy items required
 *
 */
export default {
    "name": "PolicyPanel",
    // eslint-disable-next-line sort-keys
    "computed": {
        isLoading () {
            return this.policyFailures === "loading" || this.policyFailures === false;
        },
        isValid () {
            return isArray(this.policyFailures) && isEmpty(this.policyFailures);
        }
    },
    data () {
        return {};
    },
    "methods": {
        includes,
        translate (policy) {
            return this.$t(`common.policyValidationMessages.${policy.name}`, policy.params);
        }
    },
    "props": ["policies", "policyFailures"],
    "watch": {
        policyFailures (value) {
            this.policyFailures = value;
        }
    }
};
</script>
<style lang="scss" scoped>
    .fr-policy-list-item {
        line-height: 1.25;
    }

    .fr-valid {
        opacity: 0.5;
    }
</style>
