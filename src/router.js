import Router from 'vue-router';
import Vue from 'vue';
import ApplicationStore from './store/Application';

Vue.use(Router);

/**
 * Available toolbar configuration
 * hideToolbar - Will hide main toolbar when route accessed
 */
export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/handleOAuth/:amData',
            component: () => import('@/components/OAuthReturn'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/oauthReturn',
            component: () => import('@/components/OAuthReturn'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/login',
            name: 'Login',
            alias: ['/_=_'], // Need alias for catching Facebook odd oAuth return
            component: () => import('@/components/Login'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
            beforeEnter: (to, from, next) => {
                if (ApplicationStore.state.platformMode) {
                    window.location = ApplicationStore.state.loginURL;
                } else if (window.location.search && window.location.search.match(/state|oauth_token/)) {
                    next('/oauthReturn');
                } else {
                    next();
                }
            }
        },
        {
            path: '/profile',
            name: 'Profile',
            props: true,
            component: () => import('@/components/profile'),
            meta: { authenticate: true }
        },
        {
            path: '/list/:resourceType/:resourceName',
            name: 'ListResource',
            component: () => import('@/components/access'),
            meta: { authenticate: true }
        },
        {
            path: '/edit/:resourceType/:resourceName/:resourceId',
            name: 'EditResource',
            component: () => import('@/components/access/EditResource'),
            meta: { authenticate: true }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('@/components/dashboard'),
            meta: { authenticate: true },
            beforeEnter: (to, from, next) => {
                /* istanbul ignore next */
                if (window.location.search && window.location.search.match(/state|oauth_token/)) {
                    next({
                        path: '/oauthReturn'
                    });
                } else {
                    next();
                }
            }
        },
        {
            path: '/registration',
            name: 'Registration',
            component: () => import('@/components/selfservice/registration'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
            props: true
        },
        {
            path: '/accountClaiming',
            name: 'AccountClaiming',
            component: () => import('@/components/selfservice/registration/AccountClaiming'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
            props: true
        },
        {
            path: '/registration/:queryParams',
            name: 'RegistrationEmailValidation',
            component: () => import('@/components/selfservice/registration'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/forgotusername',
            name: 'ForgotUsername',
            component: () => import('@/components/selfservice/forgotusername'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/passwordreset',
            name: 'PasswordReset',
            component: () => import('@/components/selfservice/passwordreset'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/passwordreset/:queryParams',
            name: 'PasswordResetForm',
            component: () => import('@/components/selfservice/passwordreset'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/profilecompletion',
            name: 'ProgressiveProfileForm',
            component: () => import('@/components/selfservice/progressiveprofile'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/profilecompletion/:profileProcess',
            name: 'ProgressiveProfileInitiate',
            component: () => import('@/components/selfservice/progressiveprofile'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/sharing',
            name: 'Sharing',
            component: () => import('@/components/uma'),
            meta: {
                authenticate: true
            }
        },
        /*
        {
            path: '/styleguide',
            name: 'Styleguide',
            component: Styleguide,
            meta: { hideToolbar: true }
        },
        */
        {
            path: '*',
            component: () => import('@/components/NotFound'),
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        }
    ]
});
