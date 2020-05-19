<template>
    <b-form id="kbaDefinition" class="mb-4" @submit.prevent>
        <fr-horizontal-rule v-if="inline" insert="<i class='fa fa-lock'></i>" />

        <p class="text-center">{{ $t('common.user.kba.description') }}</p>

        <fr-kba-form-group ref="kbaFormGroup" :self-service-details="selfServiceDetails" />

        <b-button v-if="!inline" :block="true" size="lg" variant="primary" @click="save">{{ $t("pages.selfservice.registration.completeRegistration") }}</b-button>
    </b-form>
</template>

<script>
import KBADefinitionFormGroup from "../common/KBADefinitionFormGroup";
import HorizontalRule from "../../utils/HorizontalRule";

/**
 * @description Selfservice stage that handles the initial KBA during registration functions the same in allinone
 *
 */
export default {
    "name": "KBA-Security-Answer-Definition-Stage",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-horizontal-rule": HorizontalRule,
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

<style scoped>
</style>
