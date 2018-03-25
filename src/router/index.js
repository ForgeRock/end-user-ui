import Router from 'vue-router';
import Dashboard from '@/components/mains/Dashboard';
import NotFound from '@/components/mains/NotFound';
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
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard
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
