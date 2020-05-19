<template>
    <b-form-group class="mb-0">
        <slot v-if="!customInput" name="input-with-validation-panel">
            <fr-floating-label-input
                v-model="password"
                v-validate.initial="'required|policy'"
                name="password"
                field-name="password"
                type="password"
                :label="label || $t('common.placeholders.password')"
                :reveal="true"
                :show-error-state="false"
                @input="$emit('input', $event)"
            >
                <fr-policy-panel slot="validationError" :policies="policies" :policy-failures="(showDefaultPolicyFailures) ? defaultPolicyFailures : policyFailures" />
            </fr-floating-label-input>
        </slot>

        <template v-else>
            <slot name="custom-input" />
            <fr-policy-panel :policies="policies" :policy-failures="(showDefaultPolicyFailures) ? defaultPolicyFailures : policyFailures" />
        </template>
    </b-form-group>
</template>

<script>
import { at, curry, first, flatten, head, includes, isEmpty, isNull, isObject, isString, isUndefined, map, reject } from "lodash";
import FloatingLabelInput from "./FloatingLabelInput";
import PolicyPanel from "./PolicyPanel";

/**
 * @description The main display for the password policy component. Connects a text field to check policy on input to see if password correctly matches configured policy (makes use of policy.json)
 *
 * @fires POST /policy/selfservice/registration/?_action=validateObject - Submits an object in its current state to policy for validation against the configured policy
 *
 */
export default {
    "name": "PolicyPasswordInput",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-floating-label-input": FloatingLabelInput,
        "fr-policy-panel": PolicyPanel
    },
    "computed": {
        customInput () {
            return !isUndefined(this.$slots["custom-input"]);
        },
        policyFailures () {
            const failures = this.errors.firstByRule("password", "policy");

            if (isUndefined(this.fields.password)) {
                return "loading";
            } else if (isNull(failures) && this.fields.password.valid) {
                return [];
            }
            return failures;
        }
    },
    data () {
        return {
            "failedExcludedPolicies": [],
            "password": this.value,
            "policies": [],
            "showDefaultPolicyFailures": false
        };
    },
    // eslint-disable-next-line max-lines-per-function, sort-keys
    created () {
        // Initialize the policy service to be used in validation calls and the preliminary get call.
        const formatPayload = this.formatPayload.bind(this),
            headers = this.getAnonymousHeaders(),
            policyService = this.getRequestService({ headers }),
            // Create validation service call and bind to component scope.
            requestPolicyValidation = function policyValidation (password) {
                const payload = formatPayload(password);

                /* istanbul ignore next */
                return policyService.
                    post(`/policy/${this.policyApi}/?_action=${this.getAction()}`, payload).
                    then(({ data }) => {
                        if (data.failedPolicyRequirements) {
                            map(data.failedPolicyRequirements, (failedPolicyRequirement) => {
                                if (failedPolicyRequirement.property === "password") {
                                    this.showDefaultPolicyFailures = false;

                                    // If the failure is included in excluded policies add it to the failedExcludedPolicies list
                                    if (includes(this.exclude, failedPolicyRequirement.policyRequirements[0].policyRequirement)) {
                                        this.failedExcludedPolicies.push(failedPolicyRequirement);
                                    }
                                }
                            });
                        }

                        return this.toPolicyNames(data);
                    }).
                    catch(() => {
                        /* istanbul ignore next */
                        this.displayNotification("error", this.$t("common.policyValidationMessages.policyServiceError"));
                    });
            }.bind(this);

        // Extend the validator with the custom validation rule.
        this.$validator.extend("policy", {
            getMessage (field, parameters, data) {
                return data;
            },
            validate (value, arguments_) {
                // Make policy service call.
                /* istanbul ignore next */
                return requestPolicyValidation(value).then((policyFailures) => ({
                    "data": policyFailures,
                    "valid": isEmpty(policyFailures)
                }));
            }
        });

        // Get the initial policy list from the policy service.
        /* istanbul ignore next */
        policyService.get(`/policy/${this.policyApi}`).
            then(({ data }) => head(data.properties.filter((element) => this.isPasswordPolicyItem("name")(element)))).
            then((policyRequirementSet) => this.makeExclusions(policyRequirementSet)).
            then(({ policies }) => {
                this.policies = policies.
                    map((element) => this.toSimplePolicyObject(element)).
                    filter((parameter) => !isEmpty(parameter));
            }).
            catch(() => {
                /* istanbul ignore next */
                this.displayNotification("error", this.$t(`common.policyValidationMessages.policyServiceError.${this.policyApi}`));
                this.$router.push("/login");
            });
    },
    "inject": ["$validator"],
    "methods": {

        formatPayload (password) {
            if (this.policyApi.match("registration")) {
                return { "user": { password } };
            }
            return { password };
        },
        getAction () {
            return this.policyApi.match("selfservice") ? "validateObject" : "validateProperty";
        },

        /**
         * Predicates whether item matches 'password'. Policy Definition and Policy Failure objects
         * have different shapes, so this function can be used as a predicate for both.
         * @param {String} propName - The name of the property grab
         * @param {Object} policyRequirementItem - object to predicate on
         * @return {Boolean}
         */
        "isPasswordPolicyItem": curry((propName, policyRequirementItem) => !isEmpty(policyRequirementItem[propName].match("password"))),

        /**
         * Remove from the policy service return set of policies those that are defined in the `exclude` prop
         * @param {Object} policyRequirementSet - policy service response object
         * @return {Object} - edited version of the policyRequirementSet
         */
        makeExclusions (policyRequirementSet) {
            const policyRequirements = policyRequirementSet && policyRequirementSet.policyRequirements ? policyRequirementSet.policyRequirements : [];
            let policies = policyRequirementSet && policyRequirementSet.policies ? policyRequirementSet.policies : [];

            // eslint-disable-next-line one-var
            const rejectPolicy = (requirement) => reject(policies, (policy) => first(policy.policyRequirements) === requirement);

            this.exclude.forEach((exclusion) => {
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

            return { policyRequirementSet, ...{ policies, policyRequirements } };
        },

        /**
         * Change an array of Failed Policy objects to an array of policy names
         * @param {Object} failedPolicySet - policy service response object
         * @param {Object[]} failedPolicySet.failedPolicyRequirements - the list to map
         * @return {String[]}
         */
        toPolicyNames (failedPolicySet) {
            const failedPolicyRequirements = failedPolicySet.failedPolicyRequirements || [],
                policyNames = failedPolicyRequirements.
                    filter((element) => this.isPasswordPolicyItem("property")(element)).
                    map((failedPolicyDefinition) => at(failedPolicyDefinition, ["policyRequirements[0].policyRequirement"]));

            return flatten(policyNames);
        },

        /**
         * Convert policy definition into a simple structure to work with
         * @param {Object} policyDefinition
         * @param {String[]} policyDefinition.policyRequirements - singleton array with policy name
         * @param {Object} policyDefinition.params - objet containing params for policy (e.g. `{ params: { numNum: 1 } }
         * @return {Object} - {name<String>, params<Object>}
         */
        toSimplePolicyObject (policyDefinition) {
            const { policyRequirements, params } = policyDefinition,
                name = first(policyRequirements);

            if (!isUndefined(name)) {
                return { name, params };
            }
            return {};
        }
    },
    "props": {
        "defaultPolicyFailures": { "required": false, "type": Array },
        "exclude": {
            default () {
                const { policyApi } = this;
                return [
                    {
                        "name": "REQUIRED",
                        predicate (policyRequirements) {
                            return includes(policyRequirements, "REQUIRED") && includes(policyRequirements, "MIN_LENGTH");
                        }
                    },
                    {
                        "name": "IS_NEW",
                        predicate (policyRequirements) {
                            return policyApi === "selfservice/registration";
                        }
                    },
                    "VALID_TYPE",
                    "CANNOT_CONTAIN_OTHERS"
                ];
            },
            "required": false,
            "type": Array
        },
        "label": String,
        "policyApi": { "required": true, "type": String },
        "value": String
    },
    "watch": {
        defaultPolicyFailures (newValue) {
            this.showDefaultPolicyFailures = true;
        },
        failedExcludedPolicies (value) {
            const [policy] = value;

            if (policy) {
                const policyError = this.$t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, policy.policyRequirements[0].params),
                    // eslint-disable-next-line sort-vars
                    errorMessage = `${this.$t("common.policyValidationMessages.policyValidationFailed", { "property": policy.property })}: ${policyError}`;

                /* istanbul ignore next */
                this.displayNotification("error", errorMessage);

                this.failedExcludedPolicies = [];
            }
        }
    }
};
</script>
