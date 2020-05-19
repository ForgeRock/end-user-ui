<template>
    <div class="fr-all-in-one-container">
        <idmUserDetails v-if="stages.idmUserDetails" :inline="true" :self-service-details="selfServiceDetails" />
        <kbaSecurityAnswerDefinitionStage v-if="stages.kbaSecurityAnswerDefinitionStage" :inline="true" :self-service-details="selfServiceDetails" />
        <Captcha v-if="stages.captcha" :self-service-details="selfServiceDetails" />

        <template v-if="stages.consent && selfServiceDetails.requirements && selfServiceDetails.requirements.consent">
            <b-modal ref="consentModal" :title="$t('pages.selfservice.registration.consent.title')" @hide="loading = false;">
                <Consent :inline="true" :self-service-details="selfServiceDetails" />

                <b-form-checkbox v-model="consentCheck" plain :value="false" :unchecked-value="true">
                    {{ $t("pages.selfservice.registration.consent.agreement") }}
                </b-form-checkbox>

                <div slot="modal-footer" class="w-100">
                    <b-btn :disabled="consentCheck" size="sm" class="float-right" variant="primary" @click="save">
                        {{ $t("common.form.okay") }}
                    </b-btn>
                </div>
            </b-modal>
        </template>

        <fr-loading-button
            type="button"
            variant="primary"
            class="mt-2 mb-3 btn-lg btn-block"
            :label="$t('common.form.signUp')"
            :loading="loading"
            :large="true"
            @click="saveCheck"
        />

        <TermsAndConditions
            v-if="stages.termsAndConditions && selfServiceDetails.requirements && selfServiceDetails.requirements.terms"
            :inline="true"
            :self-service-details="selfServiceDetails"
        />
    </div>
</template>

<script>
import { each, merge } from "lodash";
import Captcha from "../common/Captcha";
import Consent from "./Consent";
import idmUserDetails from "./UserDetails";
import kbaSecurityAnswerDefinitionStage from "./KBASecurityAnswerDefinitionStage";
import LoadingButton from "../../utils/LoadingButton";
import TermsAndConditions from "./TermsAndConditions";

/**
 * @description Selfservice stage that is used for combing multiple selfservice stages (User details, Captcha, KBA, Terms and Confitions and Consent)
 *
 */
export default {
    "name": "All-In-One-Registration",
    // eslint-disable-next-line sort-keys
    "components": {
        Captcha,
        Consent,
        TermsAndConditions,
        "fr-loading-button": LoadingButton,
        idmUserDetails,
        kbaSecurityAnswerDefinitionStage
    },
    data () {
        const data = {
            "consentCheck": true,
            "loading": false,
            "stages": {}
        };

        each(this.selfServiceDetails.requirements.stages, (name) => {
            data.stages[name] = true;
        });

        return data;
    },
    "methods": {
        getData () {
            let data = {};

            /* istanbul ignore next */
            each(this.$children, (child) => {
                let childData = {};

                if (child.getData) {
                    childData = child.getData();
                }

                data = merge(data, childData);
            });

            if (this.selfServiceDetails.requirements.consentEnabled) {
                data.consentGiven = "true";
            }

            return data;
        },

        isValid () {
            const childChecks = [],
                validPromise = new Promise((resolve, reject) => {
                    if (this.$children) {
                        each(this.$children, (child, index) => {
                            /* istanbul ignore next */
                            if (this.$children[index].isValid) {
                                childChecks.push(this.$children[index].isValid());
                            }
                        });
                    }

                    Promise.all(childChecks).then((results) => {
                        let validCheck = true;

                        each(results, (check) => {
                            /* istanbul ignore next */
                            if (check === false) {
                                validCheck = false;
                            }
                        });

                        if (validCheck) {
                            resolve({ "success": true });
                        } else {
                            this.displayNotification("error", this.$t("pages.selfservice.registration.pleaseComplete"));
                            this.loading = false;
                        }
                    });
                });

            return validPromise;
        },

        save () {
            this.$emit("advanceStage", this.getData());
            this.loading = false;
        },

        saveCheck () {
            this.loading = true;

            if (this.selfServiceDetails.requirements.consentEnabled) {
                this.isValid().then(() => {
                    this.$refs.consentModal.show();
                });
            } else {
                /* istanbul ignore next */
                this.isValid().then(() => {
                    this.save();
                });
            }
        }
    },
    "props": {
        "selfServiceDetails": { "required": true }
    }
};
</script>

<style scoped></style>
