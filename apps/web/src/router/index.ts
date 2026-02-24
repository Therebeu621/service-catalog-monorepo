import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AppLayout from '../layouts/AppLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import ServiceDetailView from '../views/ServiceDetailView.vue';
import ServicesView from '../views/ServicesView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/app/services',
    },
    {
      path: '/login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/app',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/app/services',
        },
        {
          path: 'services',
          component: ServicesView,
        },
        {
          path: 'services/:id',
          component: ServiceDetailView,
          props: true,
        },
        {
          path: 'dashboard',
          component: DashboardView,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const isPublic = Boolean(to.meta.public);

  if (!isPublic && !auth.isAuthenticated) {
    return '/login';
  }

  if (isPublic && auth.isAuthenticated) {
    return '/app/services';
  }

  return true;
});
