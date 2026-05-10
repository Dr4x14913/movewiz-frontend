import { createMemoryHistory, createRouter } from 'vue-router'
import CreateEvent from './components/CreateEvent.vue'
import Toto from './components/Toto.vue'

const routes = [
  { path: '/', component: CreateEvent },
  { path: '/about', component: Toto },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
