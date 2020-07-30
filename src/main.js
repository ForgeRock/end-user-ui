/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import 'core-js/stable';
import _ from 'lodash';
import App from './App';
import ApplicationStore from './store/Application';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import i18n from './i18n';
import Notifications from 'vue-notification';
import PromisePoly from 'es6-promise';
import router from './router';
import ToggleButton from 'vue-js-toggle-button';
import UserStore from './store/User';
import {
    ValidationObserver,
    ValidationProvider,
    extend,
    localize
} from 'vee-validate';
import en from 'vee-validate/dist/locale/en.json';
import * as rules from 'vee-validate/dist/rules';
import Vue from 'vue';

// Turn off production warning messages
Vue.config.productionTip = false;
PromisePoly.polyfill();

// Ready translated locale messages
// IDM Context default
const idmContext = window.context || '/openidm',
    setSchemaProperties = function (schema) {
        if (_.has(schema, 'data.properties')) {
            schema.data.order.forEach((propName) => {
                let prop = schema.data.properties[propName];

                if (prop) {
                    // If the property is nullable type will be an array so we need to grab the first array item that is not null to determine property type
                    if (_.isArray(prop.type)) {
                        prop.isNullable = true;
                        prop.type = _.reject(prop.type, 'null')[0];
                    }
                }
            });
        }

        return schema;
    };

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
                }, {}),
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
                        const scrubbedSchema = setSchemaProperties(schema);
                        UserStore.setProfileAction(profile.data);
                        UserStore.setSchemaAction(scrubbedSchema.data);
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

                next({ name: 'Login' });
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

// Globally load bootstrap vue components for use
Vue.use(BootstrapVue);

// Register validation components for global use
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);
Object.keys(rules).forEach(rule => {
    extend(rule, rules[rule]);
});

// How to add an extra validation rule
extend('date_format', {
    validate (value) {
        return value.match(/^\d{2}[.//]\d{2}[.//]\d{4}$/);
    },
    message: () => {
        return 'Invalid date format';
    }
});

localize('en', en);

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
        // Get validation state for a form field
        getValidationState ({ dirty, validated, valid = null }) {
            return dirty || validated ? valid : null;
        },
        // Generated an axios ajax request service for consistent use of calls to IDM
        getRequestService: function (config) {
            let baseURL = idmContext,
                timeout = 0,
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
            let headers = {
                'X-OpenIDM-NoSession': true,
                'X-OpenIDM-Password': 'anonymous',
                'X-OpenIDM-Username': 'anonymous',
                'cache-control': 'no-cache'
            };

            return headers;
        },
        getSchema: function (resourcePath) {
            /* istanbul ignore next */
            let idmServiceInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });

            return idmServiceInstance.get(`schema/${resourcePath}`).then((schema) => {
                return setSchemaProperties(schema);
            });
        },
        // Display a application notification
        displayNotification: function (notificationType, message) {
            /* istanbul ignore next */
            this.$notify({
                group: 'IDMMessages',
                type: notificationType,
                text: message,
                ignoreDuplicates: true
            });
        },
        // Log a user out of their existing session
        logoutUser: function () {
            /* istanbul ignore next */
            let idmInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });
            /* istanbul ignore next */
            idmInstance.post('/authentication?_action=logout').then((response) => {
                this.$root.userStore.clearStoreAction();
                this.$router.push({ name: 'Login' });
            }, () => {
                // if an error is thrown here reloading the page will clean up the state of the app
                window.location.reload(true);
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
            this.$router.push('/');
        },
        // Encode characters that cannot be used in browser request-header values
        encodeRFC5987IfNecessary: function (headerValue) {
            /* istanbul ignore next */
            let encoded = encodeURIComponent(headerValue)
                .replace(/['()]/g, escape)
                .replace(/\*/g, '%2A');
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
