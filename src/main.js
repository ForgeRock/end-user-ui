import _ from 'lodash';
import App from './App';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import Notifications from 'vue-notification';
import Router from 'vue-router';
import router from './router';
import translations from './translations';
import UserStore from './store/User';
import VeeValidate from 'vee-validate';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import ToggleButton from 'vue-js-toggle-button';

// Turn off production warning messages
Vue.config.productionTip = false;

// Add translation capability
/*
  Basic Translation Example:

  HTML: {{ $t("pages.resources.externalResources") }}
  JS: this.$t("pages.resources.externalResources")
 */
Vue.use(VueI18n);

// Setup router
Vue.use(Router);

// Router guard to check authenticated routes
router.beforeEach((to, from, next) => {
    document.body.className = '';

    if (_.has(to, 'meta.bodyClass')) {
        document.body.className = (document.body.className + to.meta.bodyClass).trim();
    }

    if (_.has(to, 'meta.authenticate')) {
        if (_.isNull(UserStore.state.userId)) {
            let authInstance = axios.create({
                baseURL: '/openidm',
                timeout: 1000,
                headers: {
                    'content-type': 'application/json',
                    'cache-control': 'no-cache',
                    'x-requested-with': 'XMLHttpRequest'
                }
            });

            authInstance.post('/authentication?_action=login').then((userDetails) => {
                UserStore.setUserIdAction(userDetails.data.authorization.id);
                UserStore.setManagedResourceAction(userDetails.data.authorization.component);
                UserStore.setRolesAction(userDetails.data.authorization.roles);

                axios.all([
                    authInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                    authInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, schema) => {
                        UserStore.setProfileAction(profile.data);
                        UserStore.setSchemaAction(schema.data);

                        next();
                    }))
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.displayNotification('error', error.response.data.message);
                    });
            },
            () => {
                next(false);
                router.push('login');
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
const i18n = new VueI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages: translations
    }),
    idmDefaultContext = '/openidm';

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
Vue.use(VeeValidate, {inject: false, fastExit: false});

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
        getRequestService: function (config) {
            let baseURL = idmDefaultContext,
                timeout = 1000,
                headers = {
                    'content-type': 'application/json'
                },
                instance;

            if (config) {
                if (config.baseURL) {
                    baseURL = config.baseURL;
                }

                if (config.timeout) {
                    timeout = config.timeout;
                }

                if (config.headers) {
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
                if (error.response.data.code === 401) {
                    this.$router.push({path: 'login'});
                }

                return Promise.reject(error);
            });

            return instance;
        },
        getAnonymousHeaders: function () {
            return {
                'X-OpenIDM-NoSession': true,
                'X-OpenIDM-Password': 'anonymous',
                'X-OpenIDM-Username': 'anonymous'
            };
        },
        displayNotification: function (notificationType, message) {
            /* istanbul ignore next */
            this.$notify({
                group: 'IDMMessages',
                type: notificationType,
                text: message
            });
        }
    }
});

/*
    We will load the application regardless
 */
var startApp = function () {
        let translationInstance = axios.create({
            baseURL: idmDefaultContext,
            timeout: 1000,
            headers: {
                'X-OpenIDM-NoSession': true,
                'X-OpenIDM-Password': 'anonymous',
                'X-OpenIDM-Username': 'anonymous'
            }
        });

        translationInstance.get('/info/uiconfig').then((info) => {
            if (info.data.configuration.lang) {
                i18n.locale = info.data.configuration.lang;
            }

            return loadApp();
        })
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
                userStore: UserStore
            }
        });
    };

startApp();
