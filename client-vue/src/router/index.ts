import { createRouter, createWebHistory } from 'vue-router'
import RCDCDashboard from '../views/RCDCDashboard.vue'
import MeterWiseCommands from '../views/MeterWiseCommands.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: RCDCDashboard,
    },
    {
      path: '/meter-wise',
      name: 'meter-wise',
      component: MeterWiseCommands,
    },
  ],
})

export default router
