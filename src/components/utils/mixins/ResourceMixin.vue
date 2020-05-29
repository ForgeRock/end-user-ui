<script>
import _ from 'lodash';

/**
 * @description Resource management mixin used for generating an update patch and  handling policy errors
 *
 **/
export default {
    name: 'Resource-Mixin',
    methods: {
        generateUpdatePatch (o, n) {
            let originalForm = _.cloneDeep(o),
                newForm = _.cloneDeep(n),
                changes;

            if (_.isArray(newForm)) {
                changes = _.filter(newForm, (field, index) => {
                    if (field.value !== originalForm[index].value) {
                        return true;
                    }
                    return false;
                });
            } else {
                changes = [];

                _.each(newForm, (value, key) => {
                    if (!_.isEqual(originalForm[key], newForm[key])) {
                        changes.push({
                            value: newForm[key],
                            name: key
                        });
                    }
                });
            }

            return _.map(changes, (formField) => {
                if (formField.value === '' || formField.value === null) {
                    return { operation: 'remove', field: '/' + formField.name };
                } else {
                    return { operation: 'add', field: '/' + formField.name, value: formField.value };
                }
            });
        },

        findPolicyError (errorResponse, properties) {
            let error = [];

            if (_.has(errorResponse, 'data.detail.failedPolicyRequirements')) {
                _.each(errorResponse.data.detail.failedPolicyRequirements, (policy) => {
                    if (policy.policyRequirements.length > 0) {
                        let displayTitle = '',
                            foundProperty = _.find(properties, (prop) => { return prop.key === policy.property; }),
                            params = policy.policyRequirements[0].params || {};

                        if (foundProperty) {
                            if (foundProperty.title) {
                                displayTitle = foundProperty.title;
                            } else {
                                displayTitle = foundProperty.key;
                            }

                            params.property = displayTitle;
                        }

                        error.push({
                            exists: displayTitle.length > 0,
                            field: policy.property,
                            msg: this.$t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, params)
                        });
                    }
                });
            }

            return error;
        }
    }
};
</script>
