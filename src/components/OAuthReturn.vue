<template>
    <b-container fluid class="h-100 px-0">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor" />
            </div>
        </div>
    </b-container>
</template>

<script>
import { each, extend, has, isNull } from "lodash";
import styles from "../scss/main.scss";
// eslint-disable-next-line import/extensions
import { BounceLoader } from "vue-spinner/dist/vue-spinner.min.js";

/**
 * @description Return page used for oauth provider authentication. Will appropriately redirect a user to login or account claiming.
 *
 * @fires POST identityProviders?_action=handlePostAuth - Generates the token used for continuing the authentication process based off of the returned provider information
 * @fires POST authentication?_action=login - Uses data store token to establish a new user session
 */
export default {
    "components": {
        "bounce-loader": BounceLoader
    },
    data () {
        return {
            "loadingColor": styles.baseColor
        };
    },
    // eslint-disable-next-line max-lines-per-function, max-statements, sort-keys
    created () {
        let queryParameters = {};

        /*
         * This check is for openAM fullstack only. With the return of a special URL #/handleOAuth/
         * We are given a clientToken that we can directly pass on to accountClaiming / Registration
         */
        if (this.$route.params.amData) {
            queryParameters = {};

            each(this.$route.params.amData.replace("?", "").split("&"), (parameter) => {
                if (parameter.length > 0) {
                    const parts = parameter.split("=");
                    // eslint-disable-next-line prefer-destructuring
                    queryParameters[parts[0]] = parts[1];
                }
            });

            window.history.pushState("", "", window.location.pathname);

            this.$router.push({
                "name": "AccountClaiming",
                "params": {
                    "clientToken": queryParameters.clientToken,
                    "returnParams": queryParameters.returnParams
                }
            });
        } else {
            queryParameters = window.location.search.replace("?", "").split("&").
                reduce((map, item) => {
                    const parts = item.split("="),
                        valueDecoded = [decodeURIComponent(parts[1])];

                    map[parts[0]] = map[parts[0]] ? map[parts[0]].concat(valueDecoded) : valueDecoded;
                    return map;
                }, {});

            window.history.pushState("", "", window.location.pathname);

            this.$root.applicationStore.clearAuthHeadersAction();

            /* istanbul ignore next */
            const linkedProvider = localStorage.getItem("linkedProvider"),
                socialInstance = this.getRequestService({
                    "headers": extend(this.getAnonymousHeaders(), {
                        "X-OpenIDM-DataStoreToken": localStorage.getItem("dataStoreToken"),
                        "X-OpenIDM-NoSession": "true"
                    })
                });

            /* istanbul ignore next */
            localStorage.removeItem("dataStoreToken");
            localStorage.removeItem("linkedProvider");

            /* istanbul ignore next */
            socialInstance.post("/identityProviders?_action=handlePostAuth", queryParameters).
                // eslint-disable-next-line max-lines-per-function
                then((response) => {
                    const dataStoreToken = response.data.token,
                        originalToken = localStorage.getItem("accountClaimingToken");

                    localStorage.removeItem("accountClaimingToken");

                    // eslint-disable-next-line one-var
                    const socialLoginInstance = this.getRequestService({
                        "headers": {
                            "X-OpenIDM-DataStoreToken": dataStoreToken,
                            "X-OpenIDM-NoSession": "false",
                            "X-OpenIDM-OAuth-Login": "true",
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    });
                    socialLoginInstance.post("/authentication?_action=login").
                        // eslint-disable-next-line padded-blocks
                        then((responseAuth) => {

                            /*
                             * If amDataEndpoints exist we know this if fullStack mode.
                             *     We need to set the headers to be used on all this user's authenticated requests.
                             *     Basically re-logging in on every request with a valid am token. We also need to
                             *     grab the logoutUrl so we can use that to kill not only the idm session
                             *     but also the am session.
                             */
                            if (has(this.$root.applicationStore.state, "amDataEndpoints") &&
                                this.$root.applicationStore.state.amDataEndpoints !== null
                            ) {
                                this.$root.applicationStore.setAuthHeadersAction({
                                    "X-OpenIDM-DataStoreToken": dataStoreToken,
                                    "X-OpenIDM-OAuth-Login": "true",
                                    "X-Requested-With": "XMLHttpRequest"
                                });

                                sessionStorage.setItem("amToken", dataStoreToken);
                                sessionStorage.setItem("resubmitDataStoreToken", "true");
                            }

                            // Check for progressive profiling.
                            this.progressiveProfileCheck(responseAuth, () => {
                                if (linkedProvider) {
                                    this.$router.push({
                                        "name": "Profile",
                                        "params": {
                                            "clientToken": dataStoreToken,
                                            linkedProvider
                                        }
                                    });
                                } else if (isNull(originalToken)) {
                                    this.$router.push("/");
                                } else {
                                    this.$router.push({
                                        "name": "AccountClaiming",
                                        "params": {
                                            "clientToken": dataStoreToken,
                                            originalToken
                                        }
                                    });
                                }
                            });
                        }).
                        catch(() => {
                            this.$router.push({
                                "name": "AccountClaiming",
                                "params": {
                                    "clientToken": dataStoreToken,
                                    originalToken
                                }
                            });
                        });
                }).
                catch((error) => {
                    this.$router.push("/login");
                    this.displayNotification("error", error.response.data.message);
                });
        }
    },
    "name": "OAuth-Return"
};
</script>
