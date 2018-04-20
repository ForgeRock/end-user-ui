import Vue from 'vue';
import App from './App';
import Router from 'vue-router';
import router from './router';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import translations from './translations';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';

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
            var baseURL = '/openidm',
                timeout = 1000,
                headers = {
                    'X-OpenIDM-Username': 'openidm-admin',
                    'X-OpenIDM-Password': 'openidm-admin',
                    'content-type': 'application/json'
                };

            // TODO Remove hardcoded admin headers
            // TODO Add interceptor for axios to catch failed IDM requests when session timesout
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

            //  Example: instance.interceptors.request.use(function () {});
            return axios.create({
                baseURL: baseURL,
                timeout: timeout,
                headers: headers
            });
        }
    }
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    i18n,
    template: '<App/>',
    components: { App }
});
