<template>
    <fr-kba-form-group ref="kbaFormGroup" :self-service-details="selfServiceDetails" />
</template>

<script>
import KBADefinitionFormGroup from "../common/KBADefinitionFormGroup";

/**
 * @description Selfservice stage for progressive profile, handles the case where a resource is requested to change their KBA questions
 *
 */
export default {
    "name": "KBA-Update-Stage",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-kba-form-group": KBADefinitionFormGroup
    },
    data () {
        return {};
    },
    "methods": {
        getData () {
            return this.$refs.kbaFormGroup.getData();
        },
        isValid () {
            /* istanbul ignore next */
            return this.$refs.kbaFormGroup.isValid();
        },
        save () {
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    this.$emit("advanceStage", this.getData());
                }
            });
        }
    },
    "props": {
        "inline": {
            "default": false,
            "required": false
        },
        "selfServiceDetails": { "required": true }
    }
};
</script>
