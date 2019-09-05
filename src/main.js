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
import 'core-js/stable';

// Turn off production warning messages
Vue.config.productionTip = false;
PromisePoly.polyfill();

// Add translation capability
/*
  Basic Translation Example:

  HTML: {{ $t("pages.resources.externalResources") }}
  JS: this.$t("pages.resources.externalResources")
 */

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
    document.body.className = '';

    if (_.has(to, 'meta.bodyClass')) {
        document.body.className = (document.body.className + to.meta.bodyClass).trim();
    }

    if (_.has(to, 'meta.authenticate') && to.meta.authenticate === true) {
        if (_.isNull(UserStore.state.userId)) {
            let tempHeaders = _.extend({
                    'content-type': 'application/json; charset=utf-8',
                    'cache-control': 'no-cache',
                    'x-requested-with': 'XMLHttpRequest'
                }, ApplicationStore.state.authHeaders || {}),
                amLogin = false,
                authInstance;

            /*
                If we are in working with OpenAM to prevent extra redirects and timeouts we have to catch
                the session right here and configure the appropriate headers
             */
            if (sessionStorage.getItem('resubmitDataStoreToken') && sessionStorage.getItem('amToken')) {
                tempHeaders = {
                    'X-OpenIDM-NoSession': 'false',
                    'X-OpenIDM-OAuth-Login': 'true',
                    'X-OpenIDM-DataStoreToken': sessionStorage.getItem('amToken'),
                    'X-Requested-With': 'XMLHttpRequest'
                };

                amLogin = true;
            }

            authInstance = axios.create({
                baseURL: idmContext,
                timeout: 5000,
                headers: tempHeaders
            });

            authInstance.post('/authentication?_action=login').then((userDetails) => {
                /*
                    Similar to oauthReturn we need to manipulate the correct headers for open AM here as well (if not the UI gets into an odd state where it will
                    randomly go back to openAM to restore its session since the existing JWT returned from IDM has timed out.

                    This is not ideal, but to create the least painful UI experience this is what we have to do for now.
                 */
                if (amLogin) {
                    ApplicationStore.setAuthHeadersAction({
                        'X-OpenIDM-OAuth-Login': 'true',
                        'X-OpenIDM-DataStoreToken': sessionStorage.getItem('amToken'),
                        'X-Requested-With': 'XMLHttpRequest'
                    });
                }

                UserStore.setUserIdAction(userDetails.data.authorization.id);
                UserStore.setManagedResourceAction(userDetails.data.authorization.component);
                UserStore.setRolesAction(userDetails.data.authorization.roles);

                // Check for progressive profiling.
                if (
                    _.has(userDetails, 'data.authorization.requiredProfileProcesses') &&
                    !_.isNull(userDetails.data.authorization.requiredProfileProcesses) &&
                    userDetails.data.authorization.requiredProfileProcesses.length > 0
                ) {
                    let profileProcess = userDetails.data.authorization.requiredProfileProcesses[0].split('/')[1];

                    next(`/profileCompletion/${profileProcess}`);
                } else {
                    axios.all([
                        authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                        authInstance.post(`privilege?_action=listPrivileges`),
                        authInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, privilege, schema) => {
                        UserStore.setProfileAction(profile.data);
                        UserStore.setSchemaAction(schema.data);
                        UserStore.setAccess(privilege.data);

                        next();
                    }));
                }
            },
            () => {
                // Recheck class in case of double login load using from location
                document.body.className = '';

                if (_.has(from, 'meta.bodyClass')) {
                    document.body.className = (document.body.className + from.meta.bodyClass).trim();
                }

                if (to.name !== 'Login') {
                    ApplicationStore.setLoginRedirect({
                        name: to.name,
                        params: to.params
                    });
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
                    'content-type': 'application/json; charset=utf-8',
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

            instance = axios.create({
                baseURL: baseURL,
                timeout: timeout,
                headers: headers
            });

            instance.interceptors.response.use((response) => {
                return response;
            }, (error) => {
                if (error.response && error.response.data && error.response.data.code === 401) {
                    if (this.$route.name !== 'Login') {
                        ApplicationStore.setLoginRedirect({
                            name: this.$route.name,
                            params: this.$route.params
                        });
                    }

                    if (_.has(this.$root.applicationStore.state, 'amDataEndpoints') &&
                        this.$root.applicationStore.state.amDataEndpoints !== null
                    ) {
                        this.logoutUser(true);
                    }

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
                'X-OpenIDM-NoSession': true,
                'X-OpenIDM-Password': 'anonymous',
                'X-OpenIDM-Username': 'anonymous'
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
        logoutUser: function (amLogout) {
            /* istanbul ignore next */
            let idmInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });
            /* istanbul ignore next */
            idmInstance.post('/authentication?_action=logout').then((response) => {
                this.$root.userStore.clearStoreAction();

                /*
                    In case of oauth + openAM we should always make sure these session variables are cleared on logout
                 */
                sessionStorage.removeItem('amToken');
                sessionStorage.removeItem('resubmitDataStoreToken');
                this.$root.applicationStore.clearAuthHeadersAction();
                this.$root.applicationStore.clearLoginRedirect();

                this.$router.push({ name: 'Login' });
            }, () => {
                if (amLogout) {
                    let baseUrl = this.$root.applicationStore.state.amDataEndpoints.baseUrl.replace(/realms\/[a-zA-Z0-9]*\/users\//, ''),
                        amInstance = axios.create({
                            baseURL: baseUrl,
                            timeout: 5000,
                            headers: {
                                'Content-type': 'application/json',
                                'Accept-API-Version': 'protocol=1.0,resource=2.0'
                            }
                        }),
                        doLogout = () => {
                            this.displayNotification('error', this.$t('config.messages.sessionExpired'));
                            _.delay(() => {
                                window.location.reload(true);
                            }, 4000);
                        };

                    amInstance.post('sessions?_action=logout', {}, { withCredentials: true }).then(() => {
                        this.amLogoutSuccess = true;
                        doLogout();
                    }, () => {
                        if (!this.amLogoutSuccess) {
                            this.amLogoutSuccess = true;
                            doLogout();
                        }
                    });
                } else {
                    // if an error is thrown here reloading the page will clean up the state of the app
                    window.location.reload(true);
                }
            });
        },
        // Check if progressive profile is needed
        progressiveProfileCheck (userDetails, continueLogin, updateApiType) {
            if (
                _.has(userDetails, 'data.authorization.requiredProfileProcesses') &&
                !_.isNull(userDetails.data.authorization.requiredProfileProcesses) &&
                userDetails.data.authorization.requiredProfileProcesses.length > 0
            ) {
                let profileProcess = userDetails.data.authorization.requiredProfileProcesses[0].split('/')[1];

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
        },
        // One location for checking and redirecting a completed login for s user
        completeLogin () {
            if (!_.isNull(this.$root.applicationStore.state.loginRedirect)) {
                this.$router.push(this.$root.applicationStore.state.loginRedirect);
                this.$root.applicationStore.clearLoginRedirect();
            } else {
                this.$router.push('/');
            }
        },
        // Encode characters that cannot be used in browser request-header values
        encodeRFC5987IfNecessary: function (headerValue) {
            /* istanbul ignore next */
            let encoded = encodeURIComponent(headerValue)
                .replace(/['()]/g, escape)
                .replace(/\*/g, '%2A')
                .replace(/%(?:7C|60|5E)/g, unescape);
            /* istanbul ignore next */
            return encoded === headerValue ? headerValue : "UTF-8''" + encoded;
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
                'X-OpenIDM-NoSession': true,
                'X-OpenIDM-Password': 'anonymous',
                'X-OpenIDM-Username': 'anonymous'
            }
        });

        ApplicationStore.setEnvironment(process.env);

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
    };

startApp();
