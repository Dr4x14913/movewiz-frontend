import { createMemoryHistory, createRouter } from 'vue-router'
import HomePage from './components/HomePage.vue'
import CreateEvent from './components/CreateEvent.vue'
import Toto from './components/Toto.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/create', component: CreateEvent },
  { path: '/about', component: Toto },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
