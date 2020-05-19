import "core-js/stable";

import { delay, extend, has, isEmpty, isNull, isUndefined } from "lodash";

import App from "./App";
import ApplicationStore from "./store/Application";
import { BootstrapVue } from "bootstrap-vue/dist/bootstrap-vue.esm.min";
import Notifications from "vue-notification";
import PromisePoly from "es6-promise";
import ToggleButton from "vue-js-toggle-button";
import UserStore from "./store/User";
import VeeValidate from "vee-validate";
import Vue from "vue";
import axios from "axios";
import i18n from "./i18n";
import router from "./router";

// Turn off production warning messages
Vue.config.productionTip = false;
PromisePoly.polyfill();

/*
 * Ready translated locale messages
 * IDM Context default
 */
const idmContext = window.context || "/openidm";

// Router guard to check authenticated routes
// eslint-disable-next-line max-statements, max-lines-per-function
router.beforeEach((to, from, next) => {
    document.body.className = "";

    if (has(to, "meta.bodyClass")) {
        document.body.className = (document.body.className + to.meta.bodyClass).trim();
    }

    if (has(to, "meta.authenticate") && to.meta.authenticate === true) {
        if (isNull(UserStore.state.userId)) {
            let amLogin = false,
                temporaryHeaders = extend({
                    "cache-control": "no-cache",
                    "content-type": "application/json; charset=utf-8",
                    "x-requested-with": "XMLHttpRequest"
                }, ApplicationStore.state.authHeaders || {});

            /*
             *If we are in working with OpenAM to prevent extra redirects and timeouts we have to catch
             *the session right here and configure the appropriate headers
             */
            if (sessionStorage.getItem("resubmitDataStoreToken") && sessionStorage.getItem("amToken")) {
                temporaryHeaders = {
                    "X-OpenIDM-DataStoreToken": sessionStorage.getItem("amToken"),
                    "X-OpenIDM-NoSession": "false",
                    "X-OpenIDM-OAuth-Login": "true",
                    "X-Requested-With": "XMLHttpRequest"
                };

                amLogin = true;
            }

            const authInstance = axios.create({
                "baseURL": idmContext,
                "headers": temporaryHeaders,
                "timeout": 5000
            });

            authInstance.post("/authentication?_action=login").then(
                (userDetails) => {
                    if (amLogin) {
                        ApplicationStore.setAuthHeadersAction({
                            "X-OpenIDM-DataStoreToken": sessionStorage.getItem("amToken"),
                            "X-OpenIDM-OAuth-Login": "true",
                            "X-Requested-With": "XMLHttpRequest"
                        });
                    }

                    UserStore.setUserIdAction(userDetails.data.authorization.id);
                    UserStore.setManagedResourceAction(userDetails.data.authorization.component);
                    UserStore.setRolesAction(userDetails.data.authorization.roles);

                    // Check for progressive profiling.
                    if (
                        has(userDetails, "data.authorization.requiredProfileProcesses") &&
                        !isNull(userDetails.data.authorization.requiredProfileProcesses) &&
                        userDetails.data.authorization.requiredProfileProcesses.length > 0
                    ) {
                        // eslint-disable-next-line prefer-destructuring
                        const profileProcess = userDetails.data.authorization.requiredProfileProcesses[0].split("/")[1];

                        // eslint-disable-next-line callback-return
                        next(`/profileCompletion/${profileProcess}`);
                    } else {
                        axios.all([
                            authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                            authInstance.post("privilege?_action=listPrivileges"),
                            authInstance.get(`schema/${userDetails.data.authorization.component}`)
                        ]).then(axios.spread((profile, privilege, schema) => {
                            UserStore.setProfileAction(profile.data);
                            UserStore.setSchemaAction(schema.data);
                            UserStore.setAccess(privilege.data);

                            next();
                        }));
                    }
                },
                () => {
                // Recheck class in case of double login load using from location
                    document.body.className = "";

                    if (has(from, "meta.bodyClass")) {
                        document.body.className = (document.body.className + from.meta.bodyClass).trim();
                    }

                    if (to.name !== "Login") {
                        ApplicationStore.setLoginRedirect({
                            "name": to.name,
                            "params": to.params
                        });
                    }

                    next({ "name": "Login" });
                }
            );
        } else {
            // eslint-disable-next-line callback-return
            next();
        }
    } else {
        // eslint-disable-next-line callback-return
        next();
    }
});

// Globally load bootstrap vue components for use
Vue.use(BootstrapVue);

Vue.use(VeeValidate, { "fastExit": false, "inject": false });

Vue.use(Notifications);
Vue.use(ToggleButton);

// Global mixin for making openIDM REST calls
Vue.mixin({
    "methods": {
        // One location for checking and redirecting a completed login for s user
        completeLogin () {
            if (isNull(this.$root.applicationStore.state.loginRedirect)) {
                this.$router.push("/");
            } else {
                this.$router.push(this.$root.applicationStore.state.loginRedirect);
                this.$root.applicationStore.clearLoginRedirect();
            }
        },
        // Display a application notification
        displayNotification (notificationType, message) {
            /* istanbul ignore next */
            this.$notify({
                "group": "IDMMessages",
                "ignoreDuplicates": true,
                "text": message,
                "type": notificationType
            });
        },
        // Encode characters that cannot be used in browser request-header values
        encodeRFC5987IfNecessary (headerValue) {
            /* istanbul ignore next */
            const encoded = encodeURIComponent(headerValue).
                replace(/['()]/gu, escape).
                replace(/\*/gu, "%2A").
                replace(/%(?:7C|60|5E)/gu, unescape);
            /* istanbul ignore next */
            return encoded === headerValue ? headerValue : `UTF-8''${encoded}`;
        },
        // Headers used for oauth requests and self service
        getAnonymousHeaders () {
            const headers = this.$root.applicationStore.state.authHeaders || {
                "X-OpenIDM-NoSession": true,
                "X-OpenIDM-Password": "anonymous",
                "X-OpenIDM-Username": "anonymous"
            };

            return headers;
        },
        // Generated an axios ajax request service for consistent use of calls to IDM
        // eslint-disable-next-line max-statements
        getRequestService (config) {
            let baseURL = idmContext,
                headers = {
                    "cache-control": "no-cache",
                    "content-type": "application/json; charset=utf-8",
                    "x-requested-with": "XMLHttpRequest"
                },
                instance = null,
                timeout = 0;

            if (config) {
                if (config.baseURL) {
                    ({ baseURL } = config);
                }

                if (config.timeout) {
                    ({ timeout } = config);
                }

                if (config.headers && !isEmpty(config.headers)) {
                    ({ headers } = config);
                }
            }

            headers = extend(headers, this.$root.applicationStore.state.authHeaders || {});

            instance = axios.create({
                baseURL,
                headers,
                timeout
            });

            instance.interceptors.response.use((response) => response, (error) => {
                if (error.response && error.response.data && error.response.data.code === 401) {
                    if (this.$route.name !== "Login") {
                        ApplicationStore.setLoginRedirect({
                            "name": this.$route.name,
                            "params": this.$route.params
                        });
                    }

                    if (has(this.$root.applicationStore.state, "amDataEndpoints") &&
                        this.$root.applicationStore.state.amDataEndpoints !== null
                    ) {
                        this.logoutUser(true);
                    }

                    return Promise.reject(error);
                } else if (isUndefined(error.response)) {
                    // In the case of critical error
                    return Promise.reject(new Error(error.message));
                }
                return Promise.reject(error);
            });

            return instance;
        },
        // Log a user out of their existing session (both normal and fullstack)
        logoutUser (amLogout) {
            /* istanbul ignore next */
            const idmInstance = this.getRequestService({
                "headers": this.getAnonymousHeaders()
            });
            /* istanbul ignore next */
            idmInstance.post("/authentication?_action=logout").then((response) => {
                this.$root.userStore.clearStoreAction();

                /*
                 *In case of oauth + openAM we should always make sure these session variables are cleared on logout
                 */
                sessionStorage.removeItem("amToken");
                sessionStorage.removeItem("resubmitDataStoreToken");
                this.$root.applicationStore.clearAuthHeadersAction();
                this.$root.applicationStore.clearLoginRedirect();

                this.$router.push({ "name": "Login" });
            }, () => {
                if (amLogout) {
                    const baseUrl = this.$root.applicationStore.state.amDataEndpoints.baseUrl.replace(/realms\/[a-zA-Z0-9]*\/users\//u, ""),
                        // eslint-disable-next-line sort-vars
                        amInstance = axios.create({
                            "baseURL": baseUrl,
                            "headers": {
                                "Accept-API-Version": "protocol=1.0,resource=2.0",
                                "Content-type": "application/json"
                            },
                            "timeout": 5000
                        }),
                        doLogout = () => {
                            this.displayNotification("error", this.$t("config.messages.sessionExpired"));
                            delay(() => {
                                window.location.reload(true);
                            }, 4000);
                        };

                    amInstance.post("sessions?_action=logout", {}, { "withCredentials": true }).then(() => {
                        this.amLogoutSuccess = true;
                        doLogout();
                    }, () => {
                        if (!this.amLogoutSuccess) {
                            this.amLogoutSuccess = true;
                            doLogout();
                        }
                    });
                } else {
                    // If an error is thrown here reloading the page will clean up the state of the app
                    window.location.reload(true);
                }
            });
        },
        // Check if progressive profile is needed
        progressiveProfileCheck (userDetails, continueLogin, updateApiType) {
            if (
                has(userDetails, "data.authorization.requiredProfileProcesses") &&
                !isNull(userDetails.data.authorization.requiredProfileProcesses) &&
                userDetails.data.authorization.requiredProfileProcesses.length > 0
            ) {
                // eslint-disable-next-line prefer-destructuring
                const profileProcess = userDetails.data.authorization.requiredProfileProcesses[0].split("/")[1];

                if (updateApiType) {
                    this.apiType = profileProcess;
                }

                this.$router.push(`/profileCompletion/${profileProcess}`);
                // If we update the apiType we need to reload the selfServiceDetails with the fresh info.
                if (updateApiType) {
                    this.loadData();
                }
            } else {
                continueLogin();
            }
        }
    }
});

// eslint-disable-next-line one-var
const loadApp = function () {
        return new Vue({
            "components": { App },
            "data": {
                "applicationStore": ApplicationStore,
                "userStore": UserStore
            },
            "el": "#app",
            i18n,
            router,
            "template": "<App/>"
        });
    },
    startApp = function () {
        const idmInstance = axios.create({
            "baseURL": idmContext,
            "headers": {
                "X-OpenIDM-NoSession": true,
                "X-OpenIDM-Password": "anonymous",
                "X-OpenIDM-Username": "anonymous"
            },
            "timeout": 5000
        });

        // eslint-disable-next-line no-process-env
        ApplicationStore.setEnvironment(process.env);

        axios.all([
            idmInstance.get("/info/uiconfig"),
            idmInstance.get("info/features?_queryFilter=true")
        ]).then(axios.spread((uiConfig, availability) => {
            if (uiConfig.data.configuration.lang) {
                i18n.locale = uiConfig.data.configuration.lang;
            }

            if (uiConfig.data.configuration.amDataEndpoints) {
                ApplicationStore.setAmDataEndpointsAction(uiConfig.data.configuration.amDataEndpoints);
            }

            ApplicationStore.setEnduserSelfservice(availability.data.result);

            return loadApp();
        })).
            catch(() => loadApp());
    };

startApp();
