import Router from 'vue-router';
import ListResource from '@/components/mains/ListResource';
import EditResource from '@/components/access/EditResource';
import Dashboard from '@/components/mains/Dashboard';
import ForgotUsername from '@/components/mains/ForgotUsername';
import NotFound from '@/components/mains/NotFound';
import Login from '@/components/mains/Login';
import OAuthReturn from '@/components/mains/OAuthReturn';
import Profile from '@/components/mains/Profile';
import PasswordReset from '@/components/mains/PasswordReset';
import ProgressiveProfile from '@/components/mains/ProgressiveProfile';
import Registration from '@/components/mains/Registration';
import AccountClaiming from '@/components/selfservice/registration/AccountClaiming';
import Sharing from '@/components/mains/Sharing';

// import Styleguide from '../../styleguide/Styleguide';
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
            path: '/oauthReturn',
            component: OAuthReturn,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/login',
            name: 'Login',
            alias: ['/_=_'], // Need alias for catching Facebook odd oAuth return
            component: Login,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
            beforeEnter: (to, from, next) => {
                /* istanbul ignore next */
                if (window.location.search && window.location.search.includes('state')) {
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
            component: Profile,
            meta: { authenticate: true }
        },
        {
            path: '/list/:resourceType/:resourceName',
            name: 'ListResource',
            component: ListResource,
            meta: { authenticate: true }
        },
        {
            path: '/edit/:resourceType/:resourceName/:resourceId',
            name: 'EditResource',
            component: EditResource,
            meta: { authenticate: true }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
            meta: { authenticate: true },
            beforeEnter: (to, from, next) => {
                /* istanbul ignore next */
                if (window.location.search && window.location.search.includes('state')) {
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
            component: Registration,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
            props: true
        },
        {
            path: '/accountClaiming',
            name: 'AccountClaiming',
            component: AccountClaiming,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
            props: true
        },
        {
            path: '/registration/:queryParams',
            name: 'RegistrationEmailValidation',
            component: Registration,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/forgotusername',
            name: 'ForgotUsername',
            component: ForgotUsername,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/passwordreset',
            name: 'PasswordReset',
            component: PasswordReset,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/passwordreset/:queryParams',
            name: 'PasswordResetForm',
            component: PasswordReset,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/profilecompletion',
            name: 'ProgressiveProfileForm',
            component: ProgressiveProfile,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/profilecompletion/:profileProcess',
            name: 'ProgressiveProfileInitiate',
            component: ProgressiveProfile,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        },
        {
            path: '/sharing',
            name: 'Sharing',
            component: Sharing,
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
            component: NotFound,
            meta: { hideToolbar: true, bodyClass: 'fr-body-image' }
        }
    ]
});
