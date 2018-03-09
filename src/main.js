import Vue from 'vue';
import App from './App';
import Router from 'vue-router';
import router from './router';
import BootstrapVue from 'bootstrap-vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import translations from './translations';
import Notifications from 'vue-notification';

// Turn off production warning messages
Vue.config.productionTip = false;

// Add translation capability
/*
  Example of translation use:

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
 Example of notification use throughout application:

 this.$notify({
   group: 'IDMMessages', // Currently the only group
   type: 'success', // Available types success, failure, info, warning
   title: this.$t('common.messages.saveSuccess'), //Translated string
   text: this.$t('pages.resources.mappingSave') // Translated string (can also be html)
 });
 */

Vue.use(Notifications);

// Global mixin for making openIDM REST calls
// Hardcoded as admin for now
Vue.mixin({
    methods: {
        getRequestService: function () {
            return axios.create({
                baseURL: '/openidm',
                timeout: 1000,
                headers: {
                    'X-OpenIDM-Username': 'openidm-admin',
                    'X-OpenIDM-Password': 'openidm-admin',
                    'content-type': 'application/json'
                }
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
