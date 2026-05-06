import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/environment' },
    { path: '/environment',           component: () => import('./views/environment/index.vue') },
    { path: '/environment/create',    component: () => import('./views/environment/create/index.vue') },
    { path: '/environment/edit/:id',  component: () => import('./views/environment/create/index.vue') },
    { path: '/settings',           component: () => import('./views/settings/index.vue') },
  ],
})

createApp(App).use(router).mount('#app')
