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
    if (_.has(to, 'meta.authenticate')) {
        let userState = UserStore.getUserState();

        if (_.isNull(userState.userId)) {
            let instance = axios.create({
                baseURL: '/openidm',
                timeout: 1000,
                headers: {
                    'content-type': 'application/json',
                    'cache-control': 'no-cache',
                    'x-requested-with': 'XMLHttpRequest'
                }
            });

            instance.post('/authentication?_action=login').then((userDetails) => {
                UserStore.setUserIdAction(userDetails.data.authorization.id);
                UserStore.setManagedResourceAction(userDetails.data.authorization.component);
                UserStore.setRolesAction(userDetails.data.authorization.roles);

                next();
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
const i18n = new VueI18n({
    locale: 'en',
    messages: translations
});

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

// Global mixin for making openIDM REST calls
Vue.mixin({
    methods: {
        getRequestService: function (config) {
            let baseURL = '/openidm',
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

            if (config && config.authenticator) {
                instance.interceptors.response.use((response) => {
                    return response;
                }, (error) => {
                    if (error.response.data.code === 401) {
                        this.$router.push({ path: 'login' });
                    }

                    return Promise.reject(error);
                });
            }

            return instance;
        }
    }
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    i18n,
    template: '<App/>',
    components: { App },
    data: {
        userStore: UserStore
    }
});
