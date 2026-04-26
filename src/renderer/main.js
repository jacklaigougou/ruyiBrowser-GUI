import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Sessions from './views/Sessions.vue'
import Browser from './views/Browser.vue'
import Settings from './views/Settings.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
    { path: '/sessions', component: Sessions },
    { path: '/browser', component: Browser },
    { path: '/settings', component: Settings },
  ],
})

createApp(App).use(router).mount('#app')
