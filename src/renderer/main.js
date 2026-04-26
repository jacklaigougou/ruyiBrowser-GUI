import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('./views/dashboard/index.vue') },
    { path: '/sessions',  component: () => import('./views/sessions/index.vue') },
    { path: '/browser',   component: () => import('./views/browser/index.vue') },
    { path: '/settings',  component: () => import('./views/settings/index.vue') },
  ],
})

createApp(App).use(router).mount('#app')
