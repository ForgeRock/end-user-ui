<template>
    <b-form @keyup.enter="save" @submit.prevent>
        <p class="text-center mb-4">
            {{ $t('pages.selfservice.passwordReset.userQuery') }}
        </p>
        <b-form-group>
            <fr-floating-label-input v-model="mail" field-name="mail" :label="$t('common.placeholders.emailAddress')" type="text" autofocus="true" />
        </b-form-group>

        <b-button :block="true" size="lg" variant="primary" @click="save">
            <div v-if="apiType === 'username'">
                {{ $t("pages.selfservice.forgotUsername.advanceStageButtonText") }}
            </div>
            <div v-else>
                {{ $t("pages.selfservice.passwordReset.advanceStageButtonText") }}
            </div>
        </b-button>
    </b-form>
</template>

<script>
import FloatingLabelInput from "../../utils/FloatingLabelInput";

/**
 * @description Selfservice stage for multiple selfservice flows, typically used with an email to locate a user in the system to continue on with further
 * selfservice stages
 *
 */
export default {
    "name": "User-Query",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-floating-label-input": FloatingLabelInput
    },
    data () {
        return {
            "mail": ""
        };
    },
    "methods": {
        getData () {
            return {
                "queryFilter": `mail eq "${this.mail}"`
            };
        },
        save () {
            /* istanbul ignore next */
            this.$emit("advanceStage", this.getData());
        }
    },
    "props": {
        "apiType": { "required": true }
    }
};
</script>
