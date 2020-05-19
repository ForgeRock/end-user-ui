<template>
    <div class="h-100">
        <b-container v-show="!showSelfService" fluid class="h-100 px-0">
            <div class="h-100 d-flex">
                <div class="m-auto fr-center-card">
                    <bounce-loader :color="loadingColor" />
                </div>
            </div>
        </b-container>

        <div v-show="showSelfService">
            <fr-center-card v-if="selfServiceType !== 'localAutoLogin'" :show-logo="true">
                <div slot="center-card-header">
                    <h2 v-show="title.length > 0" class="h2">{{ title }}</h2>
                    <p v-show="subtitle.length > 0" class="text-center mb-0">{{ subtitle }}</p>
                </div>

                <b-card-body slot="center-card-body">
                    <component
                        :is="selfServiceType"
                        v-show="showSelfService"
                        ref="selfServiceStage"
                        :self-service-details="selfServiceDetails"
                        @advanceStage="advanceStage"
                    />
                </b-card-body>

                <b-card-footer slot="center-card-footer">
                    {{ $t('pages.selfservice.registration.haveAccount') }}
                    <router-link action="" :to="{name: 'Login'}">{{ $t('pages.selfservice.registration.signIn') }}</router-link>
                </b-card-footer>
            </fr-center-card>
        </div>
    </div>
</template>

<script>
import { each, has, includes, toLower } from "lodash";
// eslint-disable-next-line import/extensions
import { BounceLoader } from "vue-spinner/dist/vue-spinner.min.js";
import styles from "../../../scss/main.scss";
import CenterCard from "../../utils/CenterCard";
import AllInOneRegistration from "./AllInOneRegistration";
import Captcha from "../common/Captcha";
import Consent from "./Consent";
import emailValidation from "./EmailValidation";
import GenericSelfService from "../common/GenericSelfService";
import idmUserDetails from "./UserDetails";
import kbaSecurityAnswerDefinitionStage from "./KBASecurityAnswerDefinitionStage";
import SelfserviceAPI from "../mixins/SelfserviceAPIMixin";
import TermsAndConditions from "./TermsAndConditions";

const customTitleComponents = [
    "captcha",
    "consent",
    "emailValidation",
    "kbaSecurityAnswerDefinitionStage",
    "termsAndConditions"
];

/**
 * @description Selfservice controlling component for registering a resource (e.g. a new user). Makes use of selfservice-registration.json config file.
 *
 * @mixin - selfservice/mixins/SelfserviceAPIMixin.vue
 *
 * @fires POST authentication?_action=login - Uses localAutoLogin stage that sets a JWT after a successful registration to start a user session.
 * Alternatively if registration came through social, login will use the data store token to go forward with login after a successful registration.
 * @fires POST authentication?_action=logout - Ends current user session
 */
export default {
    "name": "Registration",
    // eslint-disable-next-line sort-keys
    "components": {
        AllInOneRegistration,
        BounceLoader,
        Captcha,
        Consent,
        GenericSelfService,
        TermsAndConditions,
        emailValidation,
        "fr-center-card": CenterCard,
        idmUserDetails,
        kbaSecurityAnswerDefinitionStage
    },
    "computed": {
        subtitle () {
            if (includes(customTitleComponents, this.selfServiceType)) {
                return this.$t(`pages.selfservice.registration.stageSubtitle.${this.selfServiceType}`);
            }
            return this.$t("pages.selfservice.registration.signUpMsg");
        },
        title () {
            if (includes(customTitleComponents, this.selfServiceType)) {
                return this.$t(`pages.selfservice.registration.stageTitle.${this.selfServiceType}`);
            }
            return this.$t("pages.selfservice.registration.signUp");
        }
    },
    data () {
        return {
            "apiType": "registration",
            "clientTokenUsed": false,
            "loadingColor": styles.baseColor,
            "selfServiceDetails": null,
            "selfServiceType": null,
            "showSelfService": false
        };
    },
    "methods": {
        apiErrorCallback (error) {
            this.showSelfService = true;

            /* istanbul ignore next */
            this.displayNotification("error", this.findPolicyError(error.response));
        },
        autoLogin (jwt, successUrl) {
            /* istanbul ignore next */
            const idmInstance = this.getRequestService({
                    "headers": this.getAnonymousHeaders()
                }),
                loginServiceInstance = this.getRequestService({
                    "headers": {
                        "X-OpenIDM-Jwt": jwt,
                        "X-OpenIDM-NoSession": false,
                        "X-OpenIDM-Password": null,
                        "X-OpenIDM-Username": null
                    }
                });

            /* istanbul ignore next */
            idmInstance.post("/authentication?_action=logout").then(() => {
                loginServiceInstance.post("/authentication?_action=login").then((userDetails) => {
                    this.displayNotification("success", this.$t("pages.selfservice.registration.createdAccount"));

                    if (successUrl && successUrl.length > 0) {
                        window.location = successUrl;
                    } else {
                        // Check for progressive profiling.
                        this.progressiveProfileCheck(userDetails, () => {
                            this.$router.push("/");
                        });
                    }
                }).
                    catch((error) => {
                        /* istanbul ignore next */
                        this.displayNotification("error", error.response.data.message);
                    });
            });
        },
        findPolicyError (errorResponse) {
            let errorMessage = errorResponse.data.message,
                policyError = "";

            if (has(errorResponse, "data.detail.failedPolicyRequirements")) {
                // eslint-disable-next-line prefer-destructuring
                const policy = errorResponse.data.detail.failedPolicyRequirements[0];

                if (policy.policyRequirements.length > 0) {
                    policyError = this.$t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, policy.policyRequirements[0].params);

                    errorMessage = `${this.$t("common.policyValidationMessages.policyValidationFailed", { "property": policy.property })}: ${policyError}`;
                }
            }

            return errorMessage;
        },
        // eslint-disable-next-line max-lines-per-function, max-statements
        setChildComponent (type, details) {
            this.selfServiceDetails = details;

            if (type === "parameters") {
                this.selfServiceType = null;
                this.showSelfService = false;

                this.advanceStage({
                    "input": {}
                });
            } else if (this.clientToken && !this.clientTokenUsed) {
                this.advanceStage({
                    "clientToken": this.clientToken,
                    "oauthRegister": "true"
                });
                this.clientTokenUsed = true;
            } else if (details.type === "localAutoLogin") {
                if (has(details, "additions.oauthLogin") && details.additions.oauthLogin) {
                    /* istanbul ignore next */
                    const socialLoginInstance = this.getRequestService({
                        "headers": {
                            "X-OpenIDM-DataStoreToken": this.clientToken,
                            "X-OpenIDM-NoSession": "false",
                            "X-OpenIDM-OAuth-Login": "true",
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    });

                    /* istanbul ignore next */
                    socialLoginInstance.post("/authentication?_action=login").
                        then((userDetails) => {
                            this.displayNotification("success", this.$t("pages.selfservice.registration.createdAccount"));

                            if (details.additions.successUrl && details.additions.successUrl.length > 0) {
                                window.location = details.additions.successUrl;
                            } else {
                                this.progressiveProfileCheck(userDetails, () => {
                                    window.history.pushState("", "", window.location.pathname);
                                    this.$router.push("/");
                                });
                            }
                        }).
                        catch(() => {
                            window.history.pushState("", "", window.location.pathname);
                            this.$router.push("/login");
                        });
                } else {
                    this.autoLogin(details.additions.credentialJwt, details.additions.successUrl);
                }
            } else if (type === "openAMAutoLogin" && details.status) {
                if (has(details, "additions.successUrl")) {
                    // If there is a provided success url then follow it.
                    /* istanbul ignore next */
                    window.location.href = details.additions.successUrl;
                } else {
                    // Otherwise, redirect to login and send success notification.
                    this.$router.push("/login");
                    /* istanbul ignore next */
                    this.displayNotification("success", this.$t("pages.selfservice.registration.createdAccount"));
                }
            } else {
                let stageCheck = false;

                each(this.$options.components, (value, key) => {
                    if (toLower(key) === toLower(type)) {
                        stageCheck = true;
                    }
                });

                if (stageCheck) {
                    this.selfServiceType = type;
                } else {
                    this.selfServiceType = "GenericSelfService";
                }

                this.showSelfService = true;
            }
        }
    },
    "mixins": [SelfserviceAPI],
    mounted () {
        if (this.$route.params.queryParams) {
            /* istanbul ignore next */
            // This stops the flicker by hiding everything in the center-card; queryParams come from the link emailed to the user for the emailValidation stage
            this.selfServiceType = "localAutoLogin";
            this.advanceStage(this.parseQueryParams(this.$route.params.queryParams));
        } else {
            this.loadData();
        }
    },
    "props": ["clientToken"]
};
</script>
