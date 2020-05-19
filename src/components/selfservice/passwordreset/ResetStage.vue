<template>
    <div v-if="selfServiceDetails.tag ==='end'">
        <b-alert show>
            <p>{{ $t('pages.selfservice.passwordReset.successMessage') }}</p>
        </b-alert>
    </div>
    <div v-else-if="typeof selfServiceDetails.error !== 'string'">
        <b-form @keyup.enter="save" @submit.prevent>
            <fr-policy-password-input
                v-model="password"
                :default-policy-failures="defaultPolicyFailures"
                policy-api="selfservice/reset"
                name="password"
                :label="$t('pages.selfservice.passwordReset.newPassword')"
            />
            <b-button :block="true" size="lg" variant="primary" @click="save">
                {{ $t("pages.selfservice.passwordReset.changePassword") }}
            </b-button>
        </b-form>
    </div>
    <div v-else>
        <b-alert variant="danger" show>
            <b>{{ $t('pages.selfservice.passwordReset.errorMessage') }}</b>
            <p>{{ selfServiceDetails.error }}</p>
        </b-alert>
        <div class="mt-2">
            <a href="#/passwordreset" @click="reloadPage">{{ $t("pages.selfservice.passwordReset.tryAgain") }}</a>
        </div>
    </div>
</template>

<script>
import { has, find, map } from "lodash";
import PolicyPasswordInput from "../../utils/PolicyPasswordInput";

/**
 * @description Selfservice stage for password reset, handles the final result of password reset, either displaying an error or that the reset has been complete
 *
 */
export default {
    "name": "Reset-Stage",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-policy-password-input": PolicyPasswordInput
    },
    data () {
        return {
            "defaultPolicyFailures": null,
            "password": ""
        };
    },
    "methods": {
        getData () {
            return {
                "password": this.password
            };
        },
        reloadPage (event) {
            event.preventDefault();
            const { hash } = window.location;

            // Remove any `code` after last foward slash in url
            window.location.hash = hash.slice(0, hash.lastIndexOf("/") + 1);
            window.location.reload();
        },
        save () {
            this.$emit("advanceStage", this.getData());
        }
    },
    "props": {
        "selfServiceDetails": { "required": true }
    },
    "watch": {
        "selfServiceDetails": {
            "deep": true,
            // eslint-disable-next-line padded-blocks
            handler (value) {

                /*
                 * If there is a change to selfServiceDetails it's probably because of a
                 * policy failure on password that could not be handled on the fly with
                 * "?_action=validateObject". Look for those failures here and send them to the
                 * PolicyPasswordInput via it's defaultPolicyFailures property.
                 */
                if (has(value, "requirements.error.detail.failedPolicyRequirements")) {
                    const failedPolicy = find(value.requirements.error.detail.failedPolicyRequirements, { "property": "password" });

                    if (failedPolicy && failedPolicy.policyRequirements) {
                        const policyError = this.$t(`common.policyValidationMessages.${failedPolicy.policyRequirements[0].policyRequirement}`, failedPolicy.policyRequirements[0].params),
                            // eslint-disable-next-line sort-vars
                            errorMessage = `${this.$t("common.policyValidationMessages.policyValidationFailed", { "property": failedPolicy.property })}: ${policyError}`;

                        /* istanbul ignore next */
                        this.displayNotification("error", errorMessage);

                        this.defaultPolicyFailures = map(failedPolicy.policyRequirements, "policyRequirement");
                    }
                }
            }
        }
    }
};
</script>
