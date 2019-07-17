<template>
    <b-form-group class="mb-0">
        <slot v-if="!customInput" name="input-with-validation-panel">
            <fr-floating-label-input
                name="password"
                fieldName="password"
                type="password"
                v-validate.initial="'required|policy'"
                v-model="password"
                :label="label || $t('common.placeholders.password')"
                :reveal="true"
                :showErrorState="false"
                @input="$emit('input', $event)">

                <fr-policy-panel slot="validationError" :policies="policies" :policyFailures="defaultPolicyFailures || policyFailures"></fr-policy-panel>
            </fr-floating-label-input>
        </slot>

        <template v-else>
            <slot name="custom-input"></slot>
            <fr-policy-panel :policies="policies" :policyFailures="defaultPolicyFailures || policyFailures"></fr-policy-panel>
        </template>
    </b-form-group>
</template>

<script>
import _ from 'lodash';
import FloatingLabelInput from './FloatingLabelInput';
import PolicyPanel from './PolicyPanel';

/**
 * @description The main display for the password policy component. Connects a text field to check policy on input to see if password correctly matches configured policy (makes use of policy.json)
 *
 * @fires POST /policy/selfservice/registration/?_action=validateObject - Submits an object in its current state to policy for validation against the configured policy
 *
 **/
export default {
    name: 'PolicyPasswordInput',
    inject: ['$validator'],
    components: {
        'fr-floating-label-input': FloatingLabelInput,
        'fr-policy-panel': PolicyPanel
    },
    props: {
        policyApi: { required: true, type: String },
        defaultPolicyFailures: { required: false, type: Array },
        value: String,
        label: String,
        exclude: {
            required: false,
            type: Array,
            default () {
                let policyApi = this.policyApi;
                return [
                    {
                        name: 'REQUIRED',
                        predicate (policyRequirements) {
                            return _.includes(policyRequirements, 'REQUIRED') && _.includes(policyRequirements, 'MIN_LENGTH');
                        }
                    },
                    {
                        name: 'IS_NEW',
                        predicate (policyRequirements) {
                            return policyApi === 'selfservice/registration';
                        }
                    },
                    'VALID_TYPE',
                    'CANNOT_CONTAIN_OTHERS'
                ];
            }
        }
    },
    data () {
        return {
            policies: [],
            password: this.value
        };
    },
    computed: {
        policyFailures () {
            let failures = this.errors.firstByRule('password', 'policy');

            if (_.isUndefined(this.fields.password)) {
                return 'loading';
            } else if (_.isNull(failures) && this.fields.password.valid) {
                return [];
            } else {
                return failures;
            }
        },
        customInput () { return !_.isUndefined(this.$slots['custom-input']); }

    },
    methods: {
        /**
             * Predicates whether item matches 'password'. Policy Definition and Policy Failure objects
             * have different shapes, so this function can be used as a predicate for both.
             * @param {String} propName - The name of the property grab
             * @param {Object} policyRequirementItem - object to predicate on
             * @return {Boolean}
             */
        isPasswordPolicyItem: _.curry(function (propName, policyRequirementItem) {
            return !_.isEmpty(policyRequirementItem[propName].match('password'));
        }),
        /**
             * convert policy definition into a simple structure to work with
             * @param {Object} policyDefinition
             * @param {String[]} policyDefinition.policyRequirements - singleton array with policy name
             * @param {Object} policyDefinition.params - objet containing params for policy (e.g. `{ params: { numNum: 1 } }
             * @return {Object} - {name<String>, params<Object>}
             */
        toSimplePolicyObject (policyDefinition) {
            let { policyRequirements, params } = policyDefinition,
                name = _.first(policyRequirements);

            if (!_.isUndefined(name)) {
                return { name, params };
            } else {
                return {};
            }
        },
        /**
             * Change an array of Failed Policy objects to an array of policy names
             * @param {Object} failedPolicySet - policy service response object
             * @param {Object[]} failedPolicySet.failedPolicyRequirements - the list to map
             * @return {String[]}
             */
        toPolicyNames (failedPolicySet) {
            let failedPolicyRequirements = failedPolicySet.failedPolicyRequirements || [],
                policyNames = failedPolicyRequirements
                    .filter(this.isPasswordPolicyItem('property'))
                    .map((failedPolicyDefinition) => {
                        return _.at(failedPolicyDefinition, ['policyRequirements[0].policyRequirement']);
                    });

            return _.flatten(policyNames);
        },
        /**
             * Remove from the policy service return set of policies those that are defined in the `exclude` prop
             * @param {Object} policyRequirementSet - policy service response object
             * @return {Object} - edited version of the policyRequirementSet
             */
        makeExclusions (policyRequirementSet) {
            let policyRequirements,
                policies;

            if (policyRequirementSet && policyRequirementSet.policyRequirements) {
                policyRequirements = policyRequirementSet.policyRequirements;
            } else {
                policyRequirements = [];
            }

            if (policyRequirementSet && policyRequirementSet.policies) {
                policies = policyRequirementSet.policies;
            } else {
                policies = [];
            }

            const rejectPolicy = (requirement) => {
                return _.reject(policies, (policy) => _.first(policy.policyRequirements) === requirement);
            };

            this.exclude.forEach((exclusion) => {
                if (_.isObject(exclusion)) {
                    if (exclusion.predicate(policyRequirements)) {
                        policies = rejectPolicy(exclusion.name);
                    }
                } else if (_.isString(exclusion)) {
                    if (_.includes(policyRequirements, exclusion)) {
                        policies = rejectPolicy(exclusion);
                    }
                }
            });

            return Object.assign({}, policyRequirementSet, { policyRequirements, policies });
        },
        formatPayload (password) {
            if (this.policyApi.match('registration')) {
                return { user: { password } };
            } else {
                return { password };
            }
        },
        getAction () {
            return this.policyApi.match('selfservice') ? 'validateObject' : 'validateProperty';
        }
    },
    created () {
        // Initialize the policy service to be used in validation calls and the preliminary get call.
        const headers = this.getAnonymousHeaders(),
            policyService = this.getRequestService({ headers }),
            formatPayload = this.formatPayload.bind(this),
            // Create validation service call and bind to component scope.
            requestPolicyValidation = function (password) {
                let data = formatPayload(password);

                // remove existing defaultPolicyFailures
                // this.defaultPolicyFailures = null;

                /* istanbul ignore next */
                return policyService
                    .post(`/policy/${this.policyApi}/?_action=${this.getAction()}`, data)
                    .then(({ data }) => this.toPolicyNames(data))
                    .catch(() => {
                        /* istanbul ignore next */
                        this.displayNotification('error', this.$t('common.policyValidationMessages.policyServiceError'));
                    });
            }.bind(this);

        // Extend the validator with the custom validation rule.
        this.$validator.extend('policy', {
            validate (value, args) {
                // Make policy service call.
                /* istanbul ignore next */
                return requestPolicyValidation(value).then((policyFailures) => {
                    return {
                        valid: _.isEmpty(policyFailures),
                        data: policyFailures
                    };
                });
            },
            getMessage (field, params, data) {
                return data;
            }
        });

        // Get the initial policy list from the policy service.
        /* istanbul ignore next */
        policyService.get(`/policy/${this.policyApi}`)
            .then(({ data }) => _.head(data.properties.filter(this.isPasswordPolicyItem('name'))))
            .then((policyRequirementSet) => {
                return this.makeExclusions(policyRequirementSet);
            })
            .then(({ policies }) => {
                this.policies = policies
                    .map(this.toSimplePolicyObject)
                    .filter((p) => !_.isEmpty(p));
            })
            .catch(() => {
                /* istanbul ignore next */
                this.displayNotification('error', this.$t(`common.policyValidationMessages.policyServiceError.${this.policyApi}`));
                this.$router.push('/login');
            });
    }
};
</script>
