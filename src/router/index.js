import Router from 'vue-router';
import Dashboard from '@/components/mains/Dashboard';
import NotFound from '@/components/mains/NotFound';

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
            path: '*',
            component: NotFound
        }
    ]
});
