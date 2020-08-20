import _ from 'lodash';
import App from './App';
import ApplicationStore from './store/Application';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm.min';
import i18n from './i18n';
import Notifications from 'vue-notification';
import PromisePoly from 'es6-promise';
import router from './router';
import ToggleButton from 'vue-js-toggle-button';
import UserStore from './store/User';
import VeeValidate from 'vee-validate';
import Vue from 'vue';
import AppAuthHelper from 'appauthhelper';
import SessionCheck from 'oidcsessioncheck';
import 'core-js/stable';

// Turn off production warning messages
Vue.config.productionTip = false;

PromisePoly.polyfill();

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
    document.body.className = '';

    if (_.has(to, 'meta.bodyClass')) {
        document.body.className = (document.body.className + to.meta.bodyClass).trim();
    }

    if (_.has(to, 'meta.authenticate')) {
        if (_.isNull(UserStore.state.userId)) {
            let tempHeaders = _.extend({
                    'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
                }, ApplicationStore.state.authHeaders || {}),
                authInstance;

            authInstance = axios.create({
                baseURL: idmContext,
                timeout: 5000,
                headers: tempHeaders
            });

            authInstance.post('/authentication?_action=login').then((userDetails) => {
                UserStore.setUserIdAction(userDetails.data.authorization.id);
                UserStore.setManagedResourceAction(userDetails.data.authorization.component);
                UserStore.setRolesAction(userDetails.data.authorization.roles);

                axios.all([
                    authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                    authInstance.post(`privilege?_action=listPrivileges`),
                    authInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, privilege, schema) => {
                    UserStore.setProfileAction(profile.data);
                    UserStore.setSchemaAction(schema.data);
                    UserStore.setAccess(privilege.data);

                    next();
                }));
            },
            () => {
                // Recheck class in case of double login load using from location
                document.body.className = '';

                if (_.has(from, 'meta.bodyClass')) {
                    document.body.className = (document.body.className + from.meta.bodyClass).trim();
                }

                next({ name: 'Login' });
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

// Ready translated locale messages
// IDM Context default
const idmContext = window.context || '/openidm';

// Globally load bootstrap vue components for use
Vue.use(BootstrapVue);

/*
    Basic Validation Example:
    <p :class="{ 'control': true }">
        <input v-validate="'required|email'" :class="{'input': true, 'is-danger': errors.has('email') }" name="email" type="text" placeholder="Email">
        <span v-show="errors.has('email')" class="help is-danger">{{ errors.first('email') }}</span>
    </p>

    To use VeeValidate in a component include:

    $_veeValidate: {
        validator: 'new'
    }
 */
Vue.use(VeeValidate, { inject: false, fastExit: false });

/*
    Basic Notification Example:
    this.$notify({
        group: 'IDMMessages', // Currently the only group
        type: 'success', // Available types success, failure, info, warning
        title: this.$t('common.messages.saveSuccess'), //Translated string
        text: this.$t('pages.resources.mappingSave') // Translated string (can also be html)
    });
 */
Vue.use(Notifications);
Vue.use(ToggleButton);

// Global mixin for making openIDM REST calls
Vue.mixin({
    methods: {
        // Generated an axios ajax request service for consistent use of calls to IDM
        getRequestService: function (config) {
            let baseURL = idmContext,
                timeout = 5000,
                headers = {
                    'content-type': 'application/json',
                    'cache-control': 'no-cache',
                    'x-requested-with': 'XMLHttpRequest'
                },
                instance;

            if (config) {
                if (config.baseURL) {
                    baseURL = config.baseURL;
                }

                if (config.timeout) {
                    timeout = config.timeout;
                }

                if (config.headers && !_.isEmpty(config.headers)) {
                    headers = config.headers;
                }
            }

            headers = _.extend(headers, this.$root.applicationStore.state.authHeaders || {});
            headers['Authorization'] = 'Bearer ' + sessionStorage.getItem('accessToken');

            instance = axios.create({
                baseURL: baseURL,
                timeout: timeout,
                headers: headers
            });

            instance.interceptors.response.use((response) => {
                return response;
            }, (error) => {
                if (error.response && error.response.data && error.response.data.code === 401) {
                    this.$router.push({ name: 'Login' });

                    return Promise.reject(error);
                } else if (_.isUndefined(error.response)) {
                    // In the case of critical error
                    return Promise.reject(new Error(error.message));
                } else {
                    return Promise.reject(error);
                }
            });

            return instance;
        },
        // Headers used for oauth requests and selfservice
        getAnonymousHeaders: function () {
            let headers = this.$root.applicationStore.state.authHeaders || {
                'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
            };

            return headers;
        },
        // Display a application notification
        displayNotification: function (notificationType, message) {
            /* istanbul ignore next */
            this.$notify({
                group: 'IDMMessages',
                type: notificationType,
                text: message
            });
        },
        // Log a user out of their existing session (both normal and fullstack)
        logoutUser: function () {
            window.logout();
        },
        // One location for checking and redirecting a completed login for s user
        completeLogin () {
            if (!_.isNull(this.$root.applicationStore.state.loginRedirect)) {
                this.$router.push(this.$root.applicationStore.state.loginRedirect);
                this.$root.applicationStore.clearLoginRedirect();
            } else {
                this.$router.push('/');
            }
        }
    }
});

/*
    We will load the application regardless
 */
var startApp = function () {
        let idmInstance = axios.create({
            baseURL: idmContext,
            timeout: 5000,
            headers: {
                'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
            }
        });

        axios.all([
            idmInstance.get('/info/uiconfig'),
            idmInstance.get('info/features?_queryFilter=true')]).then(axios.spread((uiConfig, availability) => {
            if (uiConfig.data.configuration.lang) {
                i18n.locale = uiConfig.data.configuration.lang;
            }

            if (uiConfig.data.configuration.amDataEndpoints) {
                ApplicationStore.setAmDataEndpointsAction(uiConfig.data.configuration.amDataEndpoints);
            }

            ApplicationStore.setEnduserSelfservice(availability.data.result);

            return loadApp();
        }))
            .catch(() => {
                return loadApp();
            });
    },
    loadApp = function () {
        /* eslint-disable no-new */
        return new Vue({
            el: '#app',
            router,
            i18n,
            template: '<App/>',
            components: { App },
            data: {
                userStore: UserStore,
                applicationStore: ApplicationStore
            }
        });
    },
    addAppAuth = () => {
        var AM_URL = ApplicationStore.state.amBaseURL,
            commonSettings = {
                clientId: ApplicationStore.state.idmClientID,
                authorizationEndpoint: AM_URL + '/oauth2/authorize'
            },
            redirectToLogin = () => {
                window.location.href = ApplicationStore.state.loginURL;
            };

        AppAuthHelper.init({
            clientId: commonSettings.clientId,
            authorizationEndpoint: commonSettings.authorizationEndpoint,
            scopes: 'openid',
            tokenEndpoint: AM_URL + '/oauth2/access_token',
            revocationEndpoint: AM_URL + '/oauth2/token/revoke',
            endSessionEndpoint: AM_URL + '/oauth2/connect/endSession',
            redirectUri: window.location.origin + '/appAuthHelperRedirect.html',
            interactionRequiredHandler: function () {
                redirectToLogin();
            },
            tokensAvailableHandler: function (claims) {
                // this function is called every time the tokens are either
                // originally obtained or renewed
                var sessionCheck = new SessionCheck({
                    clientId: commonSettings.clientId,
                    opUrl: commonSettings.authorizationEndpoint,
                    redirectUri: window.location.origin + '/sessionCheck.html',
                    subject: claims.sub,
                    invalidSessionHandler: function () {
                        AppAuthHelper.logout().then(function () {
                            redirectToLogin();
                        });
                    },
                    cooldownPeriod: 5
                });
                // check the validity of the session immediately
                sessionCheck.triggerSessionCheck();

                // check every minute
                setInterval(function () {
                    sessionCheck.triggerSessionCheck();
                }, 60000);
                // check with every captured event
                document.addEventListener('click', function () {
                    sessionCheck.triggerSessionCheck();
                });
                document.addEventListener('keypress', function () {
                    sessionCheck.triggerSessionCheck();
                });

                startApp();
            }
        });

        // In this application, we want tokens immediately, before any user interaction is attempted
        AppAuthHelper.getTokens();

        // trigger logout from anywhere in the SPA by calling this global function
        window.logout = function () {
            AppAuthHelper.logout().then(function () {
                redirectToLogin();
            });
        };
    };

ApplicationStore.setEnvironment(process.env);
addAppAuth();
