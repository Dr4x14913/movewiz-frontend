import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import CreateEvent from './components/CreateEvent.vue'
import Toto from './components/Toto.vue'
import EventPage from './components/EventPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/create', component: CreateEvent },
  { path: '/event', component: EventPage, props: route => ({ token: route.query.token }) },
  { path: '/about', component: Toto },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
