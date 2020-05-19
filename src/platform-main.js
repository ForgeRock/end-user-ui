/* eslint-disable unicorn/filename-case */
import { extend, has, isEmpty, isNull, isUndefined } from "lodash";

import App from "./App";
import AppAuthHelper from "appauthhelper";
import ApplicationStore from "./store/Application";
import { BootstrapVue } from "bootstrap-vue/dist/bootstrap-vue.esm.min";
import Notifications from "vue-notification";
import PromisePoly from "es6-promise";
import SessionCheck from "oidcsessioncheck";
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

const idmContext = window.context || "/openidm";

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
    document.body.className = "";

    if (has(to, "meta.bodyClass")) {
        document.body.className = (document.body.className + to.meta.bodyClass).trim();
    }

    if (has(to, "meta.authenticate")) {
        if (isNull(UserStore.state.userId)) {
            const temporaryHeaders = extend({
                    "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
                }, ApplicationStore.state.authHeaders || {}),
                // eslint-disable-next-line sort-vars
                authInstance = axios.create({
                    "baseURL": idmContext,
                    "headers": temporaryHeaders,
                    "timeout": 5000
                });

            authInstance.post("/authentication?_action=login").then(
                (userDetails) => {
                    UserStore.setUserIdAction(userDetails.data.authorization.id);
                    UserStore.setManagedResourceAction(userDetails.data.authorization.component);
                    UserStore.setRolesAction(userDetails.data.authorization.roles);

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
                },
                () => {
                // Recheck class in case of double login load using from location
                    document.body.className = "";

                    if (has(from, "meta.bodyClass")) {
                        document.body.className = (document.body.className + from.meta.bodyClass).trim();
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
                "text": message,
                "type": notificationType
            });
        },
        // Headers used for oauth requests and selfservice
        getAnonymousHeaders () {
            const headers = this.$root.applicationStore.state.authHeaders || {
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            };

            return headers;
        },
        // Generated an axios ajax request service for consistent use of calls to IDM
        // eslint-disable-next-line max-statements
        getRequestService (config) {
            let baseURL = idmContext,
                headers = {
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "x-requested-with": "XMLHttpRequest"
                },
                instance = null,
                timeout = 5000;

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
            headers.Authorization = `Bearer ${sessionStorage.getItem("accessToken")}`;

            instance = axios.create({
                baseURL,
                headers,
                timeout
            });

            instance.interceptors.response.use((response) => response, (error) => {
                if (error.response && error.response.data && error.response.data.code === 401) {
                    this.$router.push({ "name": "Login" });

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
        logoutUser () {
            window.logout();
        }
    }
});

// eslint-disable-next-line one-var
const loadApp = function () {
    /* eslint-disable no-new */
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
                "Authorization": `Bearer ${sessionStorage.getItem("accessToken")}`
            },
            "timeout": 5000
        });

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
    },
    // eslint-disable-next-line sort-vars,  max-lines-per-function
    addAppAuth = () => {
        const AM_URL = ApplicationStore.state.amBaseURL,
            commonSettings = {
                "authorizationEndpoint": `${AM_URL}/oauth2/authorize`,
                "clientId": ApplicationStore.state.idmClientID
            },
            redirectToLogin = () => {
                window.location.href = ApplicationStore.state.loginURL;
            };

        AppAuthHelper.init({
            "authorizationEndpoint": commonSettings.authorizationEndpoint,
            "clientId": commonSettings.clientId,
            "endSessionEndpoint": `${AM_URL}/oauth2/connect/endSession`,
            interactionRequiredHandler () {
                redirectToLogin();
            },
            "redirectUri": `${window.location.origin}/appAuthHelperRedirect.html`,
            "revocationEndpoint": `${AM_URL}/oauth2/token/revoke`,
            "scopes": "openid",
            "tokenEndpoint": `${AM_URL}/oauth2/access_token`,
            tokensAvailableHandler (claims) {
                // Called every time the tokens are either originally obtained or renewed
                const sessionCheck = new SessionCheck({
                    "clientId": commonSettings.clientId,
                    "cooldownPeriod": 5,
                    invalidSessionHandler () {
                        AppAuthHelper.logout().then(() => {
                            redirectToLogin();
                        });
                    },
                    "opUrl": commonSettings.authorizationEndpoint,
                    "redirectUri": `${window.location.origin}/sessionCheck.html`,
                    "subject": claims.sub
                });
                // Check the validity of the session immediately
                sessionCheck.triggerSessionCheck();

                // Check every minute
                setInterval(() => {
                    sessionCheck.triggerSessionCheck();
                }, 60000);
                // Check with every captured event
                document.addEventListener("click", () => {
                    sessionCheck.triggerSessionCheck();
                });
                document.addEventListener("keypress", () => {
                    sessionCheck.triggerSessionCheck();
                });
                startApp();
            }
        });

        // In this application, we want tokens immediately, before any user interaction is attempted
        AppAuthHelper.getTokens();

        // Trigger logout from anywhere in the SPA by calling this global function
        // eslint-disable-next-line func-names
        window.logout = function () {
            AppAuthHelper.logout().then(() => {
                redirectToLogin();
            });
        };
    };

// eslint-disable-next-line no-process-env
ApplicationStore.setEnvironment(process.env);
addAppAuth();
