/* eslint-disable callback-return */
import ApplicationStore from "./store/Application";
import Router from "vue-router";
import Vue from "vue";

Vue.use(Router);

/**
 * Available toolbar configuration
 * hideToolbar - Will hide main toolbar when route accessed
 */
export default new Router({
    "routes": [
        {
            "path": "/",
            "redirect": "/dashboard"
        },
        {
            "component": () => import("@/components/OAuthReturn"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "path": "/handleOAuth/:amData"
        },
        {
            "component": () => import("@/components/OAuthReturn"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "path": "/oauthReturn"
        },
        {
            "path": "/login",
            // Need alias for catching Facebook and Instragram odd oAuth return
            // eslint-disable-next-line sort-keys
            "alias": ["/_=_", "/_"],
            "beforeEnter": (to, from, next) => {
                if (ApplicationStore.state.platformMode) {
                    window.location = ApplicationStore.state.loginURL;
                } else if (window.location.search && window.location.search.match(/state|oauth_token/u)) {
                    next("/oauthReturn");
                } else {
                    next();
                }
            },
            "component": () => import("@/components/Login"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "Login"
        },
        {
            "component": () => import("@/components/profile"),
            "meta": { "authenticate": true },
            "name": "Profile",
            "path": "/profile",
            "props": true
        },
        {
            "component": () => import("@/components/access"),
            "meta": { "authenticate": true },
            "name": "ListResource",
            "path": "/list/:resourceType/:resourceName"
        },
        {
            "component": () => import("@/components/access/EditResource"),
            "meta": { "authenticate": true },
            "name": "EditResource",
            "path": "/edit/:resourceType/:resourceName/:resourceId"
        },
        {
            "beforeEnter": (to, from, next) => {
                /* istanbul ignore next */
                if (window.location.search && window.location.search.match(/state|oauth_token/u)) {
                    next({
                        "path": "/oauthReturn"
                    });
                } else {
                    next();
                }
            },
            "component": () => import("@/components/dashboard"),
            "meta": { "authenticate": true },
            "name": "Dashboard",
            "path": "/dashboard"
        },
        {
            "component": () => import("@/components/selfservice/registration"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "Registration",
            "path": "/registration",
            "props": true
        },
        {
            "component": () => import("@/components/selfservice/registration/AccountClaiming"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "AccountClaiming",
            "path": "/accountClaiming",
            "props": true
        },
        {
            "component": () => import("@/components/selfservice/registration"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "RegistrationEmailValidation",
            "path": "/registration/:queryParams"
        },
        {
            "component": () => import("@/components/selfservice/forgotusername"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "ForgotUsername",
            "path": "/forgotusername"
        },
        {
            "component": () => import("@/components/selfservice/passwordreset"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "PasswordReset",
            "path": "/passwordreset"
        },
        {
            "component": () => import("@/components/selfservice/passwordreset"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "PasswordResetForm",
            "path": "/passwordreset/:queryParams"
        },
        {
            "component": () => import("@/components/selfservice/progressiveprofile"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "ProgressiveProfileForm",
            "path": "/profilecompletion"
        },
        {
            "component": () => import("@/components/selfservice/progressiveprofile"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "name": "ProgressiveProfileInitiate",
            "path": "/profilecompletion/:profileProcess"
        },
        {
            "component": () => import("@/components/uma"),
            "meta": { "authenticate": true },
            "name": "Sharing",
            "path": "/sharing"
        },
        {
            "component": () => import("@/components/NotFound"),
            "meta": { "bodyClass": "fr-body-image", "hideToolbar": true },
            "path": "*"
        }
    ]
});
