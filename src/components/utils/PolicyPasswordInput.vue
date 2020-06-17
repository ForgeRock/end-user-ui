<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <b-form-group class="mb-0">
    <slot name="input">
        <fr-floating-label-input
            name="password"
            fieldName="password"
            type="password"
            v-model="password"
            :label="label || $t('common.placeholders.password')"
            :reveal="true"
            :showErrorState="false"
            @input="setFailingPolicies($event)" />
    </slot>
    <slot name="policy-panel">
      <fr-policy-panel
        class="mt-2"
        :num-columns="cols"
        :policies="policies"
        :policy-failures="failedPolicies" />
    </slot>
  </b-form-group>
</template>

<script>
import {
    at,
    curry,
    first,
    flatten,
    head,
    includes,
    isEmpty,
    isObject,
    isString,
    isUndefined,
    reject,
    debounce
} from 'lodash';
import FloatingLabelInput from './FloatingLabelInput';
import PolicyPanel from './PolicyPanel';

/**
 * The main display for the password policy component. Connects a text field to check policy on input to see if password correctly matches configured policy (makes use of policy.json)
 *
 * @fires POST /policy/selfservice/registration/?_action=validateObject - Submits an object in its current state to policy for validation against the configured policy
 */
export default {
    name: 'PolicyPasswordInput',
    components: {
        'fr-floating-label-input': FloatingLabelInput,
        'fr-policy-panel': PolicyPanel
    },
    props: {
        /**
         * Items to remove from the policy service.
         */
        excludeOverwrite: {
            required: false,
            type: Array,
            default: null
        },
        cols: {
            type: Number,
            default: 2
        },
        /**
         * Failed policies not shown in policy panel
         */
        failed: {
            type: Array,
            default: () => []
        },
        userPolicyObject: {
            type: Boolean,
            default: false
        },
        /**
         * Floating label for input
         */
        label: {
            type: String,
            default () {
                return this.$t('common.placeholders.password');
            }
        },
        /**
         * Required policy API used to validate input password.
         */
        policyApi: {
            required: true,
            type: String
        },
        value: {
            type: [String, Object],
            default () {
                return '';
            }
        }
    },
    data () {
        return {
            failedPolicies: [],
            password: this.value,
            policies: [],
            policyService: () => {},
            serverFailures: []
        };
    },
    watch: {
        failed: {
            handler (newVal) {
                this.serverFailures = this.getFailedPolicyMessages(newVal);
            },
            deep: true,
            immediate: true
        },
        failedPolicies (newVal) {
            this.$emit('valid', newVal.length === 0);
        },
        password (newVal) {
            this.$emit('input', newVal);
        },
        value () {
            this.password = this.value;
        }
    },
    computed: {
        exclude () {
            if (this.excludeOverwrite) {
                return this.excludeOverwrite;
            }
            return [
                {
                    name: 'REQUIRED',
                    predicate (policyRequirements) {
                        return includes(policyRequirements, 'REQUIRED') && includes(policyRequirements, 'MIN_LENGTH');
                    }
                },
                {
                    name: 'IS_NEW',
                    predicate () {
                        return this.policyApi === 'selfservice/registration';
                    }
                },
                'VALID_TYPE',
                'CANNOT_CONTAIN_OTHERS'
            ];
        }
    },
    methods: {
        /**
         * Predicates whether item matches 'password'. Policy Definition and Policy Failure objects
         * have different shapes, so this function can be used as a predicate for both.
         * @param {String} propName - The name of the property grab
         * @param {Object} policyRequirementItem - object to predicate on
         * @return {Boolean}
         */
        isPasswordPolicyItem: curry((propName, policyRequirementItem) => !isEmpty(policyRequirementItem[propName].match('password'))),

        /**
         * convert policy definition into a simple structure to work with
         * @param {Object} policyDefinition
         * @param {String[]} policyDefinition.policyRequirements - singleton array with policy name
         * @param {Object} policyDefinition.params - object containing params for policy (e.g. `{ params: { numNum: 1 } }
         * @return {Object} - {name<String>, params<Object>}
         */
        toSimplePolicyObject (policyDefinition) {
            const { policyRequirements, params } = policyDefinition,
                name = first(policyRequirements);

            return !isUndefined(name) ? { name, params } : {};
        },
        /**
         * Change an array of Failed Policy objects to an array of policy names
         * @param {Object} failedPolicySet - policy service response object
         * @param {Object[]} failedPolicySet.failedPolicyRequirements - the list to map
         * @return {String[]}
         */
        toPolicyNames (failedPolicySet) {
            const failedPolicyRequirements = failedPolicySet.failedPolicyRequirements || [],
                policyNames = failedPolicyRequirements
                    .filter(this.isPasswordPolicyItem('property'))
                    .map((failedPolicyDefinition) => at(failedPolicyDefinition, ['policyRequirements[0].policyRequirement']));

            return flatten(policyNames);
        },
        /**
         * Remove from the policy service return set of policies those that are defined in the `exclude` prop
         * @param {Object} policyRequirementSet - policy service response object
         * @param {String[]} policy names and predicates to exclude
         * @return {Object} - edited version of the policyRequirementSet
         */
        makeExclusions (policyRequirementSet, exclude) {
            const policyRequirements = (policyRequirementSet && policyRequirementSet.policyRequirements) ? policyRequirementSet.policyRequirements : [];
            let policies = (policyRequirementSet && policyRequirementSet.policies) ? policyRequirementSet.policies : [];

            // eslint-disable-next-line one-var
            const rejectPolicy = (requirement) => reject(policies, (policy) => first(policy.policyRequirements) === requirement);

            exclude.forEach((exclusion) => {
                if (isObject(exclusion)) {
                    if (exclusion.predicate(policyRequirements)) {
                        policies = rejectPolicy(exclusion.name);
                    }
                } else if (isString(exclusion)) {
                    if (includes(policyRequirements, exclusion)) {
                        policies = rejectPolicy(exclusion);
                    }
                }
            });

            return Object.assign({}, policyRequirementSet, { policyRequirements, policies });
        },
        /**
         * Get an array of error message strings given an array of failing policy objects.
         * These are used to display the failing policies that are returned after submitting a password.
         * @param {Object[]} failed Array of failing policy objects
         * @return {String[]} Array of translated error messages
         */
        getFailedPolicyMessages (failed) {
            if (failed.length === 0) {
                return [];
            }
            return this.failed.map((policy) => {
                const name = policy.policyRequirements[0].policyRequirement,
                    param = policy.policyRequirements[0].params;
                return this.$t(`common.policyValidationMessages.${name}`, param);
            });
        },
        /**
         * validates a value for as-you-type feedback.
         * @param {String} password a string to validate against relevant policy
         */
        setFailingPolicies: debounce(function (password) {
            let sentPassword = { password };

            if (this.policyApi.match('registration')) {
                sentPassword = { user: { password: this.password } };
            }

            this.policyService.post(`/policy/${this.policyApi}/?_action=validateObject`, sentPassword)
                .then(({ data }) => { this.failedPolicies = this.toPolicyNames(data); this.serverFailures = []; })
                .catch(() => {
                    this.displayNotification('IDMMessages', 'error', this.$t('common.policyValidationMessages.policyServiceError.policyApi', { policyApi: this.policyApi }));
                });
        }, 200)
    },
    created () {
    // Initialize the policy service to be used in validation calls and the preliminary get call.
        const headers = this.getAnonymousHeaders();
        this.policyService = this.getRequestService({ headers });

        // Get the initial policy list from the policy service.
        this.policyService.get(`/policy/${this.policyApi}`)
            .then(({ data }) => head(data.properties.filter(this.isPasswordPolicyItem('name'))))
            .then((policyRequirementSet) => this.makeExclusions(policyRequirementSet, this.exclude))
            .then(({ policies }) => {
                this.policies = policies
                    .map(this.toSimplePolicyObject)
                    .filter((p) => !isEmpty(p));
            })
            .catch(() => {
                this.displayNotification('IDMMessages', 'error', this.$t('common.policyValidationMessages.policyServiceError.policyApi', { policyApi: this.policyApi }));
                this.$router.push('/login');
            });

        this.setFailingPolicies(this.password);
    }
};
</script>
