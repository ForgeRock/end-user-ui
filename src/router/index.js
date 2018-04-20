import Router from 'vue-router';
import Dashboard from '@/components/mains/Dashboard';
import NotFound from '@/components/mains/NotFound';
import Login from '@/components/mains/Login';
import Registration from '@/components/mains/Registration';

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
            path: '/login',
            name: 'Login',
            component: Login,
            meta: { hideToolbar: true }
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
            path: '*',
            component: NotFound
        }
    ]
});
