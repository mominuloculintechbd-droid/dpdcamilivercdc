import { createRouter, createWebHistory } from 'vue-router'
import RCDCDashboard from '../views/RCDCDashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: RCDCDashboard,
    },
  ],
})

export default router
