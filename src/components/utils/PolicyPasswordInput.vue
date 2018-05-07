<template>
    <b-form-group class="mb-0">
        <fr-floating-label-input
            name="password"
            fieldName="password"
            type="password"
            v-validate.initial="'required|policy'"
            v-model="password"
            :label="$t('common.placeholders.password')"
            :reveal="true"
            :showErrorState="false"
            @input="$emit('input', $event)">

            <fr-policy-panel slot="validationError" :policies="policies" :policyFailures="policyFailures"></fr-policy-panel>
        </fr-floating-label-input>

    </b-form-group>
</template>

<script>
    import _ from 'lodash';
    import FloatingLabelInput from './FloatingLabelInput';
    import PolicyPanel from './PolicyPanel';

    export default {
        name: 'PolicyPasswordInput',
        inject: ['$validator'],
        components: {
            'fr-floating-label-input': FloatingLabelInput,
            'fr-policy-panel': PolicyPanel
        },
        props: {
            value: String,
            exclude: {
                required: false,
                type: Array,
                default () {
                    return [
                        {
                            name: 'REQUIRED',
                            predicate (policyRequirements) {
                                return _.includes(policyRequirements, 'REQUIRED') && _.includes(policyRequirements, 'MIN_LENGTH');
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
                return _.isUndefined(this.fields.password) ? 'loading' : this.errors.firstByRule('password', 'policy');
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
                let { policyRequirements, policies } = policyRequirementSet;

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

                return Object.assign({}, policyRequirementSet, {policyRequirements, policies});
            }
        },
        created () {
            // Initialize the policy service to be used in validation calls and the preliminary get call.
            const headers = this.getAnonymousHeaders(),
                baseURL = 'openidm/policy/selfservice/registration/',
                policyService = this.getRequestService({ headers, baseURL }),
                // Create validation service call and bind to component scope.
                requestPolicyValidation = function (password) {
                    let data = { user: { password } };

                    /* istanbul ignore next */
                    return policyService
                        .post('?_action=validateObject', data)
                        .then(({ data }) => this.toPolicyNames(data))
                        .catch(() => {
                            /* istanbul ignore next */
                            this.$notify({
                                group: 'IDMMessages',
                                type: 'error',
                                text: this.$t('common.policyValidationMessages.policyServiceError')
                            });
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
            policyService.get()
                .then(({data}) => _.head(data.properties.filter(this.isPasswordPolicyItem('name'))))
                .then((policyRequirementSet) => {
                    return this.makeExclusions(policyRequirementSet);
                })
                .then(({policies}) => {
                    this.policies = policies
                        .map(this.toSimplePolicyObject)
                        .filter((p) => !_.isEmpty(p));
                })
                .catch(() => {
                    /* istanbul ignore next */
                    this.$notify({
                        group: 'IDMMessages',
                        type: 'error',
                        text: this.$t('common.policyValidationMessages.policyServiceError')
                    });

                    this.$router.push('/login');
                });
        }
    };
</script>