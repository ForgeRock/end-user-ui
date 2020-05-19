<template>
    <b-form>
        <fr-social-buttons v-if="!isSocialReg" :signin="false" />
        <b-form-group v-for="(property, key) in userDetails" :key="key" class="mb-0">
            <fr-floating-label-input
                v-model="saveDetails[key]"
                :default-value="property.socialValue"
                :field-name="key"
                :label="property.description"
                :validate-rules="calculateValidation(property)"
                type="text"
            />
        </b-form-group>

        <fr-policy-password-input v-if="!isSocialReg" v-model="saveDetails.password" policy-api="selfservice/registration" name="password" />

        <!-- Vue Bootstrap custom radio button seems to have problems so just using none component-->
        <div class="form-group mb-4">
            <div v-for="(preference, key) in userPreferences" :key="key" class="custom-control custom-checkbox mb-2">
                <input :id="key" v-model="saveDetails.preferences[key]" type="checkbox" class="custom-control-input">
                <label class="custom-control-label" :for="key">{{ preference.description }}</label>
            </div>
        </div>

        <b-button v-if="inline === false" :block="true" size="lg" variant="primary" @click="save">
            {{ $t("common.form.signUp") }}
        </b-button>
    </b-form>
</template>

<script>
import { clone, each, get, has, isUndefined } from "lodash";
import FloatingLabelInput from "../../utils/FloatingLabelInput";
import PolicyPasswordInput from "../../utils/PolicyPasswordInput";
import SocialButtons from "../../utils/SocialButtons";

/**
 * @description Selfservice stage for generating user details and displaying social buttons available. Works the same alone and in allinone
 *
 */
export default {
    "name": "User-Details",
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    "components": {
        "fr-floating-label-input": FloatingLabelInput,
        "fr-policy-password-input": PolicyPasswordInput,
        "fr-social-buttons": SocialButtons
    },
    // eslint-disable-next-line max-statements
    data () {
        const data = {
            "isSocialReg": get(this.selfServiceDetails, "tag") !== "initial",
            "saveDetails": {},
            "userDetails": {},
            "userPreferences": {}
        };

        if (this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.registrationProperties) {
            data.userDetails = this.selfServiceDetails.requirements.registrationProperties.properties;

            if (has(this.selfServiceDetails, "requirements.properties.user.default") &&
                    !isUndefined(this.selfServiceDetails, "requirements.properties.user.default")) {
                each(this.selfServiceDetails.requirements.properties.user.default, (value, key) => {
                    data.userDetails[key].socialValue = value;
                });
            }

            each(this.selfServiceDetails.requirements.registrationProperties.required, (prop) => {
                data.userDetails[prop].required = true;
            });

            each(this.selfServiceDetails.requirements.registrationProperties.properties, (value, key) => {
                data.saveDetails[key] = "";
            });
        }

        if (this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.registrationPreferences) {
            data.saveDetails.preferences = {};
            data.userPreferences = this.selfServiceDetails.requirements.registrationPreferences;

            each(data.userPreferences, (value, key) => {
                data.saveDetails.preferences[key] = false;
            });
        }

        data.saveDetails.password = "";

        return data;
    },
    "methods": {
        // Add additional frontend checks for field validation here
        calculateValidation (property) {
            const validators = [];

            if (property.required) {
                validators.push("required");
            }

            if (property.policies) {
                // Add policy vee validators correlations here
                each(property.policies, (policy) => {
                    if (policy.policyId === "valid-email-address-format") {
                        validators.push("email");
                    }
                });
            }

            return validators.join("|");
        },

        getData () {
            const details = clone(this.saveDetails);

            delete details.confirmPassword;

            if (this.isSocialReg) {
                delete details.password;
            }

            return {
                "user": details
            };
        },

        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        },

        save () {
            // Need to ignore this validation because it does not preform in testing due to vue validate
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    this.$emit("advanceStage", this.getData());
                } else {
                    this.displayNotification("error", this.$t("pages.selfservice.registration.pleaseComplete"));
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

<style scoped lang="scss"></style>
