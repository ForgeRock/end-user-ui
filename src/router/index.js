import Router from 'vue-router';
import Dashboard from '@/components/mains/Dashboard';
import ForgotUsername from '@/components/mains/ForgotUsername';
import NotFound from '@/components/mains/NotFound';
import Login from '@/components/mains/Login';
import Profile from '@/components/mains/Profile';
import PasswordReset from '@/components/mains/PasswordReset';
import ProgressiveProfile from '@/components/mains/ProgressiveProfile';
import Registration from '@/components/mains/Registration';
// import Styleguide from '../../styleguide/Styleguide';
/**
 * Available toolbar configuration
 * hideToolbar - Will hide main toolbar when route accessed
 */
export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard',
            meta: { hideToolbar: true }
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { hideToolbar: true }
        },
        {
            path: '/profile',
            name: 'Profile',
            props: true,
            component: Profile,
            meta: { authenticate: true }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
            meta: { authenticate: true }
        },
        {
            path: '/registration',
            name: 'Registration',
            component: Registration,
            meta: { hideToolbar: true }
        },
        {
            path: '/registration/:queryParams',
            name: 'RegistrationEmailValidation',
            component: Registration,
            meta: { hideToolbar: true }
        },
        {
            path: '/forgotusername',
            name: 'ForgotUsername',
            component: ForgotUsername,
            meta: { hideToolbar: true }
        },
        {
            path: '/passwordreset',
            name: 'PasswordReset',
            component: PasswordReset,
            meta: { hideToolbar: true }
        },
        {
            path: '/passwordreset/:queryParams',
            name: 'PasswordResetForm',
            component: PasswordReset,
            meta: { hideToolbar: true }
        },
        {
            path: '/profilecompletion',
            name: 'ProgressiveProfileForm',
            component: ProgressiveProfile,
            meta: { hideToolbar: true }
        },
        {
            path: '/profilecompletion/:profileProcess',
            name: 'ProgressiveProfileInitiate',
            component: ProgressiveProfile,
            meta: { hideToolbar: true }
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
            meta: { hideToolbar: true }
        }
    ]
});
