<template>
    <div class="card border-0 mt-3">
        <transition name="fade" mode="out-in" :duration="150">
            <template v-if="!isLoading">
                <ul class="text-left pl-3" v-if="!isValid">
                    <li v-for="policy in policies"
                    :key="policy.policyId"
                    :class="[{'fr-valid': !includes(policyFailures, policy.name)}, 'text-primary fr-policy-list-item']">
                        <small class="text-body">{{translate(policy)}}</small>
                    </li>
                </ul>
                <div v-else class="alert alert-success mt-1" role="alert">
                    <i class="fa fa-check-circle"></i> {{$t('common.policyValidationMessages.successMessages.password')}}
                </div>
            </template>
        </transition>
    </div>
</template>

<script>
import _ from 'lodash';

/**
 * @description Part of the password policy component to display the list of policy items required
 *
 **/
export default {
    name: 'PolicyPanel',
    props: ['policies', 'policyFailures'],
    data () {
        return {};
    },
    computed: {
        isValid () {
            return _.isArray(this.policyFailures) && _.isEmpty(this.policyFailures);
        },
        isLoading () {
            return this.policyFailures === 'loading' || this.policyFailures === false;
        }
    },
    methods: {
        translate (policy) {
            let path = `common.policyValidationMessages.${policy.name}`;

            return this.$t(path, policy.params);
        },
        includes: _.includes
    },
    watch: {
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
