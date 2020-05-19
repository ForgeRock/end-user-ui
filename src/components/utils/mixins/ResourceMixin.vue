<script>
import { cloneDeep, each, filter, find, has, isArray, isEqual, map } from "lodash";

/**
 * @description Resource management mixin used for generating an update patch and  handling policy errors
 *
 */
export default {
    "name": "Resource-Mixin",
    // eslint-disable-next-line sort-keys
    "methods": {
        findPolicyError (errorResponse, properties) {
            const error = [];

            if (has(errorResponse, "data.detail.failedPolicyRequirements")) {
                each(errorResponse.data.detail.failedPolicyRequirements, (policy) => {
                    if (policy.policyRequirements.length > 0) {
                        let displayTitle = "";
                        const foundProperty = find(properties, (prop) => prop.key === policy.property),
                            parameters = policy.policyRequirements[0].params || {};

                        if (foundProperty) {
                            if (foundProperty.title) {
                                displayTitle = foundProperty.title;
                            } else {
                                displayTitle = foundProperty.key;
                            }

                            parameters.property = displayTitle;
                        }

                        error.push({
                            "exists": displayTitle.length > 0,
                            "field": policy.property,
                            "msg": this.$t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, parameters)
                        });
                    }
                });
            }

            return error;
        },
        generateUpdatePatch (original, new_) {
            const newForm = cloneDeep(new_),
                originalForm = cloneDeep(original);
            let changes = null;

            if (isArray(newForm)) {
                changes = filter(newForm, (field, index) => {
                    if (field.value !== originalForm[index].value) {
                        return true;
                    }
                    return false;
                });
            } else {
                changes = [];

                each(newForm, (value, key) => {
                    if (!isEqual(originalForm[key], newForm[key])) {
                        changes.push({
                            "name": key,
                            "value": newForm[key]
                        });
                    }
                });
            }

            return map(changes, (formField) => {
                if (formField.value === "" || formField.value === null) {
                    return { "field": `/${formField.name}`, "operation": "remove" };
                }
                return { "field": `/${formField.name}`, "operation": "add", "value": formField.value };
            });
        }
    }
};
</script>
