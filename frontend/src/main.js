import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// Import components
import Home from './views/Home.vue'
import Products from './views/Products.vue'
import ProductDetail from './views/ProductDetail.vue'
import Cart from './views/Cart.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'
import Orders from './views/Orders.vue'
import AdminDashboard from './views/admin/Dashboard.vue'
import AdminProducts from './views/admin/Products.vue'
import AdminOrders from './views/admin/Orders.vue'

// Define routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/products', name: 'Products', component: Products },
  { path: '/products/:category', name: 'ProductsByCategory', component: Products },
  { path: '/product/:slug', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: Orders, meta: { requiresAuth: true } },
  { 
    path: '/admin', 
    name: 'AdminDashboard', 
    component: AdminDashboard, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  { 
    path: '/admin/products', 
    name: 'AdminProducts', 
    component: AdminProducts, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  { 
    path: '/admin/orders', 
    name: 'AdminOrders', 
    component: AdminOrders, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  }
]

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create Pinia store
const pinia = createPinia()

// Create and mount app
const app = createApp(App)
app.use(router)
app.use(pinia)

// Navigation guards (after stores are available)
import { useAuthStore } from './stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/')
  } else {
    next()
  }
})

app.mount('#app')
