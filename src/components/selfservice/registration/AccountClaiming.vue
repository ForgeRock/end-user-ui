<template>
    <b-container v-if="!passwordVerification && !socialVerification" fluid class="h-100 px-0">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor" />
            </div>
        </div>
    </b-container>

    <fr-center-card v-else :show-logo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{ $t("pages.selfservice.accountClaiming.title") }}</h2>
            <span v-if="passwordVerification" v-html="$t('pages.selfservice.accountClaiming.passwordDesc', {account: mail})" />
            <span v-if="socialVerification">{{ socialDescription }}</span>
        </div>

        <b-card-body slot="center-card-body">
            <fr-floating-label-input
                v-if="passwordVerification"
                v-model="password"
                :label="$t('pages.login.password')"
                :reveal="true"
                type="password"
                field-name="password"
            />

            <fr-social-buttons v-if="socialVerification" :filter-providers="providers" :filter-providers-objects="providersObjects" signin />

            <button v-if="passwordVerification" class="btn btn-lg btn-primary btn-block mb-3" type="button" @click="claimAccount">
                {{ $t("pages.login.signIn") }}
            </button>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            <router-link action="" to="login">{{ $t("pages.selfservice.accountClaiming.return") }}</router-link>
        </b-card-footer>
    </fr-center-card>
</template>

<script>
import { each, has, isEmpty, isString, isUndefined, map, upperFirst } from "lodash";
// eslint-disable-next-line import/extensions
import { BounceLoader } from "vue-spinner/dist/vue-spinner.min.js";
import styles from "../../../scss/main.scss";
import CenterCard from "../../utils/CenterCard";
import FloatingLabelInput from "../../utils/FloatingLabelInput";
import SelfserviceAPI from "../mixins/SelfserviceAPIMixin";
import SocialButtons from "../../utils/SocialButtons";

export default {
    "name": "Account-Claiming",
    // eslint-disable-next-line sort-keys
    "components": {
        BounceLoader,
        "fr-center-card": CenterCard,
        "fr-floating-label-input": FloatingLabelInput,
        "fr-social-buttons": SocialButtons
    },
    "computed": {
        socialDescription () {
            const numberProviders = this.providers.length;
            let providerList = "";

            each(this.providers, (provider, index) => {
                if (numberProviders === 1) {
                    providerList += upperFirst(provider);
                } else if (index < numberProviders - 2) {
                    providerList += `${upperFirst(provider)}, `;
                } else if (index < numberProviders - 1) {
                    providerList += `${upperFirst(provider)} `;
                } else {
                    providerList += ` ${this.$t("pages.selfservice.social.or")} ${upperFirst(provider)}`;
                }
            });

            return this.$t("pages.selfservice.accountClaiming.socialDesc", { "providers": providerList });
        }
    },
    data () {
        return {
            "apiType": "socialUserClaim",
            "loadingColor": styles.baseColor,
            "mail": "",
            "password": "",
            "passwordVerification": false,
            "providers": [],
            "providersObjects": [],
            "selfServiceDetails": {},
            "socialVerification": false
        };
    },
    "methods": {
        apiErrorCallback (error) {
            /* istanbul ignore next */
            this.$router.push("/login");
            /* istanbul ignore next */
            this.displayNotification("error", error.response.data.message);
        },
        claimAccount (accountClaimingToken) {
            let { clientToken } = this;

            if (isString(accountClaimingToken)) {
                clientToken = accountClaimingToken;
            }
            /* istanbul ignore next */
            this.advanceStage({
                clientToken,
                "password": this.password
            });
        },
        // eslint-disable-next-line max-lines-per-function, max-statements
        setChildComponent (type, details) {
            /* istanbul ignore next */
            this.selfServiceDetails = details;
            /* istanbul ignore next */
            if (type === "parameters") {
                if (this.returnParams) {
                    this.advanceStage({
                        "returnParams": this.returnParams
                    });
                } else {
                    this.advanceStage({});
                }
            } else if (type === "socialUserClaim" && details.tag === "initial") {
                this.advanceStage({
                    "clientToken": this.clientToken
                });
            } else if (type === "socialUserClaim" && details.tag === "verifyProfile") {
                this.mail = has(details, "requirements.mail") ? details.requirements.mail : "";

                if (details.requirements.error) {
                    this.displayNotification("error", details.requirements.error.message);
                } else if (details.requirements.required.includes("password")) {
                    // You can get into this usecase by having a manually registered account with matching email and a password set
                    this.passwordVerification = true;
                } else if (this.clientToken && this.originalToken) {
                    this.advanceStage({
                        "clientToken": this.originalToken
                    });
                } else {
                    localStorage.setItem("accountClaimingToken", this.clientToken);
                    this.providers = map(details.requirements.definitions.providers.items.oneOf, "provider");
                    this.providersObjects = details.requirements.definitions.providers.items.oneOf;
                    this.socialVerification = true;
                }
            } else if ((type === "localAutoLogin" || type === "openAMAutoLogin") && isUndefined(details.additions.claimedProfile)) {
                if (sessionStorage.getItem("amSocialToken")) {
                    const temporaryToken = sessionStorage.getItem("amSocialToken");

                    this.$router.push({ "name": "Registration", "params": { "clientToken": temporaryToken } });
                } else {
                    this.$router.push({ "name": "Registration", "params": { "clientToken": this.clientToken } });
                }
            } else if (details.tag === "end" && details.status.success) {
                const socialLoginInstance = this.getRequestService({
                    "headers": {
                        "X-OpenIDM-DataStoreToken": sessionStorage.getItem("amSocialToken") || this.clientToken,
                        "X-OpenIDM-NoSession": "false",
                        "X-OpenIDM-OAuth-Login": "true",
                        "X-Requested-With": "XMLHttpRequest"
                    }
                });

                sessionStorage.removeItem("amSocialToken");

                socialLoginInstance.post("/authentication?_action=login").
                    then((userDetails) => {
                        // Check for progressive profiling.
                        this.progressiveProfileCheck(userDetails, () => {
                            if (has(details, "additions.successUrl") && !isEmpty(details.additions.successUrl)) {
                                window.location = details.additions.successUrl;
                            } else {
                                this.$router.push("/");
                            }
                            this.displayNotification("success", this.$t("pages.selfservice.accountClaiming.linked"));
                        });
                    }).
                    catch((error) => {
                        this.$router.push("/login");
                        this.displayNotification("error", error.response.data.message);
                    });
            } else {
                this.$router.push("/login");
                this.displayNotification("error", this.$t("pages.selfservice.accountClaiming.error"));
            }
        }
    },
    "mixins": [SelfserviceAPI],
    mounted () {
        if (localStorage.getItem("accountClaimingToken")) {
            const accountClaimingToken = localStorage.getItem("accountClaimingToken");

            localStorage.removeItem("accountClaimingToken");

            this.claimAccount(accountClaimingToken);
        } else {
            /* istanbul ignore next */
            this.loadData();
        }
    },
    "props": ["clientToken", "originalToken", "returnParams"]
};
</script>

<style scoped></style>
